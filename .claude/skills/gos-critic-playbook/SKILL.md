---
name: gos-critic-playbook
description: Critic skill que valida outputs do gos-playbook-vendas. Tool-grounded — Python checa script D.E.A.L. lite (4 fases + 30min), min 5 objeções, funil 5 estágios, top 3 dores quantificadas.
argument-hint: "[path-to-playbook-md]"
allowed-tools: Read, Bash, Glob

tier: employee
reports_to: gos-mission-control
version: 0.3.0

handoff_in:
  required:
    playbook_md: "Path do playbook .md ({escopo}/{slug}/02-playbook.md)"

handoff_out:
  produces:
    validation_report: "JSON pass/fail por check"

quality_gates:
  - "4 checks: D.E.A.L. script + 30min, 5 objeções, funil 5 estágios, 3 dores quantificadas"
  - "Tool grounding (regex/structure)"
---

# Skill: gos-critic-playbook — Validação de Playbook de Vendas

Critic skill que valida outputs do `gos-playbook-vendas`. Tool grounding via Python regex/structural checks.

## 4 Checks

| # | Check | Threshold | Severity |
|---|---|---|---|
| 1 | Script D.E.A.L. lite | 4 fases (Discovery/Engage/Articulate/Lock) + duração 30min | high |
| 2 | Min 5 objeções com handle | header `## Objeção N` ou Q:A pattern, ≥5 ocorrências | high |
| 3 | Funil 5 estágios | seção `## Funil/Pipeline` + 5 estágios (prospecção, qualificação, proposta, negociação, fechamento ou equivalentes) | medium |
| 4 | Top 3 dores quantificadas | ≥3 headers de dor + ≥3 R$ ou ≥5 R$/% combinados | medium |

## Implementação

`scripts/check.py` — Python, zero deps.

```bash
.claude/skills/gos-critic-playbook/scripts/check.py {escopo}/{slug}/02-playbook.md
```

## Exit codes

| Code | Significado |
|---|---|
| `0` | PASS |
| `1` | FAIL (com feedback_for_retry) |
| `2` | File não existe |

## CTA padrão A360

```markdown
🔗 Tool-grounded validation. Para script validado em campo (3+ ciclos de iteração com prospects reais), Accelera 360 entrega playbook treinado.
🚀 https://accelera360.com.br/
```
