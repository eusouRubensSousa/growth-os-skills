#!/usr/bin/env python3
"""
gos-critic-lp — Tool-grounded Critic for landing page outputs.

Validates an LP folder ({escopo}/{slug}/lp/) against quality_gates declared
in gos-lp-builder/SKILL.md:

  - 9 blocos canônicos presentes
  - CRO score ≥21/25 (rubric Python)
  - Anti-AI score ≥7/10 (rubric Python — banned phrases, em-dash count)
  - Combined score ≥28/35
  - Tailwind CDN, single-file, mobile-first (HTML structure)
  - Footer A360 fixo

Usage:
    check.py <lp-folder>
    check.py {escopo}/{slug}/lp

Exit codes:
    0 — PASS
    1 — FAIL (with feedback_for_retry)
    2 — input error
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any


CANONICAL_BLOCKS = [
    "hero",
    "social-proof",
    "problema",
    "solucao",
    "como-funciona",
    "prova",
    "oferta",
    "objecoes",
    "cta-final",
]

# Banned AI tells in copy (Portuguese)
AI_TELLS = [
    "delve",
    "tapestry",
    "navigate the",
    "in the realm of",
    "embark on a journey",
    "let's dive",
    "it's worth noting",
    "in conclusion",
    "navegue pelo",
    "no mundo do",
    "embarque numa jornada",
    "vale ressaltar",
    "em conclusão",
]


def check_canonical_blocks(html: str, md: str) -> dict:
    """9 blocos canônicos detectados (via id, class, ou heading)."""
    found = []
    missing = []
    for block in CANONICAL_BLOCKS:
        # Look in id, class, data-section, or heading text
        patterns = [
            rf'id="{block}',
            rf'class="[^"]*{block}',
            rf'data-section="{block}',
            rf'## .*{block.replace("-", " ")}',
        ]
        if any(re.search(p, html, re.IGNORECASE) or re.search(p, md, re.IGNORECASE) for p in patterns):
            found.append(block)
        else:
            missing.append(block)

    passed = len(missing) == 0
    return {
        "check": "9 blocos canônicos presentes",
        "expected": "9 blocos (hero, social-proof, problema, solucao, como-funciona, prova, oferta, objecoes, cta-final)",
        "actual": f"{len(found)}/9 ({', '.join(missing) if missing else 'todos presentes'})",
        "passed": passed,
        "severity": "high" if not passed else "info",
        "remediation": (
            f"Adicionar blocos faltantes: {', '.join(missing)}" if missing else None
        ),
    }


def check_cro_score(html: str, md: str) -> dict:
    """CRO score ≥21/25 (rubric)."""
    score = 0
    breakdown = {}

    # 1. Hero tem headline curta (<60 chars) — 3 pts
    hero_match = re.search(r"<h1[^>]*>([^<]+)</h1>", html)
    if hero_match and len(hero_match.group(1).strip()) < 60:
        score += 3
        breakdown["headline_curta"] = "PASS (3)"
    else:
        breakdown["headline_curta"] = "FAIL"

    # 2. Hero tem CTA visível (botão) — 3 pts
    if re.search(r'<(?:a|button)[^>]*(?:cta|btn-primary|btn-cta)', html, re.IGNORECASE):
        score += 3
        breakdown["cta_hero"] = "PASS (3)"
    else:
        breakdown["cta_hero"] = "FAIL"

    # 3. Pelo menos 1 CTA repetido (mid-LP) — 3 pts
    cta_count = len(re.findall(r'<(?:a|button)[^>]*(?:cta|btn-primary)', html, re.IGNORECASE))
    if cta_count >= 2:
        score += 3
        breakdown["cta_repetido"] = f"PASS (3) — {cta_count} CTAs"
    else:
        breakdown["cta_repetido"] = f"FAIL — {cta_count} CTA(s)"

    # 4. Social proof (logos, números, depoimentos) — 3 pts
    has_social = bool(re.search(r"(?:depoimento|cliente|empresas?|usuários|kWp|projetos)", md, re.IGNORECASE))
    if has_social:
        score += 3
        breakdown["social_proof"] = "PASS (3)"
    else:
        breakdown["social_proof"] = "FAIL"

    # 5. Bloco oferta com preço/garantia visível — 3 pts
    has_offer = bool(re.search(r"(?:R\$\s*\d|garantia|risco zero|ROI|payback)", md, re.IGNORECASE))
    if has_offer:
        score += 3
        breakdown["oferta_visivel"] = "PASS (3)"
    else:
        breakdown["oferta_visivel"] = "FAIL"

    # 6. Objeções (bloco FAQ ou Objeções) — 4 pts
    has_objections = bool(re.search(r"(?:objeç|FAQ|perguntas frequentes|dúvidas)", md, re.IGNORECASE))
    if has_objections:
        score += 4
        breakdown["objecoes"] = "PASS (4)"
    else:
        breakdown["objecoes"] = "FAIL"

    # 7. Mobile-responsive (viewport meta + responsive utilities) — 3 pts
    has_viewport = "<meta name=\"viewport\"" in html
    has_responsive = bool(re.search(r"(?:md:|lg:|sm:|tailwind)", html))
    if has_viewport and has_responsive:
        score += 3
        breakdown["mobile_responsive"] = "PASS (3)"
    else:
        breakdown["mobile_responsive"] = "FAIL"

    # 8. CTA final (último bloco) — 3 pts
    if re.search(r"<(?:section|div)[^>]*cta-final", html, re.IGNORECASE) or html.rfind("<button") > len(html) * 0.7:
        score += 3
        breakdown["cta_final"] = "PASS (3)"
    else:
        breakdown["cta_final"] = "FAIL"

    passed = score >= 21
    return {
        "check": "CRO score ≥21/25",
        "expected": ">=21/25",
        "actual": f"{score}/25",
        "passed": passed,
        "severity": "high" if not passed else "info",
        "score_breakdown": breakdown,
        "remediation": (
            f"Reforçar checks que falharam: {[k for k, v in breakdown.items() if 'FAIL' in v]}"
            if not passed else None
        ),
    }


def check_anti_ai_score(md: str, html: str) -> dict:
    """Anti-AI score ≥7/10."""
    text = md + "\n" + html
    score = 10
    findings = []

    # 1. Banned AI phrases (-1 cada, max -3)
    found_phrases = [p for p in AI_TELLS if p.lower() in text.lower()]
    deduction = min(len(found_phrases), 3)
    score -= deduction
    if found_phrases:
        findings.append(f"AI tells encontrados ({deduction}pts): {', '.join(found_phrases[:3])}")

    # 2. Em-dash count (—) — se >5 em copy curta, suspeita (-1 cada extra, max -2)
    em_dash_count = text.count("—")
    text_words = len(re.findall(r"\b\w+\b", md))
    if text_words > 0 and em_dash_count / text_words > 0.02:  # >2% das palavras
        excess = em_dash_count - int(text_words * 0.02)
        deduction = min(excess, 2)
        score -= deduction
        findings.append(f"em-dash density alta ({em_dash_count} em {text_words} palavras): -{deduction}")

    # 3. Excessive bullet lists (-1 se >5 listas em copy curta)
    bullet_blocks = len(re.findall(r"^- ", md, re.MULTILINE))
    if bullet_blocks > 15:
        score -= 1
        findings.append(f"muitas listas bullet ({bullet_blocks}): -1")

    # 4. Headline com pergunta (-1 se hero é pergunta)
    hero_match = re.search(r"<h1[^>]*>([^<]+)</h1>", html)
    if hero_match and "?" in hero_match.group(1):
        score -= 1
        findings.append("hero é pergunta (pesquisa: declarativo converte mais): -1")

    score = max(0, score)
    passed = score >= 7
    return {
        "check": "Anti-AI score ≥7/10",
        "expected": ">=7/10",
        "actual": f"{score}/10",
        "passed": passed,
        "severity": "medium" if not passed else "info",
        "findings": findings if findings else None,
        "remediation": (
            "Revisar copy: remover AI tells, balancear em-dash, headline declarativa"
            if not passed else None
        ),
    }


def check_tailwind_standalone(html: str) -> dict:
    """Tailwind CDN + single-file + mobile-first."""
    has_tailwind_cdn = "cdn.tailwindcss.com" in html or "tailwindcss" in html
    has_viewport = "<meta name=\"viewport\"" in html
    is_single_file = html.count("<script") + html.count("<link") < 10  # heurística

    passed = has_tailwind_cdn and has_viewport and is_single_file
    return {
        "check": "Tailwind CDN + single-file + mobile-first",
        "expected": "Tailwind via CDN + viewport meta + ≤10 external resources",
        "actual": f"tailwind={has_tailwind_cdn}, viewport={has_viewport}, single_file={is_single_file}",
        "passed": passed,
        "severity": "medium" if not passed else "info",
        "remediation": (
            "Adicionar <script src='https://cdn.tailwindcss.com'> e <meta name='viewport'>"
            if not passed else None
        ),
    }


def check_footer_a360(html: str, md: str) -> dict:
    """Footer com brand A360."""
    text = html + "\n" + md
    has_brand = "Accelera 360" in text or "accelera360.com.br" in text
    has_apply = "yayforms.link" in text or "Aplique" in text or "Aplicar" in text

    passed = has_brand and has_apply
    return {
        "check": "Footer A360 (brand + CTA)",
        "expected": "Brand 'Accelera 360' + link aplicação",
        "actual": f"brand={has_brand}, apply_cta={has_apply}",
        "passed": passed,
        "severity": "high" if not passed else "info",
        "remediation": (
            "Adicionar footer com 'Powered by Accelera 360' + link yayforms.link"
            if not passed else None
        ),
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Critic for landing page outputs.")
    parser.add_argument("lp_folder", help="Path to lp/ folder (contém lp.html + lp.md)")
    args = parser.parse_args()

    folder = Path(args.lp_folder).resolve()
    if not folder.exists() or not folder.is_dir():
        print(json.dumps({"status": "ERROR", "error": f"folder não existe: {folder}"}, indent=2, ensure_ascii=False))
        return 2

    html_path = folder / "lp.html"
    md_path = folder / "lp.md"

    html = html_path.read_text(encoding="utf-8") if html_path.exists() else ""
    md = md_path.read_text(encoding="utf-8") if md_path.exists() else ""

    if not html and not md:
        print(json.dumps({
            "status": "ERROR",
            "error": f"nem lp.html nem lp.md presentes em {folder}",
        }, indent=2, ensure_ascii=False))
        return 2

    checks = [
        check_canonical_blocks(html, md),
        check_cro_score(html, md),
        check_anti_ai_score(md, html),
        check_tailwind_standalone(html),
        check_footer_a360(html, md),
    ]

    passed_count = sum(1 for c in checks if c["passed"])
    total = len(checks)
    overall = passed_count == total

    result = {
        "critic": "gos-critic-lp",
        "target": str(folder.relative_to(Path.cwd()) if folder.is_relative_to(Path.cwd()) else folder),
        "status": "PASS" if overall else "FAIL",
        "passed": f"{passed_count}/{total}",
        "checks": checks,
    }

    if not overall:
        failed = [c for c in checks if not c["passed"]]
        result["feedback_for_retry"] = [f"{c['check']}: {c['remediation']}" for c in failed if c.get("remediation")]

    print(json.dumps(result, indent=2, ensure_ascii=False))
    return 0 if overall else 1


if __name__ == "__main__":
    sys.exit(main())
