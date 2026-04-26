# 07 — Roteamento de modelo por papel (impacto: muito alto)

> **Não use Opus pra tudo.** Tasks simples → Haiku. Complexas → Opus.
> Mesmo workload pode custar **30x menos** dependendo do roteamento.

## 7.1. Pricing referência (Apr 2026, Anthropic)

| Modelo | Input ($/M tokens) | Output ($/M tokens) | Cache hit ($/M) |
|---|---|---|---|
| Haiku 4.5 | $0.25 | $1.25 | $0.025 |
| Sonnet 4.6 | $3.00 | $15.00 | $0.30 |
| Opus 4.7 | $5.00 | $25.00 | $0.50 |

(Nota do playbook: Opus está em ~$15 input em alguns SKUs; sempre cheque docs.claude.com/pricing antes de planejar budget. Os patamares de **escala** entre tiers — Haiku 12x mais barato que Sonnet, Sonnet 5x mais barato que Opus — são o que importa.)

## 7.2. Mapeamento prático: papel → modelo

| Papel | Modelo recomendado | Por quê |
|---|---|---|
| triage-bot, classifier | Haiku 4.5 | Decisão binária, formato fixo |
| ACK / status reporter | Haiku 4.5 | Texto curto previsível |
| copywriter (drafts) | Sonnet 4.6 | Boa qualidade, custo razoável |
| copywriter (final brand voice) | Opus 4.7 | Refino exige sutileza |
| engineer (IC) | Sonnet 4.6 | Implementação de specs |
| engineer (architect) | Opus 4.7 | Design system high-stakes |
| QA / reviewer | Sonnet 4.6 | Diff comprehension |
| analyst | Sonnet 4.6 | Sumarização, tabelas |
| customer support | Sonnet 4.6 | Empatia + correção factual |
| PM | Sonnet 4.6 (com escalation Opus) | Planejamento ordinário |
| CEO / CTO / CMO | Opus 4.7 | Estratégia, decisões irreversíveis |
| housekeeping / cron jobs | Haiku 4.5 | Manutenção sem decisão |

## 7.3. Escalation pattern — dois agentes mesmo papel

Quando você quer ter **a mão pesada do Opus** disponível mas pagar Sonnet/Haiku no caminho comum:

```yaml
agents:
  pm-haiku:
    adapter:
      type: claude_local
      config:
        model: claude-haiku-4-5
        timeoutSec: 300

  pm-sonnet:
    adapter:
      type: claude_local
      config:
        model: claude-sonnet-4-6
        timeoutSec: 1200

  pm-opus:
    adapter:
      type: claude_local
      config:
        model: claude-opus-4-7
        timeoutSec: 1800
```

No `agents/pm-haiku/PROTOCOL.md`:

```
## Escalation
- Issue claramente trivial (ACK, status, lookup) → resolver agora.
- Issue exige decisão entre 2 caminhos com tradeoffs → escalate para pm-sonnet:
  - POST /api/issues/{id}/comments  body: "@pm-sonnet escalating: <reason>"
  - Reassign: PATCH /api/issues/{id}  body: { "assigneeAgentId": "<pm-sonnet-id>" }
- Issue exige decisão estratégica (cross-team, > $1k impact) → escalate para pm-opus.
```

## 7.4. Aplicação via `.paperclip.yaml`

Use o snippet `paperclip-yaml-routing.yaml` como base. Aplicar:

```bash
./scripts/pc-apply-patch.sh ./snippets/paperclip-yaml-routing.yaml --import
```

Customize antes de aplicar:
- Slugs dos seus agents (não os do snippet).
- Modelos por papel (cheque última versão dos modelos disponíveis).

## 7.5. Multimodal: roteamento por modalidade

Tarefas com mídia (imagem, PDF, áudio) costumam ser **mais baratas** em Gemini Flash que em Claude. Se a company usa multimodal pesado:

```yaml
agents:
  image-analyzer:
    adapter:
      type: opencode_local
      config:
        model: google/gemini-2.5-flash
        timeoutSec: 600
```

Roteamento por modalidade aplicado em workflows de análise visual, OCR, transcrição de áudio.

## 7.6. Padrões anti-econômicos (a evitar)

- ❌ Opus default em todos os agents — gasto 5-10x maior sem qualidade proporcional.
- ❌ Haiku para CEO — Haiku falha em decisões estratégicas com nuance.
- ❌ Sonnet para triagem trivial — Haiku resolve por 1/12 do custo.
- ❌ Mesmo agent fazendo triagem + execução — separe em 2 (Haiku triage → Sonnet exec).
- ❌ Modelo "future-proof" mais novo/caro: pague pelo que entrega hoje, faça upgrade quando ROI justificar.

## 7.7. Como medir economia esperada

Antes de aplicar:
```bash
# Custo último mês
./scripts/pc-wrap.sh "dashboard get --company-id $PC_COMPANY_ID --json" | jq '.costs.lastMonthCents'

# Por agente
curl -s "$PC_API_BASE/api/companies/$PC_COMPANY_ID/costs/by-agent" | jq
```

Calcular para cada agent que vai migrar:
- Tokens médios por heartbeat.
- Heartbeats/mês.
- Cost atual vs cost projetado (Haiku 12x mais barato; Sonnet 5x mais barato que Opus).

Após 7 dias da mudança, comparar. Esperado: 50-70% redução no custo dos agents migrados.

## 7.8. Pegadinhas

- **Modelo deprecation**: Anthropic deprecia modelos antigos com aviso. Tenha rota de migração documentada.
- **Tokens cache** mudam por modelo: Haiku tem TTL/discount idêntico a Sonnet em ephemeral cache.
- **`opencode_local` valida modelo**: errar formato `provider/model` faz import falhar.
- **Streaming**: latência percebida muda por modelo. Para customer-facing, considere Haiku mesmo em casos de borda — UX > qualidade incremental.
- **A/B test antes de migrar agent crítico**: rode 1 semana com 50% workload no novo modelo, compare quality bar.
