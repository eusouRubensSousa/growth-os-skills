#!/usr/bin/env bash
# pc-reload.sh — aplica a mudança da forma certa para cada tipo de edição.
#
# Uso:
#   ./pc-reload.sh hot-reload        # markdown puro (AGENTS.md, MEMORY.md, references/) — não precisa nada
#   ./pc-reload.sh import            # mudou .paperclip.yaml → re-import company
#   ./pc-reload.sh restart-server    # mudou config global (PAPERCLIP_HOME, env do servidor) → restart paperclipai
#   ./pc-reload.sh recreate-docker   # mudou .env do compose → docker compose up -d --force-recreate
#   ./pc-reload.sh systemd-restart   # native com systemd — daemon-reload + restart
#
# Requer:
#   PC_MODE, PC_HOST, PC_CONTAINER, PC_COMPOSE_DIR, PC_COMPANY_ID, PC_COMPANY_DIR

set -euo pipefail

KIND="${1:?uso: $0 [hot-reload|import|restart-server|recreate-docker|systemd-restart]}"
: "${PC_MODE:?defina PC_MODE}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WRAP="$SCRIPT_DIR/pc-wrap.sh"

run_remote() {
  if [[ "$PC_MODE" == ssh-* ]]; then
    : "${PC_HOST:?PC_HOST vazio}"
    ssh "$PC_HOST" "$@"
  else
    eval "$@"
  fi
}

check_logs() {
  echo "Checando logs (últimas 200 linhas para reload/error)..."
  case "$PC_MODE" in
    *-docker)
      : "${PC_CONTAINER:?PC_CONTAINER vazio}"
      run_remote "docker logs $PC_CONTAINER --tail 200 2>&1 | grep -iE 'reload|error|fatal|started|listening|ready' | tail -20" || true
      ;;
    *-native)
      run_remote "journalctl -u paperclip --user -n 200 --no-pager 2>/dev/null | grep -iE 'reload|error|fatal|started|listening' | tail -20 || tail -200 ~/.paperclip/logs/server.log 2>/dev/null | grep -iE 'reload|error|fatal|started|listening' | tail -20" || true
      ;;
  esac
}

case "$KIND" in
  hot-reload)
    echo "Markdown puro mudou (AGENTS.md, MEMORY.md, references/). Agente lerá na próxima heartbeat."
    echo "Nada a fazer no servidor. Verifique no dashboard que a próxima execução do agente reflete a mudança."
    ;;
  import)
    : "${PC_COMPANY_ID:?import requer PC_COMPANY_ID}"
    : "${PC_COMPANY_DIR:?import requer PC_COMPANY_DIR}"
    echo "→ dry-run primeiro:"
    "$WRAP" "company import '$PC_COMPANY_DIR' --company-id '$PC_COMPANY_ID' --dry-run"
    read -p "Aplicar de verdade? (y/N) " CONF
    if [ "$CONF" = "y" ] || [ "$CONF" = "Y" ]; then
      "$WRAP" "company import '$PC_COMPANY_DIR' --company-id '$PC_COMPANY_ID'"
    else
      echo "Cancelado."
      exit 0
    fi
    ;;
  restart-server)
    case "$PC_MODE" in
      local-native)
        # paperclipai run (foreground) — assume tmux/systemd; aqui apenas avisa
        echo "Pare a instância atual (Ctrl+C ou: pkill -f 'paperclipai run')"
        echo "Reinicie com: paperclipai run --instance ${PC_INSTANCE:-default}"
        ;;
      ssh-native)
        run_remote "pkill -f 'paperclipai run' || true; sleep 2; nohup paperclipai run --instance ${PC_INSTANCE:-default} > ~/.paperclip/logs/server.log 2>&1 &"
        sleep 5
        check_logs
        ;;
      *-docker)
        : "${PC_CONTAINER:?}"
        run_remote "docker restart $PC_CONTAINER"
        sleep 5
        check_logs
        ;;
    esac
    ;;
  recreate-docker)
    case "$PC_MODE" in
      *-docker)
        : "${PC_COMPOSE_DIR:?}"
        run_remote "cd '$PC_COMPOSE_DIR' && docker compose up -d --force-recreate paperclip"
        echo "Aguardando container saudável..."
        sleep 10
        check_logs
        ;;
      *)
        echo "ERRO: 'recreate-docker' só vale em modo docker." >&2
        exit 2
        ;;
    esac
    ;;
  systemd-restart)
    case "$PC_MODE" in
      *-native)
        run_remote "sudo systemctl daemon-reload && sudo systemctl restart paperclip && sleep 3 && systemctl is-active paperclip"
        check_logs
        ;;
      *)
        echo "ERRO: 'systemd-restart' só vale em modo native com unit systemd." >&2
        exit 2
        ;;
    esac
    ;;
  *)
    echo "uso: $0 [hot-reload|import|restart-server|recreate-docker|systemd-restart]" >&2
    exit 1
    ;;
esac

echo "OK: $KIND aplicado."
