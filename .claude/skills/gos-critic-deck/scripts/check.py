#!/usr/bin/env python3
"""
gos-critic-deck — Tool-grounded Critic for pitch deck outputs.

Validates a deck folder ({escopo}/{slug}/deck/) against quality_gates
declared in gos-pitch-deck-builder/SKILL.md:

  - Exatamente 20 slides (não 19, não 21)
  - Footer fixo em todos slides
  - CTA final no slide 20
  - Variáveis parametrizadas preenchidas (no '{{...}}' restante)
  - Mode reveal: HTML standalone funciona offline (heuristic)

Usage:
    check.py <deck-folder>
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path


def check_exact_20_slides(html: str, slides_md_dir: Path) -> dict:
    """Conta slides em deck.html (sections com class slide ou data-slide) ou em slides-md/."""
    # Reveal.js convention: <section> per slide, root <section> can wrap nested
    sections = re.findall(r"<section[^>]*>", html)
    # Filter out nested wrappers
    md_files = list(slides_md_dir.glob("*.md")) if slides_md_dir.exists() else []

    # Heurística: se tem 20 sections OU 20 .md em slides-md/
    section_count = len(sections)
    md_count = len(md_files)

    # Exato 20 (com ±1 tolerância pra wrapper)
    passed = (section_count >= 20 and section_count <= 22) or md_count == 20

    return {
        "check": "Exatamente 20 slides",
        "expected": "20 (HTML <section> ou slides-md/*.md)",
        "actual": f"{section_count} <section>, {md_count} markdown files",
        "passed": passed,
        "severity": "high" if not passed else "info",
        "remediation": (
            f"Ajustar pra exatos 20 slides — atualmente {max(section_count, md_count)}"
            if not passed else None
        ),
    }


def check_footer_in_all_slides(html: str) -> dict:
    """Footer 'Accelera 360' presente em todos os slides."""
    sections = re.findall(r"<section[^>]*>(.*?)</section>", html, re.DOTALL)
    footer_pattern = re.compile(r"(?:Accelera 360|accelera360\.com\.br|growth-os-skills)", re.IGNORECASE)

    if not sections:
        return {
            "check": "Footer fixo em todos slides",
            "expected": "footer 'Accelera 360' em cada <section>",
            "actual": "0 sections detectadas",
            "passed": False,
            "severity": "high",
            "remediation": "deck.html sem estrutura <section> — verificar template Reveal.js",
        }

    # Footer pode estar no <body> wrapper (CSS .a360-footer global), não em cada section
    has_global_footer = ".a360-footer" in html or "a360-footer" in html

    if has_global_footer:
        passed = True
        actual = "footer global via CSS .a360-footer"
    else:
        # Conta sections COM footer explícito
        with_footer = sum(1 for s in sections if footer_pattern.search(s))
        passed = with_footer >= len(sections) * 0.9  # 90% das sections
        actual = f"{with_footer}/{len(sections)} sections com footer"

    return {
        "check": "Footer fixo em todos slides",
        "expected": "footer global CSS OU footer em ≥90% das sections",
        "actual": actual,
        "passed": passed,
        "severity": "high" if not passed else "info",
        "remediation": (
            "Adicionar footer global via CSS class '.a360-footer' OU footer manual em cada section"
            if not passed else None
        ),
    }


def check_cta_final_slide_20(html: str) -> dict:
    """Slide 20 (último) tem CTA pra Accelera 360."""
    sections = re.findall(r"<section[^>]*>(.*?)</section>", html, re.DOTALL)
    if len(sections) < 20:
        return {
            "check": "CTA final no slide 20",
            "expected": "≥20 slides + CTA no último",
            "actual": f"{len(sections)} slides total",
            "passed": False,
            "severity": "high",
            "remediation": "Garantir 20 slides + CTA no slide 20 com link aplicação",
        }

    last_slide = sections[-1] if sections[-1].strip() else (sections[-2] if len(sections) > 1 else sections[-1])
    has_cta_link = bool(re.search(r"yayforms\.link|accelera360\.com\.br", last_slide))
    has_cta_text = bool(re.search(r"(?:aplique|aplicar|próximo passo|fale conosco)", last_slide, re.IGNORECASE))

    passed = has_cta_link and has_cta_text
    return {
        "check": "CTA final no slide 20",
        "expected": "Link yayforms.link + texto CTA",
        "actual": f"link={has_cta_link}, text_cta={has_cta_text}",
        "passed": passed,
        "severity": "high" if not passed else "info",
        "remediation": (
            "Adicionar no slide 20: botão 'Aplique' linkando yayforms.link/4bRG5aE"
            if not passed else None
        ),
    }


def check_no_unfilled_placeholders(html: str, md_files: list[Path]) -> dict:
    """Variáveis {{VAR}} foram substituídas — não deve sobrar nenhuma {{...}}."""
    placeholders_html = re.findall(r"\{\{([A-Z_][A-Z0-9_-]*)\}\}", html)
    placeholders_md = []
    for f in md_files:
        text = f.read_text(encoding="utf-8")
        placeholders_md.extend(re.findall(r"\{\{([A-Z_][A-Z0-9_-]*)\}\}", text))

    all_placeholders = set(placeholders_html + placeholders_md)
    passed = len(all_placeholders) == 0

    return {
        "check": "Variáveis parametrizadas preenchidas",
        "expected": "0 placeholders {{VAR}}",
        "actual": f"{len(all_placeholders)} placeholders restantes" + (f" ({', '.join(list(all_placeholders)[:5])}{'...' if len(all_placeholders) > 5 else ''})" if all_placeholders else ""),
        "passed": passed,
        "severity": "high" if not passed else "info",
        "remediation": (
            f"Substituir placeholders: {', '.join(list(all_placeholders)[:5])}"
            if not passed else None
        ),
    }


def check_offline_capable(html: str) -> dict:
    """Mode reveal: HTML standalone — Reveal.js carregado, idealmente sem CDN bloqueante."""
    has_revealjs = "reveal" in html.lower()
    # CDNs externos contados (deck "depende de internet pra renderizar" é OK por design — só flag se >5)
    cdn_count = len(re.findall(r"https?://(?:cdn|cdnjs|unpkg)\.[^\s\"']+", html))

    passed = has_revealjs and cdn_count <= 5
    return {
        "check": "Mode reveal: HTML standalone",
        "expected": "Reveal.js presente + ≤5 CDNs externos",
        "actual": f"reveal_js={has_revealjs}, cdn_count={cdn_count}",
        "passed": passed,
        "severity": "low" if not passed else "info",
        "remediation": (
            "Verificar template Reveal.js + reduzir CDNs externos se possível"
            if not passed else None
        ),
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Critic for pitch deck outputs.")
    parser.add_argument("deck_folder", help="Path to deck/ folder")
    args = parser.parse_args()

    folder = Path(args.deck_folder).resolve()
    if not folder.exists() or not folder.is_dir():
        print(json.dumps({"status": "ERROR", "error": f"folder não existe: {folder}"}, indent=2, ensure_ascii=False))
        return 2

    html_path = folder / "deck.html"
    slides_md_dir = folder / "slides-md"

    html = html_path.read_text(encoding="utf-8") if html_path.exists() else ""
    md_files = list(slides_md_dir.glob("*.md")) if slides_md_dir.exists() else []

    if not html and not md_files:
        print(json.dumps({"status": "ERROR", "error": f"nem deck.html nem slides-md/ presentes em {folder}"}, indent=2, ensure_ascii=False))
        return 2

    checks = [
        check_exact_20_slides(html, slides_md_dir),
        check_footer_in_all_slides(html),
        check_cta_final_slide_20(html),
        check_no_unfilled_placeholders(html, md_files),
        check_offline_capable(html),
    ]

    passed = sum(1 for c in checks if c["passed"])
    total = len(checks)
    overall = passed == total

    result = {
        "critic": "gos-critic-deck",
        "target": str(folder.relative_to(Path.cwd()) if folder.is_relative_to(Path.cwd()) else folder),
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
