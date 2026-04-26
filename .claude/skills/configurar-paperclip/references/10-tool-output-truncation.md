# 10 — Truncamento de tool output (vazamento #2 do playbook — economia ALTA)

> Outputs grandes (`ls -R`, logs, JSON dumps) viram lixo no contexto. Cada heartbeat
> seguinte carrega esse lixo de novo. Implemente regra clara nos AGENTS.md.

## 10.1. O problema

Sintoma: sessões longas ficam progressivamente mais caras por turno.

Por quê? O runtime envia o histórico completo da conversa a cada heartbeat. Inclui outputs verbosos de tool. Ex:
- Agent rodou `ls -R /large-repo` → 5.000 linhas.
- Próximo heartbeat: aquelas 5.000 linhas viram input.
- Próximo heartbeat: + outras 5.000 linhas de outro tool call.

Em poucas iterações, contexto explode. Limites de modelo são atingidos em minutos. E você paga input-tokens em cada turno.

## 10.2. A solução: regras explícitas em AGENTS.md

Cole o bloco do snippet `agents-md-tool-truncation.md` em **TODOS** os AGENTS.md:

```markdown
## Output Handling Rules

Regra geral: se um output passa de ~2.000 tokens, eu recebo summary ou view "head/tail" em vez do dado bruto.

- **Listing de diretório**: use `ls` (NÃO `ls -R`); navegue progressivamente.
- **Arquivos > 500 linhas**: `head -200` primeiro, depois `grep` para seções específicas.
- **JSON dumps**: piped através de `jq` extraindo apenas campos relevantes.
- **Logs**: sempre `tail -50`; expanda janela só se realmente necessário.
- **Database queries**: sempre com `LIMIT`.
- **API responses**: pegar primeira página, paginar progressivamente.

NUNCA `cat` arquivo > 1000 linhas sem filtragem.
NUNCA `ls -R` em árvore grande.
NUNCA dump completo de tabela.
```

## 10.3. Aplicação em massa

Para aplicar em todos os agents do package:

```bash
# Backup
./scripts/pc-backup.sh dir $PC_COMPANY_DIR

# Loop por cada AGENTS.md (use Edit do Claude para inserir o bloco)
for AGENTS_FILE in $PC_COMPANY_DIR/agents/*/AGENTS.md $PC_COMPANY_DIR/agents/*/AGENT.md; do
  [ -f "$AGENTS_FILE" ] || continue
  # Verificar se já tem o bloco
  if grep -q "Output Handling Rules" "$AGENTS_FILE"; then
    echo "$AGENTS_FILE — já tem"
  else
    echo "$AGENTS_FILE — precisa adicionar"
  fi
done
```

Use o Edit tool do Claude para inserir o bloco de `snippets/agents-md-tool-truncation.md` antes da seção "Lessons Learned" (ou no final, se não existir).

## 10.4. Padrões de comando substitutos

Cheat sheet a colocar no AGENTS.md:

| Em vez de... | Faça... |
|---|---|
| `ls -R /repo` | `find /repo -maxdepth 2 -type f` (limita profundidade) |
| `cat large.json` | `jq '.<field>' large.json` |
| `cat huge.log` | `tail -50 huge.log` |
| `cat server.log` (debugging) | `grep -E "error\|fatal" server.log \| tail -30` |
| `cat package.json` (full) | `jq '{name, version, scripts}' package.json` |
| `ps aux` | `ps -o pid,user,%cpu,%mem,comm` |
| `df` | `df -h /` |
| `git log` | `git log --oneline -20` |
| `git diff` | `git diff --stat` (overview) → `git diff <file>` (specific) |
| `curl https://api/...` (full) | `curl -s ... \| jq '.data[0:5]'` (sample) |

## 10.5. Verificação de impacto

Antes/depois:

```bash
# Tokens médios por heartbeat (últimos 7 dias)
curl -s "$PC_API_BASE/api/companies/$PC_COMPANY_ID/costs/by-agent" \
  | jq '.[] | {slug, avgInputPerRun: (.totalInputTokens / .runCount)}'
```

Esperado: redução de **40-60%** no tamanho médio de contexto em sessões com I/O pesado.

## 10.6. Anti-patterns frequentes (que esta regra combate)

- Agent faz `ls -R` para explorar repo → contexto vira árvore inteira.
- Agent faz `cat package-lock.json` ou similar → 50.000+ tokens em uma tool call.
- Agent debugando bug pega `cat server.log` (10MB) em vez de `grep` por padrão.
- Agent retorna API response inteira para "ler" um campo específico.
- Agent imprime resultado completo de `npm install` (incluindo deps tree).

Em todos os casos, tokens explodem desnecessariamente.

## 10.7. Quando QUEBRAR a regra

Casos legítimos onde output completo importa:
- Agent QA fazendo review de PR pequeno (< 500 linhas).
- Agent gerando relatório onde dados completos são entregáveis.
- Single-file edit onde entender contexto exige ler arquivo completo (~ 200-500 linhas).

Nesses casos, agent deve **explicitamente justificar** no comment da issue por que precisou do output completo. Failure-driven hardening: se padrão se repete, adicionar exceção explícita ao AGENTS.md.

## 10.8. Pegadinhas

- **`maxTurnsPerRun` pode mascarar o problema**: agent é killed antes do contexto explodir, mas você ainda paga pelos tokens já gastos. Resolva a CAUSA, não o sintoma.
- **`tail -50` sempre**: `tail` sem `-N` lê arquivo inteiro.
- **`grep` sem `-c`** quando só quer count: `grep "error" log` lista todas. `grep -c "error" log` retorna número.
- **`jq` é seu melhor amigo**: aprenda. `jq '.[] | select(.status == "active") | {id, name}'`.
- **Tool call output limit**: alguns runtimes truncam output da tool em ~10K tokens. Confiar nisso é frágil. Filtrar **antes** é mais seguro.
- **`echo $LARGE_VAR`** também conta como output — agent dump de var inteira é antipadrão.
