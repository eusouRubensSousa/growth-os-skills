#!/usr/bin/env bash
# pc-wrap.sh — wrapper unificado para chamar o CLI paperclipai em qualquer modo.
#
# Requer estas variáveis (vindas de pc-target-detect.sh):
#   PC_MODE       (local-native | local-docker | ssh-native | ssh-docker)
#   PC_HOST       (vazio se local; user@host se SSH)
#   PC_CONTAINER  (vazio se native)
#   PC_CLI_NAME   (paperclipai | npx paperclipai | paperclip)
#
# Uso:
#   ./pc-wrap.sh "doctor"
#   ./pc-wrap.sh "doctor --repair"
#   ./pc-wrap.sh "env"
#   ./pc-wrap.sh "company export $PC_COMPANY_ID --out /tmp/co"
#   ./pc-wrap.sh "agent list --company-id $PC_COMPANY_ID"
#   ./pc-wrap.sh "heartbeat run --agent-id <id>"
#   ./pc-wrap.sh "dashboard get --company-id $PC_COMPANY_ID"

set -euo pipefail

CMD="${*:-}"
if [ -z "$CMD" ]; then
  echo "uso: $0 \"<subcomando paperclipai>\"" >&2
  exit 1
fi

: "${PC_MODE:?defina PC_MODE (use: eval \"\$(pc-target-detect.sh)\")}"
CLI="${PC_CLI_NAME:-paperclipai}"

# Adicionar contexto comum se PC_API_BASE estiver setado
EXTRA=""
if [ -n "${PC_API_BASE:-}" ] && [[ "$PC_MODE" == local-* ]]; then
  EXTRA="--api-base $PC_API_BASE"
fi

case "$PC_MODE" in
  local-native)
    eval "$CLI $CMD $EXTRA"
    ;;
  ssh-native)
    : "${PC_HOST:?PC_HOST vazio}"
    ssh "$PC_HOST" "$CLI $CMD"
    ;;
  local-docker)
    : "${PC_CONTAINER:?PC_CONTAINER vazio}"
    # dentro do container, paperclipai está no PATH (assumido por instalação padrão)
    eval "docker exec $PC_CONTAINER paperclipai $CMD"
    ;;
  ssh-docker)
    : "${PC_HOST:?PC_HOST vazio}"
    : "${PC_CONTAINER:?PC_CONTAINER vazio}"
    ssh "$PC_HOST" "docker exec $PC_CONTAINER paperclipai $CMD"
    ;;
  *)
    echo "PC_MODE inválido: $PC_MODE" >&2
    exit 2
    ;;
esac
