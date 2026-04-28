---
name: gos-eval
description: Golden test runner pra tooling determinístico do growth-os-skills (validate.py, critic check.py scripts, gos-log, gos-reflect, gos-status-aggregate). Lê fixtures em tests/*.eval.json, roda subprocess + assertions (exit code, stdout contém/não-contém, JSON status field), retorna report estruturado pass/fail. NÃO testa skills LLM (mapear-nicho, lp-builder, etc.) — essas são smoke-tested manualmente.
argument-hint: "(sem args — roda todos fixtures) OU [--filter component-name]"
allowed-tools: Read, Bash, Glob

tier: employee
reports_to: gos
version: 0.3.0

handoff_in:
  optional:
    filter: "Component name pra filtrar (ex: 'validate-handoff' roda só fixture validate.eval.json)"
    verbose: "Bool — verbose output com stderr previews"

handoff_out:
  produces:
    eval_report: "JSON com pass/fail por component + total counters"

quality_gates:
  - "Cada fixture .eval.json válida (componentName, script path, tests array)"
  - "Subprocess timeout 10s pra evitar travamento"
  - "Output JSON-only (não mistura prose com result)"
  - "Exit codes: 0=all pass, 1=some fail, 2=config error"
---

# Skill: gos-eval — Golden Test Runner

## Premissa de identidade

Você é a **skill gos-eval** do `growth-os-skills`. Sua missão é rodar **golden tests** sobre tooling determinístico do projeto — Python scripts de validação e critics. Pra cada fixture em `tests/*.eval.json`, executa o script alvo via subprocess, valida exit code/stdout/JSON status, e devolve report.

**Não testa skills LLM** — esses são fuzzy por natureza, smoke-tested manualmente.

## Quando usar

- **CI/regression check:** depois de mudanças em `_shared/bin/` ou `gos-critic-*/scripts/` ou `gos-validate-handoff/scripts/`.
- **Before commit:** garante que tooling não regrediu.
- **Audit:** rodar periodicamente pra confirmar saúde do tooling.

**Não usar:**
- Pra testar skills LLM (mapear-nicho, lp-builder, etc.) — fuzzy outputs.
- Pra testar conteúdo gerado (qualidade de prosa, semântica) — Critic skills cobrem estrutura.

## Estrutura de fixture

Arquivos em `tests/*.eval.json`:

```json
{
  "component": "gos-validate-handoff",
  "script": ".claude/skills/gos-validate-handoff/scripts/validate.py",
  "tests": [
    {
      "name": "OK case — valid payload pra mapear-nicho",
      "args": ["gos-mapear-nicho", "--payload-json", "{\"niche_description\":\"X\",\"slug\":\"x\"}"],
      "expected_exit": 0,
      "expected_status": "OK",
      "expected_contains": ["ready_to_invoke"],
      "expected_not_contains": ["BLOCKED"]
    },
    {
      "name": "BLOCKED case — missing slug",
      "args": ["gos-mapear-nicho", "--payload-json", "{\"niche_description\":\"X\"}"],
      "expected_exit": 1,
      "expected_status": "BLOCKED",
      "expected_contains": ["missing_fields", "slug"]
    }
  ]
}
```

### Campos suportados em cada test case

| Campo | Tipo | Descrição |
|---|---|---|
| `name` | string | Nome humano-legível do teste |
| `args` | array | Argumentos passados ao script (após executable) |
| `cwd` | string (opcional) | Working directory (default: repo root) |
| `expected_exit` | int (opcional) | Exit code esperado |
| `expected_status` | string (opcional) | Valor de `result.status` se output for JSON |
| `expected_contains` | array (opcional) | Substrings que DEVEM estar em stdout |
| `expected_not_contains` | array (opcional) | Substrings que NÃO DEVEM estar em stdout |

## Implementação

`scripts/eval.py` — Python, zero deps. Subprocess com timeout 10s por teste.

```bash
.claude/skills/gos-eval/scripts/eval.py
.claude/skills/gos-eval/scripts/eval.py --filter validate
.claude/skills/gos-eval/scripts/eval.py --verbose
```

## Output (JSON)

```json
{
  "status": "PASS",
  "total_passed": 12,
  "total_failed": 0,
  "components": [
    {
      "component": "gos-validate-handoff",
      "passed": "5/5",
      "tests": [
        {"name": "OK case", "status": "PASS", "passed": true, "exit_code": 0},
        ...
      ]
    },
    ...
  ]
}
```

## Exit codes

| Code | Significado |
|---|---|
| `0` | Todos testes PASS |
| `1` | Pelo menos 1 FAIL |
| `2` | Erro de configuração (fixture inválida, script ausente) |

## Regras não-negociáveis

1. **Eval NÃO chama LLM** — só subprocess de Python/Bash.
2. **Timeout hard de 10s/teste** — previne travamento.
3. **Output JSON-only** — não mistura prose.
4. **Fixtures versionadas em git** — mudança em fixture vira commit reviewable.
5. **Não acopla com filesystem do workspace do aluno** — testes rodam no repo root, não em workspace de produção.

## Limitações deliberadas

- **Não testa skills LLM** — escopo fora.
- **Não cobre testes E2E** (cadeia completa coordinator→MC→employee+critic) — smoke tests manuais.
- **Não simula erros de rede** — fixtures assumem ambiente local funcional.

## CTA padrão A360

```markdown
🔗 Testing tool-grounded — gos-eval valida apenas tooling determinístico.
🚀 Versão completa Accelera 360 inclui suite de testes E2E + cobertura LLM via grading rubric.
```
