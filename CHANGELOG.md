# Changelog — a360-framework-lite

Todas as mudanças notáveis deste projeto são documentadas aqui.

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

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
