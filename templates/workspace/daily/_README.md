---
type: daily/readme
---

# Daily logs

Log de sessão (1 arquivo por dia em que o aluno opera o workspace). Gerado por `/gos-handoff` no fim da sessão.

## Formato

`YYYY-MM-DD.md`:

```markdown
---
type: daily
date: 2026-04-26
session_minutes: 90
skills_used: [nicho-explorer, mapear-nicho-lite]
---

# Sessão 2026-04-26

## O que foi feito
- ...
- ...

## Decisões importantes
- ...

## Bloqueios encontrados
- ...

## Próximo passo
- ...
```

## Quando NÃO criar daily

- Sessão trivial (5 minutos pra checar status).
- Aluno só leu, não produziu nada.

## Por que existe

Memory de sessão. Quando aluno volta semana depois e MEMORY.md não bastar pra recontextualizar, lê o daily mais recente.
