---
type: ledger
last_updated: "{DATA-SETUP}"
managed_by: "/gos-map"
---

# Ofertas

> Ledger pesquisável de ofertas criadas pelo aluno (próprias ou genéricas do nicho). **Regenerado por `/gos-map`** — não editar manualmente.

| Slug | Nome | Nicho-alvo | Status | Setup | Recorrência | Clientes ativos |
|---|---|---|---|---|---|---|
| *(vazio — preencher em `ofertas/{slug}/01-oferta.md`)* | | | | | | |

---

## Status possíveis

| Status | Significado |
|---|---|
| `draft` | Briefing inicial — oferta sendo desenhada. |
| `ready` | Oferta com mecanismo nomeado, pricing, garantia, ICP, FAB. |
| `validating` | 1º cliente em implantação — testando se a oferta entrega. |
| `validated` | 1+ cliente em recorrência live — oferta validada. |
| `archived` | Descontinuada (`_arquivo/ofertas/`). |

---

## Estrutura mínima de uma oferta válida

Pra status virar `ready`, `ofertas/{slug}/` precisa ter:

- `01-oferta.md` — promessa quantificada + mecanismo nomeado + setup + recorrência + ICP + garantia
- `02-estrutura.md` — como entrega (etapas + responsabilidades + prazos)
- `03-persona.md` — ICP detalhado (BANT)
- `04-marca.md` — tom + paleta + voz da oferta

Opcionalmente:
- `lp/` (gerada por `/gos-lp-builder`)
- `deck/` (gerada por `/gos-pitch-deck-builder`)
- `gtm/` (gerada por `/gos-gtm-architect`)
