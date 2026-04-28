#!/usr/bin/env bash
# pc-target-detect.sh — detecta o modo de deploy do Paperclip e imprime variáveis exportáveis.
#
# Uso:
#   ./pc-target-detect.sh                    # detecta local
#   ./pc-target-detect.sh user@host          # detecta via SSH
#
# Saída (eval-friendly):
#   PC_MODE=local-docker
#   PC_HOST=
#   PC_CONTAINER=paperclip-paperclip-1
#   PC_COMPOSE_DIR=/docker/paperclip
#   PC_HOME=/docker/paperclip/data/.paperclip
#   PC_INSTANCE=default
#   PC_API_BASE=http://localhost:3100
#   PC_OWNER=1000:1000
#
# Para usar:
#   eval "$(./pc-target-detect.sh root@srv991685.hstgr.cloud)"
#
# Observações:
#   - PC_COMPANY_ID e PC_COMPANY_DIR NÃO são auto-detectados (precisa do user) —
#     o caller deve perguntar via AskUserQuestion após este script rodar.

set -euo pipefail

HOST="${1:-}"
PFX=""
if [ -n "$HOST" ]; then
  PFX="ssh -o BatchMode=yes -o ConnectTimeout=8 $HOST --"
fi

run() { if [ -n "$PFX" ]; then $PFX "$@"; else "$@"; fi }

# Sanity: SSH funciona?
if [ -n "$HOST" ]; then
  if ! ssh -o BatchMode=yes -o ConnectTimeout=8 "$HOST" true 2>/dev/null; then
    echo "ERRO: SSH para $HOST falhou (BatchMode). Configure ~/.ssh/config ou use chave." >&2
    exit 2
  fi
fi

# (a) CLI nativo no PATH? (paperclipai ou paperclip)
HAS_CLI="false"
CLI_NAME=""
if run bash -c 'command -v paperclipai >/dev/null 2>&1'; then
  HAS_CLI="true"; CLI_NAME="paperclipai"
elif run bash -c 'command -v paperclip >/dev/null 2>&1'; then
  HAS_CLI="true"; CLI_NAME="paperclip"
elif run bash -c 'command -v npx >/dev/null 2>&1'; then
  # tem npx → pode rodar via `npx paperclipai`
  HAS_CLI="true"; CLI_NAME="npx paperclipai"
fi

# (b) container do paperclip rodando?
CONTAINER=""
COMPOSE_DIR=""
if run bash -c 'command -v docker >/dev/null 2>&1'; then
  CONTAINER=$(run bash -c "docker ps --format '{{.Names}}\t{{.Image}}' 2>/dev/null | grep -iE 'paperclip' | head -1 | awk '{print \$1}'")
  if [ -n "$CONTAINER" ]; then
    COMPOSE_DIR=$(run bash -c "docker inspect '$CONTAINER' --format '{{ index .Config.Labels \"com.docker.compose.project.working_dir\" }}' 2>/dev/null")
  fi
fi

# Decidir modo
MODE=""
if [ -n "$CONTAINER" ]; then
  if [ -n "$HOST" ]; then MODE="ssh-docker"; else MODE="local-docker"; fi
elif [ "$HAS_CLI" = "true" ]; then
  if [ -n "$HOST" ]; then MODE="ssh-native"; else MODE="local-native"; fi
else
  echo "ERRO: nem CLI 'paperclipai' nem container Paperclip foram encontrados em ${HOST:-localhost}." >&2
  echo "      Instale via 'npx paperclipai onboard --yes' ou aponte para outro host." >&2
  exit 3
fi

# Resolver PC_HOME (raiz do data dir)
PC_HOME=""
PC_INSTANCE="default"

case "$MODE" in
  *-docker)
    if [ -z "$COMPOSE_DIR" ]; then
      echo "ERRO: container detectado ($CONTAINER) mas sem label com.docker.compose.project.working_dir." >&2
      echo "      Rodar manualmente: docker inspect $CONTAINER" >&2
      exit 4
    fi
    # Normalmente compose monta data/.paperclip ou usa env PAPERCLIP_HOME=/data
    if run bash -c "test -d '$COMPOSE_DIR/data/.paperclip'"; then
      PC_HOME="$COMPOSE_DIR/data/.paperclip"
    elif run bash -c "test -d '$COMPOSE_DIR/.paperclip'"; then
      PC_HOME="$COMPOSE_DIR/.paperclip"
    else
      # tentar inspecionar PAPERCLIP_HOME no env do container
      ENV_HOME=$(run bash -c "docker exec $CONTAINER printenv PAPERCLIP_HOME 2>/dev/null" || echo "")
      if [ -n "$ENV_HOME" ]; then
        # esse path está dentro do container; achar o bind no host via inspect
        BIND=$(run bash -c "docker inspect $CONTAINER --format '{{range .Mounts}}{{if eq .Destination \"$ENV_HOME\"}}{{.Source}}{{end}}{{end}}' 2>/dev/null")
        [ -n "$BIND" ] && PC_HOME="$BIND"
      fi
    fi
    OWNER=$(run bash -c "stat -c '%u:%g' '$PC_HOME' 2>/dev/null || echo 0:0")
    ;;
  *-native)
    USER_HOME=$(run bash -c 'echo $HOME')
    # Honrar PAPERCLIP_HOME se setado
    ENV_HOME=$(run bash -c 'echo ${PAPERCLIP_HOME:-}' 2>/dev/null || echo "")
    if [ -n "$ENV_HOME" ]; then
      PC_HOME="$ENV_HOME"
    else
      PC_HOME="$USER_HOME/.paperclip"
    fi
    OWNER=$(run bash -c "stat -c '%u:%g' '$PC_HOME' 2>/dev/null || echo 0:0")
    ;;
esac

# Detectar instances disponíveis
INSTANCES=$(run bash -c "ls -1 '$PC_HOME/instances' 2>/dev/null | head -5" || echo "")
if echo "$INSTANCES" | grep -q "default"; then
  PC_INSTANCE="default"
elif [ -n "$INSTANCES" ]; then
  PC_INSTANCE=$(echo "$INSTANCES" | head -1)
fi

# API base (default; user pode sobrescrever)
PC_API_BASE="http://localhost:3100"

# Imprimir
echo "PC_MODE=$MODE"
echo "PC_HOST=${HOST:-}"
echo "PC_CONTAINER=${CONTAINER:-}"
echo "PC_COMPOSE_DIR=${COMPOSE_DIR:-}"
echo "PC_HOME=${PC_HOME:-}"
echo "PC_INSTANCE=${PC_INSTANCE:-default}"
echo "PC_API_BASE=${PC_API_BASE}"
echo "PC_CLI_NAME=${CLI_NAME:-paperclipai}"
echo "PC_OWNER=${OWNER:-0:0}"
echo "# Pendente (user precisa informar):"
echo "# PC_COMPANY_ID="
echo "# PC_COMPANY_DIR="
