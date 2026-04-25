# Roteirização Canônica — 20 Slides

> Cada slide tem: **Objetivo**, **Conteúdo (texto visível)**, **Frase falada pelo vendedor**, **Tempo estimado**, **Elemento gráfico**, **Prompt visual (modo gemini)**.
>
> A skill `pitch-deck-builder` preenche os `{{placeholders}}` com dados do `mapear-nicho-lite` + `cliente-radar`.

---

## SLIDE 01 — Capa Personalizada

**Bloco:** Conexão | **Tempo:** 30s
**Objetivo:** Quebra de gelo visual, identificação imediata de personalização.

**Conteúdo visível:**
- Título: **{{CLIENTE_NOME}}**
- Sub: "Apresentação personalizada"
- Rodapé: "Por {{VENDEDOR_NOME}} — Parceiro Accelera 360"

**Frase falada:** *"Olá {{nome_decisor}}, preparei essa apresentação especificamente pra {{CLIENTE_NOME}}. Vamos ver no que ela pode ajudar."*

**Elemento gráfico:** Título em destaque grande (logo do cliente se disponível) + glow roxo + textura linhas verticais.

**Prompt Gemini:**
```
Premium presentation cover slide (16:9). Deep navy-black background (#0A0A12) with rich purple atmospheric bokeh.
Centered text: "{{CLIENTE_NOME}}" — large bold white Inter font (~80px).
Below in muted gray: "Apresentação personalizada".
Bottom-left small text: "Por {{VENDEDOR_NOME}} — Parceiro Accelera 360".
Vertical line texture on left, soft purple glow on right.
NO logo. Cinematic, premium, sophisticated.
```

---

## SLIDE 02 — Quem Você É

**Bloco:** Conexão | **Tempo:** 1min
**Objetivo:** Credenciar o vendedor como parceiro Accelera 360.

**Conteúdo visível:**
- Label: "Quem fala com você"
- H2: **{{VENDEDOR_NOME}}**
- Sub: "{{VENDEDOR_POSICIONAMENTO}}"
- 3 hexágonos com credenciais: {{CRED_1}} / {{CRED_2}} / {{CRED_3}}

**Frase falada:** *"Antes de tudo, deixa eu me apresentar. Sou {{nome}}, [posicionamento]. Trabalho com [setor] há {{X}} anos como parceiro do framework Accelera 360 — Business Accelerator."*

**Elemento gráfico:** Card com foto do vendedor à esquerda + 3 hexágonos roxos com glow à direita (cada um com número grande + label uppercase).

**Prompt Gemini:**
```
Bio slide (16:9). Dark navy-black background with purple bokeh.
Left side: stylized portrait silhouette / abstract avatar in dark card with purple glow border.
Right side: 3 hexagons in honeycomb arrangement, each with bold white number and small uppercase label below.
Hexagon 1: "{{CRED_1_N}}" / "{{CRED_1_LABEL}}"
Hexagon 2: "{{CRED_2_N}}" / "{{CRED_2_LABEL}}"
Hexagon 3: "{{CRED_3_N}}" / "{{CRED_3_LABEL}}"
Title at top: "{{VENDEDOR_NOME}}" + small subtitle "Parceiro Accelera 360 — Business Accelerator".
Premium, sophisticated, depth.
```

---

## SLIDE 03 — Por Que Estamos Aqui

**Bloco:** Conexão | **Tempo:** 1min
**Objetivo:** Pacto inicial com 3 blocos da reunião.

**Conteúdo visível:**
- H2: "Por que estamos aqui"
- 3 cards: 1️⃣ O cenário (NICHO em 2026) / 2️⃣ O que capturar (oportunidade pra CLIENTE) / 3️⃣ Caminhar junto? (decisão)

**Frase falada:** *"Pra gente ter uma conversa produtiva nos próximos 30 minutos, esses são os 3 blocos: primeiro o cenário do {{NICHO}} hoje. Depois o que a {{CLIENTE_NOME}} pode capturar. E no fim, conversamos se faz sentido caminhar junto."*

**Elemento gráfico:** 3 cards horizontais com numeração grande (1, 2, 3) + ícone + título + descrição curta.

---

## SLIDE 04 — O Cenário Mudou

**Bloco:** Diagnóstico | **Tempo:** 1.5min
**Objetivo:** Estabelecer urgência baseada em dados reais do nicho.

**Conteúdo visível:**
- Label: "Os números falam"
- H2: "O cenário de {{NICHO}} mudou"
- 3 hexágonos grandes: TAM Brasil R$ {{TAM}} / CAGR {{CAGR}}% / {{DADO_3}}

**Frase falada:** *"Os números falam: o mercado de {{NICHO}} no Brasil já vale R$ {{TAM}} bi e tá crescendo {{CAGR}}% ao ano. Mas {{insight_provocador_dado_3}}."*

**Elemento gráfico:** 3 hexágonos com glow forte, números grandes em branco/roxo, label uppercase tracking widest.

**Prompt Gemini:**
```
Market data infographic slide (16:9). Dark navy-black background with rich purple bokeh.
Title top-left: "O cenário de {{NICHO}} mudou" — bold white.
3 large hexagons centered, evenly spaced:
- Hex 1: "{{TAM}} bi" / label "TAM BRASIL"
- Hex 2: "{{CAGR}}%" / label "CAGR"
- Hex 3: "{{DADO_3}}" / label "{{LABEL_3}}"
Each hexagon has glowing purple border, dark interior, white text inside.
Add small icon inside each hex (chart, growth arrow, currency).
Premium dashboard visualization, NOT PowerPoint.
```

---

## SLIDE 05 — As 3 Dores Mapeadas

**Bloco:** Diagnóstico | **Tempo:** 2min
**Objetivo:** Espelho — cliente se vê nas dores do nicho.

**Conteúdo visível:**
- Label: "Mapeamos {{N}} {{persona_plural}}"
- H2: "As 3 dores que mais aparecem"
- 3 cards horizontais com 🔴🟠🟡 + título da dor + descrição curta

**Frase falada:** *"Mapeando {{N}} {{persona_plural}} desse nicho, três dores aparecem em quase todos: {{DOR_1}}, {{DOR_2}}, {{DOR_3}}. Em quais delas você se enxerga?"*

**Elemento gráfico:** 3 cards horizontais empilhados com bullets coloridos (vermelho/laranja/amarelo) + título + 1 linha de descrição.

---

## SLIDE 06 — Quanto Custa

**Bloco:** Diagnóstico | **Tempo:** 1.5min
**Objetivo:** Implicação financeira — quantificar o custo de não agir.

**Conteúdo visível:**
- Label: "Em 12 meses sem resolver"
- H2: "Quanto isso custa"
- 2 hexágonos vermelhos: R$ {{CUSTO_MES}} / mês perdidos | R$ {{CUSTO_ANO}} em 12 meses
- Frase âncora: "{{FRASE_AMPLIFICACAO}}"

**Frase falada:** *"Esse cenário, mantido por 12 meses, vira R$ {{CUSTO_ANO}}. E o que mais dói: é silencioso — vai sangrando, não dói de uma vez."*

**Elemento gráfico:** 2 hexágonos com glow vermelho + números grandes em branco + frase abaixo em cinza claro.

---

## SLIDE 07 — O Que Outros Tentaram

**Bloco:** Diagnóstico | **Tempo:** 1.5min
**Objetivo:** Diferenciação — soluções que falharam.

**Conteúdo visível:**
- Label: "A maioria tenta"
- H2: "O que outros já tentaram (e por que falhou)"
- 3 cards riscados: {{TENTATIVA_1}} / {{TENTATIVA_2}} / {{TENTATIVA_3}} (com razão de falha)

**Frase falada:** *"A maioria tenta {{TENTATIVA_1}}. Falha porque {{FALHA_1}}. Outros tentam {{TENTATIVA_2}}, e falha porque {{FALHA_2}}. E também {{TENTATIVA_3}} — falha porque {{FALHA_3}}."*

**Elemento gráfico:** 3 cards com X vermelho + título riscado + razão da falha em cinza.

---

## SLIDE 08 — A Virada: Growth AI

**Bloco:** Solução | **Tempo:** 1min
**Objetivo:** Apresentar Growth AI como o framework macro.

**Conteúdo visível:**
- Label: "A virada"
- H1 grande: **Growth AI™** (em gradient branco→roxo)
- Sub: "Sistema operacional com IA pra {{NICHO}} virar máquina de aquisição + retenção"

**Frase falada:** *"A virada não é vender mais — é ter um sistema que vende sozinho. Growth AI™ é o sistema operacional com IA pra {{NICHO}}."*

**Elemento gráfico:** Título grande centralizado com gradient + glow roxo forte de fundo.

---

## SLIDE 09 — Mecanismo Proprietário

**Bloco:** Solução | **Tempo:** 1.5min
**Objetivo:** Posicionamento único — o nome que vai ficar na cabeça do prospect.

**Conteúdo visível:**
- Label: "Aplicação para {{NICHO}}"
- H1: **{{MECANISMO_NOME}}™**
- Sub: *"{{MECANISMO_TAGLINE}}"*
- Hexágonos com letras do acrônimo: {{LETRA_1}} / {{LETRA_2}} / {{LETRA_3}} / {{LETRA_4}}

**Frase falada:** *"Pra {{NICHO}} especificamente, o sistema se chama {{MECANISMO_NOME}}™. Significa {{TAGLINE}}. O método tem {{N}} fases: {{LETRAS_DESCRITAS}}."*

**Elemento gráfico:** Nome grande em destaque + tagline em itálico + linha horizontal de hexágonos com letras grandes do acrônimo.

---

## SLIDE 10 — Como Funciona — Fluxo

**Bloco:** Solução | **Tempo:** 2min
**Objetivo:** Tornar o método tangível.

**Conteúdo visível:**
- Label: "O fluxo"
- H2: "Como {{MECANISMO_NOME}} funciona"
- Fluxograma horizontal: {{FASE_1_NOME}} → {{FASE_2_NOME}} → {{FASE_3_NOME}} → {{FASE_4_NOME}}

**Frase falada:** *"O fluxo é simples. Começa com {{FASE_1_NOME}} — {{FASE_1_BENEFIT}}. Daí {{FASE_2_NOME}} — {{FASE_2_BENEFIT}}. {{FASE_3}} e {{FASE_4}}. No fim, {{RESULTADO_FINAL}}."*

**Elemento gráfico:** Cards horizontais conectados por setas roxas. Cada card com letra grande (acrônimo) + título + 1 linha de benefit.

---

## SLIDE 11 — Arquitetura

**Bloco:** Solução | **Tempo:** 1.5min
**Objetivo:** Mostrar componentes técnicos sem assustar.

**Conteúdo visível:**
- Label: "A arquitetura"
- H2: "CRM + Automações + Agentes IA"
- 3 colunas: CRM (3 itens) / Automações (3 itens) / Agentes IA (3 itens)

**Frase falada:** *"Tecnicamente, são três camadas: CRM com {{CRM_1}}, automações como {{AUTO_1}}, e agentes IA tipo {{AGT_1}}. Mas pra você não importa o como — você vê o resultado."*

**Elemento gráfico:** 3 cards verticais com ícone (engrenagem / fluxo / robô) + título + lista de 3 bullets.

---

## SLIDE 12 — Caso de Sucesso

**Bloco:** Solução | **Tempo:** 1min
**Objetivo:** Prova social do mesmo nicho.

**Conteúdo visível:**
- Label: "Caso real anônimo"
- H2: "{{CASO_TITULO}}"
- 3 cards horizontais: Antes R$ {{CASO_BASELINE}} / 90 dias R$ {{CASO_90D}} / 12 meses R$ {{CASO_12M}}
- Quote: *"{{CASO_QUOTE}}"*

**Frase falada:** *"Caso real: {{cliente_anônimo_descrição}}, partiu de R$ {{CASO_BASELINE}}. Em 90 dias chegou a R$ {{CASO_90D}}. Em 12 meses, R$ {{CASO_12M}}. Não posso garantir esse resultado pra vocês — depende de execução — mas o framework foi o mesmo."*

**Elemento gráfico:** 3 cards horizontais com label de tempo + número grande (verde no 90d e 12m) + setas de progressão entre eles.

---

## SLIDE 13 — Stack de Entregas

**Bloco:** Entrega | **Tempo:** 1.5min
**Objetivo:** Listar o que está incluído.

**Conteúdo visível:**
- Label: "O que está incluído"
- H2: "Stack de entregas"
- Grid 4x2 de hexágonos: {{STACK_1}} ... {{STACK_8}}

**Frase falada:** *"O que tu recebe: {{STACK_1}}, {{STACK_2}}, ... {{STACK_8}}. Tudo isso no mesmo pacote — sem precisar contratar 5 fornecedores diferentes."*

**Elemento gráfico:** Grid honeycomb de 8 hexágonos com ícone diferente em cada + label uppercase pequena.

---

## SLIDE 14 — Cronograma 90 Dias

**Bloco:** Entrega | **Tempo:** 1.5min
**Objetivo:** Tornar a implementação concreta no tempo.

**Conteúdo visível:**
- Label: "Cronograma 90 dias"
- H2: "Implementação em 4 fases"
- Timeline horizontal: Sem 1-2 Diagnóstico / Sem 3-4 Estruturação / Sem 5-12 Execução / Sem 13+ Padronização

**Frase falada:** *"Cronograma claro: nas primeiras 2 semanas, diagnóstico — {{FASE_DIAG_ENTREGA}}. Da 3ª à 4ª, estruturação — {{FASE_ESTRUT}}. Da 5ª à 12ª, execução. E depois, padronização."*

**Elemento gráfico:** Linha horizontal com 4 marcos (cards) + nome da fase + entregável principal por fase.

---

## SLIDE 15 — Métricas

**Bloco:** Entrega | **Tempo:** 1min
**Objetivo:** Mostrar dashboard, não promessa vazia.

**Conteúdo visível:**
- Label: "Acompanhamento"
- H2: "Métricas que vamos medir"
- 6 cards de KPI: CAC / LTV / Conversão / Retenção / Ticket / NPS

**Frase falada:** *"Você não precisa adivinhar se tá funcionando. Esses são os 6 indicadores que aparecem no dashboard semanal — CAC, LTV, conversão, retenção, ticket médio e NPS."*

**Elemento gráfico:** Grid 3x2 de cards com KPI grande no topo + label de descrição abaixo.

---

## SLIDE 16 — ROI Projetado

**Bloco:** Entrega | **Tempo:** 1.5min
**Objetivo:** Justificação financeira clara.

**Conteúdo visível:**
- Label: "ROI projetado"
- H2: "Antes / Depois (12 meses)"
- Tabela: Receita / CAC / LTV / Retenção (Hoje vs. Com {{MECANISMO}}™)
- Disclaimer: "Projeção baseada em casos similares — não é promessa individual."

**Frase falada:** *"A projeção pra vocês: {{ROI_RECEITA_BASE}} → {{ROI_RECEITA_PROJ}} em 12 meses. CAC cai de {{ROI_CAC_BASE}} pra {{ROI_CAC_PROJ}}. LTV sobe de {{ROI_LTV_BASE}} pra {{ROI_LTV_PROJ}}. Não é promessa — depende da execução. Mas o método é o mesmo."*

**Elemento gráfico:** Tabela com 3 colunas (Métrica / Hoje / Com Mecanismo). Coluna "Com Mecanismo" em verde.

---

## SLIDE 17 — Garantia

**Bloco:** Entrega | **Tempo:** 1min
**Objetivo:** Quebrar risco da decisão.

**Conteúdo visível:**
- Ícone grande: 🛡️
- Label: "Quebra de risco"
- H1: "{{GARANTIA_TITULO}}"
- Sub: "{{GARANTIA_TEXTO}}"

**Frase falada:** *"Pra reduzir teu risco: {{GARANTIA}}. Se em {{X}} dias não rolar {{resultado}}, devolvemos {{Y}}. Sem perguntas."*

**Elemento gráfico:** Selo de garantia central grande + texto centralizado.

---

## SLIDE 18 — Investimento

**Bloco:** Fechamento | **Tempo:** 1.5min
**Objetivo:** Apresentar preço de forma clara.

**Conteúdo visível:**
- Label: "Investimento"
- H2: "Para começar"
- Card central: Setup R$ {{PRECO_SETUP}} + Mensal R$ {{PRECO_MENSAL}}
- Total ano 1: R$ {{PRECO_ANO_1}}

**Frase falada:** *"Investimento: R$ {{PRECO_SETUP}} de setup + R$ {{PRECO_MENSAL}} por mês. Total no primeiro ano: R$ {{PRECO_ANO_1}}."*

**Elemento gráfico:** Card central destacado com border roxa, números grandes em verde, condições embaixo.

---

## SLIDE 19 — Próximos Passos

**Bloco:** Fechamento | **Tempo:** 1min
**Objetivo:** Mostrar roadmap de decisão claro.

**Conteúdo visível:**
- Label: "Próximos passos"
- H2: "Pra avançar"
- 3 cards horizontais: HOJE Decisão / ESTA SEMANA Contrato + Setup / 2 SEMANAS Kickoff

**Frase falada:** *"Pra avançar: hoje você decide. Se topar, semana que vem fechamos contrato e iniciamos o setup. Em 2 semanas, kickoff e diagnóstico operacional completo."*

**Elemento gráfico:** 3 cards horizontais com label de tempo (uppercase roxo) + título + descrição curta.

---

## SLIDE 20 — CTA Final

**Bloco:** Fechamento | **Tempo:** 1.5min
**Objetivo:** Convite à decisão clara.

**Conteúdo visível:**
- Label: "Decisão"
- H1 grande: "Topa começar a transformar a {{CLIENTE_NOME}} hoje?"
- 3 cards: ✅ Topa | 🤔 Preciso pensar | ❌ Não agora
- Quote: *"Construa o tipo de negócio que lidera a próxima década."* — Accelera 360
- Footer: accelera360.com.br · yayforms.link/4bRG5aE

**Frase falada:** *"O que faz sentido pra você? Topa começar?"*
*(Pausa. Espera resposta. Não preencher silêncio.)*

**Elemento gráfico:** Pergunta grande central + 3 cards horizontais (com border verde no "Topa") + quote em itálico + link Accelera no rodapé.

---

## Footer fixo (todos os 20 slides — não remover)

```
Powered by Accelera 360 — accelera360.com.br · a360-framework-lite v0.1.0
```
