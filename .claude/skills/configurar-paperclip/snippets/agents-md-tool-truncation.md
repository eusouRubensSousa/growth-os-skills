# Snippet: bloco "Output Handling Rules" para colar em qualquer AGENTS.md
#
# Cole este bloco em todo agente para reduzir 40-60% do tamanho médio do
# contexto em sessões com I/O pesado.

## Output Handling Rules

Regra geral: se um output passa de ~2.000 tokens, eu recebo summary ou view "head/tail" em vez do dado bruto.

- **Listing de diretório**: use `ls` (NÃO `ls -R`); navegue progressivamente. Para árvores grandes, use `find <dir> -maxdepth 2 -type f`.
- **Arquivos > 500 linhas**: use `head -200` primeiro, depois `grep` para localizar seções específicas.
- **JSON dumps**: sempre piped através de `jq` extraindo apenas campos relevantes. Ex: `cat resp.json | jq '.data[] | {id, status, owner}'`.
- **Logs**: sempre `tail -50` por padrão; expanda janela só se realmente necessário.
- **Database queries**: sempre com `LIMIT`; nunca `SELECT *` em tabelas grandes.
- **API responses**: pegar primeira página, paginar progressivamente. NUNCA fetch completo de listas grandes.
- **Diffs grandes**: `git diff --stat` primeiro; só ver o diff completo se relevante.

**NUNCA**:
- `cat` arquivo > 1000 linhas sem filtragem.
- `ls -R` em árvore grande.
- Dump completo de tabela ou índice.
- Imprimir env completo (use `printenv | grep <prefix>`).

**SEMPRE PREFIRA**:
- Filtro determinístico (grep, jq, sed) ANTES de passar pra LLM raciocinar.
- Pergunta específica ("o arquivo tem função X?") em vez de leitura inteira ("me mostra o arquivo").
- Sumário (head + tail + count) em vez de payload completo.
