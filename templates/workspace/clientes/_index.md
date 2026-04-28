---
title: "Clientes"
type: clientes/index
managed_by: "/gos-map"
last_updated: "{DATA-SETUP}"
---

# Clientes

> Cada cliente vira pasta aqui — perfil + reuniões + outputs customizados (LP, deck, GTM).

## Lista

| Slug | Empresa | Nicho | Status | Iniciado em |
|---|---|---|---|---|
| *(vazio — `/gos-cliente-radar` cria a primeira)* | | | | |

> Esta tabela é regenerada por `/gos-map`. Veja [[../memory/shared/clientes-ativos\|memory/shared/ledgers/clientes-ativos.md]] (mesmo dado, formato ledger).

## Como adicionar

```
/gos-cliente-radar
```

Faz mini-wizard e cria pasta com `00-perfil.md`. Depois encadear:
- `/gos-meeting-prep` → `01-meeting-prep.md`
- `/gos-lp-builder` → `lp/`
- `/gos-pitch-deck-builder` → `deck/`
- `/gos-gtm-architect` → `gtm/`
- `/gos-playbook-vendas` → `02-playbook.md`

## Cliente ≠ Oferta

Cada cliente recebe **uma oferta** (referenciada em `00-perfil.md` no campo `oferta`). A mesma oferta de `ofertas/` pode ser instalada em múltiplos clientes.
