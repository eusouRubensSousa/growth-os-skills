#!/usr/bin/env bash
# pc-apply-patch.sh — high-level wrapper que aplica um snippet YAML em $PC_COMPANY_DIR/.paperclip.yaml,
# cobrindo os 4 modos. Faz: backup → fetch (se ssh) → patch → push → chown → re-import (opcional).
#
# Uso:
#   ./pc-apply-patch.sh ../snippets/paperclip-yaml-routing.yaml
#   ./pc-apply-patch.sh ../snippets/paperclip-yaml-routing.yaml --import
#
# Requer:
#   PC_MODE, PC_HOST (se ssh-*), PC_COMPANY_DIR, PC_OWNER, PC_COMPANY_ID (se --import)

set -euo pipefail

SNIPPET="${1:?uso: $0 <snippet.yaml> [--import]}"
DO_IMPORT="${2:-}"
[ -f "$SNIPPET" ] || { echo "Snippet não encontrado: $SNIPPET" >&2; exit 1; }

: "${PC_MODE:?defina PC_MODE}"
: "${PC_COMPANY_DIR:?defina PC_COMPANY_DIR (caminho do package — pasta com COMPANY.md)}"

YAML_PATH="$PC_COMPANY_DIR/.paperclip.yaml"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
YAMLPATCH="$SCRIPT_DIR/pc-yaml-patch.py"
BACKUP="$SCRIPT_DIR/pc-backup.sh"
WRAP="$SCRIPT_DIR/pc-wrap.sh"

# 1. Backup do arquivo (ou criar arquivo vazio se não existe)
case "$PC_MODE" in
  local-*)
    if [ ! -f "$YAML_PATH" ]; then
      echo "schema: paperclip/v1" > "$YAML_PATH"
      echo "(criado .paperclip.yaml vazio em $YAML_PATH)"
    fi
    "$BACKUP" "$YAML_PATH"
    python3 "$YAMLPATCH" "$YAML_PATH" "$SNIPPET"
    ;;
  ssh-*)
    : "${PC_HOST:?PC_HOST vazio}"
    # garantir que arquivo existe remotamente
    ssh "$PC_HOST" "test -f '$YAML_PATH' || echo 'schema: paperclip/v1' > '$YAML_PATH'"
    "$BACKUP" "$YAML_PATH"

    TMP_LOCAL="$(mktemp /tmp/paperclip.XXXXXX.yaml)"
    trap "rm -f $TMP_LOCAL" EXIT

    scp -q "$PC_HOST:$YAML_PATH" "$TMP_LOCAL"

    # patch sem chown local
    PC_MODE_ORIG="$PC_MODE"; unset PC_MODE
    python3 "$YAMLPATCH" "$TMP_LOCAL" "$SNIPPET"
    export PC_MODE="$PC_MODE_ORIG"

    scp -q "$TMP_LOCAL" "$PC_HOST:$YAML_PATH"
    if [ -n "${PC_OWNER:-}" ] && [ "$PC_OWNER" != "0:0" ]; then
      ssh "$PC_HOST" "chown $PC_OWNER '$YAML_PATH'"
    fi
    ;;
esac

echo "Patch aplicado em $YAML_PATH"

# 2. Re-import opcional
if [ "$DO_IMPORT" = "--import" ]; then
  : "${PC_COMPANY_ID:?--import requer PC_COMPANY_ID}"
  echo "Re-importando company $PC_COMPANY_ID..."
  "$WRAP" "company import '$PC_COMPANY_DIR' --company-id '$PC_COMPANY_ID' --dry-run"
  read -p "Aplicar de verdade? (y/N) " CONF
  if [ "$CONF" = "y" ] || [ "$CONF" = "Y" ]; then
    "$WRAP" "company import '$PC_COMPANY_DIR' --company-id '$PC_COMPANY_ID'"
    echo "Import aplicado."
  else
    echo "Import cancelado (dry-run continua válido — mudança no markdown já está salva)."
  fi
else
  echo "Próximo passo (manual): ./pc-wrap.sh \"company import $PC_COMPANY_DIR --company-id $PC_COMPANY_ID --dry-run\""
fi
