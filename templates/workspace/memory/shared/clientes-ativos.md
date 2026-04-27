---
type: ledger
last_updated: "{DATA-SETUP}"
managed_by: "/a360-map"
---

# Clientes ativos

> Ledger pesquisável de todos os clientes em pipeline. **Regenerado por `/a360-map`** — não editar manualmente.

| Slug | Empresa | Nicho | Status | Iniciado em | Oferta | Receita |
|---|---|---|---|---|---|---|
| *(vazio — rode `/cliente-radar` ao identificar prospect)* | | | | | | |

---

## Status possíveis

| Status | Significado |
|---|---|
| `prospect` | Em conversa, sem contrato. |
| `radar-done` | `/cliente-radar` rodado. Tem `00-perfil.md`. |
| `meeting-prep-done` | `/meeting-prep` rodado. Briefing pronto pra reunião. |
| `proposta-enviada` | Proposta formal enviada. |
| `closed` | Contrato fechado. Setup pago. |
| `implementing` | Implantação em andamento (LP + deck + sistema). |
| `live` | Sistema rodando. Em recorrência. |
| `paused` | Pausado temporariamente. |
| `churned` | Encerrou contrato (registrar razão em `clientes/{slug}/_index.md`). |
| `archived` | Movido pra `_arquivo/clientes/`. |

---

## Cliente ≠ Oferta

Cada cliente recebe **uma oferta** (referenciada em `clientes/{slug}/00-perfil.md` no campo `oferta`). A mesma oferta de `ofertas/` pode ser instalada em múltiplos clientes — esse é o coração do "construa uma vez, instale em N empresas".
