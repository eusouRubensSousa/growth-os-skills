# 16 — Arquitetura de memória (shared vs per-agent)

> Memória da company (decisões estratégicas, ICP, calendário) fica em
> `memory/shared/`. Memória individual fica em `memory/per-agent/<slug>/`.
> MEMORY.md fica < 5KB. Logs diários ficam separados.

## 16.1. Estrutura recomendada

```
memory/
├── shared/
│   ├── MEMORY.md              # decisões duráveis company-wide (< 5KB)
│   ├── daily/
│   │   ├── 2026-04-25.md      # log do dia (eventos, decisões, deltas)
│   │   └── 2026-04-24.md
│   ├── decisions/
│   │   ├── 2026-04-15-pricing-strategy.md
│   │   └── 2026-03-22-stripe-vs-braintree.md
│   └── incidents/
│       └── 2026-04-10-auth-outage.md
└── per-agent/
    ├── ceo/
    │   ├── MEMORY.md          # aprendizados específicos do CEO
    │   └── daily/
    │       └── 2026-04-25.md
    ├── cmo/
    │   ├── MEMORY.md
    │   └── daily/2026-04-25.md
    └── engineer/
        ├── MEMORY.md
        └── daily/2026-04-25.md
```

## 16.2. Regra de ouro: MEMORY.md curto

- **< 5KB total** por arquivo.
- Conteúdo: APENAS o que precisa estar em **toda** sessão.
- Cada byte é multiplicado por (heartbeats × dias × agentes que leem).

Tudo que não é load-bearing vai para:
- `daily/<date>.md` — log do dia (carregado on-demand quando relevante).
- `decisions/<date>-<topic>.md` — decisão durável (referenciada de MEMORY.md).
- `incidents/<date>-<id>.md` — learning de incident.

Use snippet `memory-md-template.md` como ponto de partida.

## 16.3. O que VAI no MEMORY.md (shared)

- **Mandate** company-wide ("North star", goal de Q2).
- **Top 3 active goals** (extra: ponteiros para PROJECT.md, não detalhes).
- **Active constraints** ("budget X", "no mobile work this quarter").
- **Approved patterns** ("for new agents: tier-based").
- **Forbidden actions** ("no hire without board approval", "no force-push").
- **Where to look** (TOC para daily, decisions, references).
- **Last consolidated date** (próximo: data + 30 dias).

## 16.4. O que NÃO vai no MEMORY.md

- Detalhe de implementação de uma decisão antiga (já está em `decisions/`).
- Daily log ("hoje fizemos X").
- Conversas resolvidas.
- Métricas que mudam (use dashboard).
- Status de tarefas (use API).

## 16.5. O que VAI no per-agent MEMORY.md

Aprendizados específicos do agent. Ex: para `engineer/MEMORY.md`:

```markdown
## Patterns que funcionam neste codebase
- Use Drizzle ORM (não Prisma). Migrations em `db/migrations/`.
- Tests em Vitest, NÃO Jest.
- API responses sempre via {data, error} envelope.

## Padrões falhos (don't repeat)
- 2026-04-12: tentei adicionar lockfile via yarn — quebrou pnpm workspace.
- 2026-04-18: middleware de auth invalidou sessão de mobile app — coordenar antes.

## Onde olhar
- Architecture: `agents/engineer/references/architecture.md`
- Conventions: `agents/engineer/references/coding-conventions.md`
```

## 16.6. Daily logs

Estrutura sugerida em `memory/shared/daily/2026-04-25.md`:

```markdown
# 2026-04-25 — Daily company log

## Done today
- engineer fechou issue #142 (JWT middleware).
- cmo aprovou copy de landing page Q2.

## Decisions made
- Pricing experiment vai com tier "Pro+" a $79/mo (decisão CEO).
- Move auth de Auth0 para custom JWT (decisão CTO + CEO).

## Blockers
- analyst esperando acesso a Mixpanel (board approval pendente).

## Spent today
- Approx $14 (within budget).

## Tomorrow's focus
- engineer: continuar refactor session storage.
- cmo: review draft Q2 launch comms.
```

Daily logs:
- Carregados **sob demanda** (não no system prompt).
- Permitem reconstruir contexto sem inflar MEMORY.md.
- Consolidados mensalmente: padrões recorrentes vão para MEMORY.md ou AGENTS.md.

## 16.7. Decisions log

Cada decisão durável vira `memory/shared/decisions/<YYYY-MM-DD>-<topic>.md`:

```markdown
# Decision: Pricing tier "Pro+" at $79/mo

**Date:** 2026-04-15
**Decided by:** CEO + CMO
**Status:** Approved

## Context
We need a tier between Pro ($29) and Enterprise (custom) to capture mid-market.

## Options considered
1. $49 — too close to Pro, dilutes.
2. $79 — sweet spot, validated via 12 customer interviews.
3. $99 — close to enterprise, confusing.

## Decision
$79/mo, with these features: ...

## Tradeoffs accepted
- Some Pro users may delay upgrade hoping for incremental value.
- Mitigation: CMO leads campaign explaining tier.

## Revisit date
2026-Q3 review.
```

Estes vivem no histórico — referenciar de MEMORY.md por path se ainda load-bearing.

## 16.8. Consolidação mensal (ritual)

Todo dia 1 do mês:

1. **Per-agent**: ler logs do mês passado, extrair padrões, atualizar `agents/<slug>/MEMORY.md` ou AGENTS.md.
2. **Shared**: ler logs do mês passado, atualizar `memory/shared/MEMORY.md` removendo decisões já codificadas, adicionando novas mandates.
3. **Archive**: mover daily logs para `memory/shared/daily/archive/<YYYY-MM>/`.

Pode ser delegado a um agent "memory-curator" rodando 1º do mês.

## 16.9. Cache implications

MEMORY.md é parte do system prompt na maioria dos runtimes → editar invalida cache (`references/11-prompt-caching.md`).

**Recomendação:** consolidação MEMORY.md é semanal/mensal, NÃO diária. Daily logs em `daily/` ficam fora do prompt cacheado.

## 16.10. Workflow de migração (legado → estrutura nova)

Se a company tem MEMORY.md gigante:

```
[1] Backup
    ./scripts/pc-backup.sh dir $PC_COMPANY_DIR/memory

[2] Criar dirs novos
    mkdir -p $PC_COMPANY_DIR/memory/{shared,per-agent}
    mkdir -p $PC_COMPANY_DIR/memory/shared/{daily,decisions,incidents}
    for SLUG in $(ls $PC_COMPANY_DIR/agents); do
      mkdir -p $PC_COMPANY_DIR/memory/per-agent/$SLUG/daily
    done

[3] Identificar seções extraíveis no MEMORY.md atual
    Decisões → memory/shared/decisions/
    Incidents → memory/shared/incidents/
    Padrões repetidos → AGENTS.md ou per-agent MEMORY.md

[4] MEMORY.md final mantém só load-bearing (use snippet memory-md-template.md como guia)

[5] Re-import e verifique
```

## 16.11. Pegadinhas

- **Daily logs em system prompt** = bomba. SEMPRE deixe daily logs fora do MEMORY.md principal.
- **Multi-agent edita MEMORY.md compartilhado**: race condition. Designate UM agent (memory-curator) para writes coordenados.
- **MEMORY.md > 5KB**: você está acumulando. Consolide.
- **Decisions sem data**: difícil referenciar depois. Sempre prefixe filename com `<YYYY-MM-DD>-`.
- **Logs maiúsculo/minúsculo**: `Daily.md` vs `daily.md` em filesystems case-sensitive quebra paths.
- **Versionamento git**: memory/ deveria estar versionado para rastrear evolução. Use git diff em MEMORY.md mensalmente para ver o que mudou.
