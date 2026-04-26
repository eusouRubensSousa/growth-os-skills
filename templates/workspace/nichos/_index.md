---
title: "Nichos"
type: nichos/index
managed_by: "/a360-map"
last_updated: "{DATA-SETUP}"
---

# Nichos

> Cérebro de cada nicho que o aluno mapeia. Um nicho = um setor + recorte (ex: "clínicas de dermatologia em SP"). Cada nicho vira pasta com 12 arquivos Johnny.Decimal.

## Lista

| Slug | Setor | Status | Mecanismo | Última edição |
|---|---|---|---|---|
| *(vazio — `/nicho-explorer` ou `/mapear-nicho-lite` cria a primeira)* | | | | |

> Esta tabela é regenerada por `/a360-map`. Veja também [[../memory/shared/nichos-mapeados\|memory/shared/nichos-mapeados.md]] (mesmo dado, formato ledger).

## Como adicionar

1. **Validar GO/NO-GO:** `/nicho-explorer` Modo B → produz `00-validacao.md`.
2. **Mapear cérebro:** `/mapear-nicho-lite` → preenche 01-09.
3. *(opcional)* Criar oferta: editar `ofertas/{slug}/01-oferta.md`.

## Estrutura de cada `{slug}/`

Cada pasta de nicho segue o template em `_modelo/`:

```
{slug}/
├── _index.md                         MoC + frontmatter (status, mecanismo)
├── 00-validacao.md                   /nicho-explorer Modo B (GO/NO-GO)
├── 01-perfil-cliente-alvo.md         ICP em 1 página
├── 02-dores.md                       3-5 dores (qualitativas + 1-2 R$)
├── 03-mecanismo.md                   3 candidatos de naming
├── 04-oferta-base.md                 1 tier de oferta (promessa + preço)
├── 05-linguagem.md                   8 termos do nicho
├── 06-eventos-gatilho.md             5 eventos
├── 07-objecoes.md                    3 objeções
├── 08-fontes.md                      8 fontes auditadas
└── 09-gtm-outline.md                 1 inbound + 1 outbound
```

## Status possíveis

`researching` → `mapped` → `offered` → `validated` → `archived`

(detalhe em `memory/shared/nichos-mapeados.md`)
