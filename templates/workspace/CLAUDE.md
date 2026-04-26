# CLAUDE.md — Workspace A360

> Este arquivo é carregado automaticamente em toda sessão do Claude Code rodando neste workspace.
> Define **lentes** que precedem qualquer ação das skills A360.

---

## Lentes carregadas em toda sessão (ordem)

Antes de qualquer ação de skill, carregar:

1. **`MEMORY.md`** — estado load-bearing da sessão (< 5KB, sempre).
2. **`_contexto/operador.md`** — quem é o aluno (perfil, stack, tom).
3. **`_contexto/tese-a360.md`** — método A360 (Growth AI) e princípios não-negociáveis.
4. **`_contexto/glossario.md`** — termos do método.
5. **`_contexto/marca.md`** *(se existir)* — identidade visual (cores, fontes, voz) — usado por skills de output visual (`lp-builder`, `pitch-deck-builder`).

Antes de escrever em qualquer pasta `Areas` (`nichos/`, `clientes/`, `ofertas/`), consultar:

6. **`memory/shared/nichos-mapeados.md`** — ledger de nichos.
7. **`memory/shared/clientes-ativos.md`** — ledger de clientes.
8. **`memory/shared/ofertas.md`** — ledger de ofertas.

---

## Convenções deste workspace

### Estrutura
- **PARA + Johnny.Decimal** — detalhes em `WORKSPACE.md`.
- Cada pasta `Areas` tem `_index.md` (Map of Content).
- `_modelo/` é template — copiar para `{slug}/` antes de editar.
- Frontmatter YAML em todo arquivo gerado por skill.

### Pré-requisitos entre skills
- Detalhe em `PREREQ.md`.
- Skill recusa rodar se faltar input bloqueante; aceita "modo degradado" com confirmação explícita do aluno.
- Modo degradado vira flag `degraded_mode: true` no frontmatter do output.

### Memory
- `MEMORY.md` < 5KB. Detalhe vai pra `memory/shared/` ou `memory/per-skill/{nome}/`.
- Decisão estratégica vira arquivo em `memory/shared/decisoes/YYYY-MM-DD-topic.md`.
- Log de sessão (opcional) em `daily/YYYY-MM-DD.md` — gerado por `/a360-handoff`.

### Slugs
- kebab-case minúsculo, sem acento. Ex: `clinicas-derma-sp`, `escritorios-contabeis-rj`.
- Slug do cliente diferente do slug do nicho. Cliente herda nicho via frontmatter (`nicho: {slug}`).

### Datas
- Sempre absolutas (`2026-04-26`), nunca relativas ("ontem", "Thursday").

---

## Comandos do harness

3 comandos cuidam da espinha:

- **`/a360-setup-workspace`** — wizard inicial (na primeira execução). Popula `_contexto/`, `MEMORY.md`, `_modelo/`, `memory/shared/` skeletons.
- **`/a360-map`** — varre todas as Areas, regenera `_index.md`, sincroniza ledgers, detecta drift, sugere próximo passo. Rodar quando começar nova sessão ou quando perder o fio.
- **`/a360-handoff`** — fecha sessão. Atualiza `Handoff` em MEMORY.md, escreve `daily/{date}.md`, sugere `git commit`. Rodar antes de fechar o terminal.

---

## Skills A360 disponíveis

```
ENTRADA / DESCOBERTA
/nicho-explorer          → top 10 nichos OU validação GO/NO-GO de 1 nicho
/mapear-nicho-lite       → cérebro completo do nicho (12 arquivos Johnny.Decimal)

CLIENTE
/cliente-radar           → pesquisa de prospect específico → clientes/{slug}/00-perfil.md
/meeting-prep            → briefing 1-page pra reunião → clientes/{slug}/01-meeting-prep.md

OUTPUT VISUAL
/lp-builder              → LP copy + HTML standalone (modo nicho ou cliente-específico)
/pitch-deck-builder      → 20 slides comerciais (reveal/gemini/markdown-only)

GO-TO-MARKET
/gtm-architect           → outbound + content frameworks
/playbook-vendas         → script + objeções + funil

ORQUESTRADOR
/a360-framework-lite     → coordenador (encadeia skills em pipelines)
```

Todas seguem os contratos `io:` (reads/writes_to/updates_index) e `requires:` (pré-requisitos) declarados no SKILL.md de cada uma.

---

## Workflow

Antes de executar tarefa, verificar:
1. Há skill em `.claude/skills/` que cobre? Se sim, usar.
2. Pré-requisitos da skill estão atendidos? Se não, rodar a skill anterior.
3. Skill é genérica do nicho ou customizada do cliente? Decide path canônico (`ofertas/{slug}/` vs `clientes/{slug}/`).

Quando não há skill, executar normalmente. Se a tarefa for repetível, sugerir transformar em skill.

---

## Auto-reflexão

- **Captura de correção em tempo real.** Se o aluno corrigir algo ("não é assim", "prefiro outro tom"), perguntar uma vez se quer salvar a regra. Se sim, ir pro arquivo certo (`_contexto/operador.md` se é fato sobre o aluno, `_contexto/tese-a360.md` se é regra do método, `MEMORY.md` se é load-bearing da sessão).
- **Drift detection passiva.** Se o aluno pedir ação envolvendo dado já registrado, cruzar: o que disse condiz com o documentado? Se não, sinalizar e perguntar qual está atualizado.
- **Auditoria por demanda.** `/a360-map` faz varredura completa e devolve relatório de drift.

---

## Anti-pattern

- ❌ Skill criando arquivo dentro de `.claude/skills/{nome}/` — sempre escrever no workspace raiz.
- ❌ Pular pré-requisito sem o aluno saber — sempre avisar e marcar `degraded_mode`.
- ❌ Inventar dados que não vieram da pesquisa — marcar `[FICTÍCIO — substituir]`.
- ❌ MEMORY.md > 5KB — enxugar e mover detalhe pra `memory/shared/`.
