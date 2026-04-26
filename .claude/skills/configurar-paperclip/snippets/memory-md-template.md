# Snippet: MEMORY.md template (mantenha < 5KB)
#
# REGRA DE OURO: este arquivo é carregado em TODA sessão do agente.
# Cada byte aqui é multiplicado por (heartbeats × dias × agentes que leem).
# Mantenha apenas o que precisa estar SEMPRE disponível.
#
# Tudo que não precisa estar em toda sessão vai pros logs diários
# (`memory/daily/2026-04-25.md`) ou para `memory/decisions/<date>-<topic>.md`.
#
# Estrutura recomendada:
#   memory/
#   ├── shared/                          # company-level
#   │   ├── MEMORY.md                    # decisões duráveis (este arquivo)
#   │   ├── daily/2026-04-25.md          # log do dia
#   │   └── decisions/2026-04-15-pricing.md
#   └── per-agent/<slug>/
#       ├── MEMORY.md                    # aprendizados do agente
#       └── daily/2026-04-25.md

# MEMORY.md (shared)

## Mandate (load-bearing)
Build the #1 AI note-taking app at $1M MRR by 2026-12-31.
Primary differentiator: privacy (E2E encryption, local-first).

## Active goals (top 3 only — derivar resto via dashboard)
1. Ship onboarding flow v2 (owner: cmo, due 2026-05-15)
2. Migrate auth to JWT (owner: engineer, in_progress)
3. Q2 pricing experiment (owner: ceo, planning)

## Active constraints
- Budget company: $500/mo (33% used in April)
- No mobile work this quarter — focus on web first.
- Customer support uses ZenDesk (NÃO Intercom, decisão de 2026-03-10).

## Approved patterns
- For new agents: tier-based (Haiku triage / Sonnet exec / Opus strategic).
- For data ingestion: Airbyte → Supabase, NOT scraping with agent.
- For decisions > $500: board approval required.

## Forbidden actions (without explicit board approval)
- Hire new agent.
- Change tooling (Sentry, ZenDesk, Stripe).
- Mexer em arquivos de outro agente sem subtask + manager dual-approval.
- Force-push, drop table, mass DELETE.

## Where to look for more context
- Daily logs: `memory/shared/daily/<YYYY-MM-DD>.md`
- Decisions log: `memory/shared/decisions/`
- Per-agent learnings: `memory/per-agent/<slug>/MEMORY.md`
- Architecture: `references/architecture.md`
- KPIs / dashboards: `dashboard get --company-id <id>`

## Last consolidated
2026-04-20 (próximo: 2026-05-20)

<!--
INSTRUÇÕES PARA O AGENTE QUE EDITA ESTE ARQUIVO:
- Mantenha < 5KB total.
- Quando uma decisão antiga já está executada e codificada, REMOVA daqui
  e mova pro decisions/. Este arquivo é só "load-bearing context".
- Daily logs NÃO entram aqui — vivem em daily/.
- Se você não tem certeza se algo é load-bearing, NÃO adicione aqui.
- Consolidação mensal: extraia padrões recorrentes dos daily logs e
  promova para esta MEMORY.md ou para AGENTS.md.
-->
