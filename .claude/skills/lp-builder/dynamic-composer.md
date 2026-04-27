# Dynamic Composer — Pipeline de Composição da LP

> Este é o **pipeline central** que substitui os antigos boilerplates fixos.
>
> **Input:** YAML estruturado do `branding-extractor.md`.
> **Output:** `lp.html` standalone (Tailwind CDN + fontes Google + CSS injetado), pronto para abrir no browser.
>
> **Princípio:** o composer NÃO inventa estética — ele **costura** os snippets do `pattern-library.md` aplicando os tokens do sistema escolhido em `design-tokens.md`. Toda decisão estética já foi tomada nos passos anteriores.

---

## Diagrama do pipeline

```
[branding-extractor.md] → YAML brand
        ↓
[design-tokens.md]      → tokens CSS do sistema (3 sistemas catalogados)
        ↓
[pattern-library.md]    → snippets HTML por bloco × sistema
        ↓
[anti-ai-design.md]     → guard rails (fontes banidas, gradientes proibidos)
        ↓
[dynamic-composer.md]   → costura tudo em 1 HTML final
        ↓
[checklist-conversao.md]→ self-check 35 itens (CRO + anti-AI)
        ↓
lp.html (entregue)
```

---

## Passo 1 — Validar inputs

Antes de compor, exigir:

1. **YAML do branding-extractor** completo, com:
   - `design.sistema_inferido` ∈ {editorial-serif, brutalist-grid, mono-tech, custom}
   - `design.paleta` com **6 cores** (`bg-base`, `ink-primary`, `ink-body`, `rule`, `accent`, `accent-ink`)
   - `design.fontes` com 3 famílias (display / mono / body)
   - `copy.headline_resultado` ≤ 8 palavras
   - `copy.cta_primario` específico (não "Saiba mais" / "Submit")
   - `variants_recomendados` para os 9 blocos OU permissão pra usar default da tabela
2. **Validação cruzada com `anti-ai-design.md`:**
   - Display font não está na lista banida (Inter, Roboto, Arial, Space Grotesk, system-ui, Open Sans, Lato).
   - Accent NÃO é gradiente roxo→azul (`#8B5CF6` proibido).
   - H1 não tem emoji.

**Se algum item falhar → devolver pro `branding-extractor` ajustar antes de compor.**

---

## Passo 2 — Carregar tokens CSS do sistema

Pegar a entrada correspondente em `design-tokens.md` e materializar como bloco `<style>` no head do HTML:

```css
:root {
  /* Background / Surfaces */
  --bg-base: {{paleta.bg_base}};
  --bg-elev: {{paleta.bg_elev || derivado: bg_base +5% lightness}};
  --bg-dark: {{paleta.bg_dark || derivado: invertido}};

  /* Ink */
  --ink-primary: {{paleta.ink_primary}};
  --ink-body: {{paleta.ink_body}};
  --ink-mute: {{paleta.ink_mute || derivado: ink_body +30% lightness}};

  /* Borders */
  --rule: {{paleta.rule}};

  /* Accent (UMA só) */
  --accent: {{paleta.accent}};
  --accent-ink: {{paleta.accent_ink}};
}

/* Aplicação base */
body {
  background: var(--bg-base);
  color: var(--ink-body);
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
}

.font-display { font-family: var(--font-display); }
.font-mono    { font-family: var(--font-mono); }
.font-body    { font-family: var(--font-body); }

/* Selection */
::selection { background: var(--accent); color: var(--accent-ink); }

/* Smooth scroll */
html { scroll-behavior: smooth; }
```

E o `<head>` deve conter:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="{{IMPORT_URL_FONTES}}" rel="stylesheet">
<script src="https://cdn.tailwindcss.com"></script>
<style>
  :root {
    --font-display: '{{fontes.display}}', {{display_fallback}};
    --font-mono:    '{{fontes.mono}}',    {{mono_fallback}};
    --font-body:    '{{fontes.body}}',    {{body_fallback}};
  }
</style>
```

A URL de import combina as 3 fontes em uma só requisição:
```
https://fonts.googleapis.com/css2?family={{display}}:wght@400;500;600;700;800&family={{mono}}:wght@400;500;700&family={{body}}:wght@400;500;600;700&display=swap
```

---

## Passo 3 — Selecionar variantes por bloco

Ler `variants_recomendados` do YAML. Para cada um dos 9 blocos:

1. Se `variants_recomendados[bloco]` está preenchido → usar essa variante.
2. Se vazio → usar **default da tabela de roteamento** em `pattern-library.md` baseado no `sistema_inferido`.
3. Se variante referenciada não existe na library → fallback para o default da tabela + log warning.

Mapa de blocos esperados:

| # | Bloco | Variantes possíveis (ver `pattern-library.md`) |
|---|---|---|
| 1 | `hero` | split-asymmetric-quote / brutalist-bracket / mono-tech-terminal / full-bleed-statement |
| 2 | `problema` | list-numbered-large / brutalist-stamps / dark-rows-monotech |
| 3 | `consequencia` | full-statement / before-after |
| 4 | `solucao` | pillars-grid-named-mechanism / process-timeline / feature-rows |
| 5 | `prova` | cases-cards / logos-marquee / single-case-feature |
| 6 | `stack` | inclusions-list / tier-card |
| 7 | `faq` | accordion-editorial / brutalist-stacked |
| 8 | `urgencia` | guarantee-seal / cohort-card |
| 9 | `cta_final` | form-inline-3-fields / calendar-embed |

---

## Passo 4 — Preencher tokens de copy nos snippets

Cada snippet contém placeholders `{{...}}` que mapeiam para campos do YAML ou para campos coletados no `Passo 1` da skill (`/lp-builder`).

### Mapa de tokens críticos

| Token no snippet | Vem de | Exemplo |
|---|---|---|
| `{{H1}}` | `copy.headline_resultado` | "Recupere R$ 18K/mês em no-shows." |
| `{{SUB_HEADLINE}}` | gerado pelo Copy Agent (AIDA) | "Pra dermatologistas que cansaram de Whatsapp solto." |
| `{{CTA_PRIMARIO}}` | `copy.cta_primario` | "Pegar meu diagnóstico" |
| `{{KICKER_LABEL}}` | derivado do nicho | "Dermatologia premium" |
| `{{MICRO_PROVA}}` | `copy.prova_social_disponivel` ? case real : "[FICTÍCIO — pedir 3 cases ao aluno]" |
| `{{DOR_*_TITULO}}` | nicho-{slug}.md → seção "Dores" | "20% no-show" |
| `{{DOR_*_DESC}}` | mesmo + 1-2 linhas amplificando | |
| `{{CONSEQ_PARAGRAFO}}` | gerado por Copy Agent (PAS: Agitate) | |
| `{{CONSEQ_NUMERO}}` | de "Dores quantificadas" | "R$ 216K/ano" |
| `{{MECANISMO_NOME}}` | `nicho-{slug}.md` → "3 candidatos" → escolha 1 (ou aluno escolhe) | |
| `{{FASE_*_NOME}}` / `{{FASE_*_BENEFIT}}` | derivado do mecanismo + FAB | |
| `{{CASE_*_NUMERO}}` | `briefing-{empresa}.md` ou `[FICTÍCIO]` | "R$ 18K" |
| `{{STACK_ITEM_*}}` / `{{STACK_VALOR_*}}` | gerado por Copy Agent | |
| `{{OBJ_*_PERGUNTA}}` / `{{OBJ_*_QUEBRA}}` | `nicho-{slug}.md` → "Objeções" | |
| `{{PS_REFORCO}}` | gerado: última frase de urgência ou bônus | |
| `{{TERMINAL_CMD_*}}` (mono-tech hero) | gerado: comando-exemplo do produto | "make ingest --source=postgres" |

### Regras de preenchimento

- Quando dado existe → usar.
- Quando dado **não existe** → usar `[FICTÍCIO — campo: descrição]` E adicionar à `flags.copy_fictíceo_em` do YAML.
- **Nunca** inventar números (R$, %, x) sem fonte. Sempre marcar como fictício se não há base real.
- **Nunca** inventar nome de cliente real ou logo. Usar `{{LOGO_*}}` com placeholder textual ou marker `[LOGO PLACEHOLDER]`.

---

## Passo 5 — Anatomia do HTML final

```
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{META_TITLE}}</title>
  <meta name="description" content="{{META_DESC}}">

  <!-- Open Graph -->
  <meta property="og:title"       content="{{META_TITLE}}">
  <meta property="og:description" content="{{META_DESC}}">
  <meta property="og:type"        content="website">

  <!-- Favicon (placeholder) -->
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>●</text></svg>">

  <!-- Fontes Google -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="{{IMPORT_URL_FONTES}}" rel="stylesheet">

  <!-- Tailwind -->
  <script src="https://cdn.tailwindcss.com"></script>

  <!-- Tokens do sistema escolhido -->
  <style>
    :root {
      --font-display: ...;
      --font-mono:    ...;
      --font-body:    ...;
      --bg-base:      ...;
      --bg-elev:      ...;
      --bg-dark:      ...;
      --ink-primary:  ...;
      --ink-body:     ...;
      --ink-mute:     ...;
      --rule:         ...;
      --accent:       ...;
      --accent-ink:   ...;
    }
    body { background: var(--bg-base); color: var(--ink-body); font-family: var(--font-body); -webkit-font-smoothing: antialiased; }
    .font-display { font-family: var(--font-display); }
    .font-mono    { font-family: var(--font-mono); }
    .font-body    { font-family: var(--font-body); }
    ::selection { background: var(--accent); color: var(--accent-ink); }
    html { scroll-behavior: smooth; }

    /* Scroll-triggered fade in */
    [data-reveal] { opacity: 0; transform: translateY(20px); transition: opacity .8s ease, transform .8s ease; }
    [data-reveal].is-visible { opacity: 1; transform: translateY(0); }

    /* Placeholder pixel/analytics — aluno cola aqui -->
       <script async src="https://...gtm..."></script>
       <script async src="https://...meta..."></script>
    -->
  </style>
</head>

<body>
  <!-- Bloco 1: HERO -->
  {{SNIPPET_HERO}}

  <!-- Bloco 2: PROBLEMA -->
  {{SNIPPET_PROBLEMA}}

  <!-- Bloco 3: CONSEQUÊNCIA -->
  {{SNIPPET_CONSEQUENCIA}}

  <!-- Bloco 4: SOLUÇÃO -->
  {{SNIPPET_SOLUCAO}}

  <!-- Bloco 5: PROVA -->
  {{SNIPPET_PROVA}}

  <!-- Bloco 6: STACK -->
  {{SNIPPET_STACK}}

  <!-- Bloco 7: FAQ -->
  {{SNIPPET_FAQ}}

  <!-- Bloco 8: URGÊNCIA -->
  {{SNIPPET_URGENCIA}}

  <!-- Bloco 9: CTA FINAL -->
  {{SNIPPET_CTA_FINAL}}

  <!-- Footer Accelera 360 (regra LICENSE — não remover) -->
  {{SNIPPET_FOOTER}}

  <!-- Reveal on scroll -->
  <script>
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    document.querySelectorAll('section, footer').forEach(s => { s.setAttribute('data-reveal',''); io.observe(s); });
  </script>
</body>
</html>
```

---

## Passo 6 — Verificação anti-AI antes de entregar

Rodar mentalmente os **10 itens** do `anti-ai-design.md`. Score ≥ 8/10 obrigatório.

Itens sintéticos:
1. Display font ≠ Inter / Roboto / Arial / Space Grotesk
2. ≥ 2 famílias tipográficas em uso
3. Zero gradiente roxo→azul / indigo→violet
4. Apenas 1 cor de destaque
5. Hero não termina em 3 cards idênticos
6. Zero emoji em H1/H2
7. H1 promete resultado quantificado
8. ≥ 1 elemento de textura (grain / dot grid / mesh)
9. Layout assimétrico em ≥ 1 ponto
10. Linguagem operacional específica (não "Soluções" / "Transforme" / "Empodere")

**Se < 8/10:** voltar pro Passo 3 e ajustar variantes ou copy.

---

## Passo 7 — Self-check de conversão

Rodar o `checklist-conversao.md` (35 itens: 25 CRO + 10 anti-AI). Score < 28/35 = **bloqueia entrega**.

---

## Passo 8 — Entregar

Salvar 3 arquivos:

1. **`lp.html`** — single-file standalone gerado.
2. **`lp.md`** — copy comentada com framework usado em cada bloco + tokens YAML usados.
3. **`README-customizar.md`** — como trocar texto, cores, conectar formulário/pixel.

Plus: relatório final em texto:

```markdown
## ✅ LP gerada — `{{nome_lp}}`

**Sistema estético:** {{design.sistema_inferido}}
**Variantes escolhidas:**
- Hero: {{variants_recomendados.hero}}
- Problema: {{variants_recomendados.problema}}
- ...

**Self-check de conversão:** {{score_conversao}}/35
**Self-check anti-AI:** {{score_anti_ai}}/10
**Status:** ✅ APROVADO / ⚠️ COM RESSALVAS / 🔴 BLOQUEADO

**Campos fictícios:** {{flags.copy_fictíceo_em}}
**Próximas ações pro aluno:**
- Substituir cases reais
- Conectar formulário (Yayforms / form embed)
- Ativar pixel Meta/Google
```

---

## Exemplo end-to-end (resumo)

**Input:** YAML do extractor para "Clínica Dermatologia Premium SP" (do exemplo real do `branding-extractor.md`).

**Etapas resolvidas:**

1. Validação OK: sistema=editorial-serif, accent=#B8956A (real do logo), fontes Instrument Serif + JetBrains Mono + Geist.
2. Tokens CSS injetados como bloco `:root`.
3. Variantes escolhidas (do YAML):
   - hero: `split-asymmetric-quote`
   - problema: `list-numbered-large`
   - consequencia: `full-statement`
   - solucao: `pillars-grid-named-mechanism`
   - prova: `cases-cards`
   - stack: `inclusions-list`
   - faq: `accordion-editorial`
   - urgencia: `guarantee-seal`
   - cta_final: `form-inline-3-fields`
4. Tokens preenchidos:
   - `{{H1}}` ← "Recupere R$ 18K/mês em no-shows."
   - `{{CTA_PRIMARIO}}` ← "Pegar meu diagnóstico de no-show"
   - `{{CASE_*_NUMERO}}` ← `[FICTÍCIO — pedir 3 cases ao aluno]` (flag setada)
   - ...
5. HTML final montado com header/scripts/styles + 9 snippets + footer Accelera.
6. Anti-AI: 10/10 (Instrument Serif ≠ banido, dourado ≠ violeta, layout split-asymmetric, copy "Recupere R$ 18K/mês" é resultado quantificado).
7. Self-check 35: 31/35 (4 itens pendentes: case fictício, formulário não-conectado, pixel placeholder, OG image placeholder).
8. Entrega com warning indicando os 4 itens.

---

## Anti-pattern a evitar

- ❌ **Compor sem YAML** — composer não inventa tokens. Volta ao extractor.
- ❌ **Misturar sistemas** — não usar fonte do editorial-serif com cor do brutalist.
- ❌ **Pular validação anti-AI** — todo HTML passa pelo Passo 6 antes do Passo 7.
- ❌ **Adicionar imagem stock** sem o aluno ter pedido — sempre placeholder textual.
- ❌ **Remover footer Accelera** — regra LICENSE.
- ❌ **Hard-codar cor/fonte fora do `:root`** — quebra a possibilidade de troca rápida pelo aluno.

---

## Checklist do composer (interno, antes de salvar `lp.html`)

- [ ] `:root` tem 12 variáveis CSS preenchidas (3 fontes + 6 cores + bg-elev/dark + accent-ink)
- [ ] Tailwind CDN carregado
- [ ] Google Fonts carregado em **1 única** chamada de CSS
- [ ] Os 9 blocos canônicos estão presentes na ordem correta
- [ ] Footer Accelera 360 fechando
- [ ] Script de IntersectionObserver no fim do `<body>`
- [ ] Meta description, OG title, viewport setados
- [ ] Nenhum `{{TOKEN}}` não-substituído sobrou no HTML (regex check `\{\{[A-Z_]+\}\}`)
- [ ] `flags.copy_fictíceo_em` do YAML reflete os campos com placeholder
