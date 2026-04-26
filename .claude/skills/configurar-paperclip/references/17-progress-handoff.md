# 17 — `progress.txt` para context resets

> Para tarefas longas, agente escreve estado serializado em arquivo de hand-off.
> Quando contexto enche, sessão é resetada e novo contexto começa lendo o
> progress. Eliminação de "context rot".

## 17.1. O problema

Tarefa que dura > 4-8 heartbeats acumula histórico inflado:
- Tool outputs antigos.
- Decisões já tomadas e codificadas.
- Caminhos descartados ("tentei X, não funcionou").

Esse histórico inflado:
1. Custa input tokens em cada heartbeat seguinte.
2. Distrai o agent (informação redundante).
3. Pode passar do context window do modelo.

## 17.2. A solução

Arquivo `progress.txt` em `projects/<slug>/`:
- Estado atual: o que foi feito, o que falta, próximo passo, decisões durables, blockers.
- Atualizado pelo agent ao fim de cada heartbeat significativo.
- Lido pelo agent no INÍCIO de cada heartbeat de uma sessão fresca.

Quando contexto enche:
- Operador (humano ou guardian agent) reseta a sessão (mudar `cwd` força nova sessão claude_local).
- Próxima sessão começa lendo `progress.txt` → contexto reconstruído sem o lixo.

## 17.3. Template

Use `snippets/progress-txt-template.md`. Estrutura:

```
## Status: in_progress | blocked | done
## Last Update: <ISO 8601 UTC>
## Last Agent: <slug>
## Heartbeat ID: <hb-id>

## Goal
<descrição clara, 1-2 parágrafos>

## Done
- [x] Item completo (file:line ou commit ref)
- [x] Outro item

## In Progress
- Item ativo (50% done)
  - File: src/...
  - Next: <próximo passo concreto>
  - Blocker: <se houver>

## Next (ordered)
1. ...
2. ...

## Blockers
- ...

## Decisions made (durable, log here for handoff)
- 2026-04-23: Decisão X. Razão Y.

## Files of interest (for next session)
- ...

## Context that's NOT in code (load-bearing why)
- ...

## Lessons learned this project
- ...
```

## 17.4. Quando criar `progress.txt`

- Tarefa multi-heartbeat (estimada > 3 sessões).
- Multi-agent (precisa handoff entre agents).
- Sessão Q&A interativa que pode estender por dias (refactor grande, design docs).

NÃO crie para:
- Tarefa single-shot (resolve em 1 heartbeat).
- Trabalho rotineiro coberto pelo PROTOCOL.md.

## 17.5. Workflow

```
[1] Agent recebe issue grande, decide criar progress.txt
    Path: $PC_COMPANY_DIR/projects/<slug>/progress.txt

[2] Cada heartbeat:
    - Início: ler progress.txt (state recovery)
    - Trabalhar
    - Fim: atualizar progress.txt (Done, In Progress, Next)

[3] Quando heartbeat termina blocked:
    - Atualizar Blockers
    - Tag manager via comment

[4] Quando contexto enche (sinal: tokens médios > 80% limit):
    - Operador reseta sessão (mudar cwd OU mata processo OU manual reset)
    - Próximo heartbeat começa com session fresh + lê progress.txt

[5] Quando done:
    - Atualizar Status: done
    - Mover progress.txt → archived/<date>-<slug>.txt
    - Lição em "Lessons learned" → MEMORY.md ou per-agent MEMORY.md
```

## 17.6. Quem atualiza

- Agent que executa: atualiza Done / In Progress / Next.
- Manager (PM): pode atualizar Blockers (após escalation).
- Outro agent assumindo handoff: lê tudo, **adiciona** entry sob "Last Agent" indicando transição.

NÃO é "free for all" — disciplinado para evitar conflito.

## 17.7. Como o agent é instruído a usar

No PROTOCOL.md do agente, adicione:

```markdown
## Long-running issue checklist

Para issues marcadas com label `long-running` ou `epic`:

1. **Início do heartbeat**: ler `projects/<slug>/progress.txt` (se existir).
2. Pegue contexto do progress, NÃO do histórico de comments.
3. **Fim do heartbeat**: atualizar progress.txt com Done/In Progress/Next.
4. Se sessão sente "inflada" (notar input_tokens muito alto), comente "@board reset session for me" e pause.
```

## 17.8. Reset de sessão na prática

Para `claude_local` adapter, sessão é determinada pelo `cwd`. Reset = forçar novo session id:

**Opção A (mais limpa):** mudar `cwd` no `.paperclip.yaml`:
```yaml
agents:
  engineer:
    adapter:
      config:
        cwd: /workspaces/engineer-v2   # antes: /workspaces/engineer
```

**Opção B (heavier):** kill processo claude code rodando, deixar próximo heartbeat criar fresh.

**Opção C (Paperclip native):** se UI tiver botão "reset session" para o agent, use.

## 17.9. Handoff entre agents

Quando issue atravessa multiple agents (ex: engineer faz, QA revisa, então copywriter atualiza docs):

- Cada agent atualiza progress.txt na sua passagem.
- Adiciona entry "## Handoff: <date> <from> → <to>" com contexto incremental.
- Próximo agent lê tudo + faz seu trabalho.

## 17.10. Versionar progress.txt?

- ✅ Versionado em git: rastreia evolução do projeto.
- ❌ Sem git: pode perder hand-off em caso de erro.

Recomendação: versionar. Mas evite commit a cada heartbeat (cada agent commit progress.txt cria spam). Padrão: agent atualiza in-place, e um cron/routine commita 1x por dia ("daily snapshot").

## 17.11. Pegadinhas

- **progress.txt vs MEMORY.md**: progress é state de UMA tarefa. MEMORY é durables company-wide. Não confunda.
- **Tamanho de progress.txt**: também pode crescer. Limite: < 10KB. Acima disso, archive seções "Done" antigas para `projects/<slug>/done/<date>.md`.
- **Concorrência**: dois agents editando simultaneamente = race. Lock via `.lock` file ou via Paperclip checkout (se issue tem `assigneeAgentId`, só ele edita).
- **Reset apaga sessão Claude Code, NÃO o progress.txt**: progress fica intocado, é seu único state. Trate-o como sagrado.
- **Não escreva valores de secrets** em progress.txt. Mascare.
