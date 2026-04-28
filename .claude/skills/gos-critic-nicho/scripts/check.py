#!/usr/bin/env python3
"""
gos-critic-nicho — Tool-grounded Critic for nicho mapping outputs.

Validates a niche workspace folder (nichos/{slug}/) against the
quality_gates declared in gos-mapear-nicho/SKILL.md:

  - Min 5 dores quantificadas em R$
  - Min 3 ICPs definidos
  - Mecanismo proprietário nomeado (3 candidatos)
  - Min 8 fontes públicas auditadas
  - Status: researching → mapped (todos arquivos 01-09 preenchidos, sem stubs)

Returns structured JSON report per check.

Usage:
    check.py <niche-slug> [--workspace-root .]
    check.py --niche-folder nichos/clinicas-derma-sp

Exit codes:
    0  — todos checks PASS (ready to set status=mapped)
    1  — algum check FAIL (degraded — Director pode retry)
    2  — niche folder não existe ou input inválido
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any


# Regex helpers
RE_VALOR_R_DOLAR = re.compile(r"R\$\s*[\d.,]+(?:[kKmM]| ?(?:mil|milhão|milhões|bi|bilhão|bilhões))?", re.IGNORECASE)
RE_PORCENT = re.compile(r"\d+(?:[.,]\d+)?\s*%")
RE_HEADER_DOR = re.compile(r"^##\s+DOR\s+#\d+", re.MULTILINE | re.IGNORECASE)
RE_HEADER_ICP = re.compile(r"^##\s+(?:ICP|Persona|Cliente alvo)\b", re.MULTILINE | re.IGNORECASE)
RE_TRADEMARK = re.compile(r"\b\w+(?:™|\(TM\))")
RE_MECANISMO_HEADER = re.compile(r"^#+\s+Mecanismo", re.MULTILINE | re.IGNORECASE)
RE_URL = re.compile(r"https?://[^\s\)]+")


def check_dores(dores_md: Path) -> dict:
    """02-dores.md — min 5 dores quantificadas em R$."""
    if not dores_md.exists():
        return {
            "check": "min 5 dores quantificadas em R$",
            "expected": ">=5",
            "actual": "0 (arquivo ausente)",
            "passed": False,
            "severity": "high",
            "remediation": "Rodar `/gos-mapear-nicho` pra gerar 02-dores.md",
        }
    text = dores_md.read_text(encoding="utf-8")
    # Headers DOR #N
    dores_count = len(RE_HEADER_DOR.findall(text))
    # Quantificação em R$
    rs_mentions = len(RE_VALOR_R_DOLAR.findall(text))

    passed = dores_count >= 5 and rs_mentions >= 5
    return {
        "check": "min 5 dores quantificadas em R$",
        "expected": ">=5 headers '## DOR #N' + >=5 menções R$",
        "actual": f"{dores_count} headers, {rs_mentions} menções R$",
        "passed": passed,
        "severity": "high" if not passed else "info",
        "remediation": (
            "Adicionar dores faltantes (cada uma com header '## DOR #N' e quantificação em R$)"
            if not passed else None
        ),
    }


def check_icps(perfil_md: Path) -> dict:
    """01-perfil-cliente-alvo.md — min 3 ICPs definidos."""
    if not perfil_md.exists():
        return {
            "check": "min 3 ICPs definidos",
            "expected": ">=3",
            "actual": "0 (arquivo ausente)",
            "passed": False,
            "severity": "high",
            "remediation": "Rodar `/gos-mapear-nicho` pra gerar 01-perfil-cliente-alvo.md",
        }
    text = perfil_md.read_text(encoding="utf-8")

    # Detect stub (still has placeholders OR file is too small)
    is_stub = bool(re.search(r"\{[A-Z][A-Z\-]+\}", text)) or len(text) < 800
    if is_stub:
        return {
            "check": "min 3 ICPs definidos",
            "expected": "3 ICPs com perfil/dor/canal",
            "actual": "stub (placeholders presentes ou arquivo muito curto)",
            "passed": False,
            "severity": "high",
            "remediation": "Preencher 01-perfil-cliente-alvo.md com 3 ICPs reais",
        }

    icp_count = len(RE_HEADER_ICP.findall(text))
    passed = icp_count >= 3

    return {
        "check": "min 3 ICPs definidos",
        "expected": ">=3 headers '## ICP' or '## Persona'",
        "actual": f"{icp_count} ICPs detectados",
        "passed": passed,
        "severity": "high" if not passed else "info",
        "remediation": (
            "Adicionar mais ICPs (cada um com header '## ICP N' contendo perfil + dor + canal)"
            if not passed else None
        ),
    }


def check_mecanismo(mecanismo_md: Path) -> dict:
    """03-mecanismo.md — mecanismo nomeado (3 candidatos com naming proprietário)."""
    if not mecanismo_md.exists():
        return {
            "check": "Mecanismo proprietário nomeado",
            "expected": "3 candidatos com naming",
            "actual": "0 (arquivo ausente)",
            "passed": False,
            "severity": "high",
            "remediation": "Rodar `/gos-mapear-nicho` pra gerar 03-mecanismo.md",
        }
    text = mecanismo_md.read_text(encoding="utf-8")

    is_stub = bool(re.search(r"\{[A-Z][A-Z\-]+\}", text)) or len(text) < 600
    if is_stub:
        return {
            "check": "Mecanismo proprietário nomeado",
            "expected": "3 candidatos com naming + 5 partes do mecanismo",
            "actual": "stub (placeholders presentes ou arquivo muito curto)",
            "passed": False,
            "severity": "high",
            "remediation": "Preencher 03-mecanismo.md com 3 nomes (Acrônimo/Trademark) e justificativa",
        }

    trademarks = RE_TRADEMARK.findall(text)
    has_mechanism_header = bool(RE_MECANISMO_HEADER.search(text))
    # Need at least 3 candidate names (could be trademark, acronym, or all-caps proprietary)
    candidate_names = re.findall(r"\b[A-Z]{3,}(?:\.[A-Z]{1,3})*\b", text)
    name_candidates_unique = set(candidate_names)

    passed = (
        len(trademarks) >= 1 or len(name_candidates_unique) >= 3
    ) and has_mechanism_header

    return {
        "check": "Mecanismo proprietário nomeado",
        "expected": ">=1 nome com ™ OU >=3 candidatos all-caps + header '# Mecanismo'",
        "actual": f"{len(trademarks)} trademarks, {len(name_candidates_unique)} candidatos all-caps, header={has_mechanism_header}",
        "passed": passed,
        "severity": "high" if not passed else "info",
        "remediation": (
            "Nomear mecanismo: criar 3 candidatos (acrônimo ou trademark) + escolher 1 + justificar"
            if not passed else None
        ),
    }


def check_fontes(folder: Path) -> dict:
    """All files (especially 08-fontes + 02-dores + 00-validacao) — min 8 URLs únicas."""
    files_to_scan = [
        folder / "00-validacao.md",
        folder / "02-dores.md",
        folder / "08-fontes.md",
        folder / "_index.md",
    ]
    urls = set()
    for f in files_to_scan:
        if f.exists():
            urls.update(RE_URL.findall(f.read_text(encoding="utf-8")))

    # Filter out commonly-templated URLs (accelera360.com.br, yayforms.link)
    accelera_urls = {u for u in urls if "accelera360" in u or "yayforms" in u}
    real_urls = urls - accelera_urls

    passed = len(real_urls) >= 8
    return {
        "check": "min 8 fontes públicas auditadas",
        "expected": ">=8 URLs únicas (excluindo accelera360.com.br/yayforms.link)",
        "actual": f"{len(real_urls)} URLs únicas reais",
        "passed": passed,
        "severity": "medium" if not passed else "info",
        "remediation": (
            f"Adicionar {8 - len(real_urls)} fonte(s) extra com URL público em 02-dores ou 08-fontes"
            if not passed else None
        ),
    }


def check_no_stubs(folder: Path) -> dict:
    """Todos arquivos 01-09 preenchidos (sem placeholders {NOME-NICHO}, etc.)."""
    files_to_check = [folder / f"{i:02d}-*.md" for i in range(1, 10)]
    stubs = []
    for pattern in files_to_check:
        matches = list(folder.glob(pattern.name))
        for m in matches:
            text = m.read_text(encoding="utf-8")
            if re.search(r"\{[A-Z][A-Z\-]+\}", text):
                stubs.append(m.name)
            elif len(text) < 400:
                stubs.append(f"{m.name} (curto)")

    passed = len(stubs) == 0
    return {
        "check": "Todos arquivos 01-09 preenchidos (sem stubs/placeholders)",
        "expected": "9 arquivos completos",
        "actual": f"{9 - len(stubs)} preenchidos, {len(stubs)} stubs/curtos",
        "passed": passed,
        "severity": "high" if not passed else "info",
        "remediation": (
            f"Preencher: {', '.join(stubs)}" if stubs else None
        ),
        "stubs": stubs if stubs else None,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Critic for niche mapping outputs.")
    parser.add_argument("slug", nargs="?", help="Niche slug (e.g., 'clinicas-derma-sp')")
    parser.add_argument("--niche-folder", help="Direct path to niche folder")
    parser.add_argument("--workspace-root", default=".", help="Workspace root (default: cwd)")
    args = parser.parse_args()

    if args.niche_folder:
        folder = Path(args.niche_folder).resolve()
    elif args.slug:
        folder = Path(args.workspace_root).resolve() / "nichos" / args.slug
    else:
        print("ERROR: precisa de slug ou --niche-folder", file=sys.stderr)
        return 2

    if not folder.exists() or not folder.is_dir():
        print(json.dumps({
            "status": "ERROR",
            "error": f"folder não existe: {folder}",
        }, indent=2, ensure_ascii=False))
        return 2

    # Run all checks
    checks = [
        check_dores(folder / "02-dores.md"),
        check_icps(folder / "01-perfil-cliente-alvo.md"),
        check_mecanismo(folder / "03-mecanismo.md"),
        check_fontes(folder),
        check_no_stubs(folder),
    ]

    passed_count = sum(1 for c in checks if c["passed"])
    total = len(checks)
    overall_pass = passed_count == total

    result = {
        "critic": "gos-critic-nicho",
        "target": str(folder.relative_to(Path.cwd()) if folder.is_relative_to(Path.cwd()) else folder),
        "status": "PASS" if overall_pass else "FAIL",
        "passed": f"{passed_count}/{total}",
        "checks": checks,
    }

    if not overall_pass:
        # Build feedback for retry
        failed = [c for c in checks if not c["passed"]]
        result["feedback_for_retry"] = [
            f"{c['check']}: {c['remediation']}"
            for c in failed
            if c.get("remediation")
        ]

    print(json.dumps(result, indent=2, ensure_ascii=False))
    return 0 if overall_pass else 1


if __name__ == "__main__":
    sys.exit(main())
