# 22 — Audit & otimização automática

> Modo "analisar e aplicar otimizações" — usuário diz "audita meu paperclip" /
> "otimiza" / "reduz custo". Você roda snapshot, cruza com este rulebook,
> propõe um plano categorizado e aplica com aprovação.

## 22.1. Fluxo

```
[1] detectar target          → references/01-conexao.md
[2] coletar snapshot         → scripts/pc-audit.sh /tmp/audit.txt
[3] analisar (Claude lê o snapshot + este rulebook)
[4] mostrar relatório scoreado com economia estimada
[5] perguntar quais áreas aplicar (3 modos: críticos / recomendado completo / escolher)
[6] aplicar selecionados (cada um: backup → patch → import dry-run → import → verify)
[7] gerar diff antes/depois e estimar economia em $/mês
```

## 22.2. Severidades

| Severidade | Símbolo | Significado | Ação default |
|---|---|---|---|
| **Crítico** | 🔴 | Risco de quebrar sistema, vazar credencial, ou runaway de custo | Aplicar sempre (com aprovação explícita) |
| **Recomendado** | 🟡 | Best practice estabelecida que reduz custo, melhora UX ou previne dor | Aplicar se usuário aceita catálogo recomendado |
| **Opcional** | 🔵 | Estratégia situacional — depende de uso/orçamento | Mostrar e perguntar |
| **OK** | ✅ | Já está conforme | Listar para feedback positivo |

## 22.3. Rulebook (a planilha de checagens)

### A. Setup baseline

| # | Checagem | Esperado | Severidade | Ação | Custo |
|---|---|---|---|---|---|
| A1 | `paperclipai doctor` sem erros | OK | 🔴 | `doctor --repair` ou investigar | $0 |
| A2 | `.paperclip.yaml` existe no $PC_COMPANY_DIR | sim | 🔴 | criar via `paperclip-yaml-base.yaml` | $0 |
| A3 | `schema: paperclip/v1` declarado | sim | 🔴 | adicionar | $0 |
| A4 | Cada agent em pasta tem entry no `.paperclip.yaml` | sim | 🟡 | adicionar entries faltantes | $0 |
| A5 | `paperclipai env` mostra `ANTHROPIC_API_KEY` (ou outra prov) configurado | sim | 🔴 | `pc-secret-set.sh` | $0 |
| A6 | `company import --dry-run` sem warnings | OK | 🔴 | corrigir issues primeiro | depende |

### B. Vazamento #1 — skill monolítica no heartbeat (alta economia)

| # | Checagem | Esperado | Severidade | Ação | Economia |
|---|---|---|---|---|---|
| B1 | Cada agent tem `PROTOCOL.md` próprio | sim | 🟡 | criar via `protocol-md-template.md` | -2.500 a -3.000 tok/heartbeat |
| B2 | AGENTS.md inclui "Protocol Override" instruction | sim | 🟡 | inserir bloco | parte da B1 |
| B3 | Skill `paperclip` default NÃO está sendo invocada | sim | 🟡 | remover do `frontmatter.skills:` se presente | parte da B1 |
| B4 | AGENTS.md < 200 linhas | sim | 🔵 | mover detalhes para `references/` | -500 a -1.500 tok/heartbeat |
| B5 | MEMORY.md < 5KB | sim | 🟡 | consolidar daily logs em `memory/daily/` | -200 a -800 tok/heartbeat |

### C. Vazamento #2 — tool output explosion (alta economia)

| # | Checagem | Esperado | Severidade | Ação | Economia |
|---|---|---|---|---|---|
| C1 | AGENTS.md tem bloco "Output Handling Rules" | sim | 🟡 | colar `agents-md-tool-truncation.md` | 40-60% redução contexto |
| C2 | Activity log mostra heartbeats com input < 50K tokens em média | sim | 🔵 | aplicar C1 e medir | parte da C1 |

### D. Vazamento #3 — heartbeat agressivo (alta economia)

| # | Checagem | Esperado | Severidade | Ação | Economia |
|---|---|---|---|---|---|
| D1 | Agents non-strategic com `intervalSec: 0` (event-driven) | sim | 🟡 | patch `paperclip-yaml-routines.yaml` | até -50% custo agent |
| D2 | Cron expressions com 5 partes (não shorthand) | sim | 🔴 | corrigir | $0 (mas falha import) |
| D3 | Routines têm `timezone:` declarado | sim | 🟡 | adicionar | $0 (mas evita acordar 3h AM) |
| D4 | Routines com `catchUpPolicy: skip` (default seguro) | sim | 🔵 | adicionar | evita storm pós-downtime |
| D5 | Heartbeats `empty_response` < 30% do total | sim | 🟡 | reduzir intervalSec ou trocar para event-driven | depende |

### E. Roteamento de modelo (muito alta economia)

| # | Checagem | Esperado | Severidade | Ação | Economia |
|---|---|---|---|---|---|
| E1 | CEO/CTO/CMO usando Opus | sim | 🔵 | confirmar (estratégico justifica) | — |
| E2 | IC tier (engineer, copywriter) usando Sonnet, NÃO Opus | sim | 🟡 | patch `paperclip-yaml-routing.yaml` | ~5x redução (Opus → Sonnet) |
| E3 | Triage/ACK/status agents usando Haiku, NÃO Sonnet | sim | 🟡 | patch | ~12x redução (Sonnet → Haiku) |
| E4 | `opencode_local` model em formato `provider/model` | sim | 🔴 | corrigir | $0 (mas falha import) |
| E5 | Modelo deprecated (verificar versão atual) | não | 🟡 | atualizar para versão mantida | $0 |

### F. Prompt caching (muito alta economia em API on-demand)

| # | Checagem | Esperado | Severidade | Ação | Economia |
|---|---|---|---|---|---|
| F1 | Cache hit rate > 60% (medir via activity) | sim | 🟡 | auditar anti-patterns em §11 | até -90% input cost |
| F2 | Sem timestamps em AGENTS.md / system prompt | sim | 🟡 | mover timestamp para zona dinâmica | parte de F1 |
| F3 | Sem user-specific content em prefix cacheado | sim | 🟡 | mover user info para mensagem dinâmica | parte de F1 |
| F4 | MEMORY.md edição < 1x/dia (estável) | sim | 🟡 | move daily logs para `memory/daily/` | parte de F1 |
| F5 | Mesmo `cwd` por agent (não rotacione) | sim | 🟡 | manter | parte de F1 (resume session) |

### G. Budgets

| # | Checagem | Esperado | Severidade | Ação | Custo |
|---|---|---|---|---|---|
| G1 | `budgets.company.monthlyCents` declarado | sim | 🔴 | adicionar (use snippet) | previne runaway catastrófico |
| G2 | Cada agent tem `budgetMonthlyCents` declarado | sim | 🔴 | declare per-agent + `default` | previne runaway per-agent |
| G3 | Soma per-agent ≤ company | sim | 🟡 | ajustar | $0 |
| G4 | Nenhum agent atualmente em > 80% budget | sim | 🟡 | investigar (loop? modelo errado?) | depende |
| G5 | Anomaly detector rodando (guardian-bot routine) | sim | 🔵 | adicionar agent + routine diária | <$5/mês de Haiku |

### H. Concurrency

| # | Checagem | Esperado | Severidade | Ação |
|---|---|---|---|---|
| H1 | `concurrency.maxConcurrentAgents` declarado | sim (3-5 default) | 🟡 | patch `paperclip-yaml-concurrency.yaml` |
| H2 | `concurrency.maxConcurrentPerAgent: 1` | sim | 🟡 | declarar |
| H3 | Queue depth NÃO cresce sem limite | sim | 🔵 | aumentar maxConcurrent ou paralelizar |

### I. Memória e arquitetura

| # | Checagem | Esperado | Severidade | Ação |
|---|---|---|---|---|
| I1 | `memory/shared/` e `memory/per-agent/` existem | sim | 🔵 | criar dirs |
| I2 | `references/` por agent (TOC pattern) | sim | 🔵 | criar + cole `agents-md-references-toc.md` |
| I3 | `progress.txt` em projetos longos | sim (caso aplicável) | 🔵 | criar via `progress-txt-template.md` |
| I4 | Daily logs separados de MEMORY.md | sim | 🟡 | mover para `memory/daily/` |

### J. Determinismo vs agente

| # | Checagem | Esperado | Severidade | Ação |
|---|---|---|---|---|
| J1 | Agentes fazendo ETL repetitivo | NÃO (use Airbyte/script) | 🔵 | migrar para cron + Camada 1 (`refs/18`) |
| J2 | Agentes calculando agregações que poderiam ser SQL view | NÃO | 🔵 | criar view + agent só consulta |
| J3 | MCP write servers para ações executivas | sim | 🔵 | adicionar (modular) |

### K. Segurança

| # | Checagem | Esperado | Severidade | Ação |
|---|---|---|---|---|
| K1 | AGENTS.md tem "Security Rules" anti-injection | sim | 🔴 | colar `agents-md-security-rules.md` |
| K2 | Secrets em `.paperclip.yaml` declarados como `kind: secret` (não plaintext) | sim | 🔴 | mudar declaração |
| K3 | Grep em git por secret patterns vazia | sim | 🔴 | revogar + trocar credenciais vazadas |
| K4 | UFW ativo (apenas ssh-* VPS) | sim | 🟡 | configurar |
| K5 | fail2ban ativo (apenas ssh-* VPS) | sim | 🟡 | configurar |
| K6 | SSH `PermitRootLogin prohibit-password` (apenas ssh-*) | sim | 🟡 | configurar com confirmação |

## 22.4. Apresentação ao usuário

Após coletar snapshot, mostre relatório no formato:

```
🔍 Audit do Paperclip — <data>
Target: <PC_MODE> em <PC_HOST/local>
Company: <name> (<company-id>)

=== 🔴 Críticos (2) ===
- G1: budgets.company.monthlyCents não declarado.
      Ação: adicionar `monthlyCents: 50000` em .paperclip.yaml.
      Impacto: previne runaway catastrófico.
- A5: ANTHROPIC_API_KEY não está em secrets.
      Ação: pc-secret-set.sh ANTHROPIC_API_KEY ...

=== 🟡 Recomendados (8) — economia estimada $X/mês ===
- B1: 6 agents sem PROTOCOL.md (carregam paperclip skill monolítica).
      Economia: ~3.000 tokens × 6 × 24/dia = 432K/dia.
      Em Sonnet: ~$39/mês.
      Ação: criar PROTOCOL.md em cada (template incluído).
...

=== 🔵 Opcionais (4) ===
- I3: nenhum projeto tem progress.txt — só relevante se há tarefas multi-day.
...

=== ✅ OK (5) ===
- A1: doctor sem erros.
- A2: .paperclip.yaml existe.
...

=== 💰 Economia total estimada se aplicar tudo Recomendado ===
Antes: ~$<X>/mês
Depois: ~$<Y>/mês
Economia: ~$<Z>/mês (-NN%)
```

## 22.5. Perguntar via [AskUserQuestion]

```
Question: Quais áreas você quer aplicar agora?
Options:
  - Apenas críticos (2 itens)
  - Críticos + Recomendados (10 itens, economia ~$Z/mês)
  - Escolher manualmente quais aplicar
  - Só relatório, não aplicar agora
```

## 22.6. Aplicação por ordem de impacto

Se usuário escolheu "tudo recomendado", aplique em ordem (impacto/esforço):

1. **Tier-based protocols** (B1, B2) — alto impacto, baixo esforço.
2. **Tool output truncation** (C1) — alto impacto, baixo esforço.
3. **Model routing** (E2, E3) — muito alto impacto, médio esforço.
4. **Heartbeat conservador** (D1, D3, D4) — alto impacto, baixo esforço.
5. **Budgets** (G1, G2) — crítico, baixo esforço.
6. **Caching cleanup** (F2-F5) — muito alto impacto, médio esforço.
7. **Concurrency caps** (H1, H2) — médio impacto, baixo esforço.
8. **Memory split + references TOC** (I1, I2, I4) — sustenta ganhos.
9. **Security rules** (K1-K3) — defensivo.

Cada um: `backup → patch → dry-run → import → verify`.

## 22.7. Cálculo de ROI (template)

Para mostrar ao user impacto estimado:

```
=== Cenário ===
Agentes ativos: 8
Heartbeat médio atual: 4h (6 ticks/dia)
Custo médio por heartbeat (medido): $0.45

Custo mensal antes:
  8 × 6 × 30 × $0.45 = $648/mês

Após otimizações (acumulado):
- Tier-based protocols:        -25%
- Tool output truncation:      -15%
- Prompt caching cleanup:      -50% no input (-30% total)
- Model routing (alguns Haiku):-20%
- Heartbeat conservador:       -25% (event-driven em alguns)

Efeito composto: ~-75% custo total
Custo mensal depois: ~$160/mês
Economia: ~$488/mês (~$5.860/ano)

Payback: primeira semana já paga.
Esforço: 3-4 semanas trabalho focado.
```

## 22.8. Aplicar em ordem com dry-run sempre

```bash
# Para cada item selecionado:
./scripts/pc-backup.sh dir $PC_COMPANY_DIR
# (aplicar mudança específica via Edit/Write OU pc-apply-patch.sh)
./scripts/pc-wrap.sh "company import $PC_COMPANY_DIR --company-id $PC_COMPANY_ID --dry-run"
# (revisar output)
./scripts/pc-wrap.sh "company import $PC_COMPANY_DIR --company-id $PC_COMPANY_ID"
./scripts/pc-wrap.sh "doctor"
./scripts/pc-wrap.sh "heartbeat run --agent-id <id>"   # smoke test
```

Se algum falhar: `./scripts/pc-rollback.sh <arquivo>` e investigue.

## 22.9. Verificação pós-aplicação (7 dias)

Após 7 dias:

```bash
./scripts/pc-audit.sh /tmp/audit-after.txt
diff /tmp/audit-before.txt /tmp/audit-after.txt | head -100

# Comparar custos
curl -s "$PC_API_BASE/api/companies/$PC_COMPANY_ID/costs/summary" | jq
```

Espera-se redução de 40-70% no custo dependendo do estado inicial.

Se NÃO reduziu: investigar — talvez:
- Cache hit rate ainda baixo (anti-patterns persistentes).
- Agent não está usando PROTOCOL.md (sessão antiga em cache).
- Modelo não foi efetivamente trocado.

## 22.10. Checklist de auditoria mensal (cole em routine)

Para implementações em produção. Rodar todo mês.

### Custo
- [ ] Custo por agente dentro do budget?
- [ ] Algum agente com 2x custo do mês passado sem justificativa?
- [ ] Custo por task entregue está estável ou caindo?
- [ ] Cache hit rate > 60%?

### Performance
- [ ] Heartbeats completam dentro do timeout?
- [ ] Há agentes acordando ociosos? (>30% empty_response)
- [ ] Tasks blocked > 24h sem alerta?
- [ ] Concurrency cap atingido (sinal de subdimensionamento)?

### Qualidade
- [ ] MEMORY.md de cada agente < 5KB?
- [ ] AGENTS.md < 200 linhas?
- [ ] References/ sendo usadas (verificar nos logs de skill loading)?
- [ ] Daily notes consolidadas pro MEMORY.md mensalmente?

### Segurança
- [ ] Nenhum secret em plaintext em arquivos versionados?
- [ ] Approval gates funcionando para ações > threshold financeiro?
- [ ] Logs de audit completos para últimos 30 dias?
- [ ] Backups de package agendados e testados?
