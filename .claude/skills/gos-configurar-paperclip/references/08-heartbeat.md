# 08 — Heartbeat conservador (vazamento #3 do playbook)

> **Heartbeat agressivo + tasks vagas = runaway loop.** Comece com intervalos
> **largos (4-8h)** ou **só event-driven** (`intervalSec: 0`). Modelos baratos
> primeiro. Heartbeat agressivo só depois que ROI está claro.

## 8.1. Como funciona o heartbeat

A cada heartbeat:

1. Servidor invoca `adapter.execute(agent_id)`.
2. Adapter spawna runtime (Claude Code, Codex, etc).
3. Agent faz protocol: identity → approvals → assignments → checkout → execute → status update.
4. Resultado capturado (status, tokens, output) e persistido.

**Custo por heartbeat:** geralmente **$0.05–$0.50** dependendo de modelo, tamanho do contexto e cache hit rate. Multiplique por agentes × ticks/dia.

## 8.2. Triggers (4 tipos)

| Trigger | Quando dispara | Custo |
|---|---|---|
| Schedule (cron) | A cada N minutos/horas/dias | Constante (paga mesmo ocioso) |
| Assignment | Quando issue é atribuída ao agent | Variável (só quando há trabalho) |
| On-demand | Manual (UI ou CLI `paperclipai heartbeat run`) | Por uso |
| Automation | Disparado por system event (approval, webhook) | Por evento |

**Princípio do playbook:** *Prefira **assignment** e **webhook** sobre **schedule**. Agente que reage custa menos que agente que ronda.*

## 8.3. Configuração econômica recomendada

### Default agressivo (anti-pattern — evite)

```yaml
heartbeat:
  enabled: true
  intervalSec: 1800   # 30min — RONDA constante
  wakeOnAssignment: true
  wakeOnOnDemand: true
  wakeOnAutomation: true
```

Resultado: 48 ticks/dia × N agentes mesmo ociosos. Caro.

### Conservador (recomendado para começar)

```yaml
heartbeat:
  enabled: true
  intervalSec: 0      # 0 = só event-driven, sem timer
  wakeOnAssignment: true
  wakeOnOnDemand: true
  wakeOnAutomation: true
```

Resultado: agente só roda quando há trabalho (issue atribuída, manual ping, ou routine listada).

### Conservador com pulse opcional (agente "burocrata")

```yaml
heartbeat:
  enabled: true
  intervalSec: 21600   # 6h — pulse pra catchup ocasional
  wakeOnAssignment: true
  wakeOnOnDemand: true
```

Use para: agentes que precisam ocasionalmente fazer housekeeping mesmo sem assignment (ex: revisar backlog stale, follow-up em issues blocked).

## 8.4. Configuração por papel

| Papel | Heartbeat | Modelo | Razão |
|---|---|---|---|
| Customer-facing (atendimento) | `intervalSec: 0` event-driven only | Sonnet | Reage a webhook/mensagem |
| Burocrata (relatórios, análises) | Diário 6h via routine | Sonnet | Estado muda lentamente |
| Estratégico (CEO, CMO) | Semanal segunda 9h via routine | Opus | Decisão deliberada |
| Maintenance (housekeeping) | Diário 22h via routine | Haiku | Limpeza |
| IC engineer | `intervalSec: 0` event-driven | Sonnet | Reage a issue assignment |
| Triage | `intervalSec: 0` event-driven | Haiku | Reage a issue criada |

## 8.5. Aplicação

Use snippet `paperclip-yaml-routines.yaml`:

```bash
./scripts/pc-apply-patch.sh ./snippets/paperclip-yaml-routines.yaml --import
```

Customize antes de aplicar:
- Slugs dos agents.
- Cron expressions (timezone certo).
- Heartbeat policy por agent.

## 8.6. Hot-reload de heartbeat

Mudou heartbeat de um agent? `paperclipai company import` aplica sem restart do servidor. Próximo heartbeat já honra novo schedule.

## 8.7. Cron expressions úteis

| Expression | Significado |
|---|---|
| `0 9 * * *` | todo dia 9h |
| `0 9 * * 1-5` | seg-sex 9h |
| `0 9 * * 1` | segunda 9h |
| `0 22 * * 0` | domingo 22h |
| `0 */4 * * *` | a cada 4h (00, 04, 08, 12, 16, 20) |
| `*/30 * * * *` | a cada 30min — CARO, evite |
| `0 0 1 * *` | dia 1 de cada mês meia-noite |

**SEMPRE** especifique `timezone:` na routine. Default UTC pode levar ao agente acordar 3h da manhã se usuário pensava em horário local.

## 8.8. catchUpPolicy

Servidor down quando cron deveria disparar?

```yaml
routines:
  weekly-review:
    catchUpPolicy: skip   # NÃO rodar atrasado quando voltar
    # ou: run-once          # rodar UM heartbeat de catchup
    # ou: run-all           # rodar TODOS os ticks perdidos (raramente desejável)
```

Default: `skip`. Evita storm de heartbeats após downtime.

## 8.9. Concurrency em routines

```yaml
routines:
  weekly-review:
    concurrency: 1   # max 1 instance dessa routine simultânea
```

Importante quando: routine pode levar > intervalo entre triggers (ex: rotina de 30min que demora 40min).

## 8.10. Como saber se está acordando ocioso

Sintoma: muitos heartbeats com run liveness `empty_response` ou `plan_only` sem trabalho real.

```bash
./scripts/pc-wrap.sh "activity --agent-id <id> --json" | jq '.[] | select(.runLiveness == "empty_response")' | jq -s 'length'
```

Se > 30% dos heartbeats são vazios: heartbeat está agressivo demais. Aumente `intervalSec` ou troque para event-driven.

## 8.11. Pegadinhas

- **`enabled: false`** desliga TODOS os triggers (incluindo assignment). Use `intervalSec: 0` se quer manter event-driven.
- **Heartbeat scheduling != timezone do servidor**: declare explicitamente em `routines.<id>.triggers[].timezone`.
- **Routines + per-agent intervalSec se sobrepõem**: agente recebe heartbeat de AMBOS. Cuidado para não duplicar.
- **Manual `heartbeat run`** (CLI) sempre dispara, mesmo se `enabled: false` ou agent pausado por budget.
- **Run liveness `plan_only`** dispara continuação automática (próximo heartbeat encadeado). Se agent fica em loop "plan_only", investigue PROTOCOL.md (provavelmente o agent está parando antes da execução).
- **Activity log enche rápido**: descarte/archive logs > 30 dias. `paperclipai activity` aceita filtros.
