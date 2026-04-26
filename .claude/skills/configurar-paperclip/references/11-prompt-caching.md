# 11 — Prompt caching consciente (impacto: muito alto, esforço: médio)

> Caching reduz custo de input em **60-90%** quando bem implementado. A primeira
> chamada paga 1.25x para escrever o cache. Chamadas seguintes dentro do TTL
> pagam 0.1x (10% do custo normal).

## 11.1. Como funciona o cache da Anthropic

| Operação | Multiplicador |
|---|---|
| Cache write (5min TTL) | **1.25x** preço base |
| Cache write (1h TTL) | **2x** preço base |
| Cache hit | **0.1x** preço base (90% off) |
| Tokens não-cacheados | 1.0x |

**TTL default:** 5 minutos. Cada hit refresca TTL → conversa contínua mantém cache vivo.

**Mínimo cacheável** (Apr 2026):
- Opus 4.5+ / Haiku 4.5+: **4.096 tokens**
- Sonnet 4.6: **2.048 tokens**

Abaixo do mínimo: nada é cacheado, cobra preço cheio.

**Hierarquia de invalidação** (cascata): `tools` → `system` → `messages`.
Mudou tools → invalida tudo. Mudou system → invalida system+messages. Mudou messages no início → invalida só dali pra frente.

## 11.2. Estrutura ideal do prompt (ordem importa!)

```
┌─────────────────────────────────────┐
│ ESTÁTICO (cacheável)                │
│ - tools definitions (no topo)       │
│ - system prompt (identity, base)    │
│ - few-shot examples                 │
│ - skill definitions                 │
├─────────────────────────────────────┤
│ SEMI-ESTÁTICO (cacheável por sessão)│
│ - documento ou codebase da sessão   │
│ - contexto de projeto (PROJECT.md)  │
│ - MEMORY.md compartilhada           │
├─────────────────────────────────────┤
│ DINÂMICO (sem cache)                │
│ - query do usuário                  │
│ - histórico recente                 │
│ - timestamp atual                   │
│ - tool results da iteração          │
└─────────────────────────────────────┘
```

## 11.3. Anti-patterns que matam o cache (auditar PRIMEIRO)

Cada um destes invalida o cache em todo heartbeat:

### ❌ Timestamps no conteúdo cacheado

```markdown
# AGENTS.md
Today is {{currentDate}} ...
```
→ Cada call tem timestamp diferente → cache miss sempre.

**Fix:** mover timestamp para o final (zona dinâmica), nunca no system prompt.

### ❌ User-specific content no prefix

```markdown
# AGENTS.md
You are helping user_id={{userId}} ...
```
→ Cada user gera cache separado. Se userId vem em todo prompt, no system, vira N caches.

**Fix:** user info na zona dinâmica (mensagem do user).

### ❌ Whitespace inconsistente

Reescrever AGENTS.md com tabs/spaces alternados ou trailing whitespace variável a cada save.

**Fix:** lint markdown (markdownlint, prettier) para normalizar.

### ❌ Compaction de contexto frequente

Algumas implementações comprimem histórico longo periodicamente. Toda compaction reescreve o início do contexto → invalida cache inteiro.

**Fix:** compactação com cuidado — preferir progress.txt handoff (`references/17-progress-handoff.md`) que reseta com state explícito.

### ❌ Reescrita constante de MEMORY.md

MEMORY.md é parte do system context (geralmente). Editar a cada heartbeat invalida cache.

**Fix:** consolidação MEMORY.md é mensal/semanal, não diária. Daily logs ficam em `memory/shared/daily/<date>.md` (carregados sob demanda).

### ❌ Rotação de skill order

Carregar skills em ordem aleatória/diferente quebra cache.

**Fix:** ordem determinística em `agents/<slug>/skills:` (alfabética ou explícita).

## 11.4. Auditoria de cache hit rate

Antes de "otimizar caching", meça onde está. Anthropic retorna métricas no `usage`:

```json
{
  "usage": {
    "input_tokens": 250,
    "cache_creation_input_tokens": 100000,
    "cache_read_input_tokens": 50000
  }
}
```

Total = read + creation + input.

**Cache hit rate** = `cache_read / (cache_read + cache_creation + input)`.

Target: **> 60%**.

Cheque via Paperclip dashboard (se expõe) ou nos logs do adapter:

```bash
./scripts/pc-wrap.sh "activity --agent-id <id> --json" \
  | jq '[.[] | .usage] | add | {read: .cache_read_input_tokens, creation: .cache_creation_input_tokens, input: .input_tokens}'
```

Se hit rate < 30%: você está perdendo o benefício. Audite anti-patterns acima.

## 11.5. Estratégia de breakpoints

Anthropic suporta até **4 cache breakpoints** explícitos via `cache_control: { type: "ephemeral" }`. Lookback window: 20 blocos.

Em automatic caching (default), o sistema move o breakpoint progressivamente — funciona bem para conversas multi-turn. Em explicit caching:

**Coloque breakpoints em:**
1. Fim de tools definitions.
2. Fim de system prompt (após AGENTS.md, MEMORY.md).
3. Fim de skill definitions.
4. Fim do "documento da sessão" (se houver).

**NÃO coloque em:**
- Bloco que muda toda call (timestamp, tool result, user message).

## 11.6. Aplicação no Paperclip

Paperclip + Claude Code adapter:
- Adapter usa Claude Code CLI, que cacheia automaticamente conversação multi-turn.
- Mesmo `cwd` mantém session id → resume conversation → cache reaproveitado.
- Mudar `cwd` quebra cache (novo session).

**Recomendações:**
1. Cada agent com `cwd` próprio fixo (não rotacione).
2. AGENTS.md / MEMORY.md / PROTOCOL.md edições devem ser RAROS.
3. Daily memory entries em `memory/<slug>/daily/<date>.md` carregadas sob demanda, **NÃO** no system prompt.
4. Skills loaded via `--add-dir` (claude_local) — Paperclip já cuida disso.

## 11.7. Subscription Max muda o cálculo

Se você está em **Claude Code Max ($200/mês fixo)**, prompt caching ainda economiza, mas o impacto é absorvido pelo cap mensal. Cache continua útil para:
- Reduzir latência (cache read é mais rápido).
- Manter dentro do rate limit.

Para usuários em **API on-demand**, caching é onde mora 60-90% da economia.

## 11.8. Cálculo de impacto

Cenário típico: 70% do contexto é estável (system + skills + AGENTS.md + MEMORY.md), 30% dinâmico.

Antes (sem cache):
- 100K tokens × $3/M = $0.30 por heartbeat

Depois (cache hit em 70% estável):
- 70K cache read × $0.30/M = $0.021
- 30K input × $3/M = $0.09
- (Primeira call do dia paga write 1.25x dos 70K = $0.026; depois é só read)
- **Total: ~$0.11 por heartbeat (-63%)**

## 11.9. Pegadinhas

- **5min TTL** é janela curta — agente que dorme 30min entre heartbeats perde cache. Mitigation: **conversation continuity via session resumption**.
- **Cada usuário/conversation tem cache separado** — caching não é global, é por session.
- **Cache writes são MAIS CAROS que tokens não-cacheados** (1.25x). Mudar AGENTS.md grande durante o dia faz você pagar write várias vezes.
- **Tools changes invalidam tudo**: se você adiciona MCP tool no meio do dia, todo o cache cai.
- **Prefix matching**: cache só hita se prefix bater EXATAMENTE. Um espaço a mais quebra.
- **Speed setting (fast vs standard)** invalida system+messages cache se mudar.
- **Como medir progresso**: salve hit rate antes da otimização e depois de 7 dias. Esperado: subir de 20-30% para 60-80%.
