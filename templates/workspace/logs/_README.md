# logs/

> Event log do workspace — append-only NDJSON. Audit trail + recuperação de contexto cross-session.

## Arquivos

- **`events.ndjson`** — 1 linha = 1 evento JSON. Append-only. Nunca editar manualmente.

## Formato de cada evento

```json
{
  "timestamp": "2026-04-28T14:23:45Z",
  "agent": "gos-lp-builder",
  "action": "complete",
  "status": "ok",
  "client": "clinicas-derma-sp",
  "duration_ms": 12400,
  "tokens_in": 8500,
  "tokens_out": 3200,
  "details": {
    "output_path": "clientes/clinicas-derma-sp/lp/lp.html",
    "quality_gate": "passed"
  }
}
```

### Campos obrigatórios

| Campo | Tipo | Descrição |
|---|---|---|
| `timestamp` | ISO 8601 UTC | Momento do evento |
| `agent` | string | Nome do agent (skill) |
| `action` | enum | `start`, `complete`, `error`, `checkpoint`, `handoff_in`, `handoff_out`, `reflection` |
| `status` | enum | `ok`, `error`, `degraded`, `blocked`, `pending` |

### Campos opcionais

| Campo | Tipo | Quando |
|---|---|---|
| `client` | string | Quando ação é cliente-específica |
| `niche` | string | Quando ação é nicho-específica |
| `duration_ms` | number | Pra eventos `complete`/`error` |
| `tokens_in/out` | number | Pra cost tracking (Phase 4) |
| `details` | object | Payload extra (output_path, quality_gate, error_message...) |

## Boot sequence

`CLAUDE.md` raiz lê **últimas 10 linhas** no boot:

```bash
tail -n 10 logs/events.ndjson
```

Reconstrói:
- Última skill rodada
- Última ação completed
- Eventual erro/bloqueio pendente

## Quando escrever

Cada skill escreve evento em pontos-chave:

```
start                  ← invocação
handoff_in             ← payload validado
checkpoint             ← humano aprovou (deliverables)
handoff_out            ← payload de saída validado
complete | error       ← finalização
reflection             ← reflection escrita em memory/per-agent/{agent}/reflections.md
```

## Rotação

Quando `events.ndjson` passar de **10MB**, rotacionar:

```bash
mv logs/events.ndjson logs/events-{{YYYY-MM-DD}}.ndjson
touch logs/events.ndjson
```

Arquivos rotacionados ficam em `logs/` mesmo. Se ficar > 6 meses, mover pra `_arquivo/logs/`.

## Anti-pattern

- ❌ Editar `events.ndjson` manualmente — append-only.
- ❌ JSON multi-linha — 1 linha = 1 evento (NDJSON, não JSON puro).
- ❌ Eventos sem `timestamp` ou `agent` — sempre obrigatórios.
- ❌ Logar dados sensíveis (CPF, senha, token) — nunca.
- ❌ Logar payload completo de output — usar `details.output_path` pra apontar pro arquivo.

## Privacidade

Event log fica **local no workspace do aluno**. Nunca enviado pra servidor externo. Se o aluno commitar no Git, vira público — então:

- ✅ Logar: timestamps, agent names, paths canônicos, status, duration, tokens.
- ❌ Não logar: nomes reais de clientes (use slugs), prompts completos, outputs.
