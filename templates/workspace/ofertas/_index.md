---
title: "Ofertas"
type: ofertas/index
managed_by: "/a360-map"
last_updated: "{DATA-SETUP}"
---

# Ofertas

> Ofertas próprias do aluno (genéricas do nicho — instaláveis em N clientes).

## Lista

| Slug | Nome | Nicho | Status | Setup | Recorrência |
|---|---|---|---|---|---|
| *(vazio — copiar `_modelo/` pra `{slug-oferta}/` e preencher)* | | | | | |

> Esta tabela é regenerada por `/a360-map`. Veja [[../memory/shared/ofertas\|memory/shared/ofertas.md]].

## Como criar

> **Hoje:** copiar `_modelo/` → `{slug-oferta}/` e preencher os 4 arquivos manualmente, partindo do que veio do `nichos/{slug}/04-oferta-base.md`.
>
> **Futuro:** comando `/criar-oferta` (não implementado ainda — vem em release próxima).

## Estrutura mínima

```
{slug-oferta}/
├── _index.md                MoC + frontmatter (status, nicho-alvo)
├── 01-oferta.md             Promessa + mecanismo + setup + recorrência + ICP + garantia
├── 02-estrutura.md          Como entrega
├── 03-persona.md            ICP detalhado
├── 04-marca.md              Tom, paleta, voz da oferta
├── lp/                      LP genérica (output /lp-builder)
├── deck/                    Deck genérico (output /pitch-deck-builder)
└── gtm/                     GTM frameworks (output /gtm-architect)
```

## Status possíveis

`draft` → `ready` → `validating` → `validated` → `archived`

(detalhe em `memory/shared/ofertas.md`)
