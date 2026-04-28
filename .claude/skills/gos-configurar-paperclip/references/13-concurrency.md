# 13 — Concurrency caps

> Cada chamada consome tokens. Rodar 20 agentes simultâneos não aumenta
> produtividade proporcionalmente — aumenta custo proporcionalmente.

## 13.1. Configuração via `.paperclip.yaml`

Use snippet `paperclip-yaml-concurrency.yaml`:

```yaml
concurrency:
  maxConcurrentAgents: 5
  maxConcurrentPerAgent: 1
  queueStrategy: priority   # priority | fifo | lifo
  perAgent:
    triage-bot:
      maxConcurrent: 3
```

## 13.2. Heurísticas de dimensionamento

| Cenário | maxConcurrentAgents |
|---|---|
| Solo founder, 1-3 agents | 2 |
| Small team, 5-10 agents | 3-5 |
| Heavy automation, 10-20 agents | 5-7 |
| Enterprise (raro) | 8-10 |

**Sinal de subdimensionamento:** queue depth > N por > 10min consistentemente. Se você vê isso no dashboard, considere subir.

**Sinal de sobredimensionamento:** custo descontrolado, agents disputando workspaces.

## 13.3. `queueStrategy`

- **`priority` (recomendado):** issues com priority alto rodam primeiro.
- **`fifo`:** primeiro chegou, primeiro executa. Justo mas ignora urgência.
- **`lifo`:** último chegou, primeiro executa. Útil para "interactive feel" em conversas.

Para customer-facing (agent responde mensagens), `lifo` melhora UX (resposta rápida na última pergunta).

Para batch processing, `priority` com priority field setado é ideal.

## 13.4. `maxConcurrentPerAgent`

- **`1`** (recomendado): um agent não roda 2 issues ao mesmo tempo. Evita conflito de workspace + simplifica session resumption.
- **`2-3`:** apenas se agent é stateless (ex: triage-bot, classifier puro).

## 13.5. Override por agente

```yaml
concurrency:
  maxConcurrentAgents: 5
  perAgent:
    triage-bot:
      maxConcurrent: 3       # triage roda 3 simultâneas
    customer-support:
      maxConcurrent: 2       # support roda 2 simultâneas
    # demais usam maxConcurrentPerAgent: 1
```

## 13.6. Workspace isolation e concurrency

Se `maxConcurrentPerAgent > 1` E agent compartilha `cwd`, há **risco de race condition** (dois processos editando mesmo arquivo). Mitigations:

1. Manter `maxConcurrentPerAgent: 1` por padrão.
2. Se precisar paralelizar, usar **per-issue worktrees** (Paperclip suporta isolated execution workspaces).
3. Ou agent ser puramente stateless (não escreve em `cwd`, só lê).

## 13.7. Verificação no dashboard

```bash
./scripts/pc-wrap.sh "dashboard get --company-id $PC_COMPANY_ID --json" | \
  jq '{queueDepth, runningAgents, queuedHeartbeats}'
```

Procure por:
- `runningAgents` próximo de `maxConcurrentAgents` consistentemente → considere aumentar.
- `queueDepth` cresce sem limite → throughput insuficiente.

## 13.8. Pegadinhas

- **`maxConcurrentAgents` global vs `perAgent.<slug>.maxConcurrent`**: o per-agent é teto local; o global é teto absoluto. Soma de per-agent caps NÃO precisa bater com global.
- **Batch jobs noturnos** podem precisar de cap diferente. Considere routine que ajusta config (raro — geralmente over-engineering).
- **Coalescing de wakeups**: Paperclip auto-coalesce duplicate wakeups quando agent já está rodando. Não precisa workaround.
- **Heartbeat run --agent-id (manual)** ainda respeita cap. Se cap atingido, manual run fica em queue.
- **Cap muito baixo bloqueia trabalho importante**: mas economia marginal. Prefira budget per-agent para controle de custo, e cap para controle de throughput.
