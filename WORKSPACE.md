# Workspace A360 — Arquitetura do Harness

> Este documento define **como** o aluno organiza os outputs das skills A360 num workspace local. É a especificação canônica.
>
> **Pra quem é:** alunos da Accelera 360 que clonaram o repo e vão operar com as skills.
> **Por que existe:** sem esta convenção, cada skill jogava arquivos em pastas diferentes (raiz do projeto, dentro de `.claude/skills/...`, etc.) — virava caos.

---

## Princípios

1. **Endereço permanente.** Cada artefato (nicho, cliente, oferta, LP, deck) tem 1 caminho canônico. Skills sabem onde escrever sem decidir.
2. **PARA + Johnny.Decimal.** Areas (responsabilidades contínuas: nichos, clientes, ofertas) numeradas `00-NN` dentro de cada pasta para estabilidade de lookup.
3. **`_index.md` em toda pasta.** Map of Content — lista o que tá na pasta, com status e links. Regenerado por `/a360-map`.
4. **Memory load-bearing.** `MEMORY.md` < 5KB carregado em toda sessão. Detalhe vai pra `memory/shared/` ou `memory/per-skill/`.
5. **Pré-requisitos explícitos.** Skill recusa rodar se faltar input (ex: LP só roda com nicho mapeado + oferta definida). Ver `PREREQ.md`.
6. **Portável pro Paperclip.** Mesma nomenclatura — quando aluno migrar pra orquestrador de agentes, é um `mv` de pastas, não refactor.

---

## Estrutura canônica do workspace

```
{workspace}/                          ← raiz onde aluno roda Claude Code
│
├── CLAUDE.md                         Auto-instruções: carrega MEMORY.md + _contexto/ em toda sessão
├── MEMORY.md                         < 5KB load-bearing — single source of truth da sessão
├── WORKSPACE.md                      Este arquivo (cópia local, opcional)
├── PREREQ.md                         Árvore de pré-requisitos entre skills
│
├── _contexto/                        Lentes (lidas em toda sessão)
│   ├── operador.md                   Quem é o aluno (perfil, stack, preferências)
│   ├── tese-a360.md                  Método A360 / Growth AI — princípios não-negociáveis
│   └── glossario.md                  Termos do método (DOR/OPORTUNIDADE/SISTEMA, FLOW, FAB...)
│
├── memory/                           Memory layer
│   ├── shared/                       Contexto compartilhado entre skills
│   │   ├── nichos-mapeados.md        Ledger: 1 linha por nicho com slug + status
│   │   ├── clientes-ativos.md        Ledger: 1 linha por cliente
│   │   ├── ofertas.md                Ledger: 1 linha por oferta criada
│   │   └── decisoes/
│   │       └── YYYY-MM-DD-topic.md   Decisões duráveis (uma por arquivo)
│   └── per-skill/                    State específico por skill
│       ├── lp-builder/learnings.md   O que essa skill aprendeu na sua execução
│       ├── pitch-deck-builder/...
│       └── ...
│
├── nichos/                           PARA Areas — cérebro de cada nicho
│   ├── _index.md                     MoC com tabela (slug | status | última edição)
│   ├── _modelo/                      Template Johnny.Decimal (NÃO editar)
│   │   ├── _index.md
│   │   ├── 00-validacao.md           (do nicho-explorer Modo B)
│   │   ├── 01-perfil-cliente-alvo.md
│   │   ├── 02-dores.md
│   │   ├── 03-mecanismo.md
│   │   ├── 04-oferta-base.md
│   │   ├── 05-linguagem.md
│   │   ├── 06-eventos-gatilho.md
│   │   ├── 07-objecoes.md
│   │   ├── 08-fontes.md
│   │   └── 09-gtm-outline.md
│   └── {slug-nicho}/                 Instância (ex: clinicas-derma-sp)
│
├── clientes/                         PARA Areas — cada cliente em pasta
│   ├── _index.md
│   ├── _modelo/
│   │   ├── _index.md
│   │   ├── 00-perfil.md              (output cliente-radar)
│   │   ├── 01-meeting-prep.md        (output meeting-prep)
│   │   ├── 02-playbook.md            (output playbook-vendas customizado)
│   │   ├── lp/                       (output lp-builder customizado)
│   │   │   ├── _index.md
│   │   │   ├── lp.md
│   │   │   ├── lp.html
│   │   │   └── README-customizar.md
│   │   ├── deck/                     (output pitch-deck-builder)
│   │   │   ├── _index.md
│   │   │   ├── deck.html
│   │   │   ├── slides/               (modo gemini: PNGs aqui)
│   │   │   └── slides-md/            (20 .md de roteirização)
│   │   └── gtm/                      (output gtm-architect customizado)
│   │       ├── _index.md
│   │       ├── outbound.md
│   │       └── content.md
│   └── {slug-cliente}/
│
├── ofertas/                          PARA Areas — quando aluno tem oferta própria
│   ├── _index.md
│   ├── _modelo/
│   │   ├── _index.md
│   │   ├── 01-oferta.md              Briefing mestre — o que vende
│   │   ├── 02-estrutura.md           Como entrega
│   │   ├── 03-persona.md             Quem compra
│   │   ├── 04-marca.md               Tom, paleta, identidade
│   │   ├── lp/                       LP genérica da oferta (não cliente-específica)
│   │   ├── deck/                     Deck genérico da oferta
│   │   └── gtm/                      GTM da oferta (outbound + content frameworks)
│   └── {slug-oferta}/
│
├── daily/                            Log de sessão (gerado por /a360-handoff)
│   └── YYYY-MM-DD.md
│
└── _arquivo/                         PARA Archive — nichos/clientes/ofertas encerrados
    ├── nichos/
    ├── clientes/
    └── ofertas/
```

---

## Ledgers em `memory/shared/`

Os ledgers são **tabelas pesquisáveis em 1 olhada**. O `/a360-map` regenera. Skills consultam antes de executar (ex: lp-builder vê se nicho tá mapeado).

### Formato de cada ledger

```markdown
---
type: ledger
last_updated: 2026-04-26
---

# Nichos mapeados

| Slug | Setor | Status | Mapeado em | Mecanismo nomeado | Próximo passo |
|---|---|---|---|---|---|
| clinicas-derma-sp | Saúde estética | mapped | 2026-04-25 | CARE™ | Criar oferta |
| escritorios-contabeis | Serviços B2B | researching | 2026-04-26 | TBD | Rodar mapear-nicho-lite |
```

Status possíveis (nichos): `researching` (só nicho-explorer rodou) → `mapped` (mapear-nicho-lite completo) → `offered` (tem oferta) → `validated` (1+ cliente fechou) → `archived`.

Status possíveis (clientes): `prospect` → `radar-done` → `meeting-prep-done` → `closed` → `implementing` → `live` → `archived`.

---

## Convenções de nomenclatura

- **Slug:** kebab-case minúsculo, sem acento (`clinicas-derma-sp`, não `Clínicas-Derma-SP`).
- **Pastas iniciadas com `_`** = sentinelas (não são instâncias normais): `_index.md`, `_modelo/`, `_arquivo/`, `_contexto/`.
- **Numeração Johnny.Decimal:** `00-99` em cada pasta, lacunas permitidas (`01`, `03`, `07` se contexto pede).
- **Frontmatter YAML obrigatório** em todo arquivo gerado por skill — campos mínimos: `title`, `type`, `slug`, `created`, `status`.
- **Wiki-links** `[[arquivo]]` quando referenciar artefato dentro do workspace (compatível com Obsidian).
- **Datas absolutas** (`2026-04-26`, nunca "Thursday" / "ontem").

---

## Lentes carregadas em toda sessão

`CLAUDE.md` raiz instrui o agente a carregar antes de qualquer ação:

1. `MEMORY.md` — estado load-bearing.
2. `_contexto/operador.md` — quem é o aluno.
3. `_contexto/tese-a360.md` — método A360.
4. `_contexto/glossario.md` — termos.

Skills de output visual (lp-builder, pitch-deck-builder) também carregam `_contexto/marca.md` se existir.

---

## Pré-requisitos entre skills (resumo — detalhe em `PREREQ.md`)

- `nicho-explorer` → ponto de entrada, sem pré-req.
- `mapear-nicho-lite` → opcional ter `nicho-explorer` antes; recomendado.
- `cliente-radar` → recomenda nicho mapeado (não bloqueante).
- `meeting-prep` → **bloqueante:** `clientes/{slug}/00-perfil.md`.
- `gtm-architect` → **bloqueante:** `nichos/{slug}/` mapeado (mecanismo + ICP).
- `lp-builder` → **bloqueante:** nicho mapeado **E** (oferta definida em `ofertas/{slug}/01-oferta.md` **OU** cliente em `clientes/{slug}/00-perfil.md`).
- `pitch-deck-builder` → **bloqueante:** nicho mapeado; opcional cliente-radar.
- `playbook-vendas` → **bloqueante:** nicho mapeado.

Se a trava falha, a skill devolve mensagem do tipo:
> *"Pra rodar lp-builder, precisas antes de:*
> *(a) Nicho mapeado em `nichos/{slug}/` — roda `/mapear-nicho-lite` primeiro.*
> *(b) Oferta definida em `ofertas/{slug}/01-oferta.md` OU cliente em `clientes/{slug}/00-perfil.md` — escolhe um caminho.*
> *Sem isso, a LP sai genérica."*

---

## Comandos do harness

3 comandos cuidam da espinha do harness:

- `/a360-setup-workspace` — wizard inicial. Pergunta: nicho-alvo (opcional), perfil do aluno, tom; popula `MEMORY.md`, `_contexto/`, `memory/shared/`, `_modelo/`.
- `/a360-map` — varre todas as pastas Areas, regenera `_index.md`, sincroniza ledgers em `memory/shared/`, detecta drift, sugere próximo passo.
- `/a360-handoff` — fecha sessão. Atualiza Handoff em `MEMORY.md`, escreve `daily/{YYYY-MM-DD}.md`, sugere `git commit`.

---

## Compatibilidade com Obsidian

A estrutura é grafo-amigável:
- Wiki-links `[[arquivo]]` resolvem entre `_index.md` ↔ arquivos numerados.
- Frontmatter YAML é consumido por **Dataview** (queries dinâmicas).
- `_index.md` em cada pasta vira Map of Content navegável.

Plugins recomendados quando aluno abre vault no Obsidian: **Dataview**, **Templater**, **Graph Analysis**.

---

## Quando o workspace cresce — portabilidade pro Paperclip

Quando o aluno escala (vários nichos, vários clientes simultâneos, automações), a mesma estrutura roda no orquestrador **Paperclip** sem refactor:

- `memory/shared/` ↔ `memory/shared/` (mesmo nome).
- `memory/per-skill/` ↔ `memory/per-agent/` (mesma semântica).
- `_contexto/` ↔ `companies-spec/{slug}/COMPANY.md` (mesmo papel: contexto load-bearing).
- `MEMORY.md` mantém formato idêntico.

Detalhe em `MIGRATION-TO-PAPERCLIP.md`.

---

## Anti-pattern a evitar

- ❌ Skill criando pastas dentro de `.claude/skills/{nome}/workspace/...` — sempre escrever na raiz do workspace do aluno.
- ❌ Skill inventando paths novos sem declarar em `io.writes_to:` no SKILL.md.
- ❌ Modificar `_modelo/` direto — sempre copiar para `{slug}/` antes de editar.
- ❌ MEMORY.md > 5KB — quando passar, mover detalhe pra `memory/shared/` e enxugar.
- ❌ Decisão estratégica só na conversa — sempre virar arquivo em `memory/shared/decisoes/`.
- ❌ Pular pré-requisitos pra "rodar mais rápido" — gera output genérico, perde o ponto da skill.
