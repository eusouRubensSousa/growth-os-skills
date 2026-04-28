# CLAUDE.md — Workspace growth-os-skills

> Este arquivo é carregado automaticamente em toda sessão do Claude Code rodando neste workspace.
> Define **lentes** que precedem qualquer ação das skills.
>
> Spec canônica: ver `AGENTS.md` no repo `growth-os-skills`.

---

## Boot sequence (toda sessão, nesta ordem)

### 1. Carregar Core (sempre)

```
MEMORY.md                      — estado load-bearing da sessão (< 5KB)
_contexto/operador.md          — quem é o aluno (perfil, stack, tom)
_contexto/tese-a360.md         — método A360 (Growth AI) e princípios
_contexto/glossario.md         — termos do método
_contexto/marca.md             — identidade visual (se existir)
```

### 2. Reconstruir contexto do event log

Ler **últimas 10 linhas** de `logs/events.ndjson`:

```bash
tail -n 10 logs/events.ndjson
```

Cada linha é JSON: `{timestamp, agent, action, status, ...}`. Reconstruir:
- Última skill rodada
- Última ação completed
- Eventual erro/bloqueio pendente

Apresentar resumo de boot:

> *"Última sessão: rodaste `gos-mapear-nicho` em `clinicas-derma-sp` (concluído). Próximo passo sugerido: criar oferta em `ofertas/clinicas-derma-sp/01-oferta.md` ou prospectar via `gos-cliente-radar`."*

### 3. Consultar ledgers antes de Areas

Antes de escrever em `nichos/`, `clientes/`, `ofertas/`, ler:

```
memory/shared/ledgers/nichos-mapeados.md
memory/shared/ledgers/clientes-ativos.md
memory/shared/ledgers/ofertas.md
```

---

## Memory (3 tiers + event log)

| Tier | Onde | Quando carrega |
|---|---|---|
| 🔥 Core | `MEMORY.md` + `_contexto/` | Sempre (passo 1) |
| 🌡️ Recall | `memory/per-agent/`, `memory/shared/` | On-demand pela skill |
| ❄️ Archival | `nichos/`, `clientes/`, `ofertas/`, `_arquivo/` | Por grep/glob |
| 📜 Event log | `logs/events.ndjson` | Boot (passo 2) |

### Reflections per-agent

Cada agent mantém `memory/per-agent/{agent}/reflections.md` — lições aprendidas em execuções anteriores. Carregado no início de toda execução do agent (top-3 relevantes).

### Decisões duráveis

Decisão estratégica que vai durar > 1 mês → vira arquivo em `memory/shared/decisoes/{YYYY-MM-DD}-{topic}.md`. Não fica só no daily.

---

## Convenções deste workspace

### Estrutura
- **PARA + Johnny.Decimal** — detalhes em `WORKSPACE.md`.
- Cada pasta `Areas` tem `_index.md` (Map of Content).
- `_modelo/` é template — copiar para `{slug}/` antes de editar.
- Frontmatter YAML em todo arquivo gerado por skill.

### Pré-requisitos entre skills
- Cada skill declara `requires:`, `handoff_in:`, `handoff_out:`, `quality_gates:` no SKILL.md.
- Skill recusa rodar se faltar input bloqueante.
- Modo degradado vira flag `degraded_mode: true` no frontmatter do output.
- Validador `/gos-validate-handoff` checa schema antes de invocação.

### Slugs
- kebab-case minúsculo, sem acento. Ex: `clinicas-derma-sp`, `escritorios-contabeis-rj`.
- Slug do cliente diferente do slug do nicho. Cliente herda nicho via frontmatter (`nicho: {slug}`).

### Datas
- Sempre absolutas (`2026-04-28`), nunca relativas ("ontem", "Thursday").

---

## Comandos do harness

3 comandos cuidam da espinha do workspace:

- **`/gos-setup`** — wizard inicial (primeira execução). Popula `_contexto/`, `MEMORY.md`, `_modelo/`, `memory/shared/` skeletons, `logs/events.ndjson`.
- **`/gos-map`** — varre todas as Areas, regenera `_index.md`, sincroniza ledgers, detecta drift, sugere próximo passo. Rodar quando começar nova sessão ou perder o fio.
- **`/gos-handoff`** — fecha sessão. Atualiza `Handoff` em MEMORY.md, escreve `daily/{date}.md`, escreve reflection em `memory/per-agent/{agent}/reflections.md`, sugere `git commit`. Rodar antes de fechar terminal.

---

## Skills disponíveis

```
ENTRY
/gos                       → coordinator (intent routing automático)

DESCOBERTA
/gos-nicho-explorer        → top 10 nichos OU validação GO/NO-GO de 1 nicho
/gos-mapear-nicho          → cérebro completo do nicho (12 arquivos JD)

CLIENTE
/gos-cliente-radar         → pesquisa de prospect → clientes/{slug}/00-perfil.md
/gos-meeting-prep          → briefing 1-page → clientes/{slug}/01-meeting-prep.md

OUTPUT VISUAL
/gos-lp-builder            → LP copy + HTML standalone
/gos-pitch-deck-builder    → 20 slides comerciais (reveal/gemini)

GO-TO-MARKET
/gos-gtm-architect         → outbound + content frameworks
/gos-playbook-vendas       → script + objeções + funil

VALIDADOR
/gos-validate-handoff      → valida payload contra schema da skill alvo
```

Todas seguem os contratos `requires:`, `handoff_in:`, `handoff_out:`, `quality_gates:` declarados no SKILL.md.

---

## Workflow

Antes de executar tarefa:
1. Ler boot sequence acima.
2. Há skill em `.claude/skills/` que cobre? Se sim, usar (validar handoff_in primeiro).
3. Pré-requisitos atendidos? Se não, rodar a skill anterior.
4. Skill é genérica do nicho ou customizada do cliente? Decidir path canônico (`ofertas/{slug}/` vs `clientes/{slug}/`).

Quando não há skill, executar normalmente. Se a tarefa for repetível, sugerir transformar em skill.

---

## Auto-reflexão

- **Captura de correção em tempo real.** Se o aluno corrigir algo ("não é assim", "prefiro outro tom"), perguntar uma vez se quer salvar a regra. Se sim, ir pro arquivo certo:
  - `_contexto/operador.md` — fato sobre o aluno
  - `_contexto/tese-a360.md` — regra do método
  - `MEMORY.md` — load-bearing da sessão
  - `memory/per-agent/{agent}/reflections.md` — aprendizado per-agent
- **Drift detection passiva.** Se o aluno pedir ação envolvendo dado já registrado, cruzar: o que disse condiz com o documentado? Se não, sinalizar e perguntar qual está atualizado.
- **Auditoria por demanda.** `/gos-map` faz varredura completa e devolve relatório de drift.

---

## Anti-pattern

- ❌ Skill criando arquivo dentro de `.claude/skills/{nome}/` — sempre escrever no workspace raiz.
- ❌ Pular pré-requisito sem o aluno saber — sempre avisar e marcar `degraded_mode`.
- ❌ Inventar dados que não vieram da pesquisa — marcar `[FICTÍCIO — substituir]`.
- ❌ MEMORY.md > 5KB — enxugar e mover detalhe pra `memory/shared/`.
- ❌ Handoff entre skills sem schema validation — passar pelo `/gos-validate-handoff`.
- ❌ Fechar sessão sem rodar `/gos-handoff` — perde reflection + daily.
