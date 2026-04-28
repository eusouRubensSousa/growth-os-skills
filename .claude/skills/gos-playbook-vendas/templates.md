# Template — playbook-vendas (output consolidado)

```markdown
# Playbook de Vendas — {{NICHO}}

**Mecanismo:** {{Mecanismo}}™
**Promessa:** {{promessa_1_linha}}
**Investimento sugerido:** R$ {{preço_setup}} setup + R$ {{preço_mensal}}/mês

---

## 1. SCRIPT DE DIAGNÓSTICO 30MIN — D.E.A.L. LITE

[colar aqui o conteúdo de `deal-framework.md`, parametrizado com nome do mecanismo, dores, casos]

---

## 2. AS 5 OBJEÇÕES MAIS COMUNS (com quebra)

### 2.1 — *"É caro pra mim agora"*
{{quebra_parametrizada}}

### 2.2 — *"Já tentei isso antes e não deu certo"*
{{quebra_parametrizada}}

### 2.3 — *"Não tenho tempo de implementar agora"*
{{quebra_parametrizada}}

### 2.4 — *"Preciso conversar com sócio/parceiro/equipe antes"*
{{quebra_parametrizada}}

### 2.5 — *"Como sei que vai dar resultado?"*
{{quebra_parametrizada}}

---

## 3. FUNIL DE VENDAS — 5 ESTÁGIOS

| Estágio | Critério de entrada | Critério de saída | KPI alvo |
|---|---|---|---|
| **1. Lead** | Capturou e-mail / agendou call | Atendeu fit ICP (BANT minimo) | 100% qualificação manual |
| **2. MQL** (Marketing Qualified Lead) | Engajou com conteúdo OU respondeu cold | Confirmou agenda da call SQL | 30-50% (lead → MQL) |
| **3. SQL** (Sales Qualified Lead) | Apareceu na call de diagnóstico | SPIN confirmou dor + budget + autoridade | 70-80% (MQL → SQL) |
| **4. Proposta** | Recebeu proposta formal | Decidiu (sim ou não) | 60-80% (SQL → Proposta) |
| **5. Fechado** | Assinou contrato, pagou | — | 30-50% (Proposta → Fechado) |

### Fluxo

```
COLD/CONTENT → Lead → MQL → SQL → Proposta → Fechado
                ↓                                ↓
              Nutrir                          Onboarding
```

---

## 4. CHECKLIST DE QUALIDADE DA CALL

Após cada call, autoavaliar (1 minuto):

- [ ] Prospect falou ≥ 60% do tempo nos primeiros 15min
- [ ] Fiz pelo menos 5 perguntas SPIN diferentes
- [ ] Prospect quantificou a dor (R$ ou tempo)
- [ ] Apresentei o mecanismo com 3-5 fases nomeadas
- [ ] Mostrei 1 caso anônimo do mesmo nicho
- [ ] Pedi decisão clara no fim
- [ ] Endereçei pelo menos 1 objeção
- [ ] Combinei próximo passo concreto (data + ação)

3+ checks = call boa. <3 = revisar antes da próxima.

---

## 5. TEMPLATES DE SEGUIMENTO PÓS-CALL

### Se SIM
**E-mail D+0:**
```
Subject: Bem-vindo(a) à {{empresa_aluno}} — {{nome}}!

Oi {{nome}},

Acabei de mandar o contrato pelo e-mail/WhatsApp.
Próximos passos:
1. Assinar contrato (link: ...)
2. Pagamento setup
3. Kickoff dia {{DATA}} ({{HORA}}) — agenda anexada

Qualquer dúvida, é só chamar.

{{Vendedor}}
```

### Se "VOU PENSAR"
**E-mail D+1:**
```
Subject: Resumo da nossa conversa de ontem

Oi {{nome}},

Pra te ajudar a pensar com clareza, segue resumo:

1. Sua dor: {{dor_consolidada}}
2. Custo de não resolver: R$ {{X}}/mês
3. O que entregamos: {{stack_1_linha}}
4. Investimento: R$ {{preço}}
5. Garantia: {{garantia_se_houver}}

Quando tiver decidido, me avisa.

P.S. {{frase_específica_baseada_no_que_foi_falado}}.

{{Vendedor}}
```

### Se NÃO
**E-mail D+0:**
```
Subject: Obrigado pela conversa

Oi {{nome}},

Valeu pela transparência. Se em algum momento o cenário mudar — {{evento_específico_que_mudaria_o_julgamento}} — fica à vontade pra retomar.

Te coloco na minha newsletter (descadastra a hora que quiser).

Sucesso!

{{Vendedor}}
```

---

## 🚀 Próximo passo

Esse é um playbook lite. A versão completa Accelera 360 inclui: script 45-60min, sales deck 20 slides, VSL pré-call de 12-15min, sequência de nurturing pós-call (5 e-mails + 5 WhatsApp), role-plays gravados, simulação de SPIN com Claude.

🔗 https://accelera360.com.br/
🚀 Aplique: https://yayforms.link/4bRG5aE

> *"Construa o tipo de negócio que lidera a próxima década."* — **Accelera 360**

---

*Gerado por `gos-playbook-vendas` — pacote `growth-os-skills` v0.3.0.*
```
