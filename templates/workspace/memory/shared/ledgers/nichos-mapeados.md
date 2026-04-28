---
type: ledger
last_updated: "{DATA-SETUP}"
managed_by: "/gos-map"
---

# Nichos mapeados

> Ledger pesquisável de todos os nichos com pesquisa rodada. **Regenerado por `/gos-map`** — não editar manualmente.

| Slug | Setor | Status | Mapeado em | Mecanismo | Próximo passo |
|---|---|---|---|---|---|
| *(vazio — rode `/gos-nicho-explorer` ou `/gos-mapear-nicho`)* | | | | | |

---

## Status possíveis

| Status | Significado |
|---|---|
| `researching` | Apenas `/gos-nicho-explorer` rodou (validação GO/NO-GO ou top 10). |
| `mapped` | `/gos-mapear-nicho` completo — 12 arquivos Johnny.Decimal preenchidos. |
| `offered` | Tem oferta criada em `ofertas/{slug}/`. |
| `validated` | 1+ cliente fechado com a oferta. |
| `archived` | Nicho descontinuado (movido pra `_arquivo/nichos/`). |

---

## Como ler

- **Mecanismo** = nome proprietário do sistema (preenchido por `/gos-mapear-nicho`).
- **Próximo passo** = sugestão automática de `/gos-map` baseada no status.
- **Última edição** = mtime do arquivo `_index.md` do nicho.
