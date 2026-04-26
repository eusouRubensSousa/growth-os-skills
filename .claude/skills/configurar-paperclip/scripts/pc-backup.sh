#!/usr/bin/env bash
# pc-backup.sh — gera backup datado de arquivos editados pela skill.
#
# Requer:
#   PC_MODE, PC_HOST (se ssh-*)
#
# Uso:
#   ./pc-backup.sh /path/to/.paperclip.yaml
#   ./pc-backup.sh /path/to/agents/ceo/AGENTS.md
#   ./pc-backup.sh /path/to/COMPANY.md
#   ./pc-backup.sh dir /path/to/company-pkg     # backup do package inteiro como tar.gz
#
# Saída: imprime o caminho do backup gerado.

set -euo pipefail

if [ $# -lt 1 ]; then
  echo "uso: $0 [dir] <caminho>" >&2
  exit 1
fi

MODE_FLAG="file"
if [ "$1" = "dir" ]; then
  MODE_FLAG="dir"; shift
fi

SRC="${1:?caminho vazio}"
TS=$(date +%Y%m%d-%H%M%S)
: "${PC_MODE:?defina PC_MODE}"

run_remote() {
  if [[ "$PC_MODE" == ssh-* ]]; then
    : "${PC_HOST:?PC_HOST vazio}"
    ssh "$PC_HOST" "$@"
  else
    eval "$@"
  fi
}

if [ "$MODE_FLAG" = "file" ]; then
  DST="$SRC.bak-$TS"
  run_remote "test -f '$SRC' && cp -p '$SRC' '$DST' && echo '$DST'" || {
    echo "ERRO: arquivo não existe: $SRC" >&2; exit 2
  }
else
  # tar.gz do diretório inteiro (.paperclip.yaml + COMPANY.md + agents/ + ...)
  PARENT=$(dirname "$SRC")
  BASE=$(basename "$SRC")
  DST="$PARENT/${BASE}.bak-${TS}.tar.gz"
  run_remote "test -d '$SRC' && tar -C '$PARENT' -czf '$DST' '$BASE' && echo '$DST'" || {
    echo "ERRO: diretório não existe: $SRC" >&2; exit 2
  }
fi
