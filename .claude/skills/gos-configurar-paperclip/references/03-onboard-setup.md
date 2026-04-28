# 03 — Onboard inicial / setup zero

> Quando o usuário ainda NÃO tem Paperclip instalado, ou tem instalado mas
> não configurou nada além do default. Cobertura: instalação, env vars,
> primeira company, primeiro agent.

## 3.1. Instalação

### Native (recomendado para dev)

```bash
# One-liner com defaults sensatos
npx paperclipai onboard --yes

# Variantes de bind:
npx paperclipai onboard --yes --bind lan       # LAN access
npx paperclipai onboard --yes --bind tailnet   # Tailscale

# Subir o servidor:
npx paperclipai run
# (Servidor em localhost:3100 com Postgres embutido)
```

Requisitos: Node.js 20+, pnpm 9.15+ (se contributing).

### Docker (recomendado para produção)

Paperclip tem Dockerfile na raiz do repo. Se o usuário quer Docker Compose:

1. Clonar repo: `git clone https://github.com/paperclipai/paperclip.git`
2. Criar `docker-compose.yml` (não shipped — gerar localmente):

```yaml
services:
  paperclip:
    build: ./paperclip
    container_name: paperclip
    ports:
      - "3100:3100"
    environment:
      - PAPERCLIP_HOME=/data/.paperclip
      - PAPERCLIP_BIND=0.0.0.0:3100
      - PAPERCLIP_TELEMETRY_DISABLED=1
    volumes:
      - ./data/.paperclip:/data/.paperclip
    restart: unless-stopped
```

3. `docker compose up -d`.

### VPS (Hostinger, AWS EC2)

Mesmo fluxo mas via SSH. Ferramenta de escolha:
- VPS pequena (≤4 GB RAM): native via `npm install -g paperclipai`.
- VPS robusta + isolamento: docker compose.

## 3.2. Variáveis de ambiente importantes

Cheque com `paperclipai env`. As principais:

| Var | Default | Quando setar |
|---|---|---|
| `PAPERCLIP_HOME` | `~/.paperclip` | Customizar onde data vive |
| `PAPERCLIP_BIND` | `127.0.0.1:3100` | Permitir acesso LAN/tailnet/docker |
| `PAPERCLIP_TELEMETRY_DISABLED` | (off) | Setar `=1` para opt-out |
| `DATABASE_URL` | (embedded) | Apontar para Postgres externo em produção |
| `ANTHROPIC_API_KEY` | — | Para `claude_local` adapter |
| `OPENAI_API_KEY` | — | Para `codex_local` ou OpenAI adapters |

Em docker-compose: passe via `environment:` ou `env_file: .env`.
Em native systemd: use override em `/etc/systemd/system/paperclip.service.d/override.conf`.

## 3.3. Primeiro health check

```bash
./scripts/pc-wrap.sh "doctor"
./scripts/pc-wrap.sh "doctor --repair"   # auto-repair onde possível
./scripts/pc-wrap.sh "env"               # ver config resolvida
```

Erros comuns:
- **Database connection failed**: cheque `DATABASE_URL` ou se embedded postgres iniciou.
- **Storage path not writable**: cheque permissões em `PAPERCLIP_HOME`.
- **Secret missing**: cheque `secrets.json` ou env vars.

## 3.4. Configurar via `paperclipai configure`

Modos disponíveis:
```bash
paperclipai configure --section server     # binding, port, https
paperclipai configure --section secrets    # API keys
paperclipai configure --section storage    # data dir, postgres
```

Setup interativo. Se não-interativo necessário (ex: SSH script), edite `~/.paperclip/instances/<id>/config.json` direto + `restart-server`.

## 3.5. Permitir hostnames (autenticação)

Para acesso externo autenticado:
```bash
paperclipai allowed-hostname my-tailscale-host.tailnet.ts.net
paperclipai allowed-hostname production.example.com
```

## 3.6. Primeira company

```bash
# Via UI (mais comum):
# Abrir http://localhost:3100, "Create company", preencher.

# Via export do template (se houver):
# paperclipai company import github.com/paperclipai/templates-saas-startup --new

# Mais comum: criar pasta local, criar COMPANY.md, importar.
mkdir -p ./my-company/agents/ceo
```

Estrutura mínima do package — ver `references/04-empresa-estrutura.md` para detalhes:

```
my-company/
├── COMPANY.md
├── agents/
│   └── ceo/
│       └── AGENTS.md
└── .paperclip.yaml
```

Aí: `paperclipai company import ./my-company` (cria nova) ou `--company-id <existing>` (atualiza).

## 3.7. Primeiro agent (CEO)

`agents/ceo/AGENTS.md` mínimo:

```markdown
---
schema: agentcompanies/v1
kind: agent
slug: ceo
name: CEO
title: Chief Executive Officer
---

# CEO

Translate the company goal into actionable strategy. Delegate to PMs.
```

`.paperclip.yaml` mínimo (ver snippet `paperclip-yaml-base.yaml` para versão completa):

```yaml
schema: paperclip/v1
agents:
  ceo:
    adapter:
      type: claude_local
      config:
        model: claude-opus-4-7
        timeoutSec: 1800
    inputs:
      env:
        ANTHROPIC_API_KEY:
          kind: secret
          requirement: required
budgets:
  agents:
    ceo:
      monthlyCents: 15000   # IMPORTANTE: sempre defina!
```

## 3.8. Health check pós-setup

```bash
./scripts/pc-wrap.sh "doctor"
./scripts/pc-wrap.sh "agent list --company-id <id>"
./scripts/pc-wrap.sh "dashboard get --company-id <id>"
./scripts/pc-wrap.sh "heartbeat run --agent-id <ceo-id>"   # primeiro test heartbeat
```

## 3.9. Próximos passos (após setup base)

Em ordem de impacto/esforço (princípio do playbook):

1. **Aplicar tier-based protocols** (`references/09-protocols-tier.md`) — alto impacto, baixo esforço.
2. **Tool output truncation** (`references/10-tool-output-truncation.md`) — alto impacto, baixo esforço.
3. **Model routing** (`references/07-roteamento-modelo.md`) — muito alto impacto, médio esforço.
4. **Heartbeat conservador** (`references/08-heartbeat.md`) — alto impacto.
5. **Budgets per-agent** (`references/12-budgets.md`) — crítico, evita runaway.
6. **Audit completo** (`references/22-audit-otimizacao.md`) — quando usuário quiser plano consolidado.

## 3.10. Pegadinhas

- **`onboard --yes` pode pular auth**: a flag default é "trusted local loopback". Para produção, sempre rode `paperclipai allowed-hostname` + autenticação.
- **Embedded Postgres é dev-only**: para produção, aponte `DATABASE_URL` para Postgres dedicado.
- **PAPERCLIP_HOME muda contexto inteiro**: se setar depois de já ter rodado, dados antigos ficam órfãos no path antigo. Mude com cuidado.
- **Nó vinculado errado**: `npx paperclipai` usa Node global; em algumas distros, é antigo. Garanta Node 20+.
- **Disco**: embedded Postgres + logs + workspaces crescem. Monitore `du -sh ~/.paperclip` mensalmente.
