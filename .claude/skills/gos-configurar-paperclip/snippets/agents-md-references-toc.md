# Snippet: bloco "Knowledge Base" (table of contents) para colar em qualquer AGENTS.md
#
# Princípio Codex: "Trate AGENTS.md como tabela de conteúdos, não enciclopédia.
# Quando tudo é importante, nada é."
#
# Estrutura recomendada:
#   agents/<slug>/
#   ├── AGENTS.md (50-200 linhas, table of contents)
#   ├── PROTOCOL.md (heartbeat slim)
#   └── references/
#       ├── architecture.md      # carregado quando agente precisa
#       ├── coding-conventions.md
#       ├── api-clients.md
#       ├── troubleshooting.md
#       └── incidents/2026-04-20-auth-bug.md

## Knowledge Base (load only when relevant)

Carregue só o que precisa. NÃO leia tudo a cada heartbeat.

| Tópico | Arquivo | Quando carregar |
|---|---|---|
| Arquitetura geral | `references/architecture.md` | Decisão sobre onde mora código novo |
| Padrões de código | `references/coding-conventions.md` | Antes de PR review |
| Clientes API | `references/api-clients.md` | Integrar com serviço externo |
| Personas / ICP | `references/icp-personas.md` | Escrever copy ou messaging |
| Brand voice | `references/brand-voice.md` | Customer-facing copy |
| Compliance | `references/compliance.md` | Decisão pode afetar legal/privacy |
| Troubleshooting | `references/troubleshooting.md` | Bug investigation |
| Incidents | `references/incidents/<date>-<id>.md` | Padrão familiar de erro |

**DO NOT load all references on every heartbeat.** Decida pelo título qual ler.
