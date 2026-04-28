# MIGRATION-TO-PAPERCLIP.md — Como Levar Este Harness Pro Paperclip

> Documento de portabilidade. Quando o aluno escala (vários nichos, múltiplos clientes simultâneos, automações 24/7, equipe), a estrutura do harness A360 mapeia 1:1 pro **Paperclip** (paperclipai) — o orquestrador de agentes da Nova Economia. Migração é **mover pastas**, não refactor.

---

## TL;DR

| Componente A360 | Componente Paperclip | Portabilidade |
|---|---|---|
| `MEMORY.md` (5KB load-bearing) | `MEMORY.md` (mesmo formato) | **idêntico** |
| `_contexto/` (operador + tese + glossário) | `companies-spec/{slug}/COMPANY.md` + `AGENTS.md` | **converte 1:1** |
| `memory/shared/` (ledgers + decisões) | `memory/shared/` | **idêntico** |
| `memory/per-skill/` | `memory/per-agent/` | **mesmo nome lógico** |
| `nichos/`, `clientes/`, `ofertas/` (Areas) | mesmo (Areas continuam Areas) | **idêntico** |
| Skills (`.claude/skills/{nome}/SKILL.md`) | Agentes (`agents/{slug}/AGENT.md`) | **converte 1:1** com tweaks de adapter |
| Comandos (`/a360-map`, `/a360-handoff`) | Routines / processes Paperclip | **converte com pequena alteração** |
| Pré-requisitos (`requires:` em cada SKILL.md) | Workflow guards do Paperclip | **converte com `protocols/` tier-based** |

---

## Por que o paperclip é o destino natural

A360 hoje (este harness):
- **1 operador**, sessões manuais via Claude Code.
- **Skills** que rodam quando aluno chama.
- **Memory + mapper** mantém estado entre sessões.

Paperclip:
- **N agentes** rodando 24/7 (ou em cron).
- **Heartbeat configurável**, budgets per-agent, multi-adapter (Claude/Codex/Gemini/OpenCode local).
- **Memory** + **protocols** + **skills** continuam — a diferença é **quem dispara**: Paperclip dispara automaticamente; Claude Code dispara o aluno chamar.

Conclusão: o aluno opera com este harness até a operação justificar 24/7. Quando justificar, **mesma estrutura**, novo runtime (Paperclip).

---

## Mapeamento detalhado

### 1. `MEMORY.md`

**A360:** arquivo único na raiz, < 5KB, com 8 seções fixas (Mandate, Decisões, Open Questions, Active constraints, Approved patterns, Forbidden actions, Where-to-look, Handoff).

**Paperclip:** mesmíssimo arquivo. Paperclip carrega `MEMORY.md` em toda invocação de agente.

**Migração:** zero. Move o arquivo.

---

### 2. `_contexto/`

**A360:**
```
_contexto/
├── operador.md       (perfil do aluno)
├── tese-a360.md      (método Growth AI)
└── glossario.md      (termos)
```

**Paperclip:** estrutura `companies-spec/{slug}/`:
```
companies-spec/{slug}/
├── COMPANY.md        ← contexto base + companhia (vem de operador.md)
├── AGENTS.md         ← inventário dos agentes desta empresa
├── .paperclip.yaml   ← config (adapter, heartbeat, budget)
└── memory/           ← shared + per-agent
```

**Migração:**
1. `_contexto/operador.md` + `_contexto/tese-a360.md` viram `companies-spec/{slug}/COMPANY.md` (concatenação inteligente).
2. `_contexto/glossario.md` vira `companies-spec/{slug}/GLOSSARIO.md` (referência opcional).
3. Criar `companies-spec/{slug}/.paperclip.yaml` com adapter padrão + heartbeat conservador.
4. Criar `companies-spec/{slug}/AGENTS.md` listando os agentes (skills convertidas).

---

### 3. `memory/shared/` e `memory/per-skill/`

**A360:**
```
memory/
├── shared/
│   ├── nichos-mapeados.md     (ledger)
│   ├── clientes-ativos.md     (ledger)
│   ├── ofertas.md             (ledger)
│   └── decisoes/
│       └── YYYY-MM-DD-*.md    (decisões duráveis)
└── per-skill/
    ├── lp-builder/learnings.md
    ├── pitch-deck-builder/learnings.md
    └── ...
```

**Paperclip:**
```
memory/
├── shared/                    ← MESMO NOME
│   ├── nichos-mapeados.md
│   ├── clientes-ativos.md
│   ├── ofertas.md
│   └── decisoes/
└── per-agent/                 ← per-skill VIRA per-agent
    ├── lp-builder/
    ├── pitch-deck-builder/
    └── ...
```

**Migração:**
```bash
# memory/shared/ é idêntico — não precisa mover.
# Renomear per-skill → per-agent:
mv memory/per-skill memory/per-agent
```

---

### 4. Areas (`nichos/`, `clientes/`, `ofertas/`)

**A360 e Paperclip são idênticos aqui.** Mesma estrutura PARA + Johnny.Decimal:
- `nichos/{slug}/00-09-*.md`
- `clientes/{slug}/00-perfil.md` + `lp/`, `deck/`, `gtm/`
- `ofertas/{slug}/01-04-*.md` + `lp/`, `deck/`, `gtm/`

**Migração:** zero. Move o diretório inteiro.

---

### 5. Skills → Agentes Paperclip

Cada skill `.claude/skills/{nome}/SKILL.md` vira um agente Paperclip:

**A360 SKILL.md:**
```yaml
---
name: lp-builder
description: ...
allowed-tools: Read, Write, Edit, ...
requires:
  blocking: [...]
writes_to: [...]
---

# Skill: lp-builder
...
```

**Paperclip AGENT.md:**
```yaml
---
slug: lp-builder
description: ...
adapter: claude_local      # NOVO — qual modelo/adapter usa
model: claude-haiku-4-5    # NOVO — qual modelo
heartbeat:
  intervalSec: 0           # 0 = sob demanda; > 0 = roda automaticamente
  wakeOnAssignment: true
budget:
  monthlyCents: 1000       # NOVO — budget per-agent
permissions:               # equivale a allowed-tools
  - Read
  - Write
  - Edit
requires:                  # MESMO FORMATO
  blocking: [...]
writes_to: [...]
---

# Agent: lp-builder
... (mesmo corpo)
```

**Migração de cada skill:**
1. Acrescentar campos `adapter:`, `model:`, `heartbeat:`, `budget:` no frontmatter.
2. Renomear `allowed-tools:` → `permissions:`.
3. Renomear o arquivo de `SKILL.md` para `AGENT.md`.
4. Mover de `.claude/skills/{nome}/` pra `agents/{slug}/`.

Resto (`requires:`, `writes_to:`, `updates_index:`, corpo) — **idêntico**.

---

### 6. Comandos do harness (`/a360-setup-workspace`, `/a360-map`, `/a360-handoff`)

No Paperclip viram **routines** (ações disparáveis em horário ou evento) ou **processes** (workflows determinísticos).

| Comando A360 | Equivalente Paperclip |
|---|---|
| `/a360-setup-workspace` | `routine: bootstrap` (one-shot na criação do company) |
| `/a360-map` | `routine: daily-map` (cron diário) OU `process: map-on-write` (trigger em mudança) |
| `/a360-handoff` | `routine: end-of-session` (manual ou cron 18h) |

**Migração:** reescrever cada um como routine/process com schedule. Lógica é idêntica.

---

### 7. Pré-requisitos (`requires:` em cada SKILL.md) → Protocols Paperclip

**A360 hoje:** validação de pré-requisitos é responsabilidade de cada SKILL.md (cada skill checa o bloco `requires:` antes de rodar).

**Paperclip:** centraliza em `protocols/` tier-based:

```
protocols/
├── IC.md          ← Individual Contributor (skills de execução: lp-builder, deck, etc.)
├── PM.md          ← Product Manager (orquestrador: a360-framework-lite)
└── CEO.md         ← Decisões load-bearing (mudança de nicho, kill switch)
```

Cada protocol tem regra do tipo:
> "Antes de rodar agente IC, verificar pré-reqs em `requires.bloqueante`. Se faltar, escalonar pra PM."

**Migração:**
1. Mover regra `requires:` de cada SKILL.md pro protocol IC central.
2. Orquestração de fallback (injetar skill anterior) vai pro protocol PM.
3. Decisões duráveis (mudar nicho-foco, etc.) sobem pro CEO.

---

## Plano de migração — passo a passo

### Pré-requisitos
- Aluno tem operação rodando há ≥30 dias com este harness.
- Aluno tem ≥1 cliente em recorrência ou ≥3 nichos mapeados.
- Aluno justifica 24/7 (algum agente precisa rodar fora do horário do aluno).

### Etapa 1 — Backup (1 hora)
```bash
git commit -am "snapshot: pre-migration to paperclip"
git tag harness-a360-final
```

### Etapa 2 — Instalar Paperclip (30 min)
```bash
npx paperclipai init
```

Verificar: `~/.claude/skills/configurar-paperclip/` está disponível pra orientar a instalação.

### Etapa 3 — Criar `companies-spec/{slug}/` (30 min)
1. `paperclipai company create {slug}`.
2. Criar `companies-spec/{slug}/COMPANY.md` concatenando `_contexto/operador.md` + `_contexto/tese-a360.md`.
3. Criar `companies-spec/{slug}/.paperclip.yaml` com adapter conservador (claude_local + haiku) e heartbeat zero (manual).

### Etapa 4 — Mover Areas (10 min)
```bash
cp -r nichos clientes ofertas companies-spec/{slug}/
cp MEMORY.md companies-spec/{slug}/
cp -r memory companies-spec/{slug}/
mv companies-spec/{slug}/memory/per-skill companies-spec/{slug}/memory/per-agent
```

### Etapa 5 — Converter skills em agentes (1-2 horas, depende de quantas skills usadas)
Para cada skill que tu usa:
1. Copiar `SKILL.md` → `agents/{slug}/AGENT.md`.
2. Adicionar campos `adapter:`, `model:`, `heartbeat:`, `budget:` no frontmatter.
3. Renomear `allowed-tools:` → `permissions:`.
4. Atualizar referências internas (`${CLAUDE_SKILL_DIR}` → `${PAPERCLIP_AGENT_DIR}`).

Skills que **não precisam** virar agente Paperclip imediatamente: as 3 do harness (`/a360-setup-workspace`, `/a360-map`, `/a360-handoff`) — elas substitutem por routines.

### Etapa 6 — Criar routines (30 min)
```yaml
# routines/daily-map.yaml
schedule: "0 8 * * *"   # 8h da manhã todo dia
agent: a360-map
adapter: claude_local
model: claude-haiku-4-5
```

Idem para `bootstrap` e `end-of-session`.

### Etapa 7 — Criar protocols (30 min)
1. `protocols/IC.md` — pré-reqs centralizados.
2. `protocols/PM.md` — fallback de orquestração.
3. `protocols/CEO.md` — decisões load-bearing.

### Etapa 8 — Validar (1 hora)
- Rodar `paperclipai validate`.
- Disparar 1 agente manualmente. Confirmar que escreve nos paths canônicos.
- Verificar que MEMORY.md continua < 5KB.
- Auditar custo do primeiro dia.

---

## Anti-pattern na migração

- ❌ **Migrar antes da hora.** Se aluno opera com 1 cliente esporádico, Paperclip é overkill — mantém o harness A360.
- ❌ **Migrar tudo de uma vez.** Mover Areas é seguro, converter skills é incremental — uma de cada vez.
- ❌ **Mudar a estrutura na migração.** Regra de ouro: **só renomear / mover**. Refactor de pasta vem depois, em release separada.
- ❌ **Esquecer dos budgets.** Paperclip 24/7 sem budget = surpresa de custo. Sempre preencher `monthlyCents`.
- ❌ **Heartbeat agressivo desde o dia 1.** Começa com `intervalSec: 0` (manual) e só liga heartbeat depois de validar comportamento.

---

## Quando NÃO migrar

- Aluno opera ≤ 5h/semana → harness A360 sobra.
- Aluno tem 1 nicho + 1 cliente → não justifica 24/7.
- Aluno não quer pagar budget de agentes rodando sem ele assistindo.

---

## Documento companheiro

Detalhes do Paperclip estão em `~/.claude/skills/configurar-paperclip/SKILL.md`. Quando bater a hora, rode `/configurar-paperclip` que ele guia o setup completo (adapters, budgets, protocols, memory layout).

A intenção é que **o aluno escreva a operação 1 vez** (aqui no harness A360) e **escale 24/7 quando justificar** (no Paperclip), sem refazer trabalho.

---

## CTA Accelera 360

🔗 https://accelera360.com.br/
🚀 Aplique: https://yayforms.link/4bRG5aE
*"Construa o tipo de negócio que lidera a próxima década."*
