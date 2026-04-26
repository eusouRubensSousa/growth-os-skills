# Anti-AI Design — Como Fugir do "Cheiro de IA"

> Carregue este arquivo ANTES de gerar o HTML. Ele define o que **NUNCA usar** e o que usar no lugar.
>
> Baseado em: Anthropic `frontend-design` skill oficial, Koomook `claude-frontend-skills`, Magic UI 2026, Page UI / Launch UI patterns, e auditoria de LPs B2B com >10% conversão.

---

## Por que isso importa

**Visitante experiente identifica LP gerada por IA em 3-5 segundos.** Quando identifica, atribui sinal de:
- Negócio amador / sem orçamento
- Cópia genérica = produto genérico
- Falta de diferenciação = "mais um do mesmo"

Resultado: salta a página antes do CTA. **Toda LP que cheira a IA perde conversão.**

---

## Os 8 sintomas de AI slop (NEVER USE)

### 1. ❌ Fonts genéricas como display
**Banidas:** Inter, Arial, Roboto, system-ui, Space Grotesk, Open Sans, Lato.

> *"Generic fonts make AI-generated pages immediately recognizable."* — Anthropic frontend-design skill.

**Use no lugar:** ver `design-tokens.md` — 3 stacks distintos (editorial / brutalist / mono-tech).

### 2. ❌ Gradiente roxo→azul (#6366f1 → #a855f7)
A combinação Indigo→Violet (Tailwind defaults) virou meme. Toda LP "AI startup" usa.

**Use no lugar:** background sólido + UMA cor de destaque (laranja queimado / verde elétrico / rosa choque / amarelo industrial / azul cobalto).

### 3. ❌ Hero com 3 cards idênticos abaixo
Padrão "feature triplet" em cards iguais com ícones Lucide. É o layout que o ChatGPT cospe quando você pede "landing page".

**Use no lugar:**
- Bloco assimétrico (1 grande + 2 pequenos)
- Lista numerada com tipografia grande
- Texto contínuo com destaques inline
- Comparação antes/depois lado a lado

### 4. ❌ Emojis no headline
🚀 ✨ 🍁 🔥 — sinal claro de IA preguiçosa. Headlines profissionais usam tipografia, não emojis.

**Use no lugar:** marca tipográfica (asterisco fino `*`, traço-em `—`, símbolo registrado `®`, número grande à esquerda).

### 5. ❌ Stock photos de "equipe diversa rindo"
Imagens Pexels/Unsplash de pessoas em laptop sorrindo. Visual instantaneamente reconhecível como genérico.

**Use no lugar:**
- Screenshot real do produto (mockup com chrome de browser)
- Diagrama do processo (SVG inline)
- Terminal / code snippet
- Dashboard com números reais
- Placeholder textual que sinaliza "aluno troca por screenshot real"

### 6. ❌ "Empower your team to..." / "Transform your business with..."
Headlines de resultado vago. Cara de IA que tenta soar profissional.

**Use no lugar:** headlines que prometem **resultado concreto e quantificado em ≤8 palavras**.
- Ruim: *"Transform your business with AI"*
- Bom: *"Cut ETL processing time by 70%"*
- Ruim: *"Empower your sales team"*
- Bom: *"Stop losing 4 of every 10 leads"*

### 7. ❌ Border-radius `rounded-xl` everywhere + shadow `shadow-lg` everywhere
Bauhaus de IA. Tudo arredondado, tudo com sombra. Sem hierarquia visual.

**Use no lugar:**
- Mistura de border-radius: `rounded-none` (cards estruturais) + `rounded-full` (pills/badges) + `rounded-sm` (botões)
- Sombras só onde tem **interação** (botão CTA, card que sobe no hover)
- Bordas finas de 1px com `border-neutral-200` em vez de `shadow`

### 8. ❌ Background flat + zero textura
LP "limpa" virou sinônimo de "sem alma". Página plana branca/cinza sem nenhum detalhe visual.

**Use no lugar:**
- Grain noise overlay sutil (SVG `feTurbulence`)
- Dot grid background (`background-image: radial-gradient`)
- Gradientes de mesh muito sutis (não saturados)
- Linhas finas separando seções (em vez de espaço vazio)

---

## As 6 táticas que fogem do padrão

### A. Tensão tipográfica (3 fontes com função clara)

Combinação: **Display Serif + Mono Técnico + Sans Refinado**.

O contraste entre serif elegante + mono rígido + sans neutro é a personalidade inteira do site. Refinado e mecânico no mesmo frame.

**Stacks que funcionam (Apr 2026):**
- **Editorial:** Instrument Serif (display) + JetBrains Mono (labels) + Geist Sans (body)
- **Brutalist:** Archivo Black (display) + Space Mono (labels) + Manrope (body)
- **Mono-tech:** Geist Sans 800 (display) + Geist Mono (labels) + Geist Sans 400 (body)

Função de cada uma:
| Fonte | Onde aparece | Pra quê |
|---|---|---|
| Display Serif | H1, H2 | Personalidade, "wow" |
| Mono Técnico | Labels nav, metadata, números, "kicker" acima de H2 | Sinaliza "este negócio é técnico/sério" |
| Sans Refinado | Body, parágrafos, CTA | Legibilidade |

### B. Grayscale + UMA cor de destaque (não duas, não três — UMA)

Paleta majoritariamente grayscale (>90% do pixel). UMA cor real como destaque, aparece em:
- Status indicators
- Hover states
- Navegação ativa
- Underline no link primário
- Borda do card em foco

> *"Manter uma cor é mais difícil do que parece, mas faz com que cada uso da cor realmente puxe o olho."*

**Cores de destaque que NÃO cheiram a IA:**
- `#FF6B35` (laranja queimado — Magic UI usa)
- `#00D9A6` (verde mineral — Vercel-ish)
- `#FFD23F` (amarelo industrial — Plausible)
- `#FF2E63` (rosa choque controlado)
- `#3B82F6` (azul cobalto — clássico mas funciona se for ÚNICA cor)
- `#8B5CF6` **EVITE** (violeta = AI default)

### C. Linguagem específica e operacional

Os toques humanos pequenos são o que evita parecer parede de IA.

| Genérico (cheira a IA) | Específico (humano) |
|---|---|
| Solutions | What We Build |
| Empower your team | Stop your team from drowning in tickets |
| Get started | Show me my numbers |
| Learn more | I'll see the demo |
| Transform your business | Replace 6 tools with 1 |

Em PT-BR:
| Cheira a IA | Humano |
|---|---|
| Soluções | O que entregamos |
| Transforme seu negócio | Pare de perder 4 leads de cada 10 |
| Saiba mais | Quero ver os números |
| Comece agora | Pegar meu diagnóstico |
| Empodere sua equipe | Tira 12h/semana de operação manual do seu time |

### D. Demos interativos no hero (em vez de screenshot)

Tendência destaque de 2026. Substitui screenshot estático por algo vivo:
- Animação CSS curta (3-5s loop) do produto resolvendo a dor
- Antes/depois com `clip-path` animado
- Gráfico animado mostrando resultado (counter, progress bar)
- Terminal "digitando" com `typewriter` CSS
- Mini-dashboard com números que mudam

**Implementação leve (sem JS pesado):** CSS-only animations + IntersectionObserver para trigger no scroll.

### E. Asymmetric layouts e grid-breaking

LP de IA usa grid simétrico (`grid-cols-3`, `grid-cols-4`). LP humana **quebra a grid**:
- Hero com texto à esquerda 60% / visual à direita 40% (não 50/50)
- Section headlines deslocados para a direita
- Card hero "comendo" o limite da seção (overflow controlado)
- Diagonal lines / borders (`transform: skew`)
- 1 elemento desalinhado intencionalmente

### F. Headlines de resultado quantificado, não de feature

Headlines abaixo de 8 palavras prometendo resultado concreto.

**Templates que convertem:**
- *"Cut [thing] by [number]"* → *"Cut ETL time by 70%"*
- *"Stop [verb] [number] [unit]"* → *"Stop losing 4 of 10 leads"*
- *"[Number] [unit] back to your week"* → *"12h back to your week"*
- *"Replace [tool stack] with [thing]"* → *"Replace Zapier + Make + n8n with one stack"*
- *"From [bad state] to [good state] in [time]"* → *"From spreadsheet chaos to dashboard in 7 days"*

PT-BR:
- *"Pare de perder R$ [valor] todo mês com [coisa]"*
- *"[Número] horas de [tarefa] viram [tempo curto]"*
- *"De [estado ruim] pra [estado bom] em [prazo]"*
- *"O fim de [coisa indesejada]"*

---

## Checklist anti-AI rápido (antes de entregar HTML)

10 itens. Se tiver 2+ em vermelho, REPROCESSA.

- [ ] **A1.** Display font NÃO é Inter / Roboto / Arial / Space Grotesk
- [ ] **A2.** Pelo menos 2 famílias tipográficas diferentes em uso (display + body, idealmente +mono)
- [ ] **A3.** ZERO gradiente roxo→azul / indigo→violet / blue→purple
- [ ] **A4.** UMA cor de destaque dominante (não 2, não 3)
- [ ] **A5.** Hero NÃO tem 3 cards idênticos imediatamente abaixo
- [ ] **A6.** ZERO emoji no H1 e H2 (emoji só permitido em ícones decorativos pequenos, e apenas no boilerplate-infoprod)
- [ ] **A7.** Headline H1 promete resultado concreto/quantificado, não feature ou estado vago
- [ ] **A8.** Tem pelo menos 1 elemento de textura (grain / dot grid / mesh sutil / linha decorativa)
- [ ] **A9.** Layout NÃO é 100% simétrico — pelo menos 1 quebra de grid intencional
- [ ] **A10.** Linguagem operacional específica (nada de "Soluções" / "Transforme" / "Empodere")

---

## Como aplicar este arquivo

A skill `lp-builder` lê este arquivo no Passo 3.4 (HTML Builder) e no Passo 3.6 (Design Reviewer):

1. **HTML Builder** usa as táticas A-F como guia ativo enquanto preenche o boilerplate.
2. **Design Reviewer** roda os 10 itens do checklist anti-AI. Score < 8/10 = bloqueia entrega.

---

## Fontes

- [Anthropic frontend-design SKILL.md](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md) — banimento de fonts genéricas e gradient cliché
- Koomook [claude-frontend-skills/distinctive-frontend](https://github.com/Koomook/claude-frontend-skills) — tema cyberpunk/brutalist/vaporwave/nordic
- [Magic UI](https://magicui.design) — patterns de animação que destacam
- [Page UI / Launch UI](https://pageui.dev) — copy-paste components shadcn-style
- Porter Intelligent — análise tipográfica (serif + mono tension)
- Crea8ive Solution — anti-AI design 2026 trends
- Vezadigital — interactive demos no hero (Guideflow pattern)
- SaaS Hero — headlines de resultado quantificado
