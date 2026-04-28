#!/usr/bin/env python3
"""
gos-critic-playbook — Tool-grounded Critic for sales playbook outputs.

Validates a playbook (.md) against quality_gates from gos-playbook-vendas:
  - Script de diagnóstico 30min (D.E.A.L. lite — 4 fases visíveis)
  - Min 5 objeções com handle
  - Funil 5 estágios
  - Top 3 dores quantificadas

Usage:
    check.py <playbook-md-file>
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path


def check_deal_script(text: str) -> dict:
    """D.E.A.L. lite — 4 fases (Discovery, Engage, Articulate, Lock)."""
    deal_phases = {
        "Discovery": [r"discov", r"diagnóstico", r"contexto", r"situação atual"],
        "Engage": [r"engage", r"engajamento", r"conexão", r"rapport"],
        "Articulate": [r"articulat", r"proposta", r"oferta", r"solução"],
        "Lock": [r"lock", r"fechamento", r"próximo passo", r"agendamento"],
    }
    found = {}
    for phase, patterns in deal_phases.items():
        found[phase] = any(re.search(p, text, re.IGNORECASE) for p in patterns)

    missing = [p for p, ok in found.items() if not ok]
    passed = len(missing) == 0

    # Time mention (30min)
    has_30min = bool(re.search(r"30\s*min|30 minutos|trinta minutos", text, re.IGNORECASE))

    return {
        "check": "Script D.E.A.L. lite (4 fases) + 30min mencionado",
        "expected": "4 fases (Discovery/Engage/Articulate/Lock) + duração 30min",
        "actual": f"fases presentes: {sum(found.values())}/4, 30min={has_30min}",
        "passed": passed and has_30min,
        "severity": "high" if not (passed and has_30min) else "info",
        "remediation": (
            f"Adicionar fases faltantes: {', '.join(missing)}" + ("; mencionar duração 30min" if not has_30min else "")
            if not (passed and has_30min) else None
        ),
    }


def check_objections(text: str) -> dict:
    """Min 5 objeções com handle."""
    # Patterns for objection headers
    obj_headers = re.findall(r"^#+\s+(?:Objeção|OBJ|Objection)[^\n]*", text, re.MULTILINE)
    # Or numbered list of objections
    obj_numbered = re.findall(r"^\d+\.\s+(?:Objeção|\".*\")", text, re.MULTILINE)
    # Or bullet with "objeção" prefix
    obj_bullets = re.findall(r"^[-*]\s+\*?\*?Objeção", text, re.MULTILINE | re.IGNORECASE)

    total = len(obj_headers) + len(obj_numbered) + len(obj_bullets)
    # If no explicit "objeção" prefix, look for question-handle patterns
    if total < 5:
        # Heuristic: count "Q: ... A:" or quote + answer patterns
        qa_pairs = len(re.findall(r"(?:>\s*\".*?\")\s*\n+(?:[-*]|\d+\.|\*\*Resposta|\*\*Handle)", text))
        total += qa_pairs

    passed = total >= 5
    return {
        "check": "Min 5 objeções com handle",
        "expected": ">=5 objeções (header explícito ou Q:A pattern)",
        "actual": f"{total} objeções detectadas",
        "passed": passed,
        "severity": "high" if not passed else "info",
        "remediation": (
            f"Adicionar {5 - total} objeções com header '## Objeção N: \"...\"' + handle scripted"
            if not passed else None
        ),
    }


def check_funnel_5_stages(text: str) -> dict:
    """Funil 5 estágios."""
    funnel_keywords = [
        "prospecção",
        "qualificação",
        "proposta",
        "negociação",
        "fechamento",
    ]
    alt_keywords = [
        "lead",
        "MQL",
        "SQL",
        "discovery",
        "demo",
        "closing",
        "topo",
        "meio",
        "fundo",
    ]

    found = sum(1 for k in funnel_keywords if re.search(k, text, re.IGNORECASE))
    found_alt = sum(1 for k in alt_keywords if re.search(k, text, re.IGNORECASE))
    has_funnel_section = bool(re.search(r"^#+\s+(?:Funil|Funnel|Pipeline|Estágios)", text, re.MULTILINE | re.IGNORECASE))

    passed = (found >= 4 or found_alt >= 5) and has_funnel_section
    return {
        "check": "Funil 5 estágios",
        "expected": "header '## Funil/Pipeline' + 5 estágios mencionados",
        "actual": f"{found} estágios PT-padrão, {found_alt} alt keywords, header={has_funnel_section}",
        "passed": passed,
        "severity": "medium" if not passed else "info",
        "remediation": (
            "Adicionar seção '## Funil de vendas' com 5 estágios (prospecção/qualificação/proposta/negociação/fechamento ou equivalentes)"
            if not passed else None
        ),
    }


def check_top_3_dores_quantified(text: str) -> dict:
    """Top 3 dores quantificadas em R$ ou métrica."""
    rs_mentions = len(re.findall(r"R\$\s*[\d.,]+", text))
    pct_mentions = len(re.findall(r"\d+(?:[.,]\d+)?\s*%", text))
    dor_headers = len(re.findall(r"^#+\s+(?:Dor|DOR|Pain|Pain point)", text, re.MULTILINE | re.IGNORECASE))

    has_quant = rs_mentions >= 3 or (rs_mentions + pct_mentions) >= 5
    passed = dor_headers >= 3 and has_quant

    return {
        "check": "Top 3 dores quantificadas",
        "expected": ">=3 dores referenciadas + >=3 R$ ou >=5 R$/% combinados",
        "actual": f"{dor_headers} dores referenciadas, {rs_mentions} R$, {pct_mentions} %",
        "passed": passed,
        "severity": "medium" if not passed else "info",
        "remediation": (
            "Referenciar 3 dores do nicho com quantificação (R$ ou %) — pode importar de nichos/{slug}/02-dores.md"
            if not passed else None
        ),
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Critic for sales playbook outputs.")
    parser.add_argument("playbook_md", help="Path to playbook .md file")
    args = parser.parse_args()

    pb_path = Path(args.playbook_md).resolve()
    if not pb_path.exists() or not pb_path.is_file():
        print(json.dumps({"status": "ERROR", "error": f"file não existe: {pb_path}"}, indent=2, ensure_ascii=False))
        return 2

    text = pb_path.read_text(encoding="utf-8")

    checks = [
        check_deal_script(text),
        check_objections(text),
        check_funnel_5_stages(text),
        check_top_3_dores_quantified(text),
    ]

    passed = sum(1 for c in checks if c["passed"])
    total = len(checks)
    overall = passed == total

    result = {
        "critic": "gos-critic-playbook",
        "target": str(pb_path.relative_to(Path.cwd()) if pb_path.is_relative_to(Path.cwd()) else pb_path),
        "status": "PASS" if overall else "FAIL",
        "passed": f"{passed}/{total}",
        "checks": checks,
    }

    if not overall:
        failed = [c for c in checks if not c["passed"]]
        result["feedback_for_retry"] = [f"{c['check']}: {c['remediation']}" for c in failed if c.get("remediation")]

    print(json.dumps(result, indent=2, ensure_ascii=False))
    return 0 if overall else 1


if __name__ == "__main__":
    sys.exit(main())
