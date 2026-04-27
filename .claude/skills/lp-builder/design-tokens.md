# Design Tokens — 3 Sistemas Distintos

> Catálogo dos 3 sistemas de design disponíveis nos boilerplates da skill `lp-builder`.
> Cada sistema é uma estética coerente — cores + tipografia + textura + animação + tom de copy.
>
> **Regra de ouro:** escolher 1 sistema e executar com precisão. Não misturar.

---

## Sistema 1 — `editorial-serif` (default Accelera 360 / Premium B2B)

**Tom:** editorial luxuoso, sóbrio, executivo. Pensa em revista NYT + agência criativa.
**Quando usar:** Accelera 360 default, B2B premium, consultoria, infraestrutura técnica corporativa, advisory.
**Boilerplate:** `boilerplate-editorial-serif.html`

### Paleta

| Token | Hex | Uso |
|---|---|---|
| `--bg-base` | `#FAF9F6` (off-white quente, NÃO branco puro) | Background principal |
| `--bg-elev` | `#FFFFFF` | Cards / elevated surfaces |
| `--bg-dark` | `#0A0908` (preto profundo, leve quente) | Bloco contraste / footer |
| `--ink-primary` | `#1B1A19` | H1, H2 |
| `--ink-body` | `#3F3D3A` | Parágrafos |
| `--ink-mute` | `#8A8680` | Captions, metadata |
| `--rule` | `#E8E5DF` | Bordas de 1px |
| `--accent` | `#D4471C` (rust orange — uma cor só) | CTA, links, underline ativo |

### Tipografia

```css
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&family=Geist:wght@400;500;600&display=swap');

--font-display: 'Instrument Serif', Georgia, serif;  /* H1, H2, hero quotes */
--font-mono: 'JetBrains Mono', ui-monospace, monospace;  /* Labels, kickers, metadata, nav */
--font-body: 'Geist', system-ui, sans-serif;  /* Body, CTA, forms */
```

**Hierarquia:**
- H1: Instrument Serif 400, 64-88px desktop / 40-48px mobile, line-height 1.05, tracking -0.02em
- H2: Instrument Serif 400, 40-56px, line-height 1.1
- Kicker (label acima de H2): JetBrains Mono 500, 12px, uppercase, tracking 0.12em, accent color
- Body: Geist 400, 17-18px, line-height 1.55
- Metadata / footnote: JetBrains Mono 400, 13px, ink-mute

### Texturas e elementos

- **Grain overlay**: SVG noise sutil em `body::before` (opacity 0.03)
- **Linhas decorativas**: 1px solid rule color separando seções (em vez de `<hr>` ou padding gigante)
- **Drop cap** opcional no primeiro parágrafo de seções longas
- **Asterisco** ou traço-em como divisor inline em vez de bullets
- **Decorative serial number** "Nº 01 / 09" em mono no canto de cada seção

### Animação

- Scroll-triggered fade + translateY(20px) com IntersectionObserver
- Stagger 0.1s entre filhos
- Hover no link: underline animado da esquerda pra direita (CSS only)
- Hover no card: borda muda de rule pra accent
- Cursor padrão (sem custom cursor — manter sobriedade)

### Tom de copy

- **Editorial, sem urgência manufaturada**
- Headlines em sentence case (não Title Case agressivo)
- "Construímos infraestrutura de IA pra clínicas que cansaram de Whatsapp solto."
- CTA: "Quero entender" / "Conversar com a equipe" / "Agendar diagnóstico"

---

## Sistema 2 — `brutalist-grid` (Anti-AI Moat / Disruptive)

**Tom:** brutalist controlado, raw, "este negócio não tá brincando". Pensa em Vercel + Cash App + agência punk.
**Quando usar:** quando quer DISRUPTAR o nicho, posicionar como "novo player que vai destruir o status quo", target de cliente cansado de SaaS genérico.
**Boilerplate:** `boilerplate-brutalist-grid.html`

### Paleta

| Token | Hex | Uso |
|---|---|---|
| `--bg-base` | `#FFFFFF` (branco puro) | Background |
| `--bg-contrast` | `#000000` (preto puro) | Bloco invertido / hero alternativo |
| `--ink-primary` | `#000000` | H1, H2 |
| `--ink-body` | `#1A1A1A` | Parágrafos |
| `--ink-mute` | `#666666` | Metadata |
| `--rule` | `#000000` | Bordas grossas (2-4px) |
| `--accent` | `#CCFF00` (lime green ácido — uma cor só) | Highlight, CTA bg, marker |
| `--accent-ink` | `#000000` | Texto sobre accent |

### Tipografia

```css
@import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Space+Mono:wght@400;700&family=Manrope:wght@400;500;700&display=swap');

--font-display: 'Archivo Black', Impact, sans-serif;  /* H1, H2, números grandes */
--font-mono: 'Space Mono', ui-monospace, monospace;  /* Labels, anotações, code */
--font-body: 'Manrope', system-ui, sans-serif;  /* Body, CTA */
```

**Hierarquia:**
- H1: Archivo Black, 72-120px desktop / 44-56px mobile, line-height 0.9, tracking -0.03em, UPPERCASE
- H2: Archivo Black, 48-72px, line-height 0.95, UPPERCASE ou sentence case
- Kicker: Space Mono 700, 12px, uppercase, tracking 0.15em, com `[brackets]` ou `///`
- Body: Manrope 400, 17px, line-height 1.5
- Highlight inline: `background: var(--accent); padding: 0 4px;`

### Texturas e elementos

- **Bordas grossas pretas** (2px solid black) em todos os cards
- **Sem border-radius** em nada estrutural (`rounded-none`)
- **Brackets `[ ]` e `///`** como marcações de seção
- **Setas → grandes** desenhadas em SVG inline
- **Highlight marker** em palavras-chave (`background: lime; padding: 0 4px;`)
- **Diagonal stripes pattern** em backgrounds de seção contraste
- **Dot grid background** sutil (opacity 0.4)
- **Underline duplo** em links (`border-bottom: 3px double black`)

### Animação

- Hover: card "afunda" 4px (translateY + shadow harsh black)
- Botão CTA: hover inverte cores (white→black) com shift de 2px
- Marquee scrolling no banner de logos clientes
- Scroll-triggered scale-in + rotate sutil (-1deg)
- Cursor pointer custom em CTA (cursor SVG seta grossa)

### Tom de copy

- **Direto, ácido, sem firula**
- "Pare de pagar Zapier + Make + n8n. Use 1 stack. Pronto."
- "Não vendemos curso. Vendemos infraestrutura."
- CTA: "Bora" / "Quero ver" / "Não me convenceu — me prova"

---

## Sistema 3 — `mono-tech` (SaaS Técnico / Dev-first)

**Tom:** Vercel-style, mono-grayscale + 1 cor pop, terminal vibes, "para quem entende". Pensa em Linear + Vercel + Resend.
**Quando usar:** SaaS B2B técnico, ferramentas dev/ops, infraestrutura, API products, audiência sofisticada.
**Boilerplate:** `boilerplate-mono-tech.html`

### Paleta

| Token | Hex | Uso |
|---|---|---|
| `--bg-base` | `#0A0A0A` (zinc-950) | Background principal |
| `--bg-elev` | `#141414` | Cards |
| `--bg-elev-2` | `#1F1F1F` | Inputs, surfaces ainda mais elevadas |
| `--ink-primary` | `#FAFAFA` | H1, H2 |
| `--ink-body` | `#A3A3A3` | Parágrafos (zinc-400) |
| `--ink-mute` | `#525252` | Metadata (zinc-600) |
| `--rule` | `#262626` | Bordas (zinc-800) |
| `--accent` | `#00D9A6` (verde mineral / mint elétrico — UMA cor) | CTA, highlight, status active |
| `--accent-ink` | `#0A0A0A` | Texto sobre accent |

### Tipografia

```css
@import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&family=Geist+Mono:wght@400;500&display=swap');

--font-display: 'Geist', system-ui, sans-serif;  /* Geist 800 para H1, 600 para H2 */
--font-mono: 'Geist Mono', ui-monospace, monospace;  /* Code, labels, numbers, kickers */
--font-body: 'Geist', system-ui, sans-serif;  /* Body em Geist 400 */
```

> Nota: **Geist** é o que substitui Inter neste sistema. Tem mais personalidade (Vercel commissioned, otimizada para code-adjacent UI), e não está no banimento da Anthropic.

**Hierarquia:**
- H1: Geist 800, 56-80px desktop / 36-44px mobile, line-height 1.05, tracking -0.025em
- H2: Geist 600, 36-48px, line-height 1.15
- Kicker: Geist Mono 500, 12px, uppercase, tracking 0.1em, accent color
- Body: Geist 400, 16-17px, line-height 1.55
- Code/snippet inline: Geist Mono 400, bg-elev-2, padding 2px 6px

### Texturas e elementos

- **Dot grid background** sutil em hero (`background-image: radial-gradient(circle, #262626 1px, transparent 1px); background-size: 24px 24px`)
- **Glow sutil** atrás do CTA primário (box-shadow do accent com blur grande, opacity 0.2)
- **Code snippet mockup** no hero como visual (terminal ou editor com syntax highlight)
- **Status pills** monospaced ("LIVE", "v2.4", "↗ +14%") em vários pontos
- **Linha de gradient sutil** separando seções (linear-gradient transparent → rule → transparent)
- **Numerais grandes** em mono ("01 / 02 / 03") em vez de bullet points

### Animação

- Scroll-triggered fade + translateY(16px), stagger 0.08s
- Cursor blinking no terminal mockup do hero
- Botão CTA: glow pulsa lentamente (animation breathing 4s ease-in-out infinite)
- Hover em cards: borda muda de rule pra accent + translateY(-2px)
- Number counter animation no bloco de provas (counts up no scroll)

### Tom de copy

- **Técnico, preciso, irônico mas profissional**
- "Roda local. Sem vendor lock-in. Open core."
- "1 endpoint. Zero config. Roda em 47ms."
- CTA: "Ver docs" / "Começar grátis" / "$ npm install / curl ..."

---

## Tabela comparativa rápida

| Aspecto | editorial-serif | brutalist-grid | mono-tech |
|---|---|---|---|
| Background | Off-white quente | Branco puro | Preto zinc-950 |
| Display font | Instrument Serif | Archivo Black UPPERCASE | Geist 800 |
| Mono font | JetBrains Mono | Space Mono | Geist Mono |
| Cor de destaque | Rust orange `#D4471C` | Lime green `#CCFF00` | Mint `#00D9A6` |
| Border radius | `rounded-sm` (sutil) | `rounded-none` (zero) | `rounded-md` |
| Texture | Grain noise sutil | Dot grid + diagonal stripes | Dot grid + glow |
| Animação | Fade in editorial | Hover harsh shifts | Scroll fade + glow breathing |
| Cursor | Default | Custom seta CTA | Default |
| Quando usar | Premium B2B / Accelera 360 | Disruptor de nicho | SaaS dev-first técnico |

---

## Como a skill escolhe o sistema

**Modo C (default):** se o aluno NÃO especifica estilo, a skill pergunta:
> *"Escolha a estética da LP:*
> *(1) Editorial-Serif — premium B2B, sóbrio (Accelera 360 default)*
> *(2) Brutalist-Grid — disruptor, alta personalidade*
> *(3) Mono-Tech — SaaS técnico, dev-first, dark"*

**Modo A (com URL referência):** o `style-scanner` analisa a URL e mapeia pra um dos 3 sistemas (ou seu próprio se for 100% custom).

**Modo B (sem referência, com nicho):** a skill escolhe automaticamente com base no nicho:
- B2B serviços / consultoria / infraestrutura → `editorial-serif`
- Agência / branding / D2C disruptor → `brutalist-grid`
- SaaS técnico / dev tools / API → `mono-tech`

---

## Override do Accelera 360

A regra do footer Accelera 360 (do LICENSE) **continua valendo nos 3 sistemas** — mas a aparência do footer adapta ao sistema escolhido (não é mais um footer cinza único).

---

## Fontes

- [Geist by Vercel](https://vercel.com/font) — fonte default do mono-tech
- [Instrument Serif by Instrument](https://fonts.google.com/specimen/Instrument+Serif) — display do editorial
- [Archivo Black](https://fonts.google.com/specimen/Archivo+Black) — display brutalist
- [JetBrains Mono](https://www.jetbrains.com/lp/mono/), [Space Mono](https://fonts.google.com/specimen/Space+Mono) — mono labels
- [Manrope](https://fonts.google.com/specimen/Manrope) — body brutalist
