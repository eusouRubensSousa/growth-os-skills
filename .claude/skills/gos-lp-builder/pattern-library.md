# Pattern Library — Snippets HTML por Bloco × Sistema

> Catálogo de snippets HTML+Tailwind+CSS prontos para serem combinados pelo `dynamic-composer.md`.
>
> **Lógica:** cada um dos 9 blocos canônicos (`anatomia-lp.md`) tem 2–4 variantes nomeadas. O `branding-extractor.md` recomenda uma variante por bloco no campo `variants_recomendados`. O composer monta a LP escolhendo 1 variante por bloco.
>
> **Tokens:** todos os snippets usam variáveis CSS (`var(--bg-base)`, `var(--accent)`, `var(--font-display)` etc.) injetadas pelo composer a partir do `design-tokens.md` do sistema escolhido.
>
> **Regra de ouro:** snippets são **estruturais** (layout + tokens), não **decorativos** (não tem cor hardcoded, não tem fonte hardcoded). A estética vem do sistema injetado.

---

## Convenções

- `{{TOKEN}}` — variável de copy preenchida pelo composer (ex: `{{H1}}`, `{{CTA_PRIMARIO}}`).
- `var(--token)` — variável CSS injetada pelo sistema (ex: `var(--accent)`).
- `class="font-display"` / `class="font-mono"` / `class="font-body"` — classes utilitárias que mapeiam pras 3 fontes do sistema.
- Todos os snippets são **responsivos mobile-first** (breakpoint `md:` em 768px).
- Nenhum snippet usa `rounded-xl` global, `shadow-lg` global, gradiente roxo→azul, ou as 8 fontes banidas (`anti-ai-design.md`).

---

## Bloco 1 — HERO (4 variantes)

### `hero.split-asymmetric-quote`
**Quando usar:** sistema `editorial-serif`. Premium B2B / advisory / clínicas premium.
**Layout:** texto à esquerda 58% / quote-block à direita 42%. Quebra de grid intencional.

```html
<section class="relative overflow-hidden border-b" style="border-color: var(--rule);">
  <div class="absolute inset-0 opacity-[0.025]" style="background-image: url('data:image/svg+xml;utf8,<svg xmlns=&quot;http://www.w3.org/2000/svg&quot; width=&quot;200&quot; height=&quot;200&quot;><filter id=&quot;n&quot;><feTurbulence baseFrequency=&quot;0.9&quot;/></filter><rect width=&quot;100%&quot; height=&quot;100%&quot; filter=&quot;url(%23n)&quot;/></svg>');"></div>
  <div class="max-w-7xl mx-auto px-6 md:px-10 pt-20 md:pt-28 pb-16 md:pb-24 grid md:grid-cols-12 gap-8 relative">
    <div class="md:col-span-7">
      <p class="font-mono text-xs uppercase tracking-[0.18em] mb-8" style="color: var(--accent);">Nº 01 / {{KICKER_LABEL}}</p>
      <h1 class="font-display text-5xl md:text-7xl leading-[1.02] tracking-tight" style="color: var(--ink-primary);">{{H1}}</h1>
      <p class="font-body mt-6 text-lg md:text-xl max-w-xl" style="color: var(--ink-body);">{{SUB_HEADLINE}}</p>
      <div class="mt-10 flex flex-col sm:flex-row gap-3">
        <a href="#cta" class="font-body inline-flex items-center justify-center px-7 py-4 text-base font-medium border border-transparent transition" style="background: var(--accent); color: var(--accent-ink);">{{CTA_PRIMARIO}} →</a>
        <a href="#prova" class="font-mono inline-flex items-center justify-center px-5 py-4 text-sm border" style="border-color: var(--rule); color: var(--ink-body);">Ver casos →</a>
      </div>
      <p class="font-mono text-xs mt-8" style="color: var(--ink-mute);">{{MICRO_PROVA}}</p>
    </div>
    <aside class="md:col-span-5 md:pl-10 md:border-l flex flex-col justify-end" style="border-color: var(--rule);">
      <blockquote class="font-display italic text-2xl md:text-3xl leading-snug" style="color: var(--ink-primary);">"{{QUOTE_HERO}}"</blockquote>
      <p class="font-mono text-xs uppercase tracking-wider mt-4" style="color: var(--ink-mute);">— {{QUOTE_AUTOR}}</p>
    </aside>
  </div>
</section>
```

### `hero.brutalist-bracket`
**Quando usar:** sistema `brutalist-grid`. Disruptor de nicho.
**Layout:** texto enorme uppercase + brackets `[ ]` + linha grossa diagonal.

```html
<section class="border-b-4 border-black relative overflow-hidden" style="background: var(--bg-base);">
  <div class="absolute inset-0" style="background-image: radial-gradient(circle, var(--ink-mute) 1px, transparent 1px); background-size: 28px 28px; opacity: 0.08;"></div>
  <div class="max-w-7xl mx-auto px-6 md:px-10 pt-16 md:pt-24 pb-16 md:pb-20 relative">
    <p class="font-mono font-bold text-xs uppercase tracking-[0.2em] mb-10">[ {{KICKER_LABEL}} ] /// LP-2026</p>
    <h1 class="font-display uppercase text-6xl md:text-8xl lg:text-9xl leading-[0.88] tracking-tighter" style="color: var(--ink-primary);">{{H1}}</h1>
    <div class="mt-10 max-w-2xl border-l-4 border-black pl-6">
      <p class="font-body text-lg md:text-xl" style="color: var(--ink-body);">{{SUB_HEADLINE}}</p>
    </div>
    <div class="mt-12 flex flex-wrap gap-4 items-center">
      <a href="#cta" class="font-body font-bold inline-flex items-center px-8 py-5 border-2 border-black text-base transition hover:translate-x-[2px] hover:translate-y-[2px]" style="background: var(--accent); color: var(--accent-ink); box-shadow: 6px 6px 0 0 var(--ink-primary);">{{CTA_PRIMARIO}} →</a>
      <span class="font-mono text-xs uppercase tracking-wider" style="color: var(--ink-mute);">{{MICRO_PROVA}}</span>
    </div>
  </div>
</section>
```

### `hero.mono-tech-terminal`
**Quando usar:** sistema `mono-tech`. SaaS dev-first / API / infraestrutura técnica.
**Layout:** texto à esquerda + mockup terminal à direita com cursor piscando.

```html
<section class="relative overflow-hidden" style="background: var(--bg-base);">
  <div class="absolute inset-0" style="background-image: radial-gradient(circle, var(--rule) 1px, transparent 1px); background-size: 24px 24px;"></div>
  <div class="max-w-7xl mx-auto px-6 md:px-10 pt-20 md:pt-28 pb-20 grid md:grid-cols-2 gap-12 items-center relative">
    <div>
      <p class="font-mono text-xs uppercase tracking-[0.12em] mb-6" style="color: var(--accent);">// {{KICKER_LABEL}}</p>
      <h1 class="font-display font-extrabold text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight" style="color: var(--ink-primary);">{{H1}}</h1>
      <p class="font-body mt-6 text-lg max-w-lg" style="color: var(--ink-body);">{{SUB_HEADLINE}}</p>
      <div class="mt-10 flex flex-col sm:flex-row gap-3">
        <a href="#cta" class="font-body inline-flex items-center justify-center px-7 py-4 text-base font-medium rounded-md transition" style="background: var(--accent); color: var(--accent-ink); box-shadow: 0 0 32px 0 color-mix(in srgb, var(--accent) 30%, transparent);">{{CTA_PRIMARIO}} →</a>
        <a href="#docs" class="font-mono inline-flex items-center justify-center px-5 py-4 text-sm rounded-md border" style="border-color: var(--rule); color: var(--ink-body);">$ ver docs</a>
      </div>
      <div class="mt-8 flex items-center gap-3 font-mono text-xs" style="color: var(--ink-mute);">
        <span class="inline-block w-2 h-2 rounded-full" style="background: var(--accent);"></span>
        <span>{{MICRO_PROVA}}</span>
      </div>
    </div>
    <div class="rounded-lg border overflow-hidden" style="background: var(--bg-elev); border-color: var(--rule);">
      <div class="flex items-center gap-2 px-4 py-3 border-b" style="border-color: var(--rule);">
        <span class="w-3 h-3 rounded-full bg-red-400 opacity-60"></span>
        <span class="w-3 h-3 rounded-full bg-yellow-400 opacity-60"></span>
        <span class="w-3 h-3 rounded-full bg-green-400 opacity-60"></span>
        <span class="font-mono text-xs ml-3" style="color: var(--ink-mute);">~/{{TERMINAL_LABEL}}</span>
      </div>
      <pre class="font-mono text-sm p-6 leading-relaxed" style="color: var(--ink-primary);"><code>$ {{TERMINAL_CMD_1}}
<span style="color: var(--accent);">→</span> {{TERMINAL_OUT_1}}

$ {{TERMINAL_CMD_2}}
<span style="color: var(--accent);">→</span> {{TERMINAL_OUT_2}}<span class="cursor-blink">▋</span></code></pre>
    </div>
  </div>
  <style>.cursor-blink{animation: blink 1.1s steps(1) infinite}@keyframes blink{50%{opacity:0}}</style>
</section>
```

### `hero.full-bleed-statement`
**Quando usar:** qualquer sistema, quando NÃO há visual / produto demo / quote forte. Fallback editorial.
**Layout:** uma frase só, gigante, centralizada, com CTA embaixo.

```html
<section class="relative" style="background: var(--bg-base);">
  <div class="max-w-5xl mx-auto px-6 md:px-10 py-24 md:py-36 text-center">
    <p class="font-mono text-xs uppercase tracking-[0.18em] mb-8" style="color: var(--accent);">{{KICKER_LABEL}}</p>
    <h1 class="font-display text-5xl md:text-7xl lg:text-8xl leading-[1.02] tracking-tight" style="color: var(--ink-primary);">{{H1}}</h1>
    <p class="font-body mt-8 text-lg md:text-xl max-w-2xl mx-auto" style="color: var(--ink-body);">{{SUB_HEADLINE}}</p>
    <a href="#cta" class="font-body inline-flex items-center justify-center px-7 py-4 mt-10 text-base font-medium transition" style="background: var(--accent); color: var(--accent-ink);">{{CTA_PRIMARIO}} →</a>
    <p class="font-mono text-xs mt-6" style="color: var(--ink-mute);">{{MICRO_PROVA}}</p>
  </div>
</section>
```

---

## Bloco 2 — PROBLEMA (3 variantes)

### `problema.list-numbered-large`
**Quando usar:** sistema `editorial-serif`. Lista numerada com tipografia grande, sem cards.

```html
<section class="border-b" style="border-color: var(--rule); background: var(--bg-base);">
  <div class="max-w-5xl mx-auto px-6 md:px-10 py-20 md:py-28">
    <p class="font-mono text-xs uppercase tracking-[0.18em] mb-4" style="color: var(--accent);">Nº 02 / Diagnóstico</p>
    <h2 class="font-display text-4xl md:text-5xl leading-tight max-w-3xl" style="color: var(--ink-primary);">{{PROBLEMA_TITULO}}</h2>
    <p class="font-body mt-4 text-lg max-w-2xl" style="color: var(--ink-body);">{{PROBLEMA_INTRO}}</p>
    <ol class="mt-14 space-y-12">
      <li class="grid md:grid-cols-12 gap-6 items-start">
        <span class="md:col-span-1 font-display text-3xl md:text-4xl" style="color: var(--accent);">01</span>
        <div class="md:col-span-11 md:border-l md:pl-8" style="border-color: var(--rule);">
          <h3 class="font-display text-2xl md:text-3xl" style="color: var(--ink-primary);">{{DOR_1_TITULO}}</h3>
          <p class="font-body mt-2 max-w-2xl" style="color: var(--ink-body);">{{DOR_1_DESC}}</p>
        </div>
      </li>
      <li class="grid md:grid-cols-12 gap-6 items-start">
        <span class="md:col-span-1 font-display text-3xl md:text-4xl" style="color: var(--accent);">02</span>
        <div class="md:col-span-11 md:border-l md:pl-8" style="border-color: var(--rule);">
          <h3 class="font-display text-2xl md:text-3xl" style="color: var(--ink-primary);">{{DOR_2_TITULO}}</h3>
          <p class="font-body mt-2 max-w-2xl" style="color: var(--ink-body);">{{DOR_2_DESC}}</p>
        </div>
      </li>
      <li class="grid md:grid-cols-12 gap-6 items-start">
        <span class="md:col-span-1 font-display text-3xl md:text-4xl" style="color: var(--accent);">03</span>
        <div class="md:col-span-11 md:border-l md:pl-8" style="border-color: var(--rule);">
          <h3 class="font-display text-2xl md:text-3xl" style="color: var(--ink-primary);">{{DOR_3_TITULO}}</h3>
          <p class="font-body mt-2 max-w-2xl" style="color: var(--ink-body);">{{DOR_3_DESC}}</p>
        </div>
      </li>
    </ol>
  </div>
</section>
```

### `problema.brutalist-stamps`
**Quando usar:** sistema `brutalist-grid`. Cada dor é um stamp grosso com borda dupla.

```html
<section class="border-b-4 border-black" style="background: var(--bg-base);">
  <div class="max-w-7xl mx-auto px-6 md:px-10 py-20">
    <p class="font-mono font-bold text-xs uppercase tracking-[0.2em] mb-6">[ DIAGNOSTICO ] ///</p>
    <h2 class="font-display uppercase text-4xl md:text-6xl leading-[0.95] tracking-tight max-w-3xl" style="color: var(--ink-primary);">{{PROBLEMA_TITULO}}</h2>
    <p class="font-body mt-6 max-w-2xl" style="color: var(--ink-body);">{{PROBLEMA_INTRO}}</p>
    <div class="mt-14 grid md:grid-cols-3 gap-6">
      <div class="border-2 border-black p-6" style="background: var(--bg-elev, #fff);">
        <span class="font-mono font-bold text-xs uppercase">[ 01 ]</span>
        <h3 class="font-display uppercase text-2xl mt-3" style="color: var(--ink-primary);">{{DOR_1_TITULO}}</h3>
        <p class="font-body mt-3 text-sm" style="color: var(--ink-body);">{{DOR_1_DESC}}</p>
      </div>
      <div class="border-2 border-black p-6" style="background: var(--accent); color: var(--accent-ink);">
        <span class="font-mono font-bold text-xs uppercase">[ 02 ]</span>
        <h3 class="font-display uppercase text-2xl mt-3">{{DOR_2_TITULO}}</h3>
        <p class="font-body mt-3 text-sm">{{DOR_2_DESC}}</p>
      </div>
      <div class="border-2 border-black p-6" style="background: var(--bg-elev, #fff);">
        <span class="font-mono font-bold text-xs uppercase">[ 03 ]</span>
        <h3 class="font-display uppercase text-2xl mt-3" style="color: var(--ink-primary);">{{DOR_3_TITULO}}</h3>
        <p class="font-body mt-3 text-sm" style="color: var(--ink-body);">{{DOR_3_DESC}}</p>
      </div>
    </div>
  </div>
</section>
```

### `problema.dark-rows-monotech`
**Quando usar:** sistema `mono-tech`. Linhas tipo log de erro em terminal.

```html
<section style="background: var(--bg-base);">
  <div class="max-w-5xl mx-auto px-6 md:px-10 py-20">
    <p class="font-mono text-xs uppercase tracking-[0.12em] mb-3" style="color: var(--accent);">// errors.detected</p>
    <h2 class="font-display font-bold text-3xl md:text-5xl leading-tight" style="color: var(--ink-primary);">{{PROBLEMA_TITULO}}</h2>
    <p class="font-body mt-4 max-w-xl" style="color: var(--ink-body);">{{PROBLEMA_INTRO}}</p>
    <div class="mt-12 rounded-lg overflow-hidden border" style="background: var(--bg-elev); border-color: var(--rule);">
      <div class="grid grid-cols-1 divide-y" style="--tw-divide-opacity:1; border-color: var(--rule);">
        <div class="p-6 grid md:grid-cols-12 gap-4 items-start" style="border-color: var(--rule);">
          <span class="md:col-span-1 font-mono text-xs" style="color: var(--accent);">[01]</span>
          <div class="md:col-span-11">
            <h3 class="font-display font-semibold text-xl" style="color: var(--ink-primary);">{{DOR_1_TITULO}}</h3>
            <p class="font-body mt-1 text-sm" style="color: var(--ink-body);">{{DOR_1_DESC}}</p>
          </div>
        </div>
        <div class="p-6 grid md:grid-cols-12 gap-4 items-start border-t" style="border-color: var(--rule);">
          <span class="md:col-span-1 font-mono text-xs" style="color: var(--accent);">[02]</span>
          <div class="md:col-span-11">
            <h3 class="font-display font-semibold text-xl" style="color: var(--ink-primary);">{{DOR_2_TITULO}}</h3>
            <p class="font-body mt-1 text-sm" style="color: var(--ink-body);">{{DOR_2_DESC}}</p>
          </div>
        </div>
        <div class="p-6 grid md:grid-cols-12 gap-4 items-start border-t" style="border-color: var(--rule);">
          <span class="md:col-span-1 font-mono text-xs" style="color: var(--accent);">[03]</span>
          <div class="md:col-span-11">
            <h3 class="font-display font-semibold text-xl" style="color: var(--ink-primary);">{{DOR_3_TITULO}}</h3>
            <p class="font-body mt-1 text-sm" style="color: var(--ink-body);">{{DOR_3_DESC}}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
```

---

## Bloco 3 — CONSEQUÊNCIA (2 variantes)

### `consequencia.full-statement`
**Quando usar:** qualquer sistema. Bloco curto, 1 parágrafo grande + 1 número de impacto.

```html
<section style="background: var(--bg-dark, var(--bg-base)); color: var(--ink-primary);">
  <div class="max-w-4xl mx-auto px-6 md:px-10 py-20 md:py-28 text-center">
    <p class="font-mono text-xs uppercase tracking-[0.18em] mb-6" style="color: var(--accent);">12 meses sem agir</p>
    <p class="font-display text-3xl md:text-5xl leading-snug" style="color: var(--ink-primary);">{{CONSEQ_PARAGRAFO}}</p>
    <div class="mt-12 inline-flex items-baseline gap-3">
      <span class="font-display text-6xl md:text-7xl font-bold" style="color: var(--accent);">{{CONSEQ_NUMERO}}</span>
      <span class="font-mono text-sm uppercase tracking-wider" style="color: var(--ink-mute);">{{CONSEQ_NUMERO_LABEL}}</span>
    </div>
  </div>
</section>
```

### `consequencia.before-after`
**Quando usar:** quando dá pra contrastar dois estados claramente.

```html
<section class="border-y" style="border-color: var(--rule); background: var(--bg-base);">
  <div class="max-w-6xl mx-auto px-6 md:px-10 py-20 grid md:grid-cols-2 gap-0 md:gap-12">
    <div class="md:pr-8 md:border-r" style="border-color: var(--rule);">
      <p class="font-mono text-xs uppercase tracking-[0.15em] mb-3" style="color: var(--ink-mute);">Hoje</p>
      <h3 class="font-display text-3xl md:text-4xl leading-tight" style="color: var(--ink-primary);">{{ANTES_TITULO}}</h3>
      <ul class="mt-6 space-y-2 font-body" style="color: var(--ink-body);">
        <li>— {{ANTES_ITEM_1}}</li>
        <li>— {{ANTES_ITEM_2}}</li>
        <li>— {{ANTES_ITEM_3}}</li>
      </ul>
    </div>
    <div class="md:pl-8 mt-12 md:mt-0">
      <p class="font-mono text-xs uppercase tracking-[0.15em] mb-3" style="color: var(--accent);">Daqui 12 meses</p>
      <h3 class="font-display text-3xl md:text-4xl leading-tight" style="color: var(--ink-primary);">{{DEPOIS_TITULO}}</h3>
      <ul class="mt-6 space-y-2 font-body" style="color: var(--ink-body);">
        <li>— {{DEPOIS_ITEM_1}}</li>
        <li>— {{DEPOIS_ITEM_2}}</li>
        <li>— {{DEPOIS_ITEM_3}}</li>
      </ul>
    </div>
  </div>
</section>
```

---

## Bloco 4 — SOLUÇÃO / MECANISMO (3 variantes)

### `solucao.pillars-grid-named-mechanism`
**Quando usar:** quando o mecanismo proprietário tem 3-5 fases nomeadas (ex: F.L.O.W.).

```html
<section id="solucao" style="background: var(--bg-base);">
  <div class="max-w-7xl mx-auto px-6 md:px-10 py-24">
    <div class="max-w-3xl">
      <p class="font-mono text-xs uppercase tracking-[0.18em] mb-4" style="color: var(--accent);">A solução</p>
      <h2 class="font-display text-4xl md:text-6xl leading-tight" style="color: var(--ink-primary);">{{MECANISMO_NOME}}</h2>
      <p class="font-body mt-4 text-lg" style="color: var(--ink-body);">{{MECANISMO_TAGLINE}}</p>
    </div>
    <div class="mt-16 grid md:grid-cols-2 lg:grid-cols-4 gap-px" style="background: var(--rule);">
      <article class="p-8 transition" style="background: var(--bg-base);">
        <span class="font-mono text-xs" style="color: var(--accent);">{{FASE_1_LETRA}}</span>
        <h3 class="font-display text-2xl mt-2" style="color: var(--ink-primary);">{{FASE_1_NOME}}</h3>
        <p class="font-body mt-3 text-sm" style="color: var(--ink-body);">{{FASE_1_BENEFIT}}</p>
      </article>
      <article class="p-8 transition" style="background: var(--bg-base);">
        <span class="font-mono text-xs" style="color: var(--accent);">{{FASE_2_LETRA}}</span>
        <h3 class="font-display text-2xl mt-2" style="color: var(--ink-primary);">{{FASE_2_NOME}}</h3>
        <p class="font-body mt-3 text-sm" style="color: var(--ink-body);">{{FASE_2_BENEFIT}}</p>
      </article>
      <article class="p-8 transition" style="background: var(--bg-base);">
        <span class="font-mono text-xs" style="color: var(--accent);">{{FASE_3_LETRA}}</span>
        <h3 class="font-display text-2xl mt-2" style="color: var(--ink-primary);">{{FASE_3_NOME}}</h3>
        <p class="font-body mt-3 text-sm" style="color: var(--ink-body);">{{FASE_3_BENEFIT}}</p>
      </article>
      <article class="p-8 transition" style="background: var(--bg-base);">
        <span class="font-mono text-xs" style="color: var(--accent);">{{FASE_4_LETRA}}</span>
        <h3 class="font-display text-2xl mt-2" style="color: var(--ink-primary);">{{FASE_4_NOME}}</h3>
        <p class="font-body mt-3 text-sm" style="color: var(--ink-body);">{{FASE_4_BENEFIT}}</p>
      </article>
    </div>
  </div>
</section>
```

### `solucao.process-timeline`
**Quando usar:** quando o método é melhor explicado como processo sequencial.

```html
<section id="solucao" style="background: var(--bg-base);">
  <div class="max-w-5xl mx-auto px-6 md:px-10 py-24">
    <p class="font-mono text-xs uppercase tracking-[0.18em] mb-4" style="color: var(--accent);">Como funciona</p>
    <h2 class="font-display text-4xl md:text-5xl leading-tight max-w-3xl" style="color: var(--ink-primary);">{{MECANISMO_NOME}}</h2>
    <p class="font-body mt-4 text-lg max-w-2xl" style="color: var(--ink-body);">{{MECANISMO_TAGLINE}}</p>
    <ol class="mt-16 relative">
      <span class="absolute left-4 top-2 bottom-2 w-px hidden md:block" style="background: var(--rule);"></span>
      <li class="relative pl-12 pb-12">
        <span class="absolute left-0 top-0 w-8 h-8 inline-flex items-center justify-center font-mono text-sm" style="background: var(--accent); color: var(--accent-ink);">1</span>
        <h3 class="font-display text-2xl" style="color: var(--ink-primary);">{{FASE_1_NOME}}</h3>
        <p class="font-body mt-2 max-w-2xl" style="color: var(--ink-body);">{{FASE_1_BENEFIT}}</p>
      </li>
      <li class="relative pl-12 pb-12">
        <span class="absolute left-0 top-0 w-8 h-8 inline-flex items-center justify-center font-mono text-sm" style="background: var(--accent); color: var(--accent-ink);">2</span>
        <h3 class="font-display text-2xl" style="color: var(--ink-primary);">{{FASE_2_NOME}}</h3>
        <p class="font-body mt-2 max-w-2xl" style="color: var(--ink-body);">{{FASE_2_BENEFIT}}</p>
      </li>
      <li class="relative pl-12 pb-12">
        <span class="absolute left-0 top-0 w-8 h-8 inline-flex items-center justify-center font-mono text-sm" style="background: var(--accent); color: var(--accent-ink);">3</span>
        <h3 class="font-display text-2xl" style="color: var(--ink-primary);">{{FASE_3_NOME}}</h3>
        <p class="font-body mt-2 max-w-2xl" style="color: var(--ink-body);">{{FASE_3_BENEFIT}}</p>
      </li>
      <li class="relative pl-12">
        <span class="absolute left-0 top-0 w-8 h-8 inline-flex items-center justify-center font-mono text-sm" style="background: var(--accent); color: var(--accent-ink);">4</span>
        <h3 class="font-display text-2xl" style="color: var(--ink-primary);">{{FASE_4_NOME}}</h3>
        <p class="font-body mt-2 max-w-2xl" style="color: var(--ink-body);">{{FASE_4_BENEFIT}}</p>
      </li>
    </ol>
  </div>
</section>
```

### `solucao.feature-rows`
**Quando usar:** sistema `mono-tech`. SaaS técnico onde features importam.

```html
<section id="solucao" style="background: var(--bg-elev);">
  <div class="max-w-6xl mx-auto px-6 md:px-10 py-24">
    <p class="font-mono text-xs uppercase tracking-[0.12em] mb-4" style="color: var(--accent);">// product</p>
    <h2 class="font-display font-bold text-4xl md:text-5xl leading-tight" style="color: var(--ink-primary);">{{MECANISMO_NOME}}</h2>
    <p class="font-body mt-4 max-w-2xl" style="color: var(--ink-body);">{{MECANISMO_TAGLINE}}</p>
    <div class="mt-16 space-y-4">
      <div class="grid md:grid-cols-12 gap-6 p-6 rounded-lg border" style="background: var(--bg-base); border-color: var(--rule);">
        <div class="md:col-span-4">
          <p class="font-mono text-xs uppercase" style="color: var(--accent);">/{{FASE_1_LETRA}}</p>
          <h3 class="font-display font-semibold text-xl mt-1" style="color: var(--ink-primary);">{{FASE_1_NOME}}</h3>
        </div>
        <p class="md:col-span-8 font-body text-sm" style="color: var(--ink-body);">{{FASE_1_BENEFIT}}</p>
      </div>
      <div class="grid md:grid-cols-12 gap-6 p-6 rounded-lg border" style="background: var(--bg-base); border-color: var(--rule);">
        <div class="md:col-span-4">
          <p class="font-mono text-xs uppercase" style="color: var(--accent);">/{{FASE_2_LETRA}}</p>
          <h3 class="font-display font-semibold text-xl mt-1" style="color: var(--ink-primary);">{{FASE_2_NOME}}</h3>
        </div>
        <p class="md:col-span-8 font-body text-sm" style="color: var(--ink-body);">{{FASE_2_BENEFIT}}</p>
      </div>
      <div class="grid md:grid-cols-12 gap-6 p-6 rounded-lg border" style="background: var(--bg-base); border-color: var(--rule);">
        <div class="md:col-span-4">
          <p class="font-mono text-xs uppercase" style="color: var(--accent);">/{{FASE_3_LETRA}}</p>
          <h3 class="font-display font-semibold text-xl mt-1" style="color: var(--ink-primary);">{{FASE_3_NOME}}</h3>
        </div>
        <p class="md:col-span-8 font-body text-sm" style="color: var(--ink-body);">{{FASE_3_BENEFIT}}</p>
      </div>
    </div>
  </div>
</section>
```

---

## Bloco 5 — PROVA SOCIAL (3 variantes)

### `prova.cases-cards`
**Quando usar:** 3 cases reais com número quantificado.

```html
<section id="prova" class="border-y" style="border-color: var(--rule); background: var(--bg-base);">
  <div class="max-w-7xl mx-auto px-6 md:px-10 py-24">
    <div class="flex items-end justify-between flex-wrap gap-6 mb-12">
      <div>
        <p class="font-mono text-xs uppercase tracking-[0.18em] mb-3" style="color: var(--accent);">Resultados reais</p>
        <h2 class="font-display text-3xl md:text-5xl leading-tight max-w-2xl" style="color: var(--ink-primary);">{{PROVA_TITULO}}</h2>
      </div>
      <a href="#cta" class="font-body inline-flex items-center px-6 py-3 text-sm font-medium" style="background: var(--accent); color: var(--accent-ink);">{{CTA_PRIMARIO}} →</a>
    </div>
    <div class="grid md:grid-cols-3 gap-6">
      <article class="p-8 border" style="border-color: var(--rule); background: var(--bg-elev, var(--bg-base));">
        <p class="font-display text-5xl md:text-6xl" style="color: var(--accent);">{{CASE_1_NUMERO}}</p>
        <p class="font-mono text-xs uppercase tracking-wider mt-2" style="color: var(--ink-mute);">{{CASE_1_LABEL}}</p>
        <p class="font-body mt-6 text-sm" style="color: var(--ink-body);">"{{CASE_1_QUOTE}}"</p>
        <p class="font-mono text-xs mt-4" style="color: var(--ink-mute);">— {{CASE_1_AUTOR}}</p>
      </article>
      <article class="p-8 border" style="border-color: var(--rule); background: var(--bg-elev, var(--bg-base));">
        <p class="font-display text-5xl md:text-6xl" style="color: var(--accent);">{{CASE_2_NUMERO}}</p>
        <p class="font-mono text-xs uppercase tracking-wider mt-2" style="color: var(--ink-mute);">{{CASE_2_LABEL}}</p>
        <p class="font-body mt-6 text-sm" style="color: var(--ink-body);">"{{CASE_2_QUOTE}}"</p>
        <p class="font-mono text-xs mt-4" style="color: var(--ink-mute);">— {{CASE_2_AUTOR}}</p>
      </article>
      <article class="p-8 border" style="border-color: var(--rule); background: var(--bg-elev, var(--bg-base));">
        <p class="font-display text-5xl md:text-6xl" style="color: var(--accent);">{{CASE_3_NUMERO}}</p>
        <p class="font-mono text-xs uppercase tracking-wider mt-2" style="color: var(--ink-mute);">{{CASE_3_LABEL}}</p>
        <p class="font-body mt-6 text-sm" style="color: var(--ink-body);">"{{CASE_3_QUOTE}}"</p>
        <p class="font-mono text-xs mt-4" style="color: var(--ink-mute);">— {{CASE_3_AUTOR}}</p>
      </article>
    </div>
  </div>
</section>
```

### `prova.logos-marquee`
**Quando usar:** quando o aluno tem logos reais de clientes (mínimo 6).

```html
<section style="background: var(--bg-base);" class="border-y" >
  <div class="max-w-7xl mx-auto px-6 md:px-10 py-12">
    <p class="font-mono text-xs uppercase tracking-[0.18em] text-center mb-8" style="color: var(--ink-mute);">Empresas que já usam</p>
    <div class="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-80">
      <span class="font-display text-2xl" style="color: var(--ink-mute);">{{LOGO_1}}</span>
      <span class="font-display text-2xl" style="color: var(--ink-mute);">{{LOGO_2}}</span>
      <span class="font-display text-2xl" style="color: var(--ink-mute);">{{LOGO_3}}</span>
      <span class="font-display text-2xl" style="color: var(--ink-mute);">{{LOGO_4}}</span>
      <span class="font-display text-2xl" style="color: var(--ink-mute);">{{LOGO_5}}</span>
      <span class="font-display text-2xl" style="color: var(--ink-mute);">{{LOGO_6}}</span>
    </div>
  </div>
</section>
```

### `prova.single-case-feature`
**Quando usar:** quando há 1 case forte (ex: Make Distribuidora) — destaca esse 1 ao invés de 3 fracos.

```html
<section id="prova" style="background: var(--bg-dark, var(--bg-base));">
  <div class="max-w-6xl mx-auto px-6 md:px-10 py-24 grid md:grid-cols-12 gap-10 items-center">
    <div class="md:col-span-5">
      <p class="font-mono text-xs uppercase tracking-[0.18em] mb-4" style="color: var(--accent);">Case</p>
      <h3 class="font-display text-3xl md:text-4xl leading-tight" style="color: var(--ink-primary);">{{CASE_FEATURED_NOME}}</h3>
      <p class="font-mono text-xs mt-2" style="color: var(--ink-mute);">{{CASE_FEATURED_SETOR}}</p>
    </div>
    <div class="md:col-span-7 grid grid-cols-3 gap-6">
      <div>
        <p class="font-display text-4xl md:text-5xl" style="color: var(--accent);">{{CASE_FEATURED_KPI_1}}</p>
        <p class="font-mono text-xs uppercase mt-1" style="color: var(--ink-mute);">{{CASE_FEATURED_KPI_1_LABEL}}</p>
      </div>
      <div>
        <p class="font-display text-4xl md:text-5xl" style="color: var(--accent);">{{CASE_FEATURED_KPI_2}}</p>
        <p class="font-mono text-xs uppercase mt-1" style="color: var(--ink-mute);">{{CASE_FEATURED_KPI_2_LABEL}}</p>
      </div>
      <div>
        <p class="font-display text-4xl md:text-5xl" style="color: var(--accent);">{{CASE_FEATURED_KPI_3}}</p>
        <p class="font-mono text-xs uppercase mt-1" style="color: var(--ink-mute);">{{CASE_FEATURED_KPI_3_LABEL}}</p>
      </div>
      <blockquote class="col-span-3 font-display italic text-xl md:text-2xl mt-6" style="color: var(--ink-primary);">"{{CASE_FEATURED_QUOTE}}"</blockquote>
      <p class="col-span-3 font-mono text-xs" style="color: var(--ink-mute);">— {{CASE_FEATURED_AUTOR}}</p>
    </div>
  </div>
</section>
```

---

## Bloco 6 — STACK DE VALOR (2 variantes)

### `stack.inclusions-list`
**Quando usar:** lista clara de itens incluídos com valor de mercado.

```html
<section style="background: var(--bg-base);">
  <div class="max-w-5xl mx-auto px-6 md:px-10 py-24">
    <p class="font-mono text-xs uppercase tracking-[0.18em] mb-4" style="color: var(--accent);">O que está incluído</p>
    <h2 class="font-display text-4xl md:text-5xl leading-tight max-w-3xl" style="color: var(--ink-primary);">{{STACK_TITULO}}</h2>
    <ul class="mt-12 divide-y" style="border-color: var(--rule); --tw-divide-opacity: 1;">
      <li class="grid md:grid-cols-12 gap-4 py-5 items-baseline border-t" style="border-color: var(--rule);">
        <span class="md:col-span-1 font-mono text-xs" style="color: var(--accent);">01</span>
        <h3 class="md:col-span-7 font-display text-lg md:text-xl" style="color: var(--ink-primary);">{{STACK_ITEM_1}}</h3>
        <p class="md:col-span-4 md:text-right font-mono text-sm" style="color: var(--ink-mute);">{{STACK_VALOR_1}}</p>
      </li>
      <li class="grid md:grid-cols-12 gap-4 py-5 items-baseline border-t" style="border-color: var(--rule);">
        <span class="md:col-span-1 font-mono text-xs" style="color: var(--accent);">02</span>
        <h3 class="md:col-span-7 font-display text-lg md:text-xl" style="color: var(--ink-primary);">{{STACK_ITEM_2}}</h3>
        <p class="md:col-span-4 md:text-right font-mono text-sm" style="color: var(--ink-mute);">{{STACK_VALOR_2}}</p>
      </li>
      <li class="grid md:grid-cols-12 gap-4 py-5 items-baseline border-t" style="border-color: var(--rule);">
        <span class="md:col-span-1 font-mono text-xs" style="color: var(--accent);">03</span>
        <h3 class="md:col-span-7 font-display text-lg md:text-xl" style="color: var(--ink-primary);">{{STACK_ITEM_3}}</h3>
        <p class="md:col-span-4 md:text-right font-mono text-sm" style="color: var(--ink-mute);">{{STACK_VALOR_3}}</p>
      </li>
      <li class="grid md:grid-cols-12 gap-4 py-5 items-baseline border-t" style="border-color: var(--rule);">
        <span class="md:col-span-1 font-mono text-xs" style="color: var(--accent);">04</span>
        <h3 class="md:col-span-7 font-display text-lg md:text-xl" style="color: var(--ink-primary);">{{STACK_ITEM_4}}</h3>
        <p class="md:col-span-4 md:text-right font-mono text-sm" style="color: var(--ink-mute);">{{STACK_VALOR_4}}</p>
      </li>
      <li class="grid md:grid-cols-12 gap-4 py-5 items-baseline border-t" style="border-color: var(--rule);">
        <span class="md:col-span-1 font-mono text-xs" style="color: var(--accent);">05</span>
        <h3 class="md:col-span-7 font-display text-lg md:text-xl" style="color: var(--ink-primary);">{{STACK_ITEM_5}}</h3>
        <p class="md:col-span-4 md:text-right font-mono text-sm" style="color: var(--ink-mute);">{{STACK_VALOR_5}}</p>
      </li>
    </ul>
    <div class="mt-10 flex items-baseline justify-between border-t-2 pt-6" style="border-color: var(--ink-primary);">
      <span class="font-display text-xl md:text-2xl" style="color: var(--ink-primary);">Valor total</span>
      <span class="font-display text-3xl md:text-4xl" style="color: var(--accent);">{{STACK_TOTAL}}</span>
    </div>
  </div>
</section>
```

### `stack.tier-card`
**Quando usar:** quando há 1 tier de oferta com preço destacado.

```html
<section style="background: var(--bg-elev, var(--bg-base));">
  <div class="max-w-3xl mx-auto px-6 md:px-10 py-24">
    <article class="p-8 md:p-12 border" style="border-color: var(--rule); background: var(--bg-base);">
      <p class="font-mono text-xs uppercase tracking-[0.18em]" style="color: var(--accent);">{{TIER_LABEL}}</p>
      <h2 class="font-display text-3xl md:text-4xl mt-3" style="color: var(--ink-primary);">{{TIER_TITULO}}</h2>
      <p class="font-body mt-3" style="color: var(--ink-body);">{{TIER_DESC}}</p>
      <div class="mt-8 flex items-baseline gap-3">
        <span class="font-display text-5xl md:text-6xl" style="color: var(--ink-primary);">{{TIER_PRECO}}</span>
        <span class="font-mono text-sm" style="color: var(--ink-mute);">{{TIER_PRECO_PERIODO}}</span>
      </div>
      <ul class="mt-8 space-y-3 font-body" style="color: var(--ink-body);">
        <li class="flex gap-3"><span style="color: var(--accent);">✓</span>{{TIER_INCLUSO_1}}</li>
        <li class="flex gap-3"><span style="color: var(--accent);">✓</span>{{TIER_INCLUSO_2}}</li>
        <li class="flex gap-3"><span style="color: var(--accent);">✓</span>{{TIER_INCLUSO_3}}</li>
        <li class="flex gap-3"><span style="color: var(--accent);">✓</span>{{TIER_INCLUSO_4}}</li>
        <li class="flex gap-3"><span style="color: var(--accent);">✓</span>{{TIER_INCLUSO_5}}</li>
      </ul>
      <a href="#cta" class="font-body inline-flex items-center justify-center w-full px-7 py-4 mt-10 text-base font-medium" style="background: var(--accent); color: var(--accent-ink);">{{CTA_PRIMARIO}} →</a>
    </article>
  </div>
</section>
```

---

## Bloco 7 — OBJEÇÕES / FAQ (2 variantes)

### `faq.accordion-editorial`
**Quando usar:** sistema `editorial-serif` ou `mono-tech`. Accordion sóbrio sem ícones cheios.

```html
<section style="background: var(--bg-base);">
  <div class="max-w-3xl mx-auto px-6 md:px-10 py-24">
    <p class="font-mono text-xs uppercase tracking-[0.18em] mb-4" style="color: var(--accent);">Perguntas frequentes</p>
    <h2 class="font-display text-3xl md:text-5xl leading-tight" style="color: var(--ink-primary);">{{FAQ_TITULO}}</h2>
    <div class="mt-12 divide-y" style="border-color: var(--rule);">
      <details class="group py-5 border-t" style="border-color: var(--rule);">
        <summary class="flex justify-between items-center cursor-pointer list-none">
          <h3 class="font-display text-lg md:text-xl pr-6" style="color: var(--ink-primary);">{{OBJ_1_PERGUNTA}}</h3>
          <span class="font-mono text-2xl transition group-open:rotate-45" style="color: var(--accent);">+</span>
        </summary>
        <p class="font-body mt-4 max-w-2xl" style="color: var(--ink-body);">{{OBJ_1_QUEBRA}}</p>
      </details>
      <details class="group py-5 border-t" style="border-color: var(--rule);">
        <summary class="flex justify-between items-center cursor-pointer list-none">
          <h3 class="font-display text-lg md:text-xl pr-6" style="color: var(--ink-primary);">{{OBJ_2_PERGUNTA}}</h3>
          <span class="font-mono text-2xl transition group-open:rotate-45" style="color: var(--accent);">+</span>
        </summary>
        <p class="font-body mt-4 max-w-2xl" style="color: var(--ink-body);">{{OBJ_2_QUEBRA}}</p>
      </details>
      <details class="group py-5 border-t" style="border-color: var(--rule);">
        <summary class="flex justify-between items-center cursor-pointer list-none">
          <h3 class="font-display text-lg md:text-xl pr-6" style="color: var(--ink-primary);">{{OBJ_3_PERGUNTA}}</h3>
          <span class="font-mono text-2xl transition group-open:rotate-45" style="color: var(--accent);">+</span>
        </summary>
        <p class="font-body mt-4 max-w-2xl" style="color: var(--ink-body);">{{OBJ_3_QUEBRA}}</p>
      </details>
      <details class="group py-5 border-t" style="border-color: var(--rule);">
        <summary class="flex justify-between items-center cursor-pointer list-none">
          <h3 class="font-display text-lg md:text-xl pr-6" style="color: var(--ink-primary);">{{OBJ_4_PERGUNTA}}</h3>
          <span class="font-mono text-2xl transition group-open:rotate-45" style="color: var(--accent);">+</span>
        </summary>
        <p class="font-body mt-4 max-w-2xl" style="color: var(--ink-body);">{{OBJ_4_QUEBRA}}</p>
      </details>
    </div>
  </div>
</section>
```

### `faq.brutalist-stacked`
**Quando usar:** sistema `brutalist-grid`. Cards com borda preta grossa, perguntas em uppercase.

```html
<section class="border-b-4 border-black" style="background: var(--bg-base);">
  <div class="max-w-5xl mx-auto px-6 md:px-10 py-20">
    <p class="font-mono font-bold text-xs uppercase tracking-[0.2em] mb-6">[ FAQ ] /// VOCE_VAI_PERGUNTAR</p>
    <h2 class="font-display uppercase text-4xl md:text-6xl leading-[0.95]" style="color: var(--ink-primary);">{{FAQ_TITULO}}</h2>
    <div class="mt-12 space-y-4">
      <details class="group border-2 border-black p-6">
        <summary class="font-display uppercase text-xl md:text-2xl cursor-pointer list-none flex justify-between items-center" style="color: var(--ink-primary);">
          <span>{{OBJ_1_PERGUNTA}}</span><span class="font-mono">[+]</span>
        </summary>
        <p class="font-body mt-4 max-w-2xl" style="color: var(--ink-body);">{{OBJ_1_QUEBRA}}</p>
      </details>
      <details class="group border-2 border-black p-6">
        <summary class="font-display uppercase text-xl md:text-2xl cursor-pointer list-none flex justify-between items-center" style="color: var(--ink-primary);">
          <span>{{OBJ_2_PERGUNTA}}</span><span class="font-mono">[+]</span>
        </summary>
        <p class="font-body mt-4 max-w-2xl" style="color: var(--ink-body);">{{OBJ_2_QUEBRA}}</p>
      </details>
      <details class="group border-2 border-black p-6">
        <summary class="font-display uppercase text-xl md:text-2xl cursor-pointer list-none flex justify-between items-center" style="color: var(--ink-primary);">
          <span>{{OBJ_3_PERGUNTA}}</span><span class="font-mono">[+]</span>
        </summary>
        <p class="font-body mt-4 max-w-2xl" style="color: var(--ink-body);">{{OBJ_3_QUEBRA}}</p>
      </details>
    </div>
  </div>
</section>
```

---

## Bloco 8 — URGÊNCIA / GARANTIA (2 variantes)

### `urgencia.guarantee-seal`
**Quando usar:** garantia de resultado / devolução. Tom honesto, sem fake countdown.

```html
<section style="background: var(--bg-base);">
  <div class="max-w-4xl mx-auto px-6 md:px-10 py-20">
    <div class="border p-8 md:p-12 text-center" style="border-color: var(--accent); background: var(--bg-elev, var(--bg-base));">
      <span class="font-mono text-xs uppercase tracking-[0.18em]" style="color: var(--accent);">{{GARANTIA_LABEL}}</span>
      <h3 class="font-display text-3xl md:text-4xl mt-3" style="color: var(--ink-primary);">{{GARANTIA_TITULO}}</h3>
      <p class="font-body mt-4 max-w-2xl mx-auto" style="color: var(--ink-body);">{{GARANTIA_TEXTO}}</p>
    </div>
  </div>
</section>
```

### `urgencia.cohort-card`
**Quando usar:** quando há limitação operacional real (turma, vagas, deadline).

```html
<section style="background: var(--bg-dark, var(--bg-base)); color: var(--ink-primary);">
  <div class="max-w-5xl mx-auto px-6 md:px-10 py-20 grid md:grid-cols-2 gap-10 items-center">
    <div>
      <p class="font-mono text-xs uppercase tracking-[0.18em] mb-3" style="color: var(--accent);">{{COHORT_LABEL}}</p>
      <h3 class="font-display text-3xl md:text-4xl leading-tight" style="color: var(--ink-primary);">{{COHORT_TITULO}}</h3>
      <p class="font-body mt-4" style="color: var(--ink-body);">{{COHORT_JUSTIFICATIVA}}</p>
    </div>
    <div class="grid grid-cols-2 gap-6">
      <div>
        <p class="font-display text-5xl md:text-6xl" style="color: var(--accent);">{{COHORT_VAGAS}}</p>
        <p class="font-mono text-xs uppercase mt-1" style="color: var(--ink-mute);">vagas restantes</p>
      </div>
      <div>
        <p class="font-display text-5xl md:text-6xl" style="color: var(--accent);">{{COHORT_DATA}}</p>
        <p class="font-mono text-xs uppercase mt-1" style="color: var(--ink-mute);">encerra</p>
      </div>
    </div>
  </div>
</section>
```

---

## Bloco 9 — CTA FINAL (2 variantes)

### `cta.form-inline-3-fields`
**Quando usar:** captação direta (lead form). Máx 4 campos.

```html
<section id="cta" style="background: var(--bg-base);">
  <div class="max-w-3xl mx-auto px-6 md:px-10 py-24 text-center">
    <p class="font-mono text-xs uppercase tracking-[0.18em] mb-4" style="color: var(--accent);">{{CTA_KICKER}}</p>
    <h2 class="font-display text-4xl md:text-6xl leading-[1.05]" style="color: var(--ink-primary);">{{CTA_TITULO}}</h2>
    <p class="font-body mt-4 text-lg" style="color: var(--ink-body);">{{CTA_SUB}}</p>
    <form class="mt-10 max-w-lg mx-auto space-y-3" onsubmit="event.preventDefault(); alert('Conecte seu formulário/Yayforms aqui.');">
      <input type="text" placeholder="Nome" class="w-full px-5 py-3 border font-body" style="border-color: var(--rule); background: var(--bg-elev, var(--bg-base)); color: var(--ink-primary);" required>
      <input type="email" placeholder="E-mail profissional" class="w-full px-5 py-3 border font-body" style="border-color: var(--rule); background: var(--bg-elev, var(--bg-base)); color: var(--ink-primary);" required>
      <input type="tel" placeholder="WhatsApp" class="w-full px-5 py-3 border font-body" style="border-color: var(--rule); background: var(--bg-elev, var(--bg-base)); color: var(--ink-primary);">
      <button type="submit" class="font-body w-full px-7 py-4 text-base font-medium" style="background: var(--accent); color: var(--accent-ink);">{{CTA_PRIMARIO}} →</button>
    </form>
    <p class="font-mono text-xs mt-6" style="color: var(--ink-mute);">P.S. {{PS_REFORCO}}</p>
  </div>
</section>
```

### `cta.calendar-embed`
**Quando usar:** B2B alto-ticket / advisory. CTA é agendar diagnóstico.

```html
<section id="cta" style="background: var(--bg-elev, var(--bg-base));">
  <div class="max-w-4xl mx-auto px-6 md:px-10 py-24 text-center">
    <p class="font-mono text-xs uppercase tracking-[0.18em] mb-4" style="color: var(--accent);">{{CTA_KICKER}}</p>
    <h2 class="font-display text-4xl md:text-6xl leading-[1.05]" style="color: var(--ink-primary);">{{CTA_TITULO}}</h2>
    <p class="font-body mt-4 text-lg max-w-2xl mx-auto" style="color: var(--ink-body);">{{CTA_SUB}}</p>
    <div class="mt-10 flex flex-col sm:flex-row justify-center gap-3">
      <a href="{{CTA_AGENDA_URL}}" class="font-body inline-flex items-center justify-center px-8 py-5 text-base font-medium" style="background: var(--accent); color: var(--accent-ink);">{{CTA_PRIMARIO}} →</a>
      <a href="{{CTA_WHATSAPP_URL}}" class="font-mono inline-flex items-center justify-center px-6 py-5 text-sm border" style="border-color: var(--rule); color: var(--ink-body);">Falar no WhatsApp</a>
    </div>
    <p class="font-mono text-xs mt-8 max-w-xl mx-auto" style="color: var(--ink-mute);">P.S. {{PS_REFORCO}}</p>
    <!-- Placeholder Cal.com / Calendly / Yayforms — aluno cola embed aqui -->
    <!-- <div data-cal-link="..." class="mt-12"></div> -->
  </div>
</section>
```

---

## Footer (regra LICENSE — sempre)

```html
<footer class="border-t" style="background: var(--bg-dark, var(--bg-base)); border-color: var(--rule);">
  <div class="max-w-7xl mx-auto px-6 md:px-10 py-10 grid md:grid-cols-3 gap-6 items-center text-center md:text-left">
    <p class="font-mono text-xs uppercase tracking-wider" style="color: var(--ink-mute);">Powered by Accelera 360 — Business Accelerator</p>
    <p class="font-display italic text-base md:text-lg" style="color: var(--ink-body);">"Construa o tipo de negócio que lidera a próxima década."</p>
    <p class="font-mono text-xs md:text-right" style="color: var(--ink-mute);">
      <a href="https://accelera360.com.br/" class="hover:underline">accelera360.com.br</a> · <a href="https://yayforms.link/4bRG5aE" class="hover:underline" style="color: var(--accent);">Aplicar →</a>
    </p>
  </div>
</footer>
```

---

## Tabela de roteamento default (composer)

Tabela usada pelo `dynamic-composer.md` quando o brand-extractor não preenche `variants_recomendados` por algum motivo.

| Sistema | Hero | Problema | Consequência | Solução | Prova | Stack | FAQ | Urgência | CTA |
|---|---|---|---|---|---|---|---|---|---|
| `editorial-serif` | `split-asymmetric-quote` | `list-numbered-large` | `full-statement` | `pillars-grid-named-mechanism` | `cases-cards` | `inclusions-list` | `accordion-editorial` | `guarantee-seal` | `calendar-embed` |
| `brutalist-grid` | `brutalist-bracket` | `brutalist-stamps` | `before-after` | `process-timeline` | `single-case-feature` | `tier-card` | `brutalist-stacked` | `cohort-card` | `form-inline-3-fields` |
| `mono-tech` | `mono-tech-terminal` | `dark-rows-monotech` | `full-statement` | `feature-rows` | `cases-cards` | `inclusions-list` | `accordion-editorial` | `guarantee-seal` | `form-inline-3-fields` |

---

## Adicionando novas variantes

Quando uma nova variante for criada:

1. Nomear no padrão `bloco.variant-descritor` (kebab case).
2. Documentar **quando usar** (sistema + caso) em até 2 linhas.
3. Incluir snippet HTML completo, com tokens `{{...}}` e `var(--...)`.
4. Registrar na tabela de roteamento default acima (se for default candidata) OU deixar opt-in apenas via `variants_recomendados`.
5. Validar contra `anti-ai-design.md` — não introduzir gradientes proibidos, fontes banidas, ou layout 100% simétrico.

---

## Anti-pattern a evitar nos snippets

- ❌ Cor hardcoded — sempre `var(--token)`.
- ❌ Fonte hardcoded — sempre classe `font-display/mono/body` (mapeia pra var).
- ❌ Border-radius global em tudo (mistura `none` / `sm` / `md` por contexto).
- ❌ Shadow global em tudo (só onde tem interação).
- ❌ Stock photo `<img src="...unsplash.../people-laughing">` — usar placeholder textual.
- ❌ 3 cards idênticos com ícones Lucide imediatamente abaixo do hero.
- ❌ Layout 100% simétrico em todas as seções.
