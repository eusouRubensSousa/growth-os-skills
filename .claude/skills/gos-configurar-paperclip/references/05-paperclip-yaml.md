# 05 — Schema completo de `.paperclip.yaml`

> O sidecar vendor-specific que vive na raiz do company package. É **opcional**
> mas é onde mora toda configuração de runtime: adapters, env, routines, budgets.

## 5.1. Schema base

```yaml
schema: paperclip/v1   # obrigatório

agents:
  <slug>:
    adapter:
      type: claude_local | codex_local | gemini_local | opencode_local |
            hermes_local | droid_local | cursor | openclaw_gateway |
            process | http
      config:
        # Campos dependem do tipo. Ver §5.3.
    inputs:
      env:
        <KEY>:
          kind: secret | plaintext
          requirement: required | optional
          default: ""
    heartbeat:
      enabled: true
      intervalSec: 0
      wakeOnAssignment: true
      wakeOnOnDemand: true
      wakeOnAutomation: true

routines:
  <routine-id>:
    triggers:
      - kind: schedule | webhook | api | event
        cronExpression: "0 9 * * 1"
        timezone: America/Sao_Paulo
    assignee: <agent-slug>
    description: |
      ...
    catchUpPolicy: skip | run-once | run-all  # opcional
    concurrency: 1                              # opcional

budgets:
  company:
    monthlyCents: 50000
  agents:
    <slug>:
      monthlyCents: 5000
    default:
      monthlyCents: 3000

concurrency:
  maxConcurrentAgents: 5
  maxConcurrentPerAgent: 1
  queueStrategy: priority | fifo | lifo
```

## 5.2. `agents.<slug>.adapter.config` por tipo

### `claude_local` (Claude Code CLI)

```yaml
adapter:
  type: claude_local
  config:
    cwd: /workspaces/engineer        # absolute, auto-criado se permitido
    model: claude-opus-4-7           # ou sonnet-4-6, haiku-4-5
    promptTemplate: |
      You are {{agent.name}} for {{company.name}}.
      Read AGENTS.md and PROTOCOL.md before acting.
    env:
      ANTHROPIC_API_KEY:
        kind: secret
        requirement: required
    timeoutSec: 1800                 # tempo máximo por heartbeat
    graceSec: 30                     # tempo após timeout para graceful kill
    maxTurnsPerRun: 200              # default 300
    dangerouslySkipPermissions: false  # CUIDADO em automação não-supervisionada
    args: []                         # CLI args extra
```

**Variáveis suportadas no `promptTemplate`:**
- `{{agentId}}`, `{{companyId}}`, `{{runId}}`
- `{{agent.name}}`, `{{company.name}}`

**Session resumption:** mesmo `cwd` → mesma session id (Claude Code resume).
Mudar `cwd` força nova sessão (limpa contexto inflado).

### `codex_local` (OpenAI Codex CLI)

Similar ao claude_local. Skills loadadas via global skills directory (não `--add-dir`).

```yaml
adapter:
  type: codex_local
  config:
    cwd: /workspaces/engineer
    model: gpt-5-codex               # ou outro Codex model
    timeoutSec: 1800
    env:
      OPENAI_API_KEY:
        kind: secret
        requirement: required
```

### `opencode_local` / `gemini_local` / `hermes_local` / `droid_local`

```yaml
adapter:
  type: opencode_local
  config:
    cwd: /workspaces/agent
    model: anthropic/claude-sonnet-4-6   # FORMATO: provider/model
    timeoutSec: 1800
```

**Importante para opencode:** `model` deve ser `provider/model`, validado contra lista de modelos disponíveis.

### `process` (shell genérico)

```yaml
adapter:
  type: process
  config:
    cwd: /workspaces/agent
    command: ["/usr/local/bin/my-agent", "--mode", "heartbeat"]
    timeoutSec: 600
    env:
      MY_API_KEY:
        kind: secret
        requirement: required
```

### `http` (webhook bot)

```yaml
adapter:
  type: http
  config:
    endpoint: https://my-agent.example.com/heartbeat
    method: POST
    timeoutSec: 60
    headers:
      Authorization: "Bearer {{secrets.MY_AGENT_TOKEN}}"
```

### `cursor` / `openclaw_gateway`

External adapters — config específica em docs/adapters/<name>.md do repo Paperclip.

## 5.3. `agents.<slug>.heartbeat`

```yaml
heartbeat:
  enabled: true
  intervalSec: 0          # 0 = só event-driven, sem timer agendado
                          # 14400 = 4h, 28800 = 8h
  wakeOnAssignment: true  # acorda quando recebe issue
  wakeOnOnDemand: true    # acorda em manual ping (UI, CLI)
  wakeOnAutomation: true  # acorda em routines.* listadas
```

**Recomendação econômica:** `intervalSec: 0` + `wakeOnAssignment: true`. Heartbeat agendado é o vazamento #3 do playbook.

## 5.4. `routines.<id>` — triggers

### Schedule (cron)

```yaml
routines:
  weekly-review:
    triggers:
      - kind: schedule
        cronExpression: "0 9 * * 1"      # 9h segunda-feira
        timezone: America/Sao_Paulo
    assignee: ceo
    description: |
      Review last week metrics.
    catchUpPolicy: skip          # se servidor estava down, NÃO rodar atrasado
    concurrency: 1               # máx 1 instance dessa routine simultânea
```

**Cron syntax:** padrão 5 partes (`minute hour day month dow`). Nunca shorthand (`1d`, `30m` rejeitados).

Exemplos úteis:
- `0 6 * * *` — todo dia 6h
- `0 9 * * 1-5` — segunda a sexta 9h
- `*/30 * * * *` — a cada 30min (CARO — evite)
- `0 22 * * 0` — domingo 22h

### Webhook

```yaml
routines:
  on-stripe-event:
    triggers:
      - kind: webhook
        path: /webhooks/stripe
        # secret para HMAC validation:
        secret:
          kind: secret
          requirement: required
          envVar: STRIPE_WEBHOOK_SECRET
    assignee: finance-bot
```

### API

```yaml
routines:
  manual-trigger:
    triggers:
      - kind: api
        # Disparado via POST /api/routines/manual-trigger/trigger
    assignee: ops
```

## 5.5. `inputs.env.<KEY>`

```yaml
inputs:
  env:
    ANTHROPIC_API_KEY:
      kind: secret              # secret | plaintext
      requirement: required     # required | optional
      default: ""               # se optional e não passado
      description: |
        API key for Anthropic Claude.
```

Valores resolvidos em ordem:
1. Secret store do Paperclip (`secrets.json` da instância).
2. Env var do processo.
3. `default` se `requirement: optional`.
4. Erro se `requirement: required` e nada encontrado.

## 5.6. `budgets`

```yaml
budgets:
  company:
    monthlyCents: 50000   # teto da company
  agents:
    ceo:
      monthlyCents: 15000
    default:
      monthlyCents: 3000  # pega qualquer agent sem entry explícita
```

**Enforcement:**
- 80% (warning): agente recebe warning no prompt.
- 100% (hard stop): agente é auto-pausado.
- Reset: 1º do mês UTC.

API equivalentes:
- `PATCH /api/companies/{id}` body `{ budgetMonthlyCents }`
- `PATCH /api/agents/{id}` body `{ budgetMonthlyCents }`

## 5.7. `concurrency`

```yaml
concurrency:
  maxConcurrentAgents: 5         # globalmente, quantos rodam em paralelo
  maxConcurrentPerAgent: 1       # 1 = um agent não roda 2 issues juntas
  queueStrategy: priority        # priority | fifo | lifo
  perAgent:
    triage-bot:
      maxConcurrent: 3           # override
```

## 5.8. Validação

Após editar `.paperclip.yaml`, sempre:

```bash
./scripts/pc-wrap.sh "company import $PC_COMPANY_DIR --company-id $PC_COMPANY_ID --dry-run"
```

Erros comuns no dry-run:
- `Unknown adapter type`: typo em `adapter.type`.
- `Cron expression invalid`: shorthand usado (use 5 partes).
- `Agent slug "X" not found in package`: slug em `routines.assignee` ou `budgets.agents` não bate com pasta `agents/<slug>/`.
- `Required env "X" not declared in inputs.env`: secret usado em `promptTemplate` mas não declarado.

## 5.9. Pegadinhas

- **YAML é YAML** — indentação significativa. Use 2 espaços.
- **Lista vs dict**: `agents:` é dict (slugs como keys), `triggers:` em routine é lista.
- **Comentários**: YAML usa `#`. NÃO usa `//`.
- **Strings com `:` interno** (ex: timezone): NÃO precisa quotear `America/Sao_Paulo` mas SIM precisa para `0 9 * * 1` (precedido por `cronExpression: "..."` para evitar interpretação como número).
- **Vendors devem ignorar campos desconhecidos** — você pode adicionar `metadata.<vendor>: ...` sem quebrar import.
- **Atualizações in-place**: `--collision-strategy replace` no import substitui campos. `rename` (default) cria novo. `skip` ignora collisions.
