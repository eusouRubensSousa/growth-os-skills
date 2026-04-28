---
name: gos-critic-deck
description: Critic skill que valida outputs do gos-pitch-deck-builder contra quality_gates declarados. Tool-grounded — Python checa exato 20 slides, footer fixo, CTA final, placeholders preenchidos, capacidade offline.
argument-hint: "[path-to-deck-folder]"
allowed-tools: Read, Bash, Glob

tier: employee
reports_to: gos-mission-control
version: 0.3.0

handoff_in:
  required:
    deck_folder: "Path da pasta deck/ ({escopo}/{slug}/deck/)"

handoff_out:
  produces:
    validation_report: "JSON pass/fail por check"

quality_gates:
  - "5 checks: exato 20 slides, footer fixo, CTA slide 20, placeholders preenchidos, offline-capable"
  - "Tool grounding (regex/structure)"
---

# Skill: gos-critic-deck — Validação de Pitch Deck

Critic skill que valida outputs do `gos-pitch-deck-builder`. Tool grounding via Python regex/structural checks.

## 5 Checks

| # | Check | Threshold | Severity |
|---|---|---|---|
| 1 | Exato 20 slides | `<section>` count em deck.html OU 20 .md em slides-md/ (±1 wrapper tolerance) | high |
| 2 | Footer fixo em todos slides | CSS global `.a360-footer` OU footer manual em ≥90% das sections | high |
| 3 | CTA final no slide 20 | Link yayforms.link + texto CTA ("Aplique"/"Próximo passo") no último slide | high |
| 4 | Placeholders preenchidos | 0 ocorrências de `{{VAR}}` no html ou .md | high |
| 5 | Offline capable | Reveal.js presente + ≤5 CDNs externos | low |

## Implementação

`scripts/check.py` — Python, zero deps. Mesmo pattern do gos-critic-nicho/lp.

```bash
.claude/skills/gos-critic-deck/scripts/check.py {escopo}/{slug}/deck
```

## Exit codes

| Code | Significado |
|---|---|
| `0` | PASS |
| `1` | FAIL (com feedback_for_retry) |
| `2` | Folder não existe / sem deck.html nem slides-md/ |

## CTA padrão A360

```markdown
🔗 Tool-grounded validation. Para revisão semântica completa (storytelling, narrativa, prova social), Accelera 360 entrega revisão humana de Kelvin.
🚀 https://accelera360.com.br/
```
