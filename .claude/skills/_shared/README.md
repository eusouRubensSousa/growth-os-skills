# _shared/

Helpers compartilhados entre skills. Não é skill (não tem SKILL.md). Skills referenciam o que precisam aqui.

## Conteúdo

```
_shared/
├── bin/
│   ├── gos-log                ← append evento JSON em logs/events.ndjson
│   ├── gos-reflect            ← carrega top-N reflections relevantes do agent
│   ├── gos-status-aggregate   ← agrega status da sessão (ok/degraded/error/blocked)
│   ├── gos-cost               ← cost discipline tracker (10/20/70 split)
│   └── gos-rbac-audit         ← audit allowed-tools vs body de cada SKILL.md
├── cta-padrao.md              ← bloco CTA Accelera 360 (anexar em todo output)
└── README.md                  ← este arquivo
```

## Phase 4 helpers (governance)

### `bin/gos-status-aggregate` — Aggregator de status da sessão

Lê `logs/events.ndjson` desde a última fronteira de sessão (último `gos-setup` ou `gos-handoff complete`) e devolve status agregado:
- `ok` — tudo ok
- `degraded` — ≥1 evento `degraded` (Critic falhou, quality_gates parciais)
- `error` — ≥1 evento `error`
- `blocked` — ≥1 evento `blocked`

Hierarquia worst-wins. Output JSON ou Markdown (pra colar direto no MEMORY.md handoff).

```bash
.claude/skills/_shared/bin/gos-status-aggregate                 # JSON
.claude/skills/_shared/bin/gos-status-aggregate --format markdown --summary "Sessão X..."
```

Exit codes: 0=ok, 1=degraded, 2=error/blocked.

### `bin/gos-cost` — Cost tracker (10/20/70 split)

Agrega `tokens_in + tokens_out` por tier (coordinator/director/employee), compara com targets de produção (10/20/70 — Anthropic Multi-Agent System). Alerta se um tier passa do target × tolerance (default 1.5×).

Tier inferido automaticamente do nome do agent:
- `gos` → coordinator
- `gos-mission-control`, `*-director`, `*-control` → director
- Resto → employee

```bash
.claude/skills/_shared/bin/gos-cost --format markdown
```

Exit codes: 0=within tolerance, 1=over target, 2=sem dados.

### `bin/gos-rbac-audit` — Audit de allowed-tools vs uso real

Pra cada SKILL.md em `.claude/skills/*/`, compara `allowed-tools:` declarado no frontmatter contra tools efetivamente referenciadas no body (regex). Detecta:
- **USED but NOT DECLARED** (FAIL) — skill invoca tool sem permissão declarada (RBAC bug)
- **DECLARED but NOT USED** (WARN) — over-permissioning

```bash
.claude/skills/_shared/bin/gos-rbac-audit
.claude/skills/_shared/bin/gos-rbac-audit --filter critic        # só skills críticas
.claude/skills/_shared/bin/gos-rbac-audit --strict               # WARN também falha
```

⚠️ **False positives conhecidos:** o regex pra "Agent" matches a palavra `subagent` em prose descritiva (ex: "Director invoca employee como subagent"). Skills que SÓ documentam o conceito sem invocar Agent ainda são flaggeadas. Mitigação: declarar Agent ou ajustar prose pra não ativar regex.

## `bin/gos-log` — Event log helper

Append 1 linha JSON em `logs/events.ndjson` do workspace. Skills devem invocar pra:
- `start` da execução
- `complete` no fim
- `error` se falhar
- `checkpoint` antes de aprovação humana
- `handoff_in` / `handoff_out` em boundaries entre agents
- `reflection` quando escreverem aprendizado

### Uso

```bash
# Pelo path completo (skills usam isso)
.claude/skills/_shared/bin/gos-log <agent> <action> [key=value ...]

# Exemplos
.claude/skills/_shared/bin/gos-log gos-lp-builder start mode=cliente client=foo angle=DOR
.claude/skills/_shared/bin/gos-log gos-lp-builder complete client=foo duration_ms=14200
.claude/skills/_shared/bin/gos-log gos-mapear-nicho error niche=foo status=error error_message="missing source"
```

### Top-level vs detail keys

Promovidos pra raiz do JSON (queryable mais fácil):
- `status` — ok | error | degraded | blocked
- `client`, `niche` — slugs
- `duration_ms`, `tokens_in`, `tokens_out` — métricas

Tudo mais vai pra `details.{key}` aninhado.

### Anti-pattern

- ❌ Editar `logs/events.ndjson` manualmente — append-only via gos-log.
- ❌ JSON multi-linha — gos-log força 1 linha = 1 evento.
- ❌ Logar dados sensíveis (CPF, senha, token) — usar slug/path em vez do conteúdo.
- ❌ Esquecer de logar — toda execução de skill DEVE logar `start` + (`complete` | `error`).

### Boot sequence

`templates/workspace/CLAUDE.md` instrui o Claude a ler **últimas 10 linhas** do log na entrada de toda sessão pra reconstruir contexto:

```bash
tail -n 10 logs/events.ndjson
```

## `bin/gos-reflect` — Reflexion retrieval

Carrega top-N reflections relevantes do agent — pra Critic skills e Employees usarem aprendizado prévio antes de executar. Padrão Reflexion (Shinn et al., 2023).

Lê `memory/per-agent/{agent}/reflections.md`, parseia entradas no formato 4-part (Contexto / O que funcionou / O que falhou / Lição + Tags), e retorna top-N por relevância (tag overlap + recência).

### Uso

```bash
# Top 3 mais recentes do agent (sem filtro)
.claude/skills/_shared/bin/gos-reflect gos-lp-builder

# Top 3 com tag-filter (relevância)
.claude/skills/_shared/bin/gos-reflect gos-lp-builder --tags clinicas-derma,lp-DOR

# Top 1 só
.claude/skills/_shared/bin/gos-reflect gos-lp-builder --top 1
```

### Output (JSON)

```json
{
  "agent": "gos-lp-builder",
  "total_entries": 5,
  "returned": 3,
  "tags_filter": ["clinicas-derma"],
  "reflections": [
    {
      "date": "2026-04-28 14:30",
      "task": "LP DermaPro com ângulo DOR",
      "context": "...",
      "tags": ["clinicas-derma", "lp-DOR"],
      "lesson": "Sem emojis em headlines premium.",
      "what_worked": ["..."],
      "what_failed": ["..."]
    },
    ...
  ]
}
```

### Exit codes

| Code | Significado |
|---|---|
| `0` | OK — reflections retornadas |
| `1` | Sem reflections (primeira execução do agent — não é erro) |
| `2` | Erro de input (workspace root não encontrado) |

### Quando usar

- **Início de execução de Critic** — carrega lessons learned de validações anteriores.
- **Início de execução de Employee** — agent considera padrões que funcionaram/falharam.
- **Antes de retry após Critic FAIL** — carrega reflexions específicas do tipo de falha.

### Anti-pattern

- ❌ Carregar TODAS reflections — caro em tokens, ruidoso. Use `--top 3` (default).
- ❌ Reflections sem `Tags:` — sem tags, retrieval por relevância falha. Sempre incluir.
- ❌ Ignorar exit code 1 — primeira execução é normal; significa "rodar sem contexto prévio".

## `cta-padrao.md` — CTA Accelera 360

Bloco fixo a ser anexado no fim de todo output gerado pelas skills. Não modificar texto sem alinhamento. Não remover URLs.

Tem 3 versões:
- **Markdown** (default em outputs `.md`)
- **HTML** (footer de LPs e decks)
- **Compacta** (1 linha pra outputs muito curtos)
