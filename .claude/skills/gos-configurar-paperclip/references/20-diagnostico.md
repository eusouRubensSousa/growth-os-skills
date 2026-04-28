# 20 — Diagnóstico (doctor, costs, dashboard, logs)

> Comandos e endpoints para entender o estado da instância. Use ANTES de
> aplicar mudanças (snapshot baseline) e DEPOIS (verificar que mudou o que
> deveria).

## 20.1. Health check rápido

```bash
./scripts/pc-wrap.sh "doctor"
./scripts/pc-wrap.sh "doctor --repair"     # repair onde possível
./scripts/pc-wrap.sh "env"                 # config resolvida
./scripts/pc-wrap.sh "--version"
```

Doctor valida:
- Server config OK.
- Database conectividade.
- Secrets store acessível.
- Storage path writable.
- Key files presentes.

Erros comuns:
- `Database connection failed`: cheque `DATABASE_URL` ou embedded postgres.
- `Storage not writable`: cheque permissions em `PAPERCLIP_HOME`.
- `Secret missing: X`: declare em secrets ou env.

## 20.2. Dashboard

```bash
./scripts/pc-wrap.sh "dashboard get --company-id $PC_COMPANY_ID --json"
```

Retorna agregado: agents, issues, costs, queueDepth.

Via UI: `http://localhost:3100/companies/<id>/dashboard`.

## 20.3. Costs APIs

```bash
# Sumário da company (mês corrente)
curl -s "$PC_API_BASE/api/companies/$PC_COMPANY_ID/costs/summary" | jq

# Por agent
curl -s "$PC_API_BASE/api/companies/$PC_COMPANY_ID/costs/by-agent" | jq

# Por projeto
curl -s "$PC_API_BASE/api/companies/$PC_COMPANY_ID/costs/by-project" | jq
```

Campos típicos: `provider`, `model`, `inputTokens`, `outputTokens`, `costCents`, `runCount`.

## 20.4. Cache hit rate (input optimization)

Se o adapter retorna usage com cache fields (Anthropic):

```bash
./scripts/pc-wrap.sh "activity --agent-id <id> --json" \
  | jq '[.[] | .usage // empty]
        | map({
            read: (.cache_read_input_tokens // 0),
            creation: (.cache_creation_input_tokens // 0),
            input: (.input_tokens // 0)
          })
        | add
        | {hit_rate: (.read / (.read + .creation + .input))}'
```

Target: > 60%. Detalhes em `references/11-prompt-caching.md`.

## 20.5. Activity log

```bash
# Últimas atividades
./scripts/pc-wrap.sh "activity --company-id $PC_COMPANY_ID --json" | jq '.[]' | head -50

# Filtro por entity
./scripts/pc-wrap.sh "activity --company-id $PC_COMPANY_ID --entity-type issue --json"

# Por agent
./scripts/pc-wrap.sh "activity --agent-id <id> --json" | jq '.[] | {ts, action, status, runLiveness}'
```

## 20.6. Agent inspection

```bash
# Listar agents
./scripts/pc-wrap.sh "agent list --company-id $PC_COMPANY_ID"

# Detalhes de um agent
./scripts/pc-wrap.sh "agent get <agent-id>"
```

Procure por:
- `status`: active / idle / running / error / paused / terminated.
- `spentMonthlyCents` vs `budgetMonthlyCents`.
- `lastHeartbeatAt`: agent acordou recentemente?

## 20.7. Issues

```bash
./scripts/pc-wrap.sh "issue list --company-id $PC_COMPANY_ID"
./scripts/pc-wrap.sh "issue list --company-id $PC_COMPANY_ID --status blocked"
./scripts/pc-wrap.sh "issue get <issue-id>"
```

Sintomas para procurar:
- Issues `blocked` há > 24h sem update.
- Issues sem assignee.
- Issues `in_progress` por mais de 7 dias (zombie).

## 20.8. Heartbeat manual (debug)

```bash
./scripts/pc-wrap.sh "heartbeat run --agent-id <agent-id>"
```

Útil para:
- Validar setup após mudança.
- Testar uma skill nova.
- Forçar processing de uma issue específica.

Saída inclui: status, runLiveness, tokens usados, output truncado.

## 20.9. Logs do servidor

### Native

```bash
# Default location
tail -f ~/.paperclip/logs/server.log

# Se rodando via systemd
journalctl -u paperclip --user -f

# Se rodando via tmux/foreground
# Ver no terminal onde foi iniciado
```

### Docker

```bash
ssh $PC_HOST "docker logs $PC_CONTAINER -f --tail 100"
ssh $PC_HOST "docker logs $PC_CONTAINER 2>&1 | grep -iE 'error|fatal'"
```

## 20.10. Snapshot completo (audit mode)

Para diagnóstico holístico:

```bash
./scripts/pc-audit.sh /tmp/audit.txt
cat /tmp/audit.txt
```

Coleta tudo: target, version, doctor, env, agents, dashboard, costs, package structure, logs filtrados.

Use isso como BASELINE antes de qualquer mudança grande, e como verificação DEPOIS.

## 20.11. Métricas-chave para monitorar

| Métrica | Target | Como medir |
|---|---|---|
| Custo por heartbeat | < US$ 0.10 (Sonnet médio) | costs.by-agent ÷ runCount |
| Tokens médios input/turno | < 5.000 | `activity` + jq agregado |
| Tokens médios output/turno | < 1.000 | idem |
| Cache hit rate | > 60% | §20.4 |
| Heartbeats vazios (empty_response) | < 30% | `activity` filter runLiveness |
| Tasks done por agente/dia | depende — define baseline e melhora | dashboard |
| Tempo médio de heartbeat | < 60s | activity ts diff |
| Custo por task entregue | depende — baseline + improve | costs ÷ tasks_done |

## 20.12. Identificando agent runaway

Sintoma: spike inesperado em costs.

```bash
# Agents que mais gastaram últimos 7 dias
curl -s "$PC_API_BASE/api/companies/$PC_COMPANY_ID/costs/by-agent" \
  | jq 'sort_by(.costCents) | reverse | .[0:5]'
```

Se top 1-2 estão muito acima do esperado:
1. `paperclipai activity --agent-id <id>` — quantos heartbeats?
2. Se > 2x esperado: cheque `intervalSec`, há loop.
3. Cheque tokens médios: subiu? Tool output explosion (`references/10-*.md`).
4. Cheque modelo: trocaram para Opus por engano?
5. Pause: `PATCH /api/agents/<id>` body `{ "status": "paused" }`.
6. Investigue antes de retomar.

## 20.13. Pegadinhas

- **`activity` sem filtro retorna tudo** — pode ser muito grande. Use `--limit 50` ou filtros.
- **`runLiveness` != `status` da issue**: liveness é do RUN; status é da ISSUE.
- **Run com erro mas issue `in_progress`**: agent crashed mid-run, próximo heartbeat retoma.
- **Cache hit rate em adapter sem suporte** retorna 0 sempre — verificar adapter docs.
- **Logs > 1GB**: ative log rotation (`logrotate` em native, log-driver em docker).
- **Dashboard pode estar cached**: refresh duro no UI ou consulte API direto.
