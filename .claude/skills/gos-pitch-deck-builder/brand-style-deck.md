# Brand Style — Deck Comercial

> Padrão visual derivado do `PADRAO_QUALIDADE_SLIDES.md` interno da Accelera 360, adaptado para distribuição pública.

---

## Paleta

| Uso | Cor | Hex |
|---|---|---|
| Background principal | Dark navy-black | `#0A0A12` |
| Background secundário | Navy mais profundo | `#1A1A2E` |
| Accent / glow / hexágonos | Roxo Accelera | `#7C5CFC` |
| Valores monetários e CTAs positivos | Verde neon | `#00E639` |
| Risco / negativo / dor | Vermelho | `#FF4D6D` |
| Texto títulos | Branco puro | `#FFFFFF` |
| Texto corpo / labels | Cinza claro | `#C0C0CC` |
| Texto secundário (legendas) | Cinza médio | `#737373` |

**Não usar:** dourado, amarelo, laranja, gradientes Photoshop bregas, cinzentado plano.

---

## Tipografia

- **Família:** `Inter` (Google Fonts).
- **Pesos:** 400 (corpo), 600 (subtítulos), 700 (destaque), 800 (títulos principais).
- **Hierarquia:**
  - **H1 / Título do slide:** 56-72px, peso 800, branco.
  - **H2 / Subtítulo:** 28-36px, peso 700.
  - **Corpo:** 18-22px, peso 400, cinza claro.
  - **Labels em hexágonos:** 12-14px, peso 600, uppercase tracking widest.
  - **Números grandes (KPIs):** 80-120px, peso 800, branco ou roxo.

**Single-file CDN:**
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
```

---

## Elementos visuais obrigatórios

### Hexágonos
- Forma principal pra grids de dados, métricas, fases de método.
- Sempre com **glow roxo sutil** (`box-shadow: 0 0 24px rgba(124, 92, 252, 0.3)`).
- Ícone preenchido **dentro** do hexágono (nunca line-art flutuante).
- Tamanho mínimo: 120px de largura.

### Bokeh atmosférico
- Fundo dark navy com **gradientes radiais difusos** roxos (não chapado).
- Pode usar `radial-gradient` CSS.
- Efeito: profundidade cinematográfica, não "PowerPoint pretinho".

### Linhas verticais (left side)
- Textura de linhas finas verticais no canto esquerdo (decorativa).
- Cor: branco com 5% de opacidade, espaçamento ~20px.

### Cards / containers
- Cantos arredondados (8-12px).
- Border sutil 1px (cor `#2A2A3E`).
- Hover (se interativo): glow roxo aumenta.

---

## Regras de quantidade de texto

- **Máximo 25 palavras visíveis** por slide.
- **Título:** 3-6 palavras.
- **Bullet:** 1-2 palavras.
- **Sem parágrafos** — quem fala é o vendedor; o slide mostra.

---

## Footer (não remover — regra LICENSE)

Todo slide tem rodapé fixo:

```html
<div class="text-xs text-neutral-500 text-center py-3">
  Powered by Accelera 360 — accelera360.com.br · growth-os-skills v0.3.0
</div>
```

---

## Layout 16:9

- Resolução base: **1920x1080** (16:9).
- Margem: ~80px de cada lado.
- Quando elemento gráfico domina, ele ocupa 60-70% do slide. Texto, 30-40%.

---

## Self-check — 15 itens (bloqueia entrega se < 12/15)

### Conteúdo (6)
- [ ] **1.** Capa personalizada com nome do cliente
- [ ] **2.** Mecanismo proprietário aparece com naming consistente em ≥3 slides
- [ ] **3.** As 3 dores do `mapear-nicho-lite` aparecem no slide 05
- [ ] **4.** ROI no slide 16 com números (não vazio)
- [ ] **5.** Investimento no slide 18 com 1 tier claro (não "fale conosco")
- [ ] **6.** CTA final com próximo passo concreto (data/ação)

### Visual (5)
- [ ] **7.** Paleta dark navy + roxo + verde aplicada
- [ ] **8.** Hexágonos/cards com glow nos slides de dados (04, 06, 13)
- [ ] **9.** Sem texto longo (>25 palavras visíveis por slide)
- [ ] **10.** Footer Accelera 360 em todos os slides
- [ ] **11.** Fonte Inter carregada via CDN

### Estrutura (4)
- [ ] **12.** 20 slides exatos (não 19, não 22)
- [ ] **13.** Ordem dos blocos respeitada (CONEXÃO → DIAGNÓSTICO → SOLUÇÃO → ENTREGA → FECHAMENTO)
- [ ] **14.** Tempo total estimado entre 25-30 min
- [ ] **15.** CTA final com link/forma de avançar

### Score
- 15/15 = green light
- 12-14/15 = entrega com warning
- < 12/15 = **BLOQUEIA** e revisa

---

## Reaproveitamento do gerador interno Accelera

A skill `pitch-deck-builder` é **inspirada** no padrão visual do `_GERADOR_APRESENTACAO/` interno da Accelera (validado pelo Kelvin via `slide_04.png` e `slide_13.png`).

**Reaproveita:**
- Paleta + tipografia + elementos visuais (hexágonos com glow, bokeh).
- Estrutura .md de roteirização.
- Prompts de geração visual (Gemini 3 Pro Image Preview).

**Não reaproveita:**
- Conteúdo dos 54 slides oficiais (texto / casos / preços / Pocket vs Full / fotos do Kelvin).
- Assets internos (CRM screenshots, prints de aluno).
- Pipeline `search_references.py` (depende de SerpAPI paga).

Documento técnico de integração interna: `_ANALISE/Comercial/_GERADOR_APRESENTACAO/INTEGRACAO_A360_FRAMEWORK_LITE.md`.
