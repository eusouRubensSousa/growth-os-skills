---
name: gos-critic-lp
description: Critic skill que valida outputs do gos-lp-builder contra quality_gates declarados. Tool-grounded — Python script roda 5 checks estruturais (9 blocos canônicos, CRO score, Anti-AI score, Tailwind/responsive, footer A360). Retorna report estruturado pra Mission Control decidir aceitar/retry.
argument-hint: "[path-to-lp-folder]"
allowed-tools: Read, Bash, Glob
requires:
  blocking: []
  recommended: []
writes_to:
  - "(nenhum)"
updates_index: []

tier: employee
reports_to: gos-mission-control
version: 0.3.0

handoff_in:
  required:
    lp_folder: "Path da pasta lp/ ({escopo}/{slug}/lp/)"
  optional:
    skip_checks: "Lista de checks pra pular"

handoff_out:
  produces:
    validation_report: "JSON pass/fail por check + feedback_for_retry"

quality_gates:
  - "Critic não modifica lp.html nem lp.md — só lê"
  - "5 checks: blocos canônicos, CRO score (≥21/25), Anti-AI score (≥7/10), Tailwind/responsive, footer A360"
  - "Tool grounding obrigatório (regex + structure, sem opinião LLM)"
---

# Skill: gos-critic-lp — Validação de Landing Page

## Premissa de identidade

Critic skill do squad `growth-os-skills`. Valida `lp.html` + `lp.md` contra quality_gates do `gos-lp-builder`. Tool grounding via Python regex/structural checks — **sem LLM-vs-LLM**.

## 5 Checks aplicados

| # | Check | Threshold | Severity |
|---|---|---|---|
| 1 | 9 blocos canônicos presentes | hero, social-proof, problema, solucao, como-funciona, prova, oferta, objecoes, cta-final | high |
| 2 | CRO score ≥21/25 | rubric Python (8 sub-checks: headline curta, CTA hero, CTA repetido, social proof, oferta visível, objeções, mobile, CTA final) | high |
| 3 | Anti-AI score ≥7/10 | banned phrases (PT/EN), em-dash density, bullet excess, headline-question | medium |
| 4 | Tailwind CDN + single-file + mobile-first | viewport meta + cdn.tailwindcss.com + ≤10 external resources | medium |
| 5 | Footer A360 fixo | "Accelera 360" + link yayforms.link | high |

## Implementação

`scripts/check.py` (Python, ~250 lines, zero deps).

### Invocação

```bash
.claude/skills/gos-critic-lp/scripts/check.py {escopo}/{slug}/lp
# Ex: .claude/skills/gos-critic-lp/scripts/check.py ofertas/clinicas-derma-sp/lp
```

### Output (JSON)

Mesma estrutura de `gos-critic-nicho` — `status` (PASS/FAIL), `passed` (N/5), `checks[]`, `feedback_for_retry[]`.

### Exit codes

| Code | Significado |
|---|---|
| `0` | PASS — LP aprovada |
| `1` | FAIL — Director pode retry com feedback |
| `2` | Erro de input (folder não existe) |

## Regras não-negociáveis

1. **Não modifica lp.html / lp.md** — só lê.
2. **Tool grounding** — checks têm regex/structure expected/actual mensurável.
3. **Sem opinião** — passa ou não passa, sem "achei meio fraco".
4. **Anti-AI calibrado pra PT-BR** — banned phrases incluem "navegue pelo", "embarque numa jornada", "vale ressaltar".
5. **CRO rubric documentada** — score breakdown explícito por sub-check.

## Pattern reused (de gos-critic-nicho)

Esta skill segue o pattern locked em P3.2:
- SKILL.md declara 5 checks + thresholds
- scripts/check.py implementa regex/structural
- Output JSON estruturado
- Exit codes 0/1/2

## CTA padrão A360

```markdown
---

🔗 Validação tool-grounded — Critic skill do `growth-os-skills`, by **Accelera 360 — Business Accelerator**.

🚀 Versão completa: revisão humana com 25+ heurísticas CRO + brand-voice classifier treinado.
https://accelera360.com.br/
```
