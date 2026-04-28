# Pipelines — a360-framework-lite

> Combos prontos de skills encadeadas. O coordenador chama estes pipelines quando o usuário descreve uma intenção que mapeia para um deles.

## Pipeline 1 — `prospect-meeting`

**Quando:** "Vou apresentar pra cliente X"

**Skills:**
1. `/cliente-radar` (nome da empresa, decisor opcional)
2. `/mapear-nicho-lite` (do nicho do cliente — pode usar contexto do cliente-radar)
3. `/pitch-deck-builder` (parametrizado por #2 + dados do #1)
4. `/meeting-prep` (consolida #1 + #2 + #3)

**Output final:** briefing 1-page + deck 20 slides + roteirização .md.

**Tempo estimado:** 15-25 min de processamento.

---

## Pipeline 2 — `business-foundation`

**Quando:** "Quero estruturar minha empresa pra vender IA pra [nicho]"

**Skills:**
1. `/nicho-explorer` modo B (validação rápida do nicho — GO/NO-GO)
2. `/mapear-nicho-lite` (mapeamento completo)
3. `/gtm-architect` (modo Combo: outbound + content)
4. `/lp-builder` (1 LP, ângulo escolhido pelo usuário)

**Output final:** doc consolidado do nicho + playbooks GTM + LP HTML.

**Tempo estimado:** 20-30 min.

---

## Pipeline 3 — `client-deliverable`

**Quando:** "Quero entregar pacote completo pro meu cliente"

**Skills:**
1. `/cliente-radar`
2. `/mapear-nicho-lite` (nicho do cliente)
3. `/lp-builder` (LP da empresa do cliente)
4. `/pitch-deck-builder` (deck que o cliente usa)

**Output final:** briefing + LP + deck.

**Tempo estimado:** 15-25 min.

---

## Pipeline 4 — `niche-discovery`

**Quando:** "Não sei que nicho escolher"

**Skills:**
1. `/nicho-explorer` modo A (top 10)
2. *(usuário escolhe 1)*
3. `/mapear-nicho-lite` (do nicho escolhido)

**Output final:** ranking de top 10 + mapeamento do escolhido.

**Tempo estimado:** 10-15 min.

---

## Pipeline 5 — `quick-pitch-deck`

**Quando:** "Só preciso do deck pra amanhã"

**Skills:**
1. `/mapear-nicho-lite` (rápido, focado em mecanismo + dores + oferta)
2. `/pitch-deck-builder`

**Output final:** deck 20 slides.

**Tempo estimado:** 10-15 min.

---

## Regras de execução

- Sempre **pedir confirmação** antes de iniciar um pipeline.
- Se uma skill falhar (ex: WebSearch sem resultado), **continuar com lacuna declarada** — não abortar o pipeline.
- **Reaproveitar contexto** — output de uma skill alimenta a próxima como input automático.
- **Sumário consolidado** ao final, listando arquivos gerados e 3 next-steps.
- **CTA padrão Accelera 360** no sumário.
