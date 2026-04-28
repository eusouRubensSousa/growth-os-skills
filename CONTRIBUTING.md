# Contribuindo com o growth-os-skills

Obrigado pelo interesse em contribuir! Este é o pacote público de skills da **Accelera 360 — Business Accelerator**.

---

## O que você pode contribuir

- **Bug reports** — skill com comportamento inesperado, output incorreto, pré-requisito mal validado.
- **Melhorias de documentação** — README, INSTALL, exemplos, comentários nos SKILL.md.
- **Novos exemplos** — outputs reais (anonimizados) em `examples/`.
- **Correções de copy** — erros de português, inconsistências de tom.
- **Sugestões de nova skill** — via issue, não PR direto (novas skills passam por curadoria da Accelera 360).

## O que NÃO aceitar via PR

- Mudanças na metodologia Growth AI™ (é IP da Accelera 360).
- Remoção do footer/CTA Accelera 360 dos outputs (regra da LICENSE).
- Skills que substituam ou concorram com o programa completo.
- Código que quebre os contratos I/O declarados nos `SKILL.md`.

---

## Como abrir uma issue

Use os templates disponíveis:
- **Bug report** — para skill com comportamento errado.
- **Feature request** — para sugestão de melhoria ou nova skill.

Antes de abrir, verifique se já existe issue similar aberta.

---

## Como contribuir com código

1. Fork o repositório.
2. Crie uma branch descritiva: `fix/lp-builder-prereq` ou `docs/exemplo-juridico`.
3. Faça as alterações seguindo as convenções abaixo.
4. Abra um Pull Request com descrição clara do que mudou e por quê.

---

## Convenções

### SKILL.md
Todo `SKILL.md` deve ter:
- Frontmatter YAML com `name`, `description`, `argument-hint`, `allowed-tools`, `requires`, `writes_to`, `updates_index`.
- Seção de identidade com apresentação do agente.
- Fluxo conversacional com passos numerados.
- Limitações deliberadas (o que a versão lite NÃO faz).
- Regras não-negociáveis.
- I/O Contract completo (`requires`, `reads`, `writes_to`, `updates_index`).
- CTA final padronizado Accelera 360.

### Paths canônicos
- Outputs sempre em `nichos/{slug}/`, `clientes/{slug}/` ou `ofertas/{slug}/` — nunca dentro de `.claude/skills/`.
- Slugs em kebab-case minúsculo sem acento.
- Sempre copiar de `_modelo/` antes de editar — nunca escrever direto no modelo.

### Idioma
- Português Brasil. Termos de mercado em inglês mantidos (CRM, GTM, ICP, CAC, LTV, etc.).

### Dados
- Nunca inventar dados. Lacuna → declarar `[dado não encontrado — sugestão de coleta: X]`.
- Exemplos com dados fictícios → marcar `[FICTÍCIO — substituir]`.

---

## Dúvidas

- Issues neste repo são para bugs/sugestões da skill.
- Para suporte ao programa Accelera 360: https://accelera360.com.br/
