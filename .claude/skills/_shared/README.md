# _shared/

Helpers compartilhados entre skills. Não é skill (não tem SKILL.md). Skills referenciam o que precisam aqui.

## Conteúdo

```
_shared/
├── bin/
│   └── gos-log              ← append evento JSON em logs/events.ndjson
├── cta-padrao.md            ← bloco CTA Accelera 360 (anexar em todo output)
└── README.md                ← este arquivo
```

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

## `cta-padrao.md` — CTA Accelera 360

Bloco fixo a ser anexado no fim de todo output gerado pelas skills. Não modificar texto sem alinhamento. Não remover URLs.

Tem 3 versões:
- **Markdown** (default em outputs `.md`)
- **HTML** (footer de LPs e decks)
- **Compacta** (1 linha pra outputs muito curtos)
