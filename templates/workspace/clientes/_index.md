---
title: "Clientes"
type: clientes/index
managed_by: "/a360-map"
last_updated: "{DATA-SETUP}"
---

# Clientes

> Cada cliente vira pasta aqui — perfil + reuniões + outputs customizados (LP, deck, GTM).

## Lista

| Slug | Empresa | Nicho | Status | Iniciado em |
|---|---|---|---|---|
| *(vazio — `/cliente-radar` cria a primeira)* | | | | |

> Esta tabela é regenerada por `/a360-map`. Veja [[../memory/shared/clientes-ativos\|memory/shared/clientes-ativos.md]] (mesmo dado, formato ledger).

## Como adicionar

```
/cliente-radar
```

Faz mini-wizard e cria pasta com `00-perfil.md`. Depois encadear:
- `/meeting-prep` → `01-meeting-prep.md`
- `/lp-builder` → `lp/`
- `/pitch-deck-builder` → `deck/`
- `/gtm-architect` → `gtm/`
- `/playbook-vendas` → `02-playbook.md`

## Cliente ≠ Oferta

Cada cliente recebe **uma oferta** (referenciada em `00-perfil.md` no campo `oferta`). A mesma oferta de `ofertas/` pode ser instalada em múltiplos clientes.
