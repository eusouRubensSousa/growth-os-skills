#!/usr/bin/env python3
"""
gos-eval — Golden test runner for growth-os-skills tooling.

Reads tests/*.eval.json fixture files and runs each test case against
the corresponding tool/script. Compares output against assertions.

For deterministic tooling only (validate.py, critic check.py scripts,
gos-log, gos-reflect, gos-status-aggregate). Does NOT run LLM skills
(those are smoke-tested manually).

Fixture format (tests/{component}.eval.json):
{
    "component": "gos-validate-handoff",
    "script": ".claude/skills/gos-validate-handoff/scripts/validate.py",
    "tests": [
        {
            "name": "OK case — valid payload pra mapear-nicho",
            "args": ["gos-mapear-nicho", "--payload-json", "{...}"],
            "expected_exit": 0,
            "expected_status": "OK",
            "expected_contains": ["ready_to_invoke"],
            "expected_not_contains": ["BLOCKED"]
        },
        ...
    ]
}

Usage:
    eval.py [--filter component_name] [--workspace tests/] [--repo-root .]

Exit codes:
    0 — todos passes
    1 — algum failure
    2 — erro de configuração (fixture inválido, script ausente)
"""

from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
from pathlib import Path
from typing import Any


def load_fixtures(tests_dir: Path) -> list[dict]:
    """Load all *.eval.json files from tests/."""
    fixtures = []
    if not tests_dir.exists():
        return fixtures
    for f in sorted(tests_dir.glob("*.eval.json")):
        try:
            data = json.loads(f.read_text(encoding="utf-8"))
            data["_fixture_file"] = str(f.relative_to(tests_dir.parent))
            fixtures.append(data)
        except json.JSONDecodeError as e:
            print(f"⚠️  fixture {f} inválida: {e}", file=sys.stderr)
    return fixtures


def run_test(script_path: Path, test: dict, repo_root: Path) -> dict:
    """Execute single test case. Return result dict."""
    name = test.get("name", "(sem nome)")
    args = test.get("args", [])
    cwd = test.get("cwd", str(repo_root))

    cmd = [str(script_path)] + args

    try:
        result = subprocess.run(
            cmd,
            cwd=cwd,
            capture_output=True,
            text=True,
            timeout=10,
        )
    except subprocess.TimeoutExpired:
        return {
            "name": name,
            "status": "ERROR",
            "reason": "timeout (10s)",
            "passed": False,
        }
    except FileNotFoundError:
        return {
            "name": name,
            "status": "ERROR",
            "reason": f"script não encontrado: {script_path}",
            "passed": False,
        }

    failures = []

    # Check exit code
    expected_exit = test.get("expected_exit")
    if expected_exit is not None and result.returncode != expected_exit:
        failures.append(f"exit_code: expected {expected_exit}, got {result.returncode}")

    # Check stdout contains
    stdout = result.stdout
    expected_contains = test.get("expected_contains", [])
    for needle in expected_contains:
        if needle not in stdout:
            failures.append(f"stdout missing expected: '{needle}'")

    # Check stdout NOT contains
    expected_not_contains = test.get("expected_not_contains", [])
    for needle in expected_not_contains:
        if needle in stdout:
            failures.append(f"stdout has unwanted: '{needle}'")

    # Check JSON status field (if expected_status defined)
    expected_status = test.get("expected_status")
    if expected_status is not None:
        try:
            stdout_json = json.loads(stdout)
            actual_status = stdout_json.get("status")
            if actual_status != expected_status:
                failures.append(f"json.status: expected '{expected_status}', got '{actual_status}'")
        except (json.JSONDecodeError, AttributeError):
            failures.append(f"stdout não é JSON parseável (esperava status='{expected_status}')")

    return {
        "name": name,
        "status": "PASS" if not failures else "FAIL",
        "passed": not failures,
        "failures": failures if failures else None,
        "exit_code": result.returncode,
        "stderr_preview": result.stderr[:200] if result.stderr else None,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Golden test runner for gos-* tooling.")
    parser.add_argument("--filter", default=None, help="Run only fixtures matching this component name")
    parser.add_argument("--tests-dir", default="tests", help="Tests directory (default: tests/)")
    parser.add_argument("--repo-root", default=None, help="Repo root (default: auto-detect)")
    parser.add_argument("--verbose", "-v", action="store_true", help="Verbose output (show stderr previews)")
    args = parser.parse_args()

    # Auto-detect repo root
    if args.repo_root:
        repo_root = Path(args.repo_root).resolve()
    else:
        cur = Path.cwd()
        repo_root = cur
        while cur != cur.parent:
            if (cur / ".claude" / "skills").is_dir() and (cur / "tests").is_dir():
                repo_root = cur
                break
            if (cur / ".claude" / "skills").is_dir():
                repo_root = cur
            cur = cur.parent

    tests_dir = repo_root / args.tests_dir
    fixtures = load_fixtures(tests_dir)

    if not fixtures:
        print(json.dumps({
            "status": "ERROR",
            "error": f"nenhum fixture encontrado em {tests_dir}",
        }, indent=2, ensure_ascii=False))
        return 2

    if args.filter:
        fixtures = [f for f in fixtures if args.filter in f.get("component", "")]

    total_pass = 0
    total_fail = 0
    components_summary = []

    for fixture in fixtures:
        component = fixture.get("component", "?")
        script_rel = fixture.get("script", "")
        script_path = (repo_root / script_rel).resolve()

        if not script_path.exists():
            components_summary.append({
                "component": component,
                "status": "ERROR",
                "reason": f"script não existe: {script_rel}",
                "tests_run": 0,
            })
            total_fail += 1
            continue

        tests = fixture.get("tests", [])
        comp_pass = 0
        comp_fail = 0
        comp_results = []
        for test in tests:
            result = run_test(script_path, test, repo_root)
            comp_results.append(result)
            if result["passed"]:
                comp_pass += 1
            else:
                comp_fail += 1

        total_pass += comp_pass
        total_fail += comp_fail
        components_summary.append({
            "component": component,
            "passed": f"{comp_pass}/{len(tests)}",
            "tests": comp_results,
        })

    overall = {
        "status": "PASS" if total_fail == 0 else "FAIL",
        "total_passed": total_pass,
        "total_failed": total_fail,
        "components": components_summary,
    }

    print(json.dumps(overall, indent=2, ensure_ascii=False))
    return 0 if total_fail == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
