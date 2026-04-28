# Changelog — growth-os-skills

Todas as mudanças notáveis deste projeto são documentadas aqui.

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

---

## [0.3.0] — 2026-04-28

### ⚠️ Breaking Changes
- **Comandos renomeados** — todos `/a360-*` agora são `/gos-*`. Coordenador é `/gos`.
- **Folders de skills renomeados** em `.claude/skills/` — usuários com clone local precisam re-clonar ou renomear pastas.
- **Memória reestruturada** — `memory/per-skill/` → `memory/per-agent/`; ledgers movidos pra `memory/shared/ledgers/`.

### Adicionado
- **`AGENTS.md` raiz** — single source of truth para arquitetura de squad, memory tiers, handoff contracts, command convention.
- **3-tier squad architecture** — Coordinator (`/gos`) + Directors (Phase 2) + Employees. Cada SKILL.md declara `tier:`, `reports_to:`, `version:`.
- **Handoff contracts estruturados** — `handoff_in:`, `handoff_out:`, `quality_gates:` em todos os 14 SKILL.md.
- **`/gos-validate-handoff`** — skill validadora de boundary; checa payload contra schema declarado antes de invocação.
- **Memory tier model (Letta-inspired)** — Core (sempre), Recall (on-demand), Archival (retrieval), Event Log.
- **Reflexion pattern** — `memory/per-agent/{agent}/reflections.md` com lições aprendidas; carregado top-3 relevantes na próxima execução.
- **Event log NDJSON** — `logs/events.ndjson` append-only pra audit trail e boot recovery (CLAUDE.md lê últimas 10 linhas).
- **Boot sequence** atualizado em `templates/workspace/CLAUDE.md` — reconstrói contexto cross-session do event log.
- **`memory/shared/projects/`** — contexto project-scoped pra workspace com múltiplos projetos paralelos.

### Mudado
- **Repo renomeado:** `a360-framework-lite` → `growth-os-skills`.
- **Package name nas footers** atualizado em todos templates.
- `WORKSPACE.md` reescrito refletindo memory tiers + event log + handoff contracts.

### Pesquisa que motivou as mudanças
- Anthropic Multi-Agent Research System (orchestrator-worker pattern).
- Letta (MemGPT) tier model (Core/Recall/Archival).
- Reflexion paper (Shinn et al., 2023) — Reflexion log per-agent.
- AGENTS.md spec (Google/OpenAI/Factory/Sourcegraph/Cursor joint launch).
- Pesquisa enterprise: handoffs não-estruturados amplificam erros 17.2x.

---

## [0.1.0] — 2026

### Adicionado
- 8 skills do pacote: `nicho-explorer`, `mapear-nicho-lite`, `cliente-radar`, `lp-builder`, `gtm-architect`, `playbook-vendas`, `meeting-prep`, `pitch-deck-builder`.
- Coordenador `a360-framework-lite` com 5 pipelines pré-definidos e roteamento por linguagem natural.
- Skills utilitárias do harness: `a360-setup-workspace`, `a360-map`, `a360-handoff`.
- Template de workspace com estrutura PARA + Johnny.Decimal (`templates/workspace/`).
- `identidade.json` com design system completo (cores, tipografia, componentes).
- `WORKSPACE.md` com arquitetura canônica do harness.
- `MIGRATION-TO-PAPERCLIP.md` com guia de portabilidade para o orquestrador Paperclip.
- `INSTALL.md` com instalação em 3 passos.
- `examples/README.md` com estrutura dos exemplos.

### Segurança
- Scripts Python (`oc-json-patch.py`, `pc-yaml-patch.py`) com validação de path traversal — inputs resolvidos e verificados contra o diretório de trabalho antes de qualquer operação de arquivo.
- `pc-yaml-patch.py` usa `yaml.safe_load` exclusivamente — sem desserialização insegura de YAML.

### Documentação
- `CONTRIBUTING.md` com guia de contribuição, convenções e o que não aceitar via PR.
- `CHANGELOG.md` (este arquivo).
- Templates de issue no GitHub (`.github/ISSUE_TEMPLATE/`).
- `PLANEJAMENTO.md` com decisões de design e roadmap.
- Referências ao `PREREQ.md` removidas — pré-requisitos lidos diretamente do bloco `requires:` de cada `SKILL.md`.
