---
type: arquivo/readme
---

# _arquivo — Histórico

PARA Archive. Onde vão nichos, clientes e ofertas que saíram de operação ativa.

## Estrutura

```
_arquivo/
├── nichos/{slug}/      Nicho descontinuado (mantém histórico — útil pra evitar repetir GO/NO-GO)
├── clientes/{slug}/    Cliente encerrado (churned ou contrato terminou)
└── ofertas/{slug}/     Oferta substituída ou descontinuada
```

## Quando arquivar

- Nicho: `/trocar-nicho` move pra cá automaticamente. Ou aluno move manual quando NO-GO.
- Cliente: status `churned` por > 90 dias OU encerramento de contrato.
- Oferta: status `archived` quando substituída por versão nova.

## Como arquivar

```bash
mv nichos/{slug} _arquivo/nichos/{slug}
```

E atualizar `memory/shared/nichos-mapeados.md` (status: `archived`).

## Por que manter histórico

- Aluno pode voltar pra um nicho 6 meses depois com ângulo novo.
- Aprendizado de cliente que churnou alimenta nicho/oferta.
- Evita repetir trabalho de pesquisa.

## Não pisar

- Nunca **deletar** — sempre arquivar.
- Nunca **editar** arquivo arquivado — se voltar a usar, copiar pra `nichos/`/`clientes/` e marcar como retomada.
