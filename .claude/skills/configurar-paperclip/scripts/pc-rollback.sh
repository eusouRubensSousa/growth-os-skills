#!/usr/bin/env bash
# pc-rollback.sh — restaura o backup mais recente de um arquivo (.bak-YYYYMMDD-HHMMSS).
#
# Uso:
#   ./pc-rollback.sh /path/to/.paperclip.yaml
#   ./pc-rollback.sh /path/to/AGENTS.md
#
# Requer: PC_MODE, PC_HOST (se ssh-*), PC_OWNER

set -euo pipefail

SRC="${1:?uso: $0 <arquivo>}"
: "${PC_MODE:?defina PC_MODE}"

run_remote() {
  if [[ "$PC_MODE" == ssh-* ]]; then
    : "${PC_HOST:?PC_HOST vazio}"
    ssh "$PC_HOST" "$@"
  else
    eval "$@"
  fi
}

# Encontrar backup mais recente
LATEST=$(run_remote "ls -1t '${SRC}.bak-'* 2>/dev/null | head -1" || true)
if [ -z "$LATEST" ]; then
  echo "ERRO: nenhum backup encontrado para $SRC (padrão: ${SRC}.bak-*)" >&2
  exit 2
fi

echo "Backup mais recente: $LATEST"
echo "Restaurar para: $SRC?"
read -p "Confirmar (y/N): " CONF
if [ "$CONF" != "y" ] && [ "$CONF" != "Y" ]; then
  echo "Cancelado."; exit 0
fi

run_remote "cp -p '$LATEST' '$SRC'"
if [ -n "${PC_OWNER:-}" ] && [ "$PC_OWNER" != "0:0" ]; then
  run_remote "chown $PC_OWNER '$SRC'"
fi

echo "OK: $SRC restaurado de $LATEST"
echo "Próximo passo (se aplicável): ./pc-reload.sh import"
