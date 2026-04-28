#!/usr/bin/env python3
"""
pc-yaml-patch.py — Deep-merge de um snippet YAML dentro do .paperclip.yaml.

Uso:
  ./pc-yaml-patch.py /path/to/.paperclip.yaml ../snippets/paperclip-yaml-routing.yaml
  cat snippet.yaml | ./pc-yaml-patch.py /path/to/.paperclip.yaml -

Comportamento:
  - Carrega o YAML original (preserva ordem e comentários quando possível usando ruamel se disponível;
    fallback para PyYAML).
  - Deep-merge: dict mescla recursivo, listas substituem (com `__merge: append` no snippet
    força append na lista correspondente).
  - Remove chaves cujo nome começa com `_` (ex: `_comment`).
  - Escreve em <arquivo>.tmp e renomeia atomicamente.
  - Reaplica owner usando $PC_OWNER se variável presente e modo local-*.

Dependência:
  - ruamel.yaml (preferido) OU pyyaml.
  - Instalar: pip install ruamel.yaml   (ou: apt-get install python3-yaml)

Em ssh-*: este script roda LOCALMENTE editando uma cópia que precisa ter sido
sincronizada antes (pc-apply-patch.sh já cuida disso).
"""
from __future__ import annotations
import os
import sys
from pathlib import Path
from typing import Any

# Tentar ruamel primeiro (preserva comentários); cair pra pyyaml
USE_RUAMEL = False
try:
    from ruamel.yaml import YAML  # type: ignore
    _yaml = YAML(typ="rt")
    _yaml.preserve_quotes = True
    _yaml.indent(mapping=2, sequence=4, offset=2)
    USE_RUAMEL = True
except ImportError:
    try:
        import yaml  # type: ignore
    except ImportError:
        print("ERRO: precisa instalar ruamel.yaml (preferido) ou pyyaml.", file=sys.stderr)
        print("       pip install ruamel.yaml", file=sys.stderr)
        sys.exit(10)


def load_yaml(path_or_text, is_text=False):
    if USE_RUAMEL:
        if is_text:
            from io import StringIO
            return _yaml.load(StringIO(path_or_text))
        return _yaml.load(Path(path_or_text).read_text(encoding="utf-8"))
    else:
        if is_text:
            return yaml.safe_load(path_or_text)  # type: ignore[name-defined]
        return yaml.safe_load(Path(path_or_text).read_text(encoding="utf-8"))  # type: ignore[name-defined]


def dump_yaml(obj, path):
    tmp = path.with_suffix(path.suffix + ".tmp")
    if USE_RUAMEL:
        with tmp.open("w", encoding="utf-8") as f:
            _yaml.dump(obj, f)
    else:
        with tmp.open("w", encoding="utf-8") as f:
            yaml.safe_dump(obj, f, sort_keys=False, allow_unicode=True)  # type: ignore[name-defined]
    return tmp


def deep_merge(base: Any, patch: Any) -> Any:
    """Merge `patch` into `base`. Dicts merge recursively; lists replace by default."""
    if isinstance(base, dict) and isinstance(patch, dict):
        out = type(base)() if hasattr(base, "__class__") else {}
        try:
            out = base.copy()
        except Exception:
            out = dict(base)
        # opcional: append em listas se snippet pedir
        merge_mode = patch.pop("__merge", None) if isinstance(patch, dict) else None
        for k, v in patch.items():
            if isinstance(k, str) and k.startswith("_"):
                continue
            if k in out:
                if isinstance(out[k], list) and isinstance(v, list) and merge_mode == "append":
                    out[k] = list(out[k]) + list(v)
                else:
                    out[k] = deep_merge(out[k], v)
            else:
                out[k] = strip_underscored(v)
        return out
    return strip_underscored(patch)


def strip_underscored(obj: Any) -> Any:
    if isinstance(obj, dict):
        return {k: strip_underscored(v) for k, v in obj.items() if not (isinstance(k, str) and k.startswith("_"))}
    if isinstance(obj, list):
        return [strip_underscored(x) for x in obj]
    return obj


def main() -> int:
    if len(sys.argv) != 3:
        print(__doc__, file=sys.stderr)
        return 1

    cfg_path = Path(sys.argv[1]).resolve()
    snippet_arg = sys.argv[2]

    # Validar que cfg_path não escapa do diretório de trabalho
    cwd = Path.cwd().resolve()
    try:
        cfg_path.relative_to(cwd)
    except ValueError:
        print(f"ERRO: {cfg_path} está fora do diretório de trabalho.", file=sys.stderr)
        return 6

    if not cfg_path.exists():
        print(f"ERRO: {cfg_path} não existe.", file=sys.stderr)
        return 2

    if snippet_arg == "-":
        snippet_data = sys.stdin.read()
        snippet = load_yaml(snippet_data, is_text=True)
    else:
        snippet_path = Path(snippet_arg).resolve()
        try:
            snippet_path.relative_to(cwd)
        except ValueError:
            print(f"ERRO: {snippet_path} está fora do diretório de trabalho.", file=sys.stderr)
            return 6
        snippet = load_yaml(str(snippet_path))

    if snippet is None:
        snippet = {}

    try:
        base = load_yaml(cfg_path)
    except Exception as e:
        print(f"ERRO: .paperclip.yaml inválido: {e}", file=sys.stderr)
        print("DICA: rode pc-rollback.sh para reverter ao backup mais recente.", file=sys.stderr)
        return 4

    if base is None:
        base = {}

    merged = deep_merge(base, snippet)

    tmp = dump_yaml(merged, cfg_path)

    # Validar que YAML voltou parseável
    try:
        load_yaml(tmp)
    except Exception as e:
        print(f"ERRO interno: tmp inválido após merge: {e}", file=sys.stderr)
        tmp.unlink()
        return 5

    os.replace(tmp, cfg_path)

    # Reaplicar owner se PC_OWNER e modo local-*
    owner = os.environ.get("PC_OWNER", "")
    mode = os.environ.get("PC_MODE", "")
    if owner and mode.startswith("local-") and owner != "0:0":
        try:
            uid_str, gid_str = owner.split(":", 1)
            os.chown(cfg_path, int(uid_str), int(gid_str))
        except Exception as e:
            print(f"AVISO: não consegui reaplicar owner {owner}: {e}", file=sys.stderr)

    print(f"OK: patch aplicado em {cfg_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
