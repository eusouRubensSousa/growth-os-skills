---
type: decisoes/readme
---

# Decisões duráveis

Cada decisão estratégica vira **um arquivo** aqui no formato `YYYY-MM-DD-topic.md`.

## Por que separar

- `MEMORY.md` é load-bearing (< 5KB). Decisão não cabe lá.
- Conversa some. Arquivo persiste.
- Decisão tem **razão** que precisa sobreviver à pessoa que tomou.

## Formato esperado

```markdown
---
title: "Título curto da decisão"
type: decisao
created: 2026-04-26
status: vigente   # vigente | revisada | revogada
revoga: null      # se revoga outra decisão, slug do arquivo
revisada_em: null # data se foi revisada
---

# Título curto da decisão

## Contexto
(Por que precisei decidir? Qual o trade-off?)

## Opções consideradas
- A: ...
- B: ...
- C: ...

## Decisão
(O que ficou.)

## Razão (load-bearing)
(Por que A e não B/C. Em 3-5 linhas.)

## Consequências esperadas
- ...

## Quando revisar
(Em que sinal ou prazo essa decisão deve ser repensada.)
```

## Quando criar uma decisão

- Decisão envolve trade-off não-trivial.
- Vou querer lembrar **por que** escolhi A em 3 meses.
- A decisão afeta múltiplas skills/clientes.
- A decisão contradiz uma decisão anterior (criar a nova com `revoga:`).

## Quando NÃO criar

- Decisão tática (qual cor de botão, qual horário de reunião).
- Mudança que não afeta nada além da sessão atual.
- Já tem arquivo do mesmo tópico — atualizar o existente em vez de criar novo.

## Como referenciar em MEMORY.md

Em `MEMORY.md`, em "Decisões load-bearing já tomadas", citar:

```markdown
- **Slug do tópico:** [[memory/shared/decisoes/2026-04-26-modelo-pricing|2026-04-26-modelo-pricing]]
```

Frase load-bearing fica em MEMORY.md; razão completa fica no arquivo.
