# AGENTS.md — growth-os-skills

> **Single source of truth** para a arquitetura de squad, modelo de memória, contratos de handoff e convenções de comando do `growth-os-skills`.
>
> Cada `SKILL.md` referencia este documento. O `templates/workspace/CLAUDE.md` (boot do workspace do aluno) é derivado destas especificações.
>
> **Pra quem é:** mantenedores do repo, contribuintes, agentes de IA assistindo no desenvolvimento.
> **Pra quem NÃO é:** alunos da Accelera 360 que só querem usar — esses leem `README.md` e `INSTALL.md`.

---

## 1. Squad Architecture (3-tier orchestrator-worker)

Padrão Anthropic Orchestrator-Worker — única arquitetura com prova pública de produção em escala.

### Tier 1 — Coordinator

| Atributo | Valor |
|---|---|
| Comando | `/gos` |
| Responsabilidade | Intent routing apenas — ler objetivo, escolher Director, repassar briefing estruturado |
| Frontmatter | `tier: coordinator` |
| Tamanho | Prompt enxuto (<5k tokens) — sem domain knowledge embutida |

O Coordinator **não executa** trabalho de domínio. Ele decide pra qual Director encaminhar.

### Tier 2 — Directors

| Atributo | Valor |
|---|---|
| Comando | `/gos-{domain}` |
| Implementados | `/gos-mission-control` (Sales & Positioning) — Phase 2 |
| Futuros | `/gos-operations` (implementação), `/gos-content` (conteúdo orgânico) |
| Frontmatter | `tier: director`, `members: [employee1, employee2, ...]` |
| Responsabilidade | Orquestrar Employees do seu domínio. Validar handoff_in/out. Invocar Critic. Checkpoint humano. |

Director chama Employees como **subagents Claude Code** (Agent tool) — context isolation crítico pro custo de token (multi-agent custa ~15x single-agent sem isolation).

### Tier 3 — Employees

| Atributo | Valor |
|---|---|
| Comando | `/gos-{skill-name}` |
| Implementados | 8 skills de domínio + 3 harness (setup, map, handoff) |
| Frontmatter | `tier: employee`, `reports_to: <director-name>` |
| Responsabilidade | Executar 1 deliverable específico. Receber briefing estruturado. Produzir output validado pelo schema declarado. |

---

## 2. Memory Architecture (3 tiers + event log, file-based)

Padrão Letta-inspirado — sem vector DB, sem infra externa, totalmente em arquivos `.md` + `.ndjson`.

### 🔥 Tier 1 — Core (sempre carregado, ≤5KB total)

Lentes carregadas em **toda** sessão antes de qualquer ação:

```
MEMORY.md                       — estado load-bearing da sessão
_contexto/operador.md           — quem é o aluno
_contexto/tese-a360.md          — método A360 / Growth AI
_contexto/glossario.md          — termos do método
_contexto/marca.md              — identidade visual (opcional, só pra skills visuais)
```

**Regra:** se `MEMORY.md` passar de 5KB, mover detalhe pra Recall.

### 🌡️ Tier 2 — Recall (carregado on-demand)

```
memory/per-agent/{agent}/state.md            — estado per-agent (NEW)
memory/per-agent/{agent}/reflections.md      — Reflexion log per-agent (NEW)
memory/shared/projects/{project_id}.md       — contexto project-scoped (NEW)
memory/shared/decisoes/{date}-{topic}.md     — decisões duráveis
memory/shared/ledgers/nichos-mapeados.md     — ledger de nichos
memory/shared/ledgers/clientes-ativos.md     — ledger de clientes
memory/shared/ledgers/ofertas.md             — ledger de ofertas
```

**Regra:** Recall é lido por skills específicas baseadas em contexto. Não é carregado upfront.

### ❄️ Tier 3 — Archival (recuperado por grep/glob)

```
nichos/{slug}/*       — artefatos de nicho mapeado
clientes/{slug}/*     — artefatos de cliente
ofertas/{slug}/*      — artefatos de oferta
_arquivo/*            — itens encerrados (PARA Archive)
```

### 📜 Event Log (audit + recovery)

```
logs/events.ndjson    — append-only, 1 linha = 1 JSON event
```

**Formato de cada linha:**

```json
{"timestamp":"2026-04-28T14:23:00Z","agent":"gos-lp-builder","action":"complete","status":"ok","client":"clinica-derma","duration_ms":12400}
```

**Boot sequence (em CLAUDE.md):** ler últimas 10 linhas do event log → reconstruir contexto → apresentar sumário *"última sessão fez X. Próximo passo: Y."*

---

## 3. Handoff Contracts (estruturados, validados)

**Razão:** pesquisa mostra que handoffs não-estruturados em multi-agent amplificam erros 17.2x. Contratos validados é a maior alavanca de confiabilidade.

### Frontmatter de cada SKILL.md

Todo SKILL.md declara:

```yaml
handoff_in:
  required: [<field1>, <field2>]
  schema:
    <field1>: <type or description>
    <field2>: <type or description>
  optional: [<field>]

handoff_out:
  produces: [<field>]
  schema:
    <field>: <type or description>
  paths:
    - "<canonical output path>"

quality_gates:
  - "<min/max criterion 1>"
  - "<min/max criterion 2>"
```

### Validador

Skill `/gos-validate-handoff` valida payload contra schema declarado **antes** da invocação. Se falhar, bloqueia + retorna campos faltantes.

### Quality gates

Declarados em Phase 1, **enforced** em Phase 3 via Critic skills.

Exemplos:
- `mapear-nicho`: min 5 dores quantificadas, min 3 ICPs, mecanismo nomeado
- `lp-builder`: min 1 hero + 3 sections + 1 CTA + footer A360
- `playbook-vendas`: min 5 objeções, funil 5 estágios, script 30min
- `pitch-deck-builder`: 20 slides exatos, footer fixo, CTA final

---

## 4. Command Naming Convention

Todos os comandos prefixados `/gos-*`. Coordinator é `/gos` puro (entry point).

| Tipo | Padrão | Exemplos |
|---|---|---|
| Coordinator | `/gos` | `/gos` |
| Director | `/gos-{domain}` | `/gos-mission-control` |
| Employee — domain | `/gos-{skill-name}` | `/gos-nicho-explorer`, `/gos-lp-builder` |
| Employee — harness | `/gos-{action}` | `/gos-setup`, `/gos-map`, `/gos-handoff` |
| Validator | `/gos-validate-{thing}` | `/gos-validate-handoff` |
| Critic (Phase 3) | `/gos-critic-{thing}` | `/gos-critic-lp`, `/gos-critic-deck` |

### Map atual

```
ENTRY
/gos                      ← coordinator (intent routing)

HARNESS
/gos-setup                ← workspace wizard inicial
/gos-map                  ← regenera _index.md + ledgers
/gos-handoff              ← fecha sessão, escreve daily, atualiza MEMORY.md
/gos-validate-handoff     ← valida handoff payload contra schema (Phase 1)

EMPLOYEES — DESCOBERTA
/gos-nicho-explorer       ← top 10 nichos OU validação GO/NO-GO
/gos-mapear-nicho         ← cérebro completo do nicho
/gos-cliente-radar        ← pesquisa de prospect

EMPLOYEES — OUTPUT
/gos-lp-builder           ← LP copy + HTML
/gos-pitch-deck-builder   ← 20 slides comerciais
/gos-meeting-prep         ← briefing 1-page de reunião

EMPLOYEES — GTM
/gos-gtm-architect        ← outbound + content
/gos-playbook-vendas      ← script + objeções + funil

DIRECTOR (Phase 2)
/gos-mission-control      ← Sales & Positioning Director

CRITIC (Phase 3)
/gos-critic-lp
/gos-critic-deck
/gos-critic-playbook
/gos-critic-nicho
```

---

## 5. Feedback Architecture (Phase 3 implementation)

```
Briefing → handoff_in (schema validation)
   ↓
Execução → skill faz o trabalho
   ↓
Quality gate → declarativo no SKILL.md (min 5 dores, etc.)
   ↓
Critic → /gos-critic-{thing} com tool grounding (readability, structure check)
   ↓
Checkpoint → director pergunta confirmação humana (deliverables externos)
   ↓
Reflexion → agent escreve em memory/per-agent/{agent}/reflections.md
   ↓
Handoff out → schema validation
   ↓
Event log → append em logs/events.ndjson
```

### Princípios

- **Sem self-refine puro** — correlated errors, sycophancy, infinite loops.
- **Critic com grounding externo** — readability scorer, structure validator, classifier (Python interno, sem API externa).
- **Reflexion per-agent** — cada agent escreve "what worked / what didn't" depois de cada execução. Carrega top-3 relevantes na próxima.
- **Checkpoints humanos** — só em deliverables client-facing ou quando quality gate falha 2 vezes.

---

## 6. Versioning

Cada SKILL.md tem `version:` no frontmatter (semver).

```yaml
---
name: gos-lp-builder
version: 0.3.0
tier: employee
reports_to: gos-mission-control
---
```

Breaking changes documentadas em `CHANGELOG.md`.

---

## 7. Cost Discipline

Target de produção (baseado em research enterprise):

| Tier | % do budget de tokens |
|---|---|
| Coordinator | ≤10% |
| Directors | ≤20% |
| Employees | ~70% |

Implementação em Phase 4 — `cost_budget:` block per skill.

---

## 8. Documentos Relacionados

| Documento | Propósito |
|---|---|
| `AGENTS.md` (este) | Spec canônica de arquitetura |
| `WORKSPACE.md` | Estrutura do workspace do aluno (PARA + Johnny.Decimal) |
| `MIGRATION-TO-PAPERCLIP.md` | Portabilidade pro orquestrador Paperclip |
| `CONTRIBUTING.md` | Como contribuir |
| `CHANGELOG.md` | Histórico de versões |
| `templates/workspace/CLAUDE.md` | Boot template do workspace do aluno |
| `README.md` | Pitch do projeto pra usuário final |
| `INSTALL.md` | Setup do aluno |

---

## 9. Princípios não-negociáveis

1. **File-based, sem infra externa** — todo state em `.md` + `.ndjson`. Zero dependência de DB, vector store, API externa.
2. **Estrutura > brevidade** — handoffs sempre estruturados, mesmo que verbosos. Token economy via caching/isolation, não compressão semântica.
3. **Subagents pra context isolation** — Director chama Employee via Agent tool, nunca inline.
4. **Pré-requisitos validados** — skill recusa rodar se faltar input bloqueante.
5. **Decisão estratégica vira arquivo** — `memory/shared/decisoes/` é load-bearing, não opcional.
6. **Memory < 5KB no Core** — disciplina pra prevenir context rot.
7. **Português Brasil** — termos de mercado em inglês mantidos (CRM, GTM, ICP, CAC, LTV).
8. **Output sempre com CTA Accelera 360** — regra LICENSE.

---

**Versão deste documento:** 0.3.0
**Última atualização:** 2026-04-28
**Stewards:** Kelvin Cleto + contribuintes
