# 09 — Tier-based protocols (vazamento #1 do playbook — economia ALTA)

> A skill `paperclip.md` monolítica tem ~3.000 tokens e é carregada por **todo
> agente em todo heartbeat**, mesmo que ele use 10% do conteúdo. Substitua
> por `PROTOCOL.md` enxuto por papel — economiza ~3.000 tokens × N × M.

## 9.1. O problema

Padrão Paperclip default: cada agent invoca a skill `paperclip.md` no system prompt. Essa skill é genérica, cobre TODOS os papéis. Resultado:

- **CEO** carrega instruções sobre IC checkout flow (não usa).
- **IC** carrega instruções sobre delegação e governance (não usa).
- **Triage bot** carrega tudo (raramente faz nada complexo).

Multiplique:
- 10 agentes × 24 heartbeats/dia × 3.000 tokens = **720.000 tokens/dia desperdiçados**.
- Com Sonnet input ($3/M): **~$65/mês** só nessa otimização.

## 9.2. A solução

Cada agente tem seu próprio `PROTOCOL.md` enxuto (~40-60 linhas) que descreve **apenas** o que aquele papel precisa fazer no heartbeat.

Estrutura:

```
agents/
├── triage-bot/
│   ├── AGENTS.md
│   └── PROTOCOL.md     # ~30 linhas: checkout fast → classify → assign → done
├── engineer/
│   ├── AGENTS.md
│   └── PROTOCOL.md     # ~50 linhas: checkout → execute → review request
├── pm/
│   ├── AGENTS.md
│   └── PROTOCOL.md     # ~70 linhas: + delegação, backlog grooming
└── ceo/
    ├── AGENTS.md
    └── PROTOCOL.md     # ~80 linhas: + governance, hire/fire approvals
```

## 9.3. Protocol Override em AGENTS.md

Cada `AGENTS.md` ganha um bloco no topo:

```markdown
## Protocol Override
Read PROTOCOL.md instead of invoking the paperclip skill.
Do NOT load the default paperclip.md skill on heartbeat.
```

Isso instrui o agent a:
1. NÃO carregar `paperclip.md` default.
2. Usar `PROTOCOL.md` local (vive ao lado de AGENTS.md).

## 9.4. Templates por tier

Use snippets:

| Tier | Snippet AGENTS.md | Snippet PROTOCOL.md |
|---|---|---|
| IC (engineer, copywriter, qa, analyst) | `agents-md-tier-ic.md` | `protocol-md-template.md` |
| PM / Manager | `agents-md-tier-pm.md` | `protocol-md-template.md` (+ seção de delegação) |
| CEO / CTO / CMO | `agents-md-tier-ceo.md` | `protocol-md-template.md` (+ seção de governance) |

## 9.5. Workflow de aplicação

```
[1] Backup do package
    ./scripts/pc-backup.sh dir $PC_COMPANY_DIR

[2] Para cada agente, criar PROTOCOL.md
    cp ./snippets/protocol-md-template.md $PC_COMPANY_DIR/agents/<slug>/PROTOCOL.md
    # Customizar para o papel (escalation rules, decision logic)

[3] Adicionar "Protocol Override" no AGENTS.md de cada agente
    # Use Edit ferramenta para inserir o bloco

[4] Validar
    ./scripts/pc-wrap.sh "company import $PC_COMPANY_DIR --company-id $PC_COMPANY_ID --dry-run"

[5] Aplicar
    ./scripts/pc-wrap.sh "company import $PC_COMPANY_DIR --company-id $PC_COMPANY_ID"

[6] Verificar
    ./scripts/pc-wrap.sh "heartbeat run --agent-id <id-de-um-agente>"
    # Verificar logs/dashboard que tokens caíram drasticamente
```

## 9.6. Verificação de impacto

Antes/depois — comparar tokens médios por heartbeat:

```bash
# Antes (medir 7 dias)
curl -s "$PC_API_BASE/api/companies/$PC_COMPANY_ID/costs/by-agent" \
  | jq '.[] | {slug, avgTokensPerRun: (.totalInputTokens / .runCount)}'

# Aplicar mudança

# Depois (medir 7 dias)
curl -s "$PC_API_BASE/api/companies/$PC_COMPANY_ID/costs/by-agent" \
  | jq '.[] | {slug, avgTokensPerRun: (.totalInputTokens / .runCount)}'
```

Esperado: **-2.500 a -3.000 tokens/heartbeat**.

## 9.7. Diferenciação por tier

### IC tier (PROTOCOL.md mínimo)

Foco em: pegar trabalho, executar, atualizar status. Sem governance.

Seções:
1. Identity check.
2. Approvals.
3. Pick assignment.
4. Checkout.
5. Execute.
6. Update status.

(Usar `snippets/protocol-md-template.md` direto.)

### PM tier (PROTOCOL.md com delegação)

Adiciona ao IC:
7. Backlog grooming (só se backlog > N items stale).
8. Delegate (criar subtasks com parentId).
9. Review (issues `in_review` atribuídas).

### CEO tier (PROTOCOL.md com governance)

Adiciona ao PM:
10. Review pending strategy approvals.
11. Hire/fire approvals.
12. Budget review (se algum agent passou de 80%).
13. Cross-team escalations.

## 9.8. Manter PROTOCOL.md curto

- < 100 linhas total (ideal < 60).
- Sem tutoriais — só o que difere do default.
- Decisão lógica explícita ("se X então faça Y, senão escalate para Z").
- NÃO duplique conteúdo de AGENTS.md.

## 9.9. Quando NÃO migrar para tier-based

- Company com 1-2 agents apenas: economia marginal não justifica refatoração.
- Agents com workflow muito custom já documentado em SKILL específica: deixe.
- Em produção crítica sem janela de teste: migre em sandbox primeiro.

## 9.10. Pegadinhas

- **PROTOCOL.md fica ao lado de AGENTS.md** — mesmo path. NÃO em `references/`.
- **"Protocol Override" em AGENTS.md** precisa ser explícito, agent não infere.
- **Não remova `skills:` do frontmatter de AGENTS.md** se outras skills (custom) ainda são usadas.
- **Skill `paperclip` ainda existe** em `skills/paperclip/SKILL.md` (default Paperclip ship). Não delete — outros vendors podem usar. Apenas não invoque.
- **Sessão Claude Code resume**: agent pode ainda ter system prompt antigo cacheado. Force novo session reiniciando workspace ou mudando `cwd`.
- **Failure-driven hardening**: quando PROTOCOL.md falhar num caso específico, adicione regra explícita. Não reescreva tudo.
