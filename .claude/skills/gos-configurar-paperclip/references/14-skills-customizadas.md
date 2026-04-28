# 14 — Skills customizadas

> Skills são **markdown carregado sob demanda** quando o agent decide que é
> relevante. Bem escrita: leve no heartbeat, expressiva quando carregada.

## 14.1. Estrutura

```
skills/
└── <shortname>/
    ├── SKILL.md           # principal (frontmatter + body)
    └── references/        # detalhes carregados sob demanda
        ├── api-spec.md
        └── examples.md
```

## 14.2. Frontmatter mandatório

```yaml
---
name: copy-review
description: |
  Routing description that tells the agent WHEN to use this skill.
  Write as decision logic, not marketing copy.
schema: agentskills/v1
metadata:
  paperclip:
    triggers: ["review copy", "copy audit"]
---
```

**Campos críticos:**
- `name`: kebab-case, único.
- `description`: o que o agent lê PRIMEIRO para decidir carregar. Escreva como decision logic.

## 14.3. Como o runtime carrega

1. Agent recebe lista (name + description) de todas skills disponíveis no system prompt (BARATO — só metadata).
2. Agent decide se task é relevante para alguma skill.
3. Se sim, abre `SKILL.md` completo (carregado on-demand).
4. Executa as instruções.

**Implicação:** descriptions importam MAIS que body. Description = roteamento.

## 14.4. Anatomia de uma boa SKILL.md

Use snippet `skill-md-template.md`. Estrutura:

```markdown
---
name: ...
description: ...
---

# Skill: <name>

## When to use
- "Use when <condition>"
- "Triggers on: '<phrase>', '<phrase>'"

## How to use
1. Step 1 com comando concreto.
2. Step 2.

## Examples
```bash
# Comando real
gh pr view 42 --json files
```

## Anti-patterns
- O que NÃO fazer.

## References (load on demand)
- `references/<topic>.md` para detalhes.
```

## 14.5. Description como decision logic (CRÍTICO)

| ❌ Marketing | ✅ Decision logic |
|---|---|
| "Skill incrível para review de PRs" | "Use when reviewing a GitHub PR diff for security issues. Triggers: 'review PR', 'security check'." |
| "Faz audit completo do código" | "Use when asked to audit a single file < 500 lines for code style. NÃO use para refactor sugestions (esse é skill `refactor-advisor`)." |
| "Generates blog content" | "Use when asked to write blog post, > 500 words, brand voice tom-de-voz Accelera. Triggers: 'blog', 'post', 'artigo'." |

A description é **quem decide se o cara abre o livro**. Gaste 10x mais esforço aqui que no body.

## 14.6. Mantenha skills CURTAS

- SKILL.md ideal: < 100 linhas.
- Conteúdo profundo vai pra `references/<topic>.md` dentro da skill.
- Skill > 200 linhas geralmente é 2+ skills disfarçadas. Quebre.

## 14.7. Resolução de skill (companies-spec)

Em paperclip companies-spec, skills resolvem na ordem:

1. **Local package**: `<company>/skills/<shortname>/SKILL.md`.
2. **Referenced/included packages**: skills declaradas em outros packages incluídos via `COMPANY.md > includes:`.
3. **Tool-managed skill library**: skills do paperclip core (ex: `paperclip` skill default — qual queremos OVERRIDE).

## 14.8. Adapter-specific loading

| Adapter | Como carrega |
|---|---|
| `claude_local` | Symlinks via `--add-dir <skills-tmp>` (workspace fica limpo) |
| `codex_local` | Global skills directory |
| `opencode_local` | Configuration-dependent |
| `process` / `http` | Adapter custom decide |

Em `claude_local`, Paperclip cria temp dir com symlinks para suas skills e passa `--add-dir`. Mudanças em SKILL.md são vistas no próximo heartbeat (sem cache).

## 14.9. Skills compartilhadas entre companies

Para reuso multi-company, distribua via Git:

```yaml
# COMPANY.md de outra company
includes:
  - github.com/your-org/skill-pack
```

Paperclip resolve via `paperclipai company import github.com/...` ou via `--expand-referenced-skills` para vendorize.

## 14.10. Workflow de criar uma skill

```
[1] mkdir -p $PC_COMPANY_DIR/skills/<shortname>
[2] cp ./snippets/skill-md-template.md $PC_COMPANY_DIR/skills/<shortname>/SKILL.md
[3] Customize description (mais importante!) e body
[4] Adicionar `<shortname>` em `agents/<slug>/AGENTS.md` frontmatter `skills:`
[5] paperclipai company import $PC_COMPANY_DIR --company-id $PC_COMPANY_ID --dry-run
[6] paperclipai company import $PC_COMPANY_DIR --company-id $PC_COMPANY_ID
[7] heartbeat: ./scripts/pc-wrap.sh "heartbeat run --agent-id <slug-id>"
[8] Verificar logs: agent loadou a skill?
```

## 14.11. Anti-patterns

- ❌ Description marketing-y → agent não consegue rotear.
- ❌ SKILL.md de 300+ linhas com tutoriais → carrega lixo todo turno onde a skill é referenciada.
- ❌ Multiple skills com mesma description → ambiguidade.
- ❌ Skill que não tem decision logic clara para "quando NÃO usar" → agent vai abrir desnecessariamente.
- ❌ Skill que duplica conteúdo de AGENTS.md → carga redundante.

## 14.12. Pegadinhas

- **Frontmatter parsing**: `---` precisa estar na primeira linha do arquivo. Espaço antes quebra.
- **`name` no frontmatter** != nome da pasta. Convenção: bater. Mas spec permite divergir.
- **Skill com nome `paperclip`**: NÃO conflite com skill default. Use namespace (`my-paperclip-helpers`).
- **Refs internas**: `references/<topic>.md` dentro da skill são relative paths. Agent precisa ter ferramenta de leitura de arquivo.
- **Hot reload**: edição de SKILL.md é hot — próximo heartbeat carrega nova versão. Sem `import` necessário (mas faça pra graph atualizar).
