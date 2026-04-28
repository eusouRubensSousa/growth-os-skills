# 15 — References como table of contents

> AGENTS.md curto que aponta para `references/<topic>.md` específicos.
> O agente carrega só o que precisa.
>
> Princípio (cunhado pela OpenAI no Codex): *"Trate AGENTS.md como tabela de
> conteúdos, não enciclopédia. Quando tudo é importante, nada é."*

## 15.1. Estrutura

```
agents/marketing-cmo/
├── AGENTS.md              # 50-200 linhas, table of contents + load-bearing
├── PROTOCOL.md            # 30-60 linhas, heartbeat slim
└── references/
    ├── icp-personas.md    # carregado quando agent precisa de persona
    ├── brand-voice.md     # carregado quando agent escreve copy
    ├── compliance.md      # carregado quando agent aprova externo
    ├── kpis.md            # carregado quando review de performance
    └── incidents/
        └── 2026-04-15-pricing-misfire.md  # learnings durables
```

## 15.2. Limite de tamanho

| Arquivo | Limite recomendado |
|---|---|
| AGENTS.md | < 200 linhas |
| MEMORY.md | < 5KB |
| PROTOCOL.md | < 100 linhas |
| Cada reference em `references/` | sem limite (carregado on-demand) |
| SOUL.md (se existir) | < 30 linhas |

Razão: AGENTS.md / MEMORY.md / SOUL.md são carregados em **toda** sessão. PROTOCOL.md é carregado em heartbeat. References são carregadas só quando a regra de TOC indica.

## 15.3. Bloco "Knowledge Base" no AGENTS.md

Cole isto (adaptando paths):

```markdown
## Knowledge Base (load only when relevant)

Carregue só o que precisa. Não leia tudo a cada heartbeat.

| Tópico | Arquivo | Quando carregar |
|---|---|---|
| Personas / ICP | `references/icp-personas.md` | Escrever copy ou messaging |
| Brand voice | `references/brand-voice.md` | Customer-facing copy |
| Compliance | `references/compliance.md` | Decisão pode afetar legal/privacy |
| KPIs | `references/kpis.md` | Review de performance |
| Incidents | `references/incidents/<date>-<id>.md` | Padrão familiar de erro |

DO NOT load all references on every heartbeat.
```

(Cópia do snippet `agents-md-references-toc.md`.)

## 15.4. Como o agent decide carregar

Depende do runtime:
- **`claude_local`**: agent vê a tabela no system prompt e usa Read tool quando relevante.
- **`codex_local`**: similar.

A **chave** é a coluna "Quando carregar" — sem isso, agent vai aleatoriamente abrir tudo.

## 15.5. Convenções de naming

`references/<topic>.md` com nomes auto-explicativos:

```
references/
├── architecture.md          # design decisions de software
├── coding-conventions.md    # style guide
├── api-clients.md           # como falar com APIs externas
├── icp-personas.md          # quem é o cliente ideal
├── brand-voice.md           # tom de voz da brand
├── compliance.md            # políticas legais
├── kpis.md                  # métricas-chave
├── delegation-policy.md     # quando escalar
├── incidents/               # learnings de incidents
│   ├── 2026-04-15-pricing.md
│   └── 2026-04-20-auth.md
└── decisions/               # decisões durables (pode ser memory/decisions/)
    └── 2026-03-15-stripe-vs-braintree.md
```

## 15.6. Migração: AGENTS.md gigante → TOC

Se o agente atual tem AGENTS.md de 500+ linhas:

```
[1] Backup do AGENTS.md atual
    ./scripts/pc-backup.sh $PC_COMPANY_DIR/agents/<slug>/AGENTS.md

[2] Identificar seções extraíveis
    Cabeçalhos ## ou ### que tratam de tópico específico (não load-bearing
    em toda decisão).

[3] Para cada tópico, criar references/<topic>.md
    mkdir -p $PC_COMPANY_DIR/agents/<slug>/references/
    # Mover seção pra arquivo

[4] No AGENTS.md original, substituir seção por entry em "Knowledge Base"
    | <Tópico> | `references/<topic>.md` | <quando carregar> |

[5] Re-import
    ./scripts/pc-wrap.sh "company import $PC_COMPANY_DIR --company-id $PC_COMPANY_ID --dry-run"
```

## 15.7. O que MANTÉM no AGENTS.md (load-bearing)

- Identidade do agent (papel, reportsTo).
- Mandate / responsabilidades top-level.
- Output Handling Rules (truncamento — usado SEMPRE).
- Security Rules (defesa injection — usado SEMPRE).
- Decision heuristics top-level.
- Knowledge Base TOC.
- Lessons Learned recentes (até consolidação mensal).

## 15.8. O que MOVE para references/

- Detalhes técnicos de uma área (architecture deep-dive).
- Templates (email templates, copy templates).
- Histórico de incidents.
- Procedimentos longos (multi-step workflows que rodam ocasionalmente).
- Glossário ou legenda.
- Link à docs externas com contexto.

## 15.9. References vs Skills

Diferença sutil:
- **Reference (`agents/<slug>/references/<topic>.md`)**: privado a um agente. Carregado quando o próprio AGENTS.md aponta.
- **Skill (`skills/<slug>/SKILL.md`)**: compartilhada entre agents. Cada agent que tem `<slug>` em `frontmatter.skills:` pode invocar.

Use reference para conteúdo single-agent. Use skill para conteúdo reusável.

## 15.10. Pegadinhas

- **Paths relativos**: `references/<topic>.md` é relative ao AGENTS.md. Garanta que agente tem ferramenta de Read.
- **Não duplique**: se mesmo conteúdo é referenciado por 3 agents, vire skill.
- **References não vão automaticamente para context**: agent precisa explicitamente decidir abrir. Sua tabela TOC tem que motivar bem.
- **Diretório `references/` no root**: é diferente do per-agent `agents/<slug>/references/`. Root é para references da company toda.
- **Renaming quebra paths**: se mover `references/foo.md` → `references/bar.md`, atualizar todos os AGENTS.md que apontam.
