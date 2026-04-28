# memory/shared/projects/

> Contexto project-scoped — quando o aluno tem múltiplos projetos paralelos rodando, cada um tem sua pasta de memória aqui.

## Quando criar pasta de projeto

Crie `projects/{project-id}.md` quando:
- Aluno está mapeando **múltiplos nichos em paralelo** (ex: nicho 85 PetFlow + nicho 86 CronoReset).
- Aluno tem **múltiplos clientes ativos** que precisam de contexto separado mas relacionado.
- Aluno tem **múltiplas ofertas** sendo desenvolvidas.

Pra projeto único (caso default), `MEMORY.md` raiz já cobre — não criar pasta de projeto.

## Estrutura de cada arquivo

```markdown
---
type: project-memory
project_id: {{slug}}
created: {{YYYY-MM-DD}}
status: active|paused|done|archived
related_niches: [{{slug-1}}, {{slug-2}}]
related_clients: [{{slug-1}}]
related_offers: [{{slug-1}}]
---

# Projeto {{slug}}

## Objetivo
{{1 parágrafo}}

## Stakeholders
- {{nome}}: {{papel}}

## Constraints
- {{prazo}}, {{budget}}, {{escopo}}

## Decisões importantes
- (linkar pra arquivos em memory/shared/decisoes/)

## Próximo passo
{{1 linha}}

## Histórico de execuções relevantes
- {{YYYY-MM-DD}}: {{skill}} → {{outcome}}
```

## Quando ler

- **Início de sessão** se `MEMORY.md` referencia múltiplos projetos.
- **Antes de executar skill** que vai operar sobre artefato de um projeto específico (cross-project context).

## Anti-pattern

- ❌ Criar pasta de projeto pra cada cliente — cliente isolado vai pra `clientes/{slug}/`, não aqui.
- ❌ Duplicar conteúdo do MEMORY.md aqui — projects/ é pra projetos paralelos com escopo amplo.
