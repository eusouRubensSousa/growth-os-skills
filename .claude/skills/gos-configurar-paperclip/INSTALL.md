# Instalação — configurar-paperclip

## Onde mora

A fonte canônica desta skill vive em:
```
~/Desenvolvimento/PoCs/claude-code/tests/open-claw-paperclip-config/auto-config/configurar-paperclip/
```

Para o Claude Code descobrir a skill, crie um **symlink** em `~/.claude/skills/`:
```bash
ln -s \
  ~/Desenvolvimento/PoCs/claude-code/tests/open-claw-paperclip-config/auto-config/configurar-paperclip \
  ~/.claude/skills/configurar-paperclip
```

Confira:
```bash
ls -la ~/.claude/skills/configurar-paperclip
```

## Como invocar

A skill é descoberta automaticamente pelo `description` no frontmatter de `SKILL.md`. Triggers (em PT-BR e EN) incluem:

- "configurar paperclip"
- "audita paperclip" / "audit paperclip"
- "otimiza paperclip" / "reduz custo paperclip"
- "paperclip caro" / "paperclip token"
- "paperclip onboard" / "paperclip company"
- "paperclip adapter" / "paperclip claude_local"
- "paperclip heartbeat" / "paperclip routine"
- "paperclip budget" / "paperclip skill"
- "paperclip docker" / "paperclip vps"
- "paperclip caching" / "paperclip memory"
- "paperclip protocol" / "paperclip tier"
- ".paperclip.yaml"

Ou explicitamente: `/configurar-paperclip` (se Claude Code expuser slash command).

## Estrutura

```
configurar-paperclip/
├── SKILL.md                            # entrypoint + roteador
├── INSTALL.md                          # este arquivo
├── references/                         # detalhes operacionais (22 arquivos)
│   ├── 01-conexao.md                   # detectar target (4 modos)
│   ├── 02-edicao-segura.md             # backup, dry-run, reload kinds
│   ├── 03-onboard-setup.md             # primeiro setup
│   ├── 04-empresa-estrutura.md         # companies-spec
│   ├── 05-paperclip-yaml.md            # schema completo
│   ├── 06-adapters-modelos.md          # claude_local, codex_local, etc
│   ├── 07-roteamento-modelo.md         # Haiku/Sonnet/Opus por papel ⚡
│   ├── 08-heartbeat.md                 # event-driven > scheduled ⚡
│   ├── 09-protocols-tier.md            # vazamento #1 do playbook ⚡
│   ├── 10-tool-output-truncation.md    # vazamento #2 ⚡
│   ├── 11-prompt-caching.md            # cache hit > 60% 🔥
│   ├── 12-budgets.md                   # budgetMonthlyCents
│   ├── 13-concurrency.md               # max concurrent
│   ├── 14-skills-customizadas.md       # SKILL.md
│   ├── 15-references-toc.md            # AGENTS.md como TOC
│   ├── 16-memory-architecture.md       # shared vs per-agent
│   ├── 17-progress-handoff.md          # progress.txt
│   ├── 18-determinismo.md              # ETL/SQL/MCP, agent só onde precisa
│   ├── 19-seguranca.md                 # injection, secrets, UFW
│   ├── 20-diagnostico.md               # doctor, costs API, dashboard
│   ├── 21-armadilhas.md                # pegadinhas conhecidas
│   └── 22-audit-otimizacao.md          # 🤖 modo audit automático (rulebook + ROI)
├── snippets/                           # YAML/MD prontos pra deep-merge
│   ├── paperclip-yaml-base.yaml        # esqueleto
│   ├── paperclip-yaml-routing.yaml     # tier Haiku/Sonnet/Opus
│   ├── paperclip-yaml-routines.yaml    # heartbeat conservador
│   ├── paperclip-yaml-budgets.yaml     # budgets per-agent
│   ├── paperclip-yaml-concurrency.yaml # concurrency caps
│   ├── agents-md-tier-ic.md            # AGENTS.md para IC tier (Sonnet)
│   ├── agents-md-tier-pm.md            # AGENTS.md para PM tier
│   ├── agents-md-tier-ceo.md           # AGENTS.md para CEO tier (Opus)
│   ├── agents-md-tool-truncation.md    # bloco "Output Handling Rules"
│   ├── agents-md-security-rules.md     # bloco "Security Rules"
│   ├── agents-md-references-toc.md     # bloco "Knowledge Base TOC"
│   ├── protocol-md-template.md         # PROTOCOL.md slim
│   ├── progress-txt-template.md        # progress.txt para projetos longos
│   ├── memory-md-template.md           # MEMORY.md < 5KB
│   └── skill-md-template.md            # SKILL.md custom
└── scripts/                            # helpers shell/python
    ├── pc-target-detect.sh             # 4 modos: local-native/docker, ssh-native/docker
    ├── pc-wrap.sh                      # wrapper unificado paperclipai
    ├── pc-backup.sh                    # backup datado de arquivo ou pkg
    ├── pc-yaml-patch.py                # deep-merge YAML em .paperclip.yaml
    ├── pc-apply-patch.sh               # high-level: backup + patch + import
    ├── pc-secret-set.sh                # set secret (input oculto)
    ├── pc-reload.sh                    # hot/import/restart-server/recreate-docker/systemd-restart
    ├── pc-rollback.sh                  # restaura backup mais recente
    └── pc-audit.sh                     # 🤖 snapshot read-only (alimenta o modo audit)
```

## Modos de deploy suportados

| Modo | Quando | Como rodar CLI |
|---|---|---|
| `local-native` | npx paperclipai onboard local | `paperclipai <cmd>` ou `npx paperclipai <cmd>` |
| `local-docker` | Docker Compose nesta máquina | `docker exec <container> paperclipai <cmd>` |
| `ssh-native` | VPS bare-metal | `ssh <host> paperclipai <cmd>` |
| `ssh-docker` | VPS docker compose remoto | `ssh <host> docker exec <container> paperclipai <cmd>` |

## Requisitos da máquina local (onde Claude Code roda)

- `bash`, `python3` (3.8+)
- **`ruamel.yaml`** (preferido — preserva comentários) OU **`PyYAML`**:
  ```bash
  pip install ruamel.yaml
  ```
- `ssh` configurado para o(s) host(s) remotos (ideal: chave + `~/.ssh/config` alias)
- `scp` (sync de `.paperclip.yaml` em modo SSH)
- `jq` (consultas no `costs` API)

Para target docker remoto, o usuário SSH precisa estar no grupo `docker` ou ter sudo.

## Atualização

Edite os arquivos em `auto-config/configurar-paperclip/` — o symlink em `~/.claude/skills/` reflete imediatamente.

Para versionar com git:
```bash
cd ~/Desenvolvimento/PoCs/claude-code/tests/open-claw-paperclip-config
git add auto-config/configurar-paperclip
git commit -m "skill configurar-paperclip: ..."
```

## Desinstalar

```bash
rm ~/.claude/skills/configurar-paperclip
# (a fonte original em auto-config/ permanece intacta)
```

## Primeira execução — sanity check

Após instalar o symlink, abra uma sessão Claude Code em qualquer pasta e diga:

> "audita meu paperclip"

A skill deve disparar automaticamente, perguntar pelo target, rodar `pc-audit.sh` e apresentar relatório categorizado seguindo `references/22-audit-otimizacao.md`.

## Suporte

Para reportar bugs ou pedir features, abra issue no repo da skill (TBD) ou edite diretamente.
