---
type: ledger
last_updated: "{DATA-SETUP}"
managed_by: "/a360-map"
---

# Nichos mapeados

> Ledger pesquisável de todos os nichos com pesquisa rodada. **Regenerado por `/a360-map`** — não editar manualmente.

| Slug | Setor | Status | Mapeado em | Mecanismo | Próximo passo |
|---|---|---|---|---|---|
| *(vazio — rode `/nicho-explorer` ou `/mapear-nicho-lite`)* | | | | | |

---

## Status possíveis

| Status | Significado |
|---|---|
| `researching` | Apenas `/nicho-explorer` rodou (validação GO/NO-GO ou top 10). |
| `mapped` | `/mapear-nicho-lite` completo — 12 arquivos Johnny.Decimal preenchidos. |
| `offered` | Tem oferta criada em `ofertas/{slug}/`. |
| `validated` | 1+ cliente fechado com a oferta. |
| `archived` | Nicho descontinuado (movido pra `_arquivo/nichos/`). |

---

## Como ler

- **Mecanismo** = nome proprietário do sistema (preenchido por `/mapear-nicho-lite`).
- **Próximo passo** = sugestão automática de `/a360-map` baseada no status.
- **Última edição** = mtime do arquivo `_index.md` do nicho.
