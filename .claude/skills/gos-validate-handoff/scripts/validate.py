#!/usr/bin/env python3
"""
gos-validate-handoff — Boundary validator.

Reads handoff_in schema declared in target SKILL.md frontmatter and validates
a payload (JSON or YAML) against it. Returns OK or BLOCKED with structured
remediation.

Usage:
    validate.py <target_skill> <payload_file>
    validate.py <target_skill> --payload-json '{"slug":"foo","mode":"oferta"}'
    validate.py <target_skill> --payload-yaml 'slug: foo
mode: oferta'

Required deps: PyYAML (in stdlib via 'yaml' is NOT stdlib — fallback parses
naively if PyYAML missing).

Exit codes:
    0  — OK (ready_to_invoke=true)
    1  — BLOCKED (missing required fields or invalid paths)
    2  — invalid args / could not read SKILL.md
    3  — invalid YAML in SKILL.md frontmatter
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from pathlib import Path
from typing import Any

# ---------- YAML parsing (PyYAML preferred, fallback for required fields) ----------

try:
    import yaml  # type: ignore
    HAS_YAML = True
except ImportError:
    HAS_YAML = False


def parse_yaml_naive(text: str) -> dict:
    """Very-naive YAML parser for the subset we need (keys, lists, nested dicts).
    Only used as fallback when PyYAML is missing."""
    result: dict = {}
    stack: list[tuple[int, dict | list]] = [(0, result)]
    lines = text.splitlines()

    for raw in lines:
        if not raw.strip() or raw.lstrip().startswith("#"):
            continue
        indent = len(raw) - len(raw.lstrip())
        line = raw.lstrip()

        # pop stack to current indent
        while stack and stack[-1][0] > indent:
            stack.pop()

        parent = stack[-1][1] if stack else result

        if line.startswith("- "):
            value = line[2:].strip()
            if isinstance(parent, list):
                parent.append(_strip_quotes(value))
            continue

        if ":" in line:
            key, _, value = line.partition(":")
            key = key.strip()
            value = value.strip()
            if not value:
                # Could be dict or list — peek next non-empty line indent
                container: Any = {}
                if isinstance(parent, dict):
                    parent[key] = container
                stack.append((indent + 2, container))
            else:
                if isinstance(parent, dict):
                    parent[key] = _strip_quotes(value)

    return result


def _strip_quotes(s: str) -> Any:
    s = s.strip()
    if s.startswith('"') and s.endswith('"'):
        return s[1:-1]
    if s.startswith("'") and s.endswith("'"):
        return s[1:-1]
    if s.lower() == "true":
        return True
    if s.lower() == "false":
        return False
    if s.lower() in ("null", "none", "~"):
        return None
    try:
        return int(s)
    except ValueError:
        pass
    try:
        return float(s)
    except ValueError:
        pass
    return s


def parse_yaml(text: str) -> dict:
    if HAS_YAML:
        try:
            return yaml.safe_load(text) or {}
        except yaml.YAMLError as e:
            raise ValueError(f"invalid YAML: {e}") from e
    return parse_yaml_naive(text)


# ---------- SKILL.md frontmatter extraction ----------

def extract_frontmatter(skill_md_path: Path) -> dict:
    """Parse YAML frontmatter from a SKILL.md file."""
    try:
        text = skill_md_path.read_text(encoding="utf-8")
    except FileNotFoundError:
        raise FileNotFoundError(f"SKILL.md not found: {skill_md_path}") from None

    match = re.match(r"^---\n(.*?)\n---\n", text, re.DOTALL)
    if not match:
        raise ValueError(f"no frontmatter found in {skill_md_path}")
    return parse_yaml(match.group(1))


# ---------- Validation logic ----------

def validate_payload(
    schema: dict,
    payload: dict,
    workspace_root: Path | None = None,
    strict: bool = False,
) -> dict:
    """Compare payload against schema. Return validation result dict."""
    handoff_in = schema.get("handoff_in") or {}
    required = handoff_in.get("required") or {}
    optional = handoff_in.get("optional") or {}

    if not isinstance(required, dict):
        required = {}
    if not isinstance(optional, dict):
        optional = {}

    missing_fields: list[dict] = []
    extra_fields: list[str] = []
    path_check: list[dict] = []

    # 1. Check required fields
    for key, desc in required.items():
        if key not in payload or payload[key] in (None, ""):
            missing_fields.append({"field": key, "description": desc})

    # 2. Check extras (only if strict mode)
    if strict:
        known = set(required.keys()) | set(optional.keys())
        for key in payload:
            if key not in known:
                extra_fields.append(key)

    # 3. Path existence check (heuristic: any string value that looks like a relative path
    #    of a file declared in required/optional with .md, .json, .html, .yaml extension)
    if workspace_root:
        for key, value in payload.items():
            if not isinstance(value, str):
                continue
            if not re.match(r"^[\w./_-]+\.(md|json|html|yaml|yml|ndjson)$", value):
                continue
            full = workspace_root / value
            path_check.append({
                "field": key,
                "path": value,
                "exists": full.exists(),
            })

    paths_validated = sum(1 for p in path_check if p["exists"])
    paths_total = len(path_check)

    blocked = bool(missing_fields) or any(not p["exists"] for p in path_check) or (strict and extra_fields)

    result = {
        "status": "BLOCKED" if blocked else "OK",
        "target": schema.get("name", "unknown"),
        "required_fields_present": f"{len(required) - len(missing_fields)}/{len(required)}",
        "optional_fields_present": f"{sum(1 for k in optional if k in payload)}/{len(optional)}",
        "ready_to_invoke": not blocked,
    }

    if missing_fields:
        result["missing_fields"] = missing_fields
    if extra_fields:
        result["extra_fields"] = extra_fields
    if path_check:
        result["paths_validated"] = f"{paths_validated}/{paths_total}"
        result["path_check"] = path_check

    if blocked:
        remediation = []
        for mf in missing_fields:
            remediation.append(f"Adicionar '{mf['field']}' ao payload — {mf['description']}")
        for pc in path_check:
            if not pc["exists"]:
                remediation.append(
                    f"Path '{pc['path']}' (campo '{pc['field']}') não existe — "
                    "rodar a skill anterior que produz esse arquivo"
                )
        if extra_fields:
            remediation.append(
                f"Remover campos não declarados (strict mode): {', '.join(extra_fields)}"
            )
        result["remediation"] = remediation

    return result


# ---------- CLI ----------

def find_skill_md(target_skill: str, repo_root: Path) -> Path:
    """Find .claude/skills/<target_skill>/SKILL.md."""
    skill_path = repo_root / ".claude" / "skills" / target_skill / "SKILL.md"
    if not skill_path.exists():
        raise FileNotFoundError(
            f"Skill '{target_skill}' não encontrada em {skill_path}. "
            f"Skills disponíveis: {sorted(d.name for d in (repo_root / '.claude' / 'skills').iterdir() if d.is_dir() and not d.name.startswith('_'))}"
        )
    return skill_path


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate handoff payload against target skill schema.")
    parser.add_argument("target_skill", help="Target skill name (e.g., 'gos-lp-builder')")
    parser.add_argument("payload", nargs="?", help="Path to payload file (.json or .yaml)")
    parser.add_argument("--payload-json", help="Inline JSON payload")
    parser.add_argument("--payload-yaml", help="Inline YAML payload")
    parser.add_argument("--strict", action="store_true", help="Reject extra fields not in schema")
    parser.add_argument("--workspace-root", default=".", help="Workspace root for path checks (default: cwd)")
    parser.add_argument("--repo-root", default=None, help="Repo root with .claude/skills/ (default: auto-detect)")
    args = parser.parse_args()

    # Auto-detect repo root: walk up from cwd until .claude/skills/ found
    repo_root: Path
    if args.repo_root:
        repo_root = Path(args.repo_root)
    else:
        cur = Path.cwd()
        repo_root = cur
        while cur != cur.parent:
            if (cur / ".claude" / "skills").is_dir():
                repo_root = cur
                break
            cur = cur.parent
        else:
            print("ERROR: .claude/skills/ não encontrado walking up do cwd", file=sys.stderr)
            return 2

    workspace_root = Path(args.workspace_root).resolve()

    # Load payload
    payload_text: str | None = None
    payload_format: str | None = None
    if args.payload_json is not None:
        payload_text = args.payload_json
        payload_format = "json"
    elif args.payload_yaml is not None:
        payload_text = args.payload_yaml
        payload_format = "yaml"
    elif args.payload:
        payload_text = Path(args.payload).read_text(encoding="utf-8")
        payload_format = "yaml" if args.payload.endswith((".yaml", ".yml")) else "json"
    else:
        print("ERROR: precisa de payload via arg, --payload-json ou --payload-yaml", file=sys.stderr)
        return 2

    try:
        if payload_format == "json":
            payload = json.loads(payload_text or "{}")
        else:
            payload = parse_yaml(payload_text or "")
    except (json.JSONDecodeError, ValueError) as e:
        print(f"ERROR: payload inválido: {e}", file=sys.stderr)
        return 2

    if not isinstance(payload, dict):
        print(f"ERROR: payload deve ser objeto/dict, recebido {type(payload).__name__}", file=sys.stderr)
        return 2

    # Find skill, parse schema
    try:
        skill_path = find_skill_md(args.target_skill, repo_root)
        schema = extract_frontmatter(skill_path)
    except FileNotFoundError as e:
        print(f"ERROR: {e}", file=sys.stderr)
        return 2
    except ValueError as e:
        print(f"ERROR: {e}", file=sys.stderr)
        return 3

    # Validate
    result = validate_payload(schema, payload, workspace_root=workspace_root, strict=args.strict)

    # Output JSON
    print(json.dumps(result, indent=2, ensure_ascii=False))

    return 0 if result["status"] == "OK" else 1


if __name__ == "__main__":
    sys.exit(main())
