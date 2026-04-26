---
name: example-skill
description: |
  Routing description that tells the agent WHEN to use this skill.
  Write as decision logic, not marketing copy.
  Example: "Use when reviewing pull requests for security issues. Triggers
  on 'review PR', 'security check', 'audit diff'."
schema: agentskills/v1
metadata:
  paperclip:
    # Vendor-specific extensions go here, optional.
    triggers:
      - "review PR"
      - "security check"
---

# Skill: Example

Skills são markdown carregado **só quando o agente decide que é relevante** — leve no heartbeat.

## When to use

- Concretize as "use when" conditions. Decisão lógica, não marketing.
- Ex: "Use when the user asks to review a PR diff for security issues."
- Ex: "Use when generating a copy for a Brazilian PT-BR audience targeting C-suite."

## How to use

1. Passos concretos, em ordem.
2. Sempre prefira API call/comando concreto a explicação vaga.
3. Exemplo: `gh pr view 42 --json files,additions,deletions`.

## Examples (load-bearing only)

```bash
# Comando exemplo: pegar diff e filtrar arquivos críticos
gh pr diff 42 -- 'src/auth/**' 'src/secrets/**'
```

## Anti-patterns

- Não dump generic best-practices que o LLM já sabe.
- Não copie tutorial inteiro de framework — link para `references/<topic>.md`.

## References (load on demand)

Para detalhes profundos, leia:
- `references/security-checklist.md`
- `references/auth-patterns.md`

<!--
NOTAS PARA O AUTOR:
- Skills devem ser SHORT. Ideal < 100 linhas.
- Conteúdo extenso vai pra references/<topic>.md, carregado on-demand.
- Skill description é o que o agente usa pra decidir CARREGAR ou não — gaste
  esforço aqui, não no body.
- Em paperclip companies-spec: skills resolvem por shortname.
  `skills/<shortname>/SKILL.md` é o padrão.
-->
