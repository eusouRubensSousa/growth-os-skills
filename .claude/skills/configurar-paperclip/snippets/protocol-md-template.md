# PROTOCOL.md — heartbeat protocol slim para um agente individual
#
# Substitui a skill `paperclip.md` monolítica (~3.000 tokens) por ~40-60 linhas
# por papel. Economia: ~3.000 tokens × N agentes × M heartbeats/dia.
#
# Cole em `agents/<slug>/PROTOCOL.md` e referencie no AGENTS.md como:
#   ## Protocol Override
#   Read PROTOCOL.md instead of invoking the paperclip skill.

# Heartbeat Protocol (slim)

A cada heartbeat, executar EXATAMENTE estes passos. Nada mais. Nada menos.

## 1. Identity check

```
GET /api/agents/me
```

Capture: `id`, `slug`, `companyId`, `budgetMonthlyCents`, `spentMonthlyCents`.

**Se `spent / budget > 0.8`**: foque apenas em tarefas críticas. Comente em issues que precisar pausar para budget review.

**Se `spent / budget >= 1.0`**: pare. Não continue. Você foi auto-pausado.

## 2. Pending approvals

```
GET /api/approvals?assigneeAgentId=me&status=pending
```

Resolva approvals primeiro — destrava trabalho de outros agentes.

## 3. Pick work

Em ordem de prioridade:

1. Issues que mencionam `PAPERCLIP_TASK_ID` ou `@me` em comments recentes (últimos 24h).
2. Issues atribuídos a você com status `in_progress`.
3. Issues atribuídos a você com status `in_review` que receberam comentário novo.
4. Issues atribuídos a você com status `todo`, ordenados por priority.

```
GET /api/issues?assigneeAgentId=me&status=in_progress,todo,in_review
```

## 4. Checkout (lock)

ANTES de tocar a issue:

```
POST /api/issues/{issueId}/checkout
```

**Se 409 Conflict**: outra agente está mexendo. NÃO RETRY. Pegue outra issue.

## 5. Execute

- Leia issue + last 10 comments. NÃO leia histórico inteiro.
- Faça o trabalho **no mesmo heartbeat** sempre que possível.
- Não pare em "plan only" a menos que a issue explicitamente pediu plano.
- Para decisão que precisa de humano: use `request_confirmation` interaction, não pergunta aberta.

## 6. Update status

Use header `X-Paperclip-Run-Id` em todas as escritas.

- **Done**: comment com summary + transition para `done`.
- **Blocked**: comment explicando bloqueio + transition para `blocked` + tag o manager.
- **In review**: comment com summary + transition para `in_review`.

## 7. Subtask delegation (se aplicável)

Se a issue requer trabalho fora da sua expertise:

```
POST /api/issues   { "parentId": "<issueId>", "goalId": "<goalId>", "assigneeAgentId": "<other-agent>" }
```

Não delegue cancelando — sempre cria subtask com `parentId`.

## 8. Cost report (automático)

O adapter já reporta tokens/cost. Você NÃO precisa fazer manual.

## Restrições explícitas

- NUNCA faça PATCH manual de `status` para `in_progress` — só `checkout` faz isso.
- NUNCA retry um 409.
- NUNCA continue depois de `spent >= budget`.
- NUNCA log valor inteiro de secret.
