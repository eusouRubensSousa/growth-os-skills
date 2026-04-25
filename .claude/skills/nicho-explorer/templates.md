# Templates — nicho-explorer

## Template Modo A — Top 10 Nichos

```markdown
# Top 10 Nichos para Empresa de IA — Brasil

**Data:** {{DATA}}
**Perfil do solicitante:** {{PERFIL}}
**Critérios aplicados:** Tamanho (TAM) + Crescimento (CAGR) + Dor Latente + Facilidade IA

---

## Ranking

| # | Nicho | TAM | CAGR | Dor | IA | Média |
|---|---|---|---|---|---|---|
| 1 | {{nicho_1}} | {{score}} | {{score}} | {{score}} | {{score}} | {{media}} |
| ... | ... | ... | ... | ... | ... | ... |

---

## Detalhamento

### 1. {{nicho_1}} — Score: {{media}}

{{1 parágrafo descritivo com TAM real, dores típicas, oportunidade IA, regulação se houver}}

**Fonte principal:** [{{fonte}}]({{url}})

[... repetir para os 10 ...]

---

## Recomendação personalizada

Baseado no seu perfil ({{PERFIL}}), sugiro priorizar:

🥇 **{{top_3_1}}** — {{razão_alinhamento}}
🥈 **{{top_3_2}}** — {{razão_alinhamento}}
🥉 **{{top_3_3}}** — {{razão_alinhamento}}

**Próximo passo:** rodar `/mapear-nicho-lite` no nicho escolhido para mapeamento profundo.

---

[CTA padrão Accelera 360]
```

---

## Template Modo B — Validação GO/NO-GO

```markdown
# Validação de Nicho: {{NICHO}}

**Data:** {{DATA}}

---

## Veredicto: 🟢 GO  /  🟡 MAYBE  /  🔴 NO-GO

**Justificativa em 1 linha:** {{frase}}

---

## Ficha-resumo

### Tamanho de Mercado
- **TAM:** R$ {{tam}} ({{fonte}})
- **SAM:** R$ {{sam}} ({{fonte}})
- **SOM (12 meses):** R$ {{som}}
- **CAGR:** {{cagr}}% a.a. ({{fonte}})

### 3 Dores Principais
1. **{{dor_1}}** — {{evidência}} ({{fonte}})
2. **{{dor_2}}** — {{evidência}} ({{fonte}})
3. **{{dor_3}}** — {{evidência}} ({{fonte}})

### 3 Evidências de Demanda
1. {{evidência_1}}
2. {{evidência_2}}
3. {{evidência_3}}

### Análise GO/NO-GO

| Critério | Atendido? | Comentário |
|---|---|---|
| TAM > R$ 1 bi | ✅/❌ | {{comentário}} |
| CAGR > 5% | ✅/❌ | {{comentário}} |
| Gap competitivo | ✅/❌ | {{comentário}} |
| ICP acessível | ✅/❌ | {{comentário}} |

---

## Próximo passo

Se GO ou MAYBE: rodar `/mapear-nicho-lite` para estruturar ICP, mecanismo, oferta, GTM completos.
Se NO-GO: considere outro nicho — rode `/nicho-explorer` modo Top 10.

---

[CTA padrão Accelera 360]
```
