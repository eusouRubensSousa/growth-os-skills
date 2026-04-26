# Style Scanner — Protocolo de Extração de Estilo

> Como extrair paleta + tipografia + hierarquia visual de uma URL de referência (Modo A do `lp-builder`).

---

## Quando aplica

Modo A: aluno passou 1-2 URLs de LPs que quer replicar visualmente.

## Pipeline

### 1. Fetch da URL via WebFetch
```
WebFetch(url, "Extrair: (a) cores principais usadas (background, headline, CTA, accent), (b) font-family CSS dominante, (c) tamanho aproximado da H1 e dos blocos, (d) tipo de hero (texto+imagem, texto+vídeo, full-bleed image), (e) layout (1 coluna / 2 colunas), (f) presença de elementos: logos clientes, depoimentos, FAQ, gradientes, sombras, animações.")
```

### 2. Heurística de paleta
- **Background:** cor predominante do `<body>` ou da seção HERO.
- **CTA:** cor do botão primário.
- **Accent:** cor de hover / detalhes.
- **Texto headline:** geralmente branco em backgrounds escuros, escuro em backgrounds claros.

### 3. Tipografia
- Procurar `font-family` no CSS.
- Identificar família dominante (Inter, Poppins, Roboto, Manrope, custom).
- Pesos usados (400 / 600 / 700 / 800).

### 4. Hierarquia visual
- Tamanho aproximado do H1 (40-72px típico).
- Spacing entre blocos (typically 80-120px).
- Largura máxima do conteúdo (max-width geralmente 1200-1400px).

---

## Output do scanner

Devolver objeto estruturado:

```yaml
referencia_url: https://exemplo.com/lp
paleta:
  bg_primary: "#0a0a0a"
  bg_secondary: "#171717"
  cta: "#7c5cfc"
  text_primary: "#fafafa"
  text_secondary: "#a3a3a3"
  accent: "#7c5cfc"
tipografia:
  family_principal: "Inter"
  family_fallback: "system-ui, sans-serif"
  pesos_usados: [400, 600, 700, 800]
  h1_size_aprox: "64px desktop / 40px mobile"
hero:
  tipo: "texto+imagem ao lado direito"
  altura: "100vh"
  prova_social_acima_dobra: true
layout:
  colunas: 1
  max_width: "1200px"
  spacing_entre_blocos: "96px"
elementos_observados:
  - logos_clientes: true
  - depoimentos_carrossel: true
  - faq_accordion: true
  - gradiente_hero: false
  - sombras: subtle
  - animacoes: scroll-reveal
```

---

## Mapeamento para um dos 3 sistemas (`design-tokens.md`)

Após o YAML cru acima, **mapear** para 1 dos 3 sistemas catalogados em `design-tokens.md`. Esse é o output que alimenta o `branding-extractor.md`.

### Heurística de mapeamento

| Sinais detectados na URL | Sistema sugerido |
|---|---|
| Background off-white quente, serif display, layout 1 coluna editorial, sem brackets/uppercase | `editorial-serif` |
| Bordas grossas pretas, uppercase agressivo, lime/amarelo ácido, brackets `[ ]` ou `///` | `brutalist-grid` |
| Background dark zinc, mono font visível, dot-grid, code snippets, glow accent | `mono-tech` |
| Não bate com nenhum dos 3 com clareza | `custom` (e mantém paleta+fontes da URL no YAML, com warning ao aluno sobre risco anti-AI menor) |

### Override de cor

Se a URL tem cor de marca real declarada (ex: dourado `#B8956A` da clínica), **manter essa cor** como `accent` mesmo quando o sistema mapeado tem outra cor default. A `accent` real do cliente sempre vence.

### Override de fonte (com guard rail anti-AI)

Se a URL usa uma fonte banida (`anti-ai-design.md`: Inter / Roboto / Arial / Space Grotesk / system-ui / Open Sans / Lato) como display, **NÃO replicar** — substituir pela fonte default do sistema mapeado e avisar o aluno.

### Saída final do scanner

Acrescentar ao YAML:

```yaml
sistema_mapeado: "editorial-serif"  # ou brutalist-grid / mono-tech / custom
sistema_justificativa: "Background off-white + serif display + layout 1 coluna editorial"
overrides_aplicados:
  - "accent mantido da marca real (#B8956A) sobre default do sistema"
  - "display font Inter substituída por Instrument Serif (banida)"
warnings:
  - "Fonte Inter banida — substituída automaticamente"
```

Esse output entra no `branding-extractor.md` no campo `design.sistema_inferido` + `design.paleta` + `design.fontes`.

---

## Limitações

- **Não copia copy** da referência — só estilo visual.
- **Não copia imagens** — apenas placeholders Unsplash similares.
- **Não copia branding** específico (logo, slogan da referência) — substituiu pelo do aluno.
- **Não viola direitos autorais** — apenas inspiração estética (paleta + tipografia + layout são livres por convenção web).
