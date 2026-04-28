# 18 — Determinístico vs agente (princípio fundador)

> *"Empurre cada operação para o lado mais barato que ainda resolve o problema.
> Use determinismo onde for possível, probabilismo onde for necessário."*
>
> Cada token gasto deve fazer trabalho que **só LLM consegue fazer**.

## 18.1. Tabela de decisão

| Tipo de trabalho | Ferramenta correta | Por quê |
|---|---|---|
| Coletar dados de API previsível | Cron + script | Determinístico, barato |
| Calcular métricas, agregações | SQL + views | Determinístico, eficiente |
| Comparar com benchmarks | SQL com WHERE | Determinístico |
| Detectar anomalia por regra fixa | If/else | Determinístico |
| **Interpretar por que anomalia ocorreu** | **Agente** | Probabilístico, contextual |
| **Decidir entre ações ambíguas** | **Agente** | Trade-offs com nuance |
| **Comunicar pro stakeholder no tom certo** | **Agente** | Linguagem + empatia |
| Executar ação determinada | API call | Determinístico |
| Logar evento estruturado | Insert | Determinístico |

## 18.2. Arquitetura recomendada (4 camadas)

```
┌─────────────────────────────────────────────────────────────┐
│  CAMADA 1 — INGESTÃO (determinística, cron)                 │
│  Airbyte / n8n / Node.js → APIs externas → Postgres         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  CAMADA 2 — TRANSFORMAÇÃO (determinística, SQL)             │
│  Views materializadas, agregações, alertas por regra fixa   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  CAMADA 3 — RACIOCÍNIO (probabilística, agente)             │
│  Paperclip → consulta views → julga → recomenda            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  CAMADA 4 — AÇÃO (determinística, MCP/API)                  │
│  MCP write servers executam decisão aprovada                │
└─────────────────────────────────────────────────────────────┘
```

## 18.3. Stack recomendada para INGESTÃO

| Tipo de fonte | Ferramenta | Por quê |
|---|---|---|
| Meta Ads, Google Ads, GA4, Stripe | Airbyte (self-hosted) | Conectores prontos, gratuito, estável |
| Webhooks, automação leve | n8n | Visual, rápido de configurar |
| CRMs nicho, ERPs específicos | Node.js + SDK oficial | Trabalho artesanal — DFY justifica |
| Leituras ad-hoc do agente | MCP servers | Reaproveita infra |

**Custo típico:** US$ 20-50/mês de VPS para stack completa (Airbyte + n8n + Supabase). Substitui facilmente US$ 500-2.000/mês de Fivetran ou agente fazendo ETL.

## 18.4. SQL Views como contrato com o agente

Em vez de:
```python
# Agent puxa raw data e calcula
SELECT * FROM ad_events WHERE date > '2026-04-01'
# (50K linhas → context explode)
# Agent: "I'll calculate ROAS by summing... wait, summing what again?"
```

Crie SQL view:
```sql
CREATE VIEW campaign_performance_last_30d AS
SELECT
  campaign_id,
  campaign_name,
  SUM(spend_cents) AS total_spend_cents,
  SUM(revenue_cents) AS total_revenue_cents,
  CASE WHEN SUM(spend_cents) > 0
       THEN SUM(revenue_cents)::float / SUM(spend_cents)
       ELSE NULL END AS roas
FROM ad_events
WHERE date > NOW() - INTERVAL '30 days'
GROUP BY campaign_id, campaign_name;
```

Agent consulta:
```python
# Pequeno, direto
SELECT * FROM campaign_performance_last_30d WHERE roas < 2 ORDER BY total_spend_cents DESC LIMIT 20;
```

Agent gasta tokens **interpretando** (por que campanha X com ROAS baixo?), não calculando.

## 18.5. Alertas por regra fixa, não agente

Agent não deve **acordar a cada 30min** para ver se ROAS caiu. Use SQL trigger ou cron:

```sql
-- Trigger ou query de alerta
SELECT campaign_id FROM campaign_performance_last_30d
WHERE roas < 1.5 AND total_spend_cents > 10000;
```

Quando regra dispara, **AÍ** acorda agent (via webhook routine):
```yaml
routines:
  on-roas-drop-alert:
    triggers:
      - kind: webhook
        path: /webhooks/alert/roas-drop
    assignee: cmo
```

Resultado: agent só roda quando há trabalho real.

## 18.6. MCP write servers para CAMADA 4 (ação)

Quando agent decide ação ("pause campaign X"), em vez de agent fazer API call diretamente:

1. Agent pede ação a um MCP server (ex: `meta-ads-mcp`).
2. MCP server valida + executa + retorna confirmação.

Vantagens:
- MCP server pode ser reusado por múltiplos agents.
- Logging/audit centralizado.
- Validação determinística antes de chamar API real.
- Permission gates ("só CEO pode pausar campanha > $1k").

## 18.7. Padrão prático: agent escreve menos código possível

| Workflow | Agent faz | Determinístico faz |
|---|---|---|
| Daily revenue report | Sumariza tendências, sugere ações | SQL gera tabelas, cron envia email |
| Detectar churn risk | Interpreta padrões em users high-risk | Modelo ML / regra de DB cospe lista |
| Responder ticket de suporte | Escreve resposta empática + correta | Lookup automático de account/order |
| Aprovar pagamento | Interpreta contexto + decide | Stripe API faz a transação |
| Onboard novo customer | Personaliza welcome + sets expectations | API cria account + envia email |

## 18.8. Reframe de uso: agent como "sense-maker", não "doer"

Antes:
> "Agent CEO acorda a cada 30min, puxa dados de Stripe, GA4, Meta Ads, calcula MRR, compara com goal, decide priorities, aciona ações."

Depois:
> "Cron busca dados (Airbyte). View calcula MRR delta. Quando MRR cai > 5% week-over-week, webhook acorda CEO agent (1x). CEO lê view, pensa, decide, escreve recomendação, aprova execução, MCP server faz."

Resultado:
- 95% menos heartbeats do CEO.
- Cada heartbeat é load-bearing (decisão real).
- ETL e calc são deterministicos = baratos + confiáveis.

## 18.9. Quando essa arquitetura É OVERKILL

- POC / experimento — vá com agent fazendo tudo, depois extrai.
- Sem dados estruturados — não tem o que SQL view calcular.
- Workflow muda toda semana — esquema fica obsoleto rápido.

## 18.10. Migrando de "agente faz tudo" para 4-layer

Roteiro:

1. **Inventário**: liste tudo que agentes fazem hoje.
2. **Categorize** cada item:
   - Determinístico repetitivo → migrar para Camada 1/2.
   - Decisão real → manter em Camada 3.
   - Ação executiva → migrar para Camada 4 via MCP.
3. **Implemente Camada 1** (Airbyte ou similar).
4. **Implemente Camada 2** (SQL views).
5. **Refatore agentes**: simplifique para apenas Camada 3.
6. **Implemente Camada 4** (MCP servers).
7. **Audit**: mede economia.

## 18.11. Pegadinhas

- **Não migre 100%**: alguns workflows são naturalmente probabilísticos (copywriting, ICP analysis). Manter em agent é OK.
- **MCP server bug ≠ agent bug**: separação de concerns também separa pontos de falha. Logs centralizados ajudam.
- **Esquema de DB fica core asset**: cuidado mudanças de schema sem atualizar views.
- **Latência de Airbyte**: alguns conectores são daily, não realtime. Se agent precisa de dados recentes (< 1h), use webhook direto + n8n.
- **Cost per insight**: nem sempre vale ter view pronta. Se métrica é raramente consultada, agent ad-hoc é mais barato que pipeline ETL.
