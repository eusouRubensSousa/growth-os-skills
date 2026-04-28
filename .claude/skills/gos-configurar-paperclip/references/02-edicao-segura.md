# 02 — Edição segura

> Toda mudança que pode quebrar o Paperclip passa por este checklist. Ignore por sua conta e risco.

## 2.1. O que pode ser editado

Tudo na company package é markdown ou YAML. Os arquivos que esta skill toca:

| Arquivo | Tipo | Quem edita | Como reload |
|---|---|---|---|
| `COMPANY.md` | Markdown | Edit/Write direto | `company import` |
| `agents/<slug>/AGENTS.md` (ou `AGENT.md`) | Markdown | Edit/Write direto | `company import` (ou hot — agente lê na próxima heartbeat) |
| `agents/<slug>/PROTOCOL.md` | Markdown | Edit/Write direto | hot |
| `agents/<slug>/references/*.md` | Markdown | Edit/Write direto | hot |
| `memory/shared/MEMORY.md` | Markdown | Edit/Write direto | hot |
| `memory/per-agent/<slug>/MEMORY.md` | Markdown | Edit/Write direto | hot |
| `skills/<slug>/SKILL.md` | Markdown + frontmatter | Edit/Write direto | hot (re-loaded na próxima heartbeat) |
| `.paperclip.yaml` | YAML | `pc-yaml-patch.py` (deep-merge) | `company import` (sempre) |
| `.env` (docker compose) | KV | Edit + `recreate-docker` | `recreate-docker` |
| `~/.paperclip/instances/<id>/config.json` | JSON (server-level) | Cuidado — preferir `paperclipai configure` | `restart-server` |
| `secrets.json` | JSON | `pc-secret-set.sh` | `restart-server` |

## 2.2. Sempre faça backup ANTES

```bash
# Arquivo único
./scripts/pc-backup.sh $PC_COMPANY_DIR/.paperclip.yaml
./scripts/pc-backup.sh $PC_COMPANY_DIR/agents/ceo/AGENTS.md

# Package inteiro (recomendado para mudanças grandes)
./scripts/pc-backup.sh dir $PC_COMPANY_DIR
```

Backup vai para `<arquivo>.bak-YYYYMMDD-HHMMSS` (ou `<dir>.bak-...tar.gz` se package).

## 2.3. Padrão de edição

### Markdown (AGENTS.md, MEMORY.md, SKILL.md, etc.)

Use **Edit** (preferido) ou **Write** direto no arquivo. Markdown é canônico.

```
1. Read $PC_COMPANY_DIR/agents/ceo/AGENTS.md
2. Edit (mudança específica) ou Write (rewrite completo, raro)
3. (Opcional) Hot reload: agente lê na próxima heartbeat. Sem ação.
4. (Opcional) `paperclipai company import` se quer que servidor recompute graph.
```

### YAML (`.paperclip.yaml`)

Use `pc-yaml-patch.py` para deep-merge — preserva campos existentes:

```bash
# Backup
./scripts/pc-backup.sh $PC_COMPANY_DIR/.paperclip.yaml

# Patch
./scripts/pc-apply-patch.sh ./snippets/paperclip-yaml-routing.yaml --import
# (--import faz dry-run + confirm + import de verdade)

# OU manual:
python3 ./scripts/pc-yaml-patch.py $PC_COMPANY_DIR/.paperclip.yaml ./snippets/paperclip-yaml-routing.yaml
./scripts/pc-wrap.sh "company import $PC_COMPANY_DIR --company-id $PC_COMPANY_ID --dry-run"
./scripts/pc-wrap.sh "company import $PC_COMPANY_DIR --company-id $PC_COMPANY_ID"
```

## 2.4. Decidir reload kind

Antes de aplicar, decida QUAL forma de reload:

| Mudança | Reload kind | Comando |
|---|---|---|
| Editou AGENTS.md / MEMORY.md / references/ / SKILL.md | **hot** | nada — agente lê na próxima heartbeat |
| Editou `.paperclip.yaml` | **import** | `./pc-reload.sh import` |
| Editou COMPANY.md (slug, nome, includes) | **import** | `./pc-reload.sh import` |
| Editou `~/.paperclip/instances/<id>/config.json` | **restart-server** | `./pc-reload.sh restart-server` |
| Editou `secrets.json` ou via `pc-secret-set.sh` | **restart-server** | `./pc-reload.sh restart-server` |
| Editou `.env` do docker-compose | **recreate-docker** | `./pc-reload.sh recreate-docker` |
| Editou systemd unit / override | **systemd-restart** | `./pc-reload.sh systemd-restart` |

**Regra de ouro:** se mudou env var (qualquer modo), use restart/recreate. `restart` em docker compose **NÃO basta** se mudou `.env` — precisa `--force-recreate`.

## 2.5. Sempre validar ANTES de fechar a operação

```bash
# 1. Doctor — health check do servidor
./scripts/pc-wrap.sh "doctor"

# 2. Dry-run de import — confirma que YAML/markdown estão consistentes
./scripts/pc-wrap.sh "company import $PC_COMPANY_DIR --company-id $PC_COMPANY_ID --dry-run"

# 3. Import de verdade
./scripts/pc-wrap.sh "company import $PC_COMPANY_DIR --company-id $PC_COMPANY_ID"

# 4. Verificar no dashboard
./scripts/pc-wrap.sh "dashboard get --company-id $PC_COMPANY_ID --json"
```

Se qualquer um falhar:
- **NÃO continuar.**
- Ofereça rollback: `./scripts/pc-rollback.sh <arquivo>`
- Investigue antes de retentar.

## 2.6. Sequência canônica (cole isto em sua mente)

```
[backup] → [edit ou patch] → [doctor] → [import dry-run] → [import] → [verify]
   ↑                                            ↓
   └── rollback ←──────── if any fails ─────────┘
```

## 2.7. Concorrência: agente rodando

Se você editar `AGENTS.md` enquanto o agente está executando uma issue:

- O **run atual** continua com o prompt antigo (já cacheado pelo adapter).
- O **próximo heartbeat** lê o novo AGENTS.md.
- Para forçar recarga imediata, peça para o user "interromper o run atual no UI" → próximo run terá o novo conteúdo.

**Sessões já abertas** (Telegram bots, websocket persistente) podem cachear system prompt — peça ao user para forçar nova sessão.

## 2.8. Multi-arquivo: mudança que toca várias agents

Se uma mudança afeta múltiplos AGENTS.md (ex: adicionar bloco de Security Rules em todos):

```bash
# Backup do package inteiro
./scripts/pc-backup.sh dir $PC_COMPANY_DIR

# Aplicar mudanças (loop pelo agente, Edit cada AGENTS.md)
for AGENT in $PC_COMPANY_DIR/agents/*/; do
  echo "=== $AGENT ==="
  # Read + Edit (via Claude tools)
done

# Validar tudo de uma vez
./scripts/pc-wrap.sh "company import $PC_COMPANY_DIR --company-id $PC_COMPANY_ID --dry-run"
```

## 2.9. Pegadinhas

- **`paperclipai company import`** sem `--company-id` cria company NOVA. Sempre passe `--company-id` quando atualizando.
- **Collisions**: import suporta `--collision-strategy rename|skip|replace`. Default é `rename`. Para atualização in-place, use `replace` (mas faça dry-run primeiro).
- **Frontmatter YAML em markdown**: `---` precisa estar na primeira linha. Espaço em branco antes do `---` quebra parsing.
- **Slugs case-sensitive**: `agents/CEO/AGENTS.md` ≠ `agents/ceo/AGENTS.md`. Pad fica lower-kebab por convenção.
- **Includes em COMPANY.md**: se você adicionar/remover agents do package, precisa atualizar `includes:` no COMPANY.md ou eles não são descobertos.
