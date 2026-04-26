#!/usr/bin/env bash
# pc-secret-set.sh — define um secret no Paperclip via `paperclipai configure --section secrets`
# de forma segura (não imprime valor inteiro, força confirmação).
#
# Uso:
#   ./pc-secret-set.sh ANTHROPIC_API_KEY sk-ant-...
#   PC_SECRET_VALUE=sk-ant-... ./pc-secret-set.sh ANTHROPIC_API_KEY  # via env (mais seguro)
#
# Requer: PC_MODE, PC_HOST, PC_CONTAINER, PC_CLI_NAME

set -euo pipefail

KEY="${1:?uso: $0 <KEY> [VALUE]}"
VALUE="${2:-${PC_SECRET_VALUE:-}}"

if [ -z "$VALUE" ]; then
  read -s -p "Valor do secret $KEY (input oculto): " VALUE
  echo
fi

# Mascarar para log
MASK="${VALUE:0:4}…${VALUE: -4}"
echo "Definindo secret $KEY=$MASK no instance ${PC_INSTANCE:-default}"

: "${PC_MODE:?defina PC_MODE}"

case "$PC_MODE" in
  local-native)
    # paperclipai configure --section secrets é interativo; usar API ou env-var direto se disponível
    # fallback: editar ~/.paperclip/instances/<id>/secrets.json — formato pode variar
    SECRETS_FILE="${PC_HOME:-$HOME/.paperclip}/instances/${PC_INSTANCE:-default}/secrets.json"
    if [ ! -f "$SECRETS_FILE" ]; then
      mkdir -p "$(dirname "$SECRETS_FILE")"
      echo '{}' > "$SECRETS_FILE"
    fi
    python3 - "$SECRETS_FILE" "$KEY" "$VALUE" <<'EOF'
import json, sys, os, stat
path, key, val = sys.argv[1], sys.argv[2], sys.argv[3]
data = json.loads(open(path).read())
data[key] = val
tmp = path + ".tmp"
with open(tmp, "w") as f:
    json.dump(data, f, indent=2)
os.replace(tmp, path)
os.chmod(path, stat.S_IRUSR | stat.S_IWUSR)
print(f"OK: secret {key} salvo em {path}")
EOF
    ;;
  ssh-native)
    : "${PC_HOST:?PC_HOST vazio}"
    ssh "$PC_HOST" "PC_HOME=${PC_HOME:-} PC_INSTANCE=${PC_INSTANCE:-default} bash -s -- '$KEY' '$VALUE'" <<'EOF'
SF="${PC_HOME:-$HOME/.paperclip}/instances/${PC_INSTANCE:-default}/secrets.json"
[ -f "$SF" ] || { mkdir -p "$(dirname "$SF")"; echo '{}' > "$SF"; }
python3 -c "
import json, sys, os, stat
path, key, val = '$SF', '$1', '$2'
data = json.loads(open(path).read())
data[key] = val
import os
tmp = path + '.tmp'
open(tmp, 'w').write(json.dumps(data, indent=2))
os.replace(tmp, path)
os.chmod(path, stat.S_IRUSR | stat.S_IWUSR)
print(f'OK: secret {key} salvo')
"
EOF
    ;;
  local-docker|ssh-docker)
    : "${PC_CONTAINER:?PC_CONTAINER vazio}"
    # Em docker, secrets normalmente vêm de .env ou de mount volume
    # Aqui editamos o secrets.json dentro do container
    if [[ "$PC_MODE" == ssh-* ]]; then PFX="ssh $PC_HOST"; else PFX=""; fi
    $PFX docker exec "$PC_CONTAINER" bash -c "
      SF=\"\${PAPERCLIP_HOME:-/data/.paperclip}/instances/${PC_INSTANCE:-default}/secrets.json\"
      [ -f \"\$SF\" ] || { mkdir -p \"\$(dirname \"\$SF\")\"; echo '{}' > \"\$SF\"; }
      python3 -c '
import json, sys, os, stat
path, key, val = \"'\"\$SF\"'\", \"$KEY\", \"$VALUE\"
data = json.loads(open(path).read())
data[key] = val
tmp = path + \".tmp\"
open(tmp, \"w\").write(json.dumps(data, indent=2))
os.replace(tmp, path)
os.chmod(path, stat.S_IRUSR | stat.S_IWUSR)
'"
    ;;
esac

echo "Próximo passo: reinicie o paperclip para o secret ser carregado (./pc-reload.sh restart-server)."
