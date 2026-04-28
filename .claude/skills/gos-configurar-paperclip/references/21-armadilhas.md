# 21 — Armadilhas conhecidas

> Pegadinhas que custam tempo. Se você bateu numa, adicione aqui.

## 21.1. `.paperclip.yaml`

- **Cron shorthand rejeitado.** Use 5 partes (`0 9 * * 1`), nunca `1d`/`30m`.
- **`agents.<slug>` slug case-sensitive.** Bater EXATO com pasta `agents/<slug>/`.
- **`opencode_local` exige `provider/model`.** `model: claude-sonnet-4-6` falha. Correto: `model: anthropic/claude-sonnet-4-6`.
- **Frontmatter YAML em markdown**: `---` precisa estar na linha 1. Espaço/BOM antes quebra.
- **Indentação YAML**: 2 espaços, não tabs. Mistura quebra parsing.
- **`timezone:` sem string-quote**: timezones como `America/Sao_Paulo` sem aspas funcionam mas `cronExpression: "0 9 * * 1"` PRECISA de aspas senão YAML interpreta como número.
- **Adicionar agent novo sem incluir em COMPANY.md**: agente não é descoberto. `includes:` precisa listar.
- **`--collision-strategy` default é `rename`**: importação cria company NOVA em vez de atualizar existente. Use `--company-id <id>` para in-place.

## 21.2. Adapters

- **`claude_local` sem CLI instalado**: erro silencioso em alguns cenários. Sempre teste com "Test environment" ou `paperclipai heartbeat run`.
- **`cwd` não writable**: agent crasha com EACCES. Crie dir antes ou use path em `$HOME/...`.
- **Mudar `model` num agent**: invalida cache (system prompt diferente). Esperado, mas planeje.
- **`maxTurnsPerRun` muito alto + heartbeat curto**: runaway. Default 300 é seguro; agressivo é 50-100.
- **`dangerouslySkipPermissions: true` fora de sandbox**: agent pode executar ações destrutivas sem aprovação. Use SOMENTE em workspace isolado.

## 21.3. Heartbeat

- **`enabled: false`** desliga TUDO (incluindo wakeOnAssignment). Para event-only, use `intervalSec: 0`.
- **`intervalSec` curto + agent ocioso**: queima budget. Sintoma: % runLiveness `empty_response` alta.
- **Multiple routines + per-agent intervalSec**: agente recebe heartbeat de ambos, podendo duplicar.
- **`catchUpPolicy: run-all`** após downtime longo: storm de heartbeats. Use `skip` ou `run-once`.
- **Cron timezone default UTC**: agent acorda 3h da manhã horário local. Sempre declare `timezone:`.

## 21.4. Skills e references

- **Skill com description marketing-y**: agente não consegue rotear. Description é decision logic.
- **Frontmatter `name` ≠ pasta**: spec permite, mas confunde. Convenção: bater.
- **References em path errado**: `references/foo.md` é relative ao AGENTS.md (per-agent). Diferente de `<root>/references/`.
- **Skills compartilhadas via `includes:`** que não existem no path: import falha com "package not found".

## 21.5. Memory

- **MEMORY.md > 5KB**: você está acumulando. Consolide.
- **Daily logs em system prompt**: invalida cache constantemente. SEMPRE deixe daily fora.
- **Multi-agent edita mesmo MEMORY.md**: race. Designate UM curator.
- **`memory/` não é gitignored**: bom para audit, mas cuidado com secrets vazando se MEMORY.md tem credencial.

## 21.6. Budgets

- **Reset UTC, não local**: agent acorda "renovado" 21h no último dia do mês BR.
- **`default` em `budgets.agents`**: nem todo runtime honra. Sempre declare per-agent.
- **Cache write é 1.25x**: editar AGENTS.md grande durante o dia paga write várias vezes — pode parecer "uso anormal" no dashboard.
- **Hire via UI cria agent sem entry no `.paperclip.yaml`**: pega `default` budget. Sempre adicione entry e re-import.

## 21.7. SSH e Docker

- **`docker compose restart` NÃO basta para mudança em `.env`**. Precisa `docker compose up -d --force-recreate paperclip`.
- **`PAPERCLIP_HOME` muda entre native e docker**: native default `~/.paperclip`; docker geralmente `/data/.paperclip`. Não confunda.
- **Container sem label `working_dir`**: `docker inspect` não mostra compose dir. Pergunte ao usuário.
- **SSH user sem grupo docker**: `docker exec` falha. `usermod -aG docker $USER` + relogin.
- **UFW ativado antes de confirmar SSH key**: prende você fora. Sempre teste antes.
- **systemctl restart sem daemon-reload**: mudança em override.conf não pega. Sempre `daemon-reload` antes.

## 21.8. Companies-spec

- **Slug renomeado**: quebra references em outros agents/skills/teams. Migre todas referências antes.
- **`schema:` no frontmatter ausente**: import passa silenciosamente mas comportamento indefinido. Sempre `schema: agentcompanies/v1` ou `schema: agentskills/v1`.
- **`kind:` errado**: ex: `kind: agent` em arquivo TASK.md. Validador rejeita.
- **`assignee:` apontando para slug inexistente**: orphan task — agente não pega.

## 21.9. Caching

- **Timestamp no system prompt**: invalida cache toda call.
- **Whitespace inconsistente em AGENTS.md**: lint markdown para normalizar.
- **Tools changes invalidam tudo**: adicionar MCP no meio do dia derruba cache.
- **`cache_creation` aparecendo em todo heartbeat**: você não está cacheando — algum prefix muda toda call.

## 21.10. Sessões e workspace

- **Sessões já abertas** (Telegram bot, websocket): cacheiam system prompt. Após mudar AGENTS.md, force nova sessão.
- **Mesmo `cwd` entre 2 agents**: race condition em writes. Use per-agent ou per-issue worktrees.
- **Workspace cresce silenciosamente**: cada heartbeat adiciona arquivos. Limpe periodicamente ou use worktrees ephemeral.
- **`cwd` apontando para path que não existe**: claude_local cria. codex_local não — falha.

## 21.11. Operação geral

- **Sem backup antes de editar**: rollback impossível. SEMPRE `pc-backup.sh`.
- **`paperclipai company import` sem `--dry-run`**: aplica mudanças que você não revisou. Sempre dry-run primeiro.
- **`--company-id` esquecido no import**: cria nova company. Resolve com `--collision-strategy replace` + `--company-id`.
- **Editar via UI E via markdown ao mesmo tempo**: divergência. Decida fonte da verdade (recomendado: markdown + import).
- **Logs crescem indefinidamente**: ative rotation. Em docker, log-driver com `max-size`.

## 21.12. Pricing/budget surpresas

- **Opus em agent que deveria ser Sonnet**: 5x mais caro do que esperado.
- **Cache read não aparecer**: alguns models/adapters não suportam — validar via `usage` field.
- **Tokens > expected**: tool output explosion (vazamento #2). Aplicar `references/10-*.md`.
- **Subscription Max + extra agents**: cuidado com cap (200/mo). Tier-based + caching mantém dentro.

## 21.13. Adicione novas armadilhas aqui

(Failure-driven hardening — quando bater em algo novo, documente.)
