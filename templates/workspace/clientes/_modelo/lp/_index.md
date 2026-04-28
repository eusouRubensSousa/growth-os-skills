---
title: "LP — {NOME-EMPRESA}"
type: cliente/lp
slug: "{SLUG}"
empresa: "{NOME-EMPRESA}"
oferta: "{SLUG-OFERTA}"
status: rascunho   # rascunho | revisao | publicada | otimizando | arquivada
created: "{DATA}"
url: ""
source: "/gos-lp-builder"
---

# LP — {NOME-EMPRESA}

> LP customizada pra este cliente específico. Output do `/gos-lp-builder` em modo cliente.

## Arquivos

- [[lp]] — copy comentada com framework usado em cada bloco
- `lp.html` — build standalone (Tailwind CDN). Abre direto no browser.
- [[README-customizar]] — como trocar texto, cores, conectar formulário/pixel

## Decisões de design

- **Sistema estético:** [editorial-serif | brutalist-grid | mono-tech]
- **Ângulo:** [DOR | OPORTUNIDADE | SISTEMA]
- **CTA primário:** "..."
- **Anti-AI score:** {{X}}/10
- **Conversão score:** {{X}}/35

## Performance (se publicada)

| Métrica | Valor |
|---|---|
| Visitas | — |
| CTR botão principal | — |
| Conversão (lead) | — |
| CPL | — |

## Variações testadas

(versões A/B se houver)

## Como hospedar

- **Vercel/Netlify:** drag-and-drop do `lp.html` → URL em 30s
- **Cloudflare Pages:** repo público → URL custom + CDN
- **GitHub Pages:** repo + `gh-pages` branch → grátis
- **Local dev:** `python3 -m http.server 8080` ou `npx serve` na pasta

## Aprendizados

(preencher pós-publicação)
