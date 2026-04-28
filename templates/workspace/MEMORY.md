---
workspace: a360
operator: "{NOME-DO-ALUNO}"
created: "{DATA-SETUP}"
last_consolidated: "{DATA-SETUP}"
next_consolidation: "{DATA-SETUP-+30D}"
status: ativo
---

# MEMORY.md — Workspace A360

> Arquivo carregado no início de toda sessão. Apenas contexto **load-bearing**.
> Mantém-se < 5KB. Detalhe vai pra `memory/shared/` ou `memory/per-agent/`.
> Decisão estratégica vira `memory/shared/decisoes/YYYY-MM-DD-topic.md`.

---

## Mandate (load-bearing — não remover)

Aplicar o método **Growth AI** da Accelera 360 para construir/operar negócios na Nova Economia. Workspace dedicado a aplicar o pipeline do método: descobrir nicho → mapear → criar oferta → instalar em clientes (LP + deck + GTM + playbook).

Tese de fundo: *"construa uma vez, instale em N empresas"* — 1 sistema replicável por nicho.

## Decisões load-bearing já tomadas

(adicionar conforme aluno toma decisões duráveis. Ex:)

- *(exemplo)* **Nicho-foco:** {{slug}} — escolhido em {{data}}. Detalhe em `nichos/{{slug}}/_index.md`.
- *(exemplo)* **Modelo de monetização:** setup + recorrência (não hora). Razão: {{1-linha}}.

## Open questions (top 3 — substituir conforme avança)

1. *(exemplo)* Qual nicho atacar primeiro? — depende do `/gos-nicho-explorer` Modo A.
2. *(exemplo)* Quem é o ICP exato dentro do nicho? — depende do `/gos-mapear-nicho`.
3. *(exemplo)* Qual a primeira oferta concreta vendável em 30 dias?

## Active constraints

- Operador único (aluno) — sem time ainda.
- Stack atual: a definir em `_contexto/operador.md`.
- Orçamento mensal de validação: TBD.
- Prazo pra primeiro cliente: TBD.

## Approved patterns

- Toda decisão estratégica vira arquivo em `memory/shared/decisoes/`.
- Skills sempre verificam pré-requisitos antes de rodar (bloco `requires:` do `SKILL.md` de cada skill).
- Outputs visuais (LP, deck) sempre passam por self-check antes de entregar.

## Forbidden actions (sem confirmação explícita)

- Rodar skill em modo degradado sem o aluno aceitar.
- Inventar dados que não vieram da pesquisa.
- Criar pasta fora dos paths canônicos (ver `WORKSPACE.md`).
- Misturar instâncias de nichos/clientes diferentes na mesma pasta.

## Where to look (índice — TOC)

```
WORKSPACE.md                        ← arquitetura completa do harness
CLAUDE.md                           ← lentes carregadas em toda sessão

_contexto/operador.md               ← perfil do aluno
_contexto/tese-a360.md              ← método Growth AI
_contexto/glossario.md              ← termos do método

nichos/{slug}/_index.md             ← cérebro de cada nicho mapeado
clientes/{slug}/_index.md           ← cada cliente com perfil + 6 fases
ofertas/{slug}/_index.md            ← oferta própria do aluno

memory/shared/ledgers/nichos-mapeados.md    ← ledger de nichos
memory/shared/ledgers/clientes-ativos.md    ← ledger de clientes
memory/shared/ledgers/ofertas.md            ← ledger de ofertas
memory/shared/decisoes/             ← decisões duráveis (1 arquivo cada)

memory/per-agent/{nome}/learnings.md ← state específico da skill
daily/YYYY-MM-DD.md                  ← log da sessão (gerado por /gos-handoff)
```

## Handoff da última sessão

**Sessão {DATA-SETUP}** — Workspace criado via `/gos-setup`. `_contexto/` populado. Pendente: rodar `/gos-nicho-explorer` para escolher nicho-foco.

<!--
INSTRUÇÕES PARA O AGENTE/CLAUDE QUE EDITA ESTE ARQUIVO:

1. **< 5KB total.** Se passar, mova detalhe para memory/shared/ ou memory/per-agent/.
2. **Open questions são fluidas.** Quando uma fecha, vira arquivo em memory/shared/decisoes/ e some daqui. Quando nasce nova, entra aqui.
3. **Decisões load-bearing** ficam aqui SEM detalhe — detalhe vai pro arquivo correspondente em memory/shared/decisoes/.
4. **Handoff** sempre atualizado no fim de cada sessão (1 parágrafo, sem rodeio). Quem atualiza: /gos-handoff.
5. **Last consolidated / next consolidation:** atualize quando reescrever estruturalmente.
6. **Não inventar.** Se uma seção está vazia, deixe vazia ou marque "TBD".
-->
