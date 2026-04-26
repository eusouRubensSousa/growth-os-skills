# 04 — Estrutura de uma company (companies-spec)

> Como organizar `COMPANY.md`, `agents/`, `teams/`, `projects/`, `skills/` e suas
> respectivas configs frontmatter. Baseado em **Agent Companies Specification v1**.

## 4.1. Diretório-raiz

```
my-company/
├── COMPANY.md                          # entrypoint
├── .paperclip.yaml                     # vendor sidecar (config Paperclip)
├── agents/
│   └── <slug>/
│       ├── AGENTS.md                   # config do agente (também aceito: AGENT.md)
│       ├── PROTOCOL.md                 # heartbeat slim (recomendado)
│       └── references/                 # knowledge base on-demand
│           ├── architecture.md
│           ├── coding-conventions.md
│           └── ...
├── teams/
│   └── <slug>/
│       └── TEAM.md                     # subtree organizacional
├── projects/
│   └── <slug>/
│       ├── PROJECT.md
│       ├── progress.txt                # opcional — handoff state
│       └── tasks/<slug>/TASK.md        # tasks scoped ao projeto
├── tasks/
│   └── <slug>/TASK.md                  # tasks no top-level (starters)
├── skills/
│   └── <slug>/
│       └── SKILL.md                    # skills da company (loaded on-demand)
├── memory/
│   ├── shared/
│   │   ├── MEMORY.md                   # company-wide, < 5KB
│   │   ├── daily/<YYYY-MM-DD>.md
│   │   └── decisions/<date>-<topic>.md
│   └── per-agent/<slug>/
│       ├── MEMORY.md
│       └── daily/<YYYY-MM-DD>.md
├── assets/                             # images, etc
├── scripts/                            # automação determinística
└── references/                         # company-wide docs
```

## 4.2. Frontmatter padrão (todos os arquivos `*.md` da spec)

```yaml
---
schema: agentcompanies/v1
kind: company | team | agent | project | task
slug: <url-safe-stable-id>
name: Display Name
description: One-line summary
version: 0.1.0
license: MIT
authors:
  - name: KCG Group
    email: kelvin@kcggroup.com.br
homepage: https://example.com
tags: [...]
metadata:
  paperclip:
    # Vendor-specific. Outros vendors devem ignorar.
sources:
  - kind: github-file
    repo: paperclipai/templates-saas
    commit: a1b2c3d
    sha256: ...
    usage: referenced | vendored | mirrored
---
```

## 4.3. `COMPANY.md`

Entrypoint. Define o package graph via `includes`.

```markdown
---
schema: agentcompanies/v1
kind: company
slug: accelera-360
name: Accelera 360
description: Performance marketing agency company
version: 1.0.0
includes:
  - agents/ceo
  - agents/cmo
  - agents/copywriter
  - agents/analyst
  - skills/seo-audit
  - skills/copy-review
metadata:
  paperclip:
    instance: default
---

# Accelera 360

## Goal
Build the #1 AI-powered performance marketing agency by 2027-Q1.

## North star
ROAS > 4x médio em accounts ativas.

## Operating principles
1. ...
```

## 4.4. `agents/<slug>/AGENTS.md`

Config do agente. Mínimo:

```markdown
---
schema: agentcompanies/v1
kind: agent
slug: copywriter
name: Copywriter
title: Senior Copywriter
reportsTo: cmo
skills:
  - copy-review
  - brand-voice
description: |
  Writes long-form copy aligned to brand voice.
tags: [content, ic]
---

# Copywriter

(corpo como em snippets/agents-md-tier-ic.md, com Knowledge Base, Output Handling, Security Rules)
```

**Limite recomendado:** < 200 linhas. Acima disso, mover para `references/`.

## 4.5. `teams/<slug>/TEAM.md`

Subtree organizacional. Útil para hierarquias.

```markdown
---
schema: agentcompanies/v1
kind: team
slug: marketing
name: Marketing
manager: cmo
includes:
  - agents/copywriter
  - agents/social-media
  - agents/seo-specialist
---

# Marketing team

Reports to CMO. Delivers brand and demand-gen.
```

## 4.6. `projects/<slug>/PROJECT.md`

Agrupa starter tasks.

```markdown
---
schema: agentcompanies/v1
kind: project
slug: q2-launch
name: Q2 Product Launch
owner: ceo
description: Launch v2 of product Q2 2026.
---

# Q2 Launch

## Tasks
(implícito: tudo em projects/q2-launch/tasks/* é descoberto)
```

## 4.7. `tasks/<slug>/TASK.md` ou `projects/<slug>/tasks/<slug>/TASK.md`

```markdown
---
schema: agentcompanies/v1
kind: task
slug: implement-jwt
name: Implement JWT auth
assignee: engineer
project: q2-launch
recurring: false
---

# Implement JWT auth

## Acceptance criteria
- [ ] Middleware validates JWT
- [ ] Refresh token flow
- [ ] 3 unit tests

## Notes
Use ES256 (decision in memory/shared/decisions/2026-04-23-auth-algo.md).
```

## 4.8. `skills/<slug>/SKILL.md`

Compatível com Agent Skills spec. Veja `snippets/skill-md-template.md`.

```markdown
---
name: copy-review
description: Use when reviewing copy drafts for brand voice and CTA strength.
schema: agentskills/v1
metadata:
  paperclip:
    triggers: ["review copy", "copy audit"]
---

# Copy review

When invoked: ...
```

**Resolução de skill:** `skills/<shortname>/SKILL.md` é o default. Skills referenciadas em outros packages resolvem por slug.

## 4.9. Convenções de slug

- URL-safe: kebab-case (`copy-review`, não `copyReview` ou `Copy_Review`).
- Estável: NÃO renomear depois de criado (quebra references em outros agents).
- Único na company.
- Curto: < 30 chars.

## 4.10. Workflow de criação de uma company nova

```
[1] mkdir -p my-company/{agents,projects,skills,memory/{shared,per-agent}}
[2] criar COMPANY.md (snippet em refs/03)
[3] criar pelo menos um agent (CEO) em agents/ceo/AGENTS.md
[4] criar .paperclip.yaml (snippet paperclip-yaml-base.yaml)
[5] (opcional) git init + commit inicial
[6] paperclipai company import ./my-company --dry-run    # verifica
[7] paperclipai company import ./my-company              # cria de verdade
[8] anote o company-id que aparece no output → exporta como PC_COMPANY_ID
[9] dashboard: paperclipai dashboard get --company-id $PC_COMPANY_ID
```

## 4.11. Workflow de adicionar agente novo

```
[1] mkdir -p $PC_COMPANY_DIR/agents/<new-slug>
[2] criar agents/<new-slug>/AGENTS.md (use snippet tier apropriado)
[3] criar agents/<new-slug>/PROTOCOL.md (use snippet protocol-md-template.md)
[4] adicionar entry em .paperclip.yaml (adapter, env, budget)
[5] adicionar slug em COMPANY.md > includes:
[6] paperclipai company import $PC_COMPANY_DIR --company-id $PC_COMPANY_ID --dry-run
[7] (revisar diff)
[8] paperclipai company import $PC_COMPANY_DIR --company-id $PC_COMPANY_ID
[9] paperclipai agent list --company-id $PC_COMPANY_ID  # confirma
```

## 4.12. Anti-patterns

- ❌ AGENTS.md monolítico de 500+ linhas. Use TOC + references/.
- ❌ MEMORY.md crescendo sem consolidação mensal.
- ❌ Slugs renomeados ad-hoc (quebra references).
- ❌ Skills com description marketing-y ("super skill that does everything"). Description é routing logic.
- ❌ Frontmatter incompleto (sem slug ou kind) — faz import falhar silenciosamente.
- ❌ `assignee:` em TASK.md apontando para agent slug que não existe — orphan task.
