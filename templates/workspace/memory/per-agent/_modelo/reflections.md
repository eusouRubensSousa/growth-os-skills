---
type: agent-reflections
agent: "{{agent-name}}"
created: "{{YYYY-MM-DD}}"
last_updated: "{{YYYY-MM-DD}}"
entries: 0
---

# Reflections — {{agent-name}}

> Reflexion log — "what worked / what didn't" depois de cada execução.
> Append-only. Top-3 mais relevantes carregam na próxima execução do agent.
>
> Padrão: Reflexion (Shinn et al., 2023). Adaptado pra agent files.

---

## Como ler

Cada entrada tem 4 partes:
- **Contexto** — qual era a tarefa
- **O que funcionou** — padrão a repetir
- **O que falhou** — armadilha a evitar
- **Lição** — 1 frase load-bearing

---

## Entradas

<!-- Ordem: mais recente em cima. -->

<!--
### {{YYYY-MM-DD HH:MM}} — {{tarefa-curta}}

**Contexto:** {{cliente/nicho/oferta + objetivo}}

**O que funcionou:**
- {{padrão concreto que deu certo}}

**O que falhou:**
- {{padrão concreto que falhou e por quê}}

**Lição:** {{1 frase pra usar de novo}}

**Tags:** [{{nicho}}, {{tipo-tarefa}}]
-->

(vazio inicialmente — entradas escritas pelo `/gos-handoff` ou pelo próprio agent ao detectar lição relevante)

---

## Anti-pattern

- ❌ Reflection vaga ("foi bom") — sempre concreta, com exemplo.
- ❌ Reflection sem tags — sem tags, retrieval falha.
- ❌ Apagar reflection antiga — append-only; mover pra `_arquivo/` se passar de 50.
- ❌ Reflection que vira regra — se vira regra, move pra `state.md` ou `_contexto/tese-a360.md`.
