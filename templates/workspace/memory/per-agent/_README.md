# memory/per-agent/

> State per-agent — cada agent (skill) tem sua própria pasta com `state.md` e `reflections.md`.

## Por que existe

Cada agent precisa de **memória própria** que sobrevive entre execuções:

- **`state.md`** — o que o agent sabe sobre o domínio dele (padrões observados, atalhos, configs do aluno).
- **`reflections.md`** — Reflexion log: "what worked / what didn't" depois de cada execução. Carregado top-3 relevantes na próxima.

## Estrutura

```
per-agent/
├── _README.md              ← este arquivo
├── _modelo/                ← template (não editar)
│   ├── state.md
│   └── reflections.md
└── {agent-name}/           ← uma pasta por agent que registrou state
    ├── state.md
    └── reflections.md
```

Exemplos de `{agent-name}`:
- `gos-lp-builder/`
- `gos-pitch-deck-builder/`
- `gos-cliente-radar/`
- `gos-mission-control/` (Phase 2)

## Quando criar

Pasta nasce automaticamente na primeira execução do agent que decide registrar reflection. Não precisa criar manualmente.

## Quando ler

- **Início de execução do agent:** carrega top-3 reflections relevantes pra tarefa atual.
- **`/gos-handoff`:** escreve nova reflection no fim da sessão.
- **`/gos-map`:** lista quais agents têm state registrado.

## Anti-pattern

- ❌ Escrever sobre OUTRO agent neste folder (cada agent escreve só no próprio).
- ❌ Apagar reflections antigas — append-only por padrão; mover pra `_arquivo/` se passar de 50 entradas.
- ❌ Misturar com `memory/shared/` — shared é cross-agent; per-agent é específico.
