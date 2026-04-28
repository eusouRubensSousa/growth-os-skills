# 06 — Adapters e modelos

> Decisão de qual adapter cada agent usa. Cada adapter mapeia para um runtime
> de execução (Claude Code, Codex CLI, etc).

## 6.1. Adapters disponíveis

| Adapter | Runtime | Quando usar |
|---|---|---|
| `claude_local` | Claude Code CLI local | Agents Claude (Anthropic) — preferido para skills + session resumption |
| `codex_local` | OpenAI Codex CLI local | Agents OpenAI |
| `gemini_local` | Gemini CLI local | Agents Google Gemini |
| `opencode_local` | OpenCode CLI | Multi-provider via opencode (Claude/OpenAI/Gemini/local) |
| `hermes_local` | Hermes CLI | Agents NousResearch |
| `droid_local` | Droid CLI | (specific) |
| `cursor` | Cursor IDE agent | Cursor users |
| `openclaw_gateway` | OpenClaw external | Reuse OpenClaw skills/agents |
| `process` | Shell genérico | Custom scripts, integração ad-hoc |
| `http` | Webhook bot | Bot externo respondendo HTTP |

## 6.2. `claude_local` — adapter recomendado

Vantagens vs outros:
- **Session resumption**: mesmo `cwd` mantém conversa entre heartbeats — agente não perde contexto.
- **Skill injection**: skills Paperclip viram symlinks via `--add-dir` (workspace fica limpo).
- **Test environment**: UI tem botão pra validar instalação, auth, e probe ao vivo.

### Config completa

```yaml
agents:
  engineer:
    adapter:
      type: claude_local
      config:
        cwd: /workspaces/engineer        # workspace dedicado
        model: claude-sonnet-4-6
        promptTemplate: |
          You are {{agent.name}} for {{company.name}}.
        timeoutSec: 1800
        graceSec: 30
        maxTurnsPerRun: 200
        dangerouslySkipPermissions: false
        env:
          ANTHROPIC_API_KEY:
            kind: secret
            requirement: required
```

### Pré-requisitos

- Claude Code CLI: `npm install -g @anthropic-ai/claude-code` (assumir instalado).
- `ANTHROPIC_API_KEY` em env ou Paperclip secret.
- Workspace `cwd` writable.

### Validação

UI tem "Test environment" button. Via CLI:
```bash
./scripts/pc-wrap.sh "agent get <agent-id>"
./scripts/pc-wrap.sh "heartbeat run --agent-id <agent-id>"   # primeiro test
```

## 6.3. `codex_local`

```yaml
agents:
  codex-engineer:
    adapter:
      type: codex_local
      config:
        cwd: /workspaces/codex-engineer
        model: gpt-5-codex
        timeoutSec: 1800
        env:
          OPENAI_API_KEY:
            kind: secret
            requirement: required
```

**Diferenças do claude_local:**
- Skills loadadas via global skills directory (não `--add-dir`).
- Pricing OpenAI direto (sem subscription Max).

## 6.4. `opencode_local` — multi-provider

```yaml
agents:
  multi-agent:
    adapter:
      type: opencode_local
      config:
        cwd: /workspaces/multi
        # FORMATO OBRIGATÓRIO: provider/model
        model: anthropic/claude-sonnet-4-6
        # Outros valores válidos:
        # model: openai/gpt-4o
        # model: google/gemini-2.5-flash
        timeoutSec: 1800
```

**Nota:** opencode valida `model` contra lista de providers configurados. Se errar formato, import falha.

## 6.5. `process` — para scripts custom

```yaml
agents:
  data-ingester:
    adapter:
      type: process
      config:
        cwd: /workspaces/ingest
        command: ["python3", "/opt/scripts/run-ingest.py", "--mode", "heartbeat"]
        timeoutSec: 600
        env:
          DB_URL:
            kind: secret
            requirement: required
```

Use quando: lógica é totalmente determinística e não precisa LLM. Princípio determinismo do playbook (`references/18-determinismo.md`).

## 6.6. `http` — para bots externos

```yaml
agents:
  external-bot:
    adapter:
      type: http
      config:
        endpoint: https://my-bot.example.com/heartbeat
        method: POST
        timeoutSec: 60
        headers:
          Authorization: "Bearer {{secrets.MY_BOT_TOKEN}}"
```

Bot externo precisa implementar contrato API documentado em docs/adapters/http.md do Paperclip.

## 6.7. Decisão de modelo (FOCO ECONÔMICO)

Para cada agent, escolher o modelo MAIS BARATO que ainda resolve a tarefa. Detalhes em `references/07-roteamento-modelo.md`.

Resumo (Apr 2026):

| Modelo | Custo input | Use para |
|---|---|---|
| Haiku 4.5 | $0.25/M | Triagem, ACK, status, classificação, formatação |
| Sonnet 4.6 | $3/M | Execução padrão (engineer, copywriter, QA) |
| Opus 4.7 | $15/M | Estratégia, arquitetura, decisões high-stakes |
| Gemini 2.5 Flash | varia | Multimodal (imagem/PDF/áudio) |

**Anti-pattern:** Opus em todos os agents. Custa 60x mais que Haiku, e em 80% das tarefas Sonnet entrega igual.

## 6.8. Subscription vs API

Se rodar 3+ agentes ativos: **Claude Code Max** ($200/mês fixo) economiza dramaticamente vs API on-demand. O `claude_local` adapter usa o mesmo CLI; subscription afeta apenas billing.

Quando faz sentido:
- 3+ agentes ativos.
- Várias horas/dia de uso.
- API bill > $100/mês → migrar.

Quando NÃO faz sentido:
- Uso esporádico.
- Sessões curtas.
- Agent único.

## 6.9. Workspace strategy

`cwd` define onde o agent executa. Estratégias:

### Per-agent workspace (default, recomendado)

```yaml
agents:
  engineer:
    adapter:
      config:
        cwd: /workspaces/engineer
  copywriter:
    adapter:
      config:
        cwd: /workspaces/copywriter
```

Vantagem: session resumption funciona. Cada agent acumula contexto sobre seu próprio trabalho.

### Shared workspace (caso especial)

```yaml
agents:
  pair-engineer-1:
    adapter:
      config:
        cwd: /workspaces/team-alpha
  pair-engineer-2:
    adapter:
      config:
        cwd: /workspaces/team-alpha   # MESMO cwd
```

Use quando: agents colaboram no mesmo código + Paperclip gerencia checkout para evitar conflito.

### Per-issue workspace (git worktrees)

Paperclip suporta isolated execution workspaces (worktrees) para isolar trabalho por issue. Isso reseta `cwd` por issue → novo session toda vez. Custa cache mas isola perfeitamente. Trade-off explícito.

## 6.10. Pegadinhas

- **`dangerouslySkipPermissions: true`** em automação não-supervisionada é necessário (não tem como aprovar dialogs), mas usa em workspace isolado.
- **`maxTurnsPerRun`** muito alto + heartbeat curto = runaway. Default 300 é seguro; agressivo é 50-100.
- **`timeoutSec` muito baixo** quebra tarefas longas; muito alto custa em hangs. 1800s (30min) é razoável.
- **CLI não autenticado**: rodar `claude` localmente uma vez interativamente ajuda — depois Paperclip usa token salvo.
- **Múltiplas versões CLI** (npm global vs npx): garanta a versão certa via `which claude` no host.
- **Workspace cresce silenciosamente**: cada heartbeat pode adicionar arquivos. Limpar `cwd` periodicamente ou usar worktrees.
