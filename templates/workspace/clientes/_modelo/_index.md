---
title: "{NOME-EMPRESA}"
type: cliente
slug: "{SLUG}"
empresa: "{NOME-EMPRESA}"
nicho: "{SLUG-NICHO}"
oferta: "{SLUG-OFERTA}"
status: prospect   # prospect | radar-done | meeting-prep-done | proposta-enviada | closed | implementing | live | paused | churned | archived
created: "{DATA}"
last_updated: "{DATA}"
---

# {NOME-EMPRESA}

> Cliente do nicho **{nicho}**. Oferta vendida: **{oferta}**. Pasta organizada em perfil + outputs customizados.

## Mapa

- [[00-perfil]] — quem é, contato, ticket, stack (output `/cliente-radar`)
- [[01-meeting-prep]] — briefing 1-page pra reunião (output `/meeting-prep`)
- [[02-playbook]] — script + objeções customizadas (output `/playbook-vendas`)
- [[lp/_index]] — LP customizada (output `/lp-builder`)
- [[deck/_index]] — deck comercial (output `/pitch-deck-builder`)
- [[gtm/_index]] — outbound + content customizados (output `/gtm-architect`)

## Status atual

**Status:** {{status}}
**Última atualização:** {{last_updated}}
**Próximo milestone:** *(preenchido por `/a360-map`)*

## Decisões importantes deste cliente

(cada decisão estratégica vira linha aqui — opcional ir pra `memory/shared/decisoes/` se for durável)

## Aprendizados deste cliente

(o que descobriu rodando o sistema com este cliente — atualiza `nichos/{slug}/02-dores.md` ou `ofertas/{slug}/01-oferta.md` se for aprendizado generalizável)
