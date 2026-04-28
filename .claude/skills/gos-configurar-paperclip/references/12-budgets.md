# 12 — Budgets (sem isso, runaway = bankrupt)

> **Crítico:** sem `budgetMonthlyCents` per-agent, um agent em loop pode quebrar
> a company toda em horas. 80% = warning soft. 100% = auto-pause.

## 12.1. Defaults conservadores

| Tier de agent | Budget mensal típico | Justificativa |
|---|---|---|
| Triage / Haiku | US$ 10-30 | Volume alto, custo unitário baixo |
| IC / Sonnet | US$ 50-150 | Execução moderada, ritmo previsível |
| PM / Sonnet | US$ 80-200 | Mais reasoning, mais delegação |
| CEO / Opus | US$ 100-300 | Decisões caras mas raras |
| Cliente-facing | US$ 50-200 | Volume varia com clientes |

Soma ≤ budget da company. Sempre defina **ambos**.

## 12.2. Configuração via `.paperclip.yaml`

Use snippet `paperclip-yaml-budgets.yaml`. Campos:

```yaml
budgets:
  company:
    monthlyCents: 50000        # US$ 500 teto da company
  agents:
    ceo:
      monthlyCents: 15000      # US$ 150
    triage-bot:
      monthlyCents: 1000       # US$ 10
    default:
      monthlyCents: 3000       # pega todo agent sem entry explícita
```

## 12.3. Configuração via API (alternativa, ad-hoc)

```bash
# Company budget
curl -X PATCH "$PC_API_BASE/api/companies/$PC_COMPANY_ID" \
  -H "Content-Type: application/json" \
  -d '{ "budgetMonthlyCents": 50000 }'

# Agent budget
curl -X PATCH "$PC_API_BASE/api/agents/$AGENT_ID" \
  -H "Content-Type: application/json" \
  -d '{ "budgetMonthlyCents": 15000 }'
```

## 12.4. Enforcement

- **80% (warning):** soft alert. Agente recebe warning no prompt — "focus on critical tasks only". Continua rodando.
- **100% (hard stop):** auto-pause. Sem mais heartbeats até budget aumentar OU 1º do mês UTC.

Reset: meia-noite UTC do primeiro dia do mês.

Para retomar agent pausado por budget:
```bash
# Aumentar budget
curl -X PATCH "$PC_API_BASE/api/agents/$AGENT_ID" \
  -d '{ "budgetMonthlyCents": 20000 }'

# OU aguardar reset mensal.
```

## 12.5. Visibilidade

```bash
# Sumário da company
curl -s "$PC_API_BASE/api/companies/$PC_COMPANY_ID/costs/summary" | jq

# Por agent
curl -s "$PC_API_BASE/api/companies/$PC_COMPANY_ID/costs/by-agent" | jq

# Por projeto
curl -s "$PC_API_BASE/api/companies/$PC_COMPANY_ID/costs/by-project" | jq
```

Campos típicos retornados: `provider`, `model`, `inputTokens`, `outputTokens`, `costCents`, `runCount`.

Dashboard UI em `localhost:3100/companies/<id>/costs`.

## 12.6. Pattern: anomaly detection

Configure alerta para spike inesperado. Adicione ao PROTOCOL.md de um agent "guardian":

```
## Daily cost check (apenas guardian-bot)
1. GET /api/companies/{id}/costs/by-agent
2. Para cada agent, comparar gasto últimas 24h vs média 7 dias.
3. Se algum agent com 3x média: criar issue "anomaly: <agent> spent <X> last 24h" e atribuir ao CEO.
```

## 12.7. Troubleshooting: agent atingiu budget muito rápido

Diagnóstico em ordem:

1. **Loop de heartbeat?** `paperclipai activity --agent-id <id>` — se há > 50 heartbeats/dia em agent que deveria ser 24, há loop.
2. **Modelo errado?** Conferir `.paperclip.yaml`. Opus em agent Sonnet-tier explode budget.
3. **Tool output explosion?** Heartbeats com input_tokens >> 100K significa contexto inflado. Audita `references/10-tool-output-truncation.md`.
4. **Cache hit rate baixo?** `references/11-prompt-caching.md`.
5. **maxTurnsPerRun muito alto?** Default 300 às vezes é excessivo. Considere 100.

## 12.8. Budgets como guard-rail, não freio

Bom budget:
- Força priorização (agent escolhe issues mais valiosas).
- Pega anomalias antes de gerar bill catastrófica.
- Permite experimentação contida (budget novo agent baixo enquanto valida ROI).

Mau budget:
- Tão apertado que agent vive em "warning mode" e não consegue trabalhar.
- Tão folgado que enquadra qualquer abuso.

Ajuste mensalmente baseado em uso real. Veja `references/22-audit-otimizacao.md §22.5` para review ritual.

## 12.9. Pegadinhas

- **Reset UTC, não local**: agent pode acordar "com budget renovado" às 21h horário SP no último dia do mês.
- **Budget é mensal — não daily, não yearly**: sem prorating. Agent contratado dia 28 tem 3 dias até reset.
- **Tokens != cents**: cost depende de modelo (Haiku é 60x mais barato que Opus). Não compare tokens entre agents direto.
- **Cache write é MAIS caro** que tokens normais (1.25x). Editar AGENTS.md grande durante o dia paga write múltiplas vezes.
- **`default` em budgets.agents**: nem todos os runtimes do Paperclip honram. Cheque dry-run import. Em dúvida, declare budget per-agent explicitamente.
- **Hire/fire muda config**: se hire novo agent via UI, ele pode pegar `default` budget. Sempre confirme via `paperclipai agent get <id>`.
