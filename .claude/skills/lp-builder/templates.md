# Templates de Copy — lp-builder

> Templates de copy por bloco da LP. A skill preenche os placeholders com dados do nicho/cliente.

---

## Bloco 1 — HERO (templates por ângulo)

### Ângulo DOR
```
H1: "{{Nicho_que_ainda_perde_clientes_diariamente}}"  (≤8 palavras)
Sub: "Pra {{persona}} que sente que tá deixando dinheiro na mesa todo mês."
CTA: "Receber meu diagnóstico"
```

### Ângulo OPORTUNIDADE
```
H1: "{{Nicho_em_2026:_quem_não_tiver_isso_some}}"
Sub: "A IA mudou o jogo. {{Persona}} preparados crescem 3x mais rápido."
CTA: "Quero entender como"
```

### Ângulo SISTEMA
```
H1: "{{Nicho_que_escala_sem_trabalhar_mais}}"
Sub: "Sistema operacional com IA pra {{persona}} que cansou da operação manual."
CTA: "Conhecer o sistema"
```

---

## Bloco 2 — PROBLEMA (formato fixo)

```
{{PROBLEMA_TITULO}}: "Você se identifica com pelo menos uma destas?"
{{PROBLEMA_INTRO}}: "Mapeamos {{N}} {{persona_plural}} e essas 3 dores apareceram em quase todos."

DOR_1: "{{frase_3-7_palavras}}" + "{{descrição_1-2_linhas}}"
DOR_2: "{{...}}" + "{{...}}"
DOR_3: "{{...}}" + "{{...}}"
```

---

## Bloco 3 — CONSEQUÊNCIA

```
TITULO: "Em 12 meses sem resolver isso..."
PARÁGRAFO: "{{persona}} que continua na operação manual perde em média {{R$}} ou {{%}} de receita por ano. {{1_linha_amplificando}}. {{1_linha_pintando_o_quadro_de_competidor_avançando}}."
```

---

## Bloco 4 — SOLUÇÃO / MECANISMO

```
LABEL: "A solução"
NOME: "{{Mecanismo}}™"
TAGLINE: "{{frase_resultado_+_método_1_linha}}"

FASES (5 cards típicos):
F: Foco — {{benefit_de_clareza}}
L: Lead — {{benefit_de_atração}}
O: Onboarding — {{benefit_de_ativação}}
W: Wellness — {{benefit_de_retenção}}
```

---

## Bloco 5 — PROVA SOCIAL (3 cases)

```
CASE_1: "{{numero_em_destaque_R$_ou_%}}" + "{{depoimento_1-2_linhas}}" + "— {{nome_ou_pseudonimo}}, {{cargo_setor}}"
CASE_2: "..."
CASE_3: "..."
```

---

## Bloco 6 — STACK

```
TITULO: "O que você recebe"
ITEM_1 + VALOR_1
ITEM_2 + VALOR_2
ITEM_3 + VALOR_3
ITEM_4 + VALOR_4
ITEM_5 + VALOR_5
```

---

## Bloco 7 — OBJEÇÕES (3-5)

```
OBJ_1: "{{pergunta_típica}}"  (ex: "É caro?")
QUEBRA_1: "{{4-6_linhas: validar → reframe → evidência → ação}}"
```

Padrões mais comuns:
- "Já tentei isso e não deu certo"
- "É caro pra mim agora"
- "Não tenho tempo de implementar"
- "Funciona pro meu nicho específico?"
- "Como sei que vai dar resultado?"

---

## Bloco 8 — URGÊNCIA / GARANTIA

### Urgência (honesta)
```
LABEL: "Próxima turma"
TITULO: "{{Vagas_limitadas}} — encerra dia {{data}}"
PARÁGRAFO: "{{justificativa_real_da_limitação}} Não é estratégia de marketing — {{razão_operacional}}."
```

### Garantia
```
TITULO: "Garantia de {{X}} dias"
TEXTO: "Se em {{X}} dias você não {{resultado_específico}}, devolvemos 100% do investimento. Sem perguntas."
```

---

## Bloco 9 — CTA FINAL

```
TITULO: "{{frase_resumo_promessa}}"
SUB: "{{1_linha_reforço}}"
P.S.: "{{último_argumento_1_linha — geralmente urgência ou bônus específico}}"
```

---

## Footer (não modificar — regra LICENSE)

```
Powered by Accelera 360 — Business Accelerator
"Construa o tipo de negócio que lidera a próxima década."
accelera360.com.br | Aplique: yayforms.link/4bRG5aE
```

---

## Tom de voz por boilerplate

| Boilerplate | Tom | Exemplo CTA |
|---|---|---|
| `boilerplate-a360.html` | Executivo, sóbrio, motivacional | "Receber meu diagnóstico" |
| `boilerplate-saas.html` | Técnico, direto, otimista | "Começar grátis" / "Falar com vendas" |
| `boilerplate-infoprod.html` | Urgência alta, emocional, transformacional | "🔥 QUERO ENTRAR AGORA" |

---

## Regras de transformação Feature → Benefit (FAB)

Sempre converter:

| ❌ Feature técnica | ✅ Benefit |
|---|---|
| "Integração com WhatsApp" | "Cliente fala com você direto, do jeito que ele já fala" |
| "Dashboard com 50 métricas" | "Saiba o que tá funcionando sem precisar virar analista" |
| "Workflow N8N pré-configurado" | "Liga e roda. Não precisa contratar dev." |
| "Multi-tenant" | "Atende vários clientes na mesma estrutura — zero retrabalho" |
