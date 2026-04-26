#!/usr/bin/env bash
# pc-audit.sh — coleta snapshot READ-ONLY do estado da instância Paperclip.
# Saída é um único arquivo de texto que o Claude lê + cruza com
# references/22-audit-otimizacao.md pra propor otimizações categorizadas.
#
# Uso:
#   ./pc-audit.sh                # imprime no stdout
#   ./pc-audit.sh /tmp/audit.txt # grava em arquivo
#
# Requer:
#   PC_MODE, PC_HOST, PC_CONTAINER, PC_HOME, PC_INSTANCE, PC_COMPANY_ID, PC_COMPANY_DIR

set -euo pipefail

OUT="${1:-/dev/stdout}"
[ "$OUT" != "/dev/stdout" ] && exec > "$OUT"

: "${PC_MODE:?defina PC_MODE (eval \"\$(pc-target-detect.sh ...)\")}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WRAP="$SCRIPT_DIR/pc-wrap.sh"

run_remote() {
  if [[ "$PC_MODE" == ssh-* ]]; then
    : "${PC_HOST:?PC_HOST vazio}"
    ssh -o BatchMode=yes "$PC_HOST" "$@" 2>&1 || true
  else
    eval "$@" 2>&1 || true
  fi
}

wrap_or_skip() {
  "$WRAP" "$1" 2>&1 || echo "<command failed: $1>"
}

# Header
echo "=== PAPERCLIP AUDIT SNAPSHOT — $(date -u +%Y-%m-%dT%H:%M:%SZ) ==="
echo

# 1. Target
echo "=== TARGET ==="
echo "PC_MODE=$PC_MODE"
echo "PC_HOST=${PC_HOST:-}"
echo "PC_CONTAINER=${PC_CONTAINER:-}"
echo "PC_COMPOSE_DIR=${PC_COMPOSE_DIR:-}"
echo "PC_HOME=${PC_HOME:-}"
echo "PC_INSTANCE=${PC_INSTANCE:-default}"
echo "PC_COMPANY_ID=${PC_COMPANY_ID:-<unset>}"
echo "PC_COMPANY_DIR=${PC_COMPANY_DIR:-<unset>}"
echo "PC_OWNER=${PC_OWNER:-}"
echo

# 2. Versão
echo "=== VERSION ==="
wrap_or_skip "--version"
echo

# 3. Doctor
echo "=== DOCTOR ==="
wrap_or_skip "doctor"
echo

# 4. Env resolved
echo "=== ENV RESOLVED ==="
wrap_or_skip "env" | head -40
echo

# 5. Companies + agents (se PC_COMPANY_ID setado)
if [ -n "${PC_COMPANY_ID:-}" ]; then
  echo "=== AGENTS (company $PC_COMPANY_ID) ==="
  wrap_or_skip "agent list --company-id $PC_COMPANY_ID --json" | head -200
  echo
  echo "=== DASHBOARD ==="
  wrap_or_skip "dashboard get --company-id $PC_COMPANY_ID --json" | head -100
  echo
fi

# 6. Costs (se API endpoint disponível)
if [ -n "${PC_COMPANY_ID:-}" ] && [ -n "${PC_API_BASE:-}" ]; then
  echo "=== COSTS SUMMARY ==="
  run_remote "curl -s '${PC_API_BASE}/api/companies/${PC_COMPANY_ID}/costs/summary' 2>/dev/null | head -50"
  echo
  echo "=== COSTS BY AGENT ==="
  run_remote "curl -s '${PC_API_BASE}/api/companies/${PC_COMPANY_ID}/costs/by-agent' 2>/dev/null | head -100"
  echo
fi

# 7. Estrutura do company package (se PC_COMPANY_DIR setado)
if [ -n "${PC_COMPANY_DIR:-}" ]; then
  echo "=== COMPANY PACKAGE STRUCTURE ==="
  run_remote "find '$PC_COMPANY_DIR' -maxdepth 4 -type f \\( -name '*.md' -o -name '.paperclip.yaml' \\) 2>/dev/null | head -60"
  echo

  echo "=== .paperclip.yaml ==="
  run_remote "cat '$PC_COMPANY_DIR/.paperclip.yaml' 2>/dev/null | head -200"
  echo

  echo "=== COMPANY.md (head) ==="
  run_remote "head -50 '$PC_COMPANY_DIR/COMPANY.md' 2>/dev/null"
  echo

  # Auditar tamanho de cada AGENTS.md (vazamento 1 — monolítico)
  echo "=== AGENTS.md SIZES (procurar > 200 linhas) ==="
  run_remote "find '$PC_COMPANY_DIR/agents' -name 'AGENTS.md' -o -name 'AGENT.md' 2>/dev/null | while read f; do echo \"\$(wc -l < \"\$f\") \$f\"; done | sort -rn | head -20"
  echo

  # MEMORY.md sizes (vazamento — > 5KB indica acúmulo)
  echo "=== MEMORY.md SIZES (procurar > 5KB) ==="
  run_remote "find '$PC_COMPANY_DIR' -name 'MEMORY.md' 2>/dev/null | while read f; do echo \"\$(wc -c < \"\$f\") \$f\"; done | sort -rn | head -20"
  echo

  # Skill paperclip.md presente? (monolítica)
  echo "=== SKILL paperclip.md (monolítica?) ==="
  run_remote "find '$PC_COMPANY_DIR/skills' -iname 'paperclip.md' -o -iname 'paperclip/SKILL.md' 2>/dev/null"
  run_remote "find '$PC_COMPANY_DIR/skills' -name 'paperclip.md' -exec wc -l {} \\; 2>/dev/null"
  echo

  # PROTOCOL.md por papel (sinal positivo — tier-based)
  echo "=== PROTOCOL.md por agente (sinal de tier-based) ==="
  run_remote "find '$PC_COMPANY_DIR/agents' -name 'PROTOCOL.md' 2>/dev/null | head -20"
  echo

  # references/ por agente (TOC pattern)
  echo "=== references/ por agente (TOC pattern) ==="
  run_remote "find '$PC_COMPANY_DIR/agents' -type d -name 'references' 2>/dev/null | head -20"
  echo

  # Memory split shared/per-agent
  echo "=== MEMORY SPLIT ==="
  run_remote "ls -la '$PC_COMPANY_DIR/memory' 2>/dev/null | head -10"
  run_remote "ls -d '$PC_COMPANY_DIR/memory/shared' '$PC_COMPANY_DIR/memory/per-agent' 2>/dev/null"
  echo

  # progress.txt para projetos longos
  echo "=== progress.txt (handoff) ==="
  run_remote "find '$PC_COMPANY_DIR/projects' -name 'progress.txt' 2>/dev/null | head -10"
  echo

  # Security rules em AGENTS.md?
  echo "=== AGENTS.md com security rules? ==="
  run_remote "grep -lic 'security rules\\|prompt injection\\|treat all fetched' '$PC_COMPANY_DIR/agents'/*/AGENTS.md '$PC_COMPANY_DIR/agents'/*/AGENT.md 2>/dev/null | grep -v ':0$' | head -10"
  echo

  # Tool output truncation rules?
  echo "=== AGENTS.md com truncamento de output? ==="
  run_remote "grep -lic 'output handling\\|head -\\|tail -50\\|never cat\\|jq ' '$PC_COMPANY_DIR/agents'/*/AGENTS.md '$PC_COMPANY_DIR/agents'/*/AGENT.md 2>/dev/null | head -10"
  echo
fi

# 8. Logs recentes (errors only)
echo "=== ERROS RECENTES (últimos 200 linhas, filtrado) ==="
case "$PC_MODE" in
  *-docker)
    : "${PC_CONTAINER:?}"
    run_remote "docker logs $PC_CONTAINER --tail 200 2>&1 | grep -iE 'error|fatal|denied|budget|paused' | tail -30"
    ;;
  *-native)
    run_remote "tail -200 ~/.paperclip/logs/server.log 2>/dev/null | grep -iE 'error|fatal|denied|budget|paused' | tail -30 || journalctl -u paperclip -n 200 --no-pager 2>/dev/null | grep -iE 'error|fatal|denied|budget|paused' | tail -30"
    ;;
esac
echo

# 9. UFW / firewall (só ssh-*)
if [[ "$PC_MODE" == ssh-* ]]; then
  echo "=== UFW STATUS ==="
  run_remote "sudo ufw status 2>/dev/null | head -10"
  echo "=== fail2ban ==="
  run_remote "sudo fail2ban-client status sshd 2>/dev/null | head -10"
  echo
fi

echo "=== END OF AUDIT SNAPSHOT ==="
