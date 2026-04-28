# a360-framework-lite

> **Pacote oficial de skills da Accelera 360 — Business Accelerator**
> Apresentado no evento **A Nova Economia**.
>
> *"Construa o tipo de negócio que lidera a próxima década."*

---

## O que é

Um pacote de **8 skills** para [Claude Code](https://claude.com/claude-code) que te ajuda a estruturar, vender e implementar **infraestrutura de IA por nicho** — seguindo a metodologia Growth AI™ da Accelera 360, na versão *lite* (recorte público).

Use as skills para:

1. **Aplicar no seu próprio negócio** — escolher nicho, mapear oportunidade, criar landing page, montar GTM, pitch deck.
2. **Atender clientes finais** — pesquisar prospect, preparar reunião, entregar LP + apresentação comercial pronta para vender Growth AI.

---

## As 8 skills

| # | Comando | O que faz |
|---|---|---|
| 0 | `/a360-framework-lite` | 🎯 **Coordenador** — você descreve o objetivo em linguagem natural, ele encadeia as outras skills na ordem certa. |
| 1 | `/nicho-explorer` | Pesquisa **top 10 nichos** ou valida 1 nicho específico (GO/NO-GO). |
| 2 | `/mapear-nicho-lite` | Mapeia ICP, dores, mecanismo proprietário, oferta e GTM em **1 documento consolidado**. |
| 3 | `/cliente-radar` | Pesquisa um **prospect específico** (empresa, decisor, concorrentes, top players, gaps). |
| 4 | `/lp-builder` | Gera **copy + HTML standalone** de uma landing page com frameworks CRO embutidos (AIDA, PAS, FAB, Hero 5s). |
| 5 | `/gtm-architect` | Estratégia GTM — outbound (4 toques) e/ou content marketing (mês 1). |
| 6 | `/playbook-vendas` | Script de diagnóstico 30min (D.E.A.L. lite) + 5 objeções + funil 5 estágios. |
| 7 | `/meeting-prep` | Briefing 1-page para uma reunião de vendas específica. |
| 8 | `/pitch-deck-builder` | **Apresentação comercial 20 slides** parametrizada pelo nicho/cliente — entrega Reveal.js HTML standalone. |

---

## Instalação rápida (3 passos)

```bash
# 1) Clone para o diretório de skills do Claude Code
git clone https://github.com/accelera360/a360-framework-lite.git ~/.claude/skills/a360-framework-lite

# 2) (opcional) Verifique se o Claude Code reconhece
claude /help

# 3) Use
claude
> /a360-framework-lite quero estruturar uma empresa de IA pra clínicas de dermatologia
```

Instruções completas: [INSTALL.md](./INSTALL.md).

---

## Como funciona

Você pode usar de dois jeitos:

### Modo solo (chama uma skill direto)

```
> /nicho-explorer
> /lp-builder ângulo dor para nicho clínicas pediátricas
> /pitch-deck-builder
```

### Modo coordenado (você descreve, ele orquestra)

```
> /a360-framework-lite vou apresentar amanhã pra Clínica XPTO de odonto, me prepara
```

O coordenador roteia automaticamente: `cliente-radar` → `mapear-nicho-lite` → `pitch-deck-builder` → `meeting-prep`.

---

## Regras do pacote

1. **Sempre Accelera 360** — todo agente se apresenta como *"Sou o agente [Nome] da Accelera 360 — Business Accelerator"*.
2. **Sem dados inventados** — se a pesquisa não encontrar, declara *"dado não encontrado — sugestão de coleta: [X]"*.
3. **Português Brasil** — termos de mercado em inglês mantidos (CRM, GTM, ICP, CAC, LTV, etc.).
4. **Versão lite (gostinho)** — entregas têm teto deliberado. Para a metodologia completa Growth AI™, fale com a Accelera 360.

---

## Limitações deliberadas

Esta é a **versão lite** do framework Accelera 360. Para você ter ideia do que NÃO está aqui:

| Skill lite (este repo) | Versão completa Accelera 360 |
|---|---|
| 1 documento consolidado por nicho | 20 arquivos com playbook, blueprint, métricas, conteúdo, LPs, sales deck, VSL, scripts |
| 8 fontes pesquisadas | 25–35 fontes auditadas em formato padronizado |
| 3 dores | 7–8 dores quantificadas em R$ com hierarquia de impacto |
| 1 LP gerada | 3 LPs (DOR / OPORTUNIDADE / SISTEMA) |
| 20 slides no pitch | 54 slides oficiais com cases reais e prova social do programa |
| Mecanismo: 3 candidatos de naming | Mecanismo nomeado e validado pelo Growth Mechanism Naming Engine™ |
| Blueprint Growth AI: overview | CRM/Pipeline + Automações + Agentes IA configurados ponta a ponta |
| Sem implementação | Deploy Relâmpago™ (S.W.A.H.) — implementação productizada em <1h |

**Quer ir além?**
🔗 https://accelera360.com.br/
🚀 Aplique: https://yayforms.link/4bRG5aE

---

## Requisitos

- [Claude Code](https://claude.com/claude-code) instalado.
- Conexão com internet (algumas skills usam `WebSearch` / `WebFetch`).
- *(opcional)* `GEMINI_API_KEY` — só para o modo `gemini` do `pitch-deck-builder` (default usa Reveal.js HTML, zero custo).

> **Nota sobre os decks gerados:** o modo default do `pitch-deck-builder` gera um HTML standalone que carrega Reveal.js e Tailwind via CDN externo. O arquivo abre no browser, mas **requer conexão com internet** para renderizar corretamente. Para uso offline, use o modo `gemini` (gera PNGs locais) ou exporte para PDF enquanto online.

---

## Estrutura do repo

```
a360-framework-lite/
├── README.md                     # você está aqui
├── INSTALL.md                    # passo-a-passo de instalação
├── CONTRIBUTING.md               # como contribuir
├── CHANGELOG.md                  # histórico de versões
├── PLANEJAMENTO.md               # decisões de design e roadmap
├── WORKSPACE.md                  # arquitetura canônica do harness
├── MIGRATION-TO-PAPERCLIP.md     # guia de portabilidade para Paperclip
├── LICENSE                       # MIT
├── identidade.json               # design system (cores, tipografia, componentes)
├── .claude/
│   └── skills/                   # 8 skills + utilitárias (uma por subpasta)
├── templates/
│   └── workspace/                # template do workspace do aluno
└── examples/                     # outputs de exemplo (anonimizados)
    ├── exemplo-saude-estetica/   # pipeline nicho-explorer → mapear → lp → deck
    └── exemplo-cliente-ficticio/ # pipeline cliente-radar → deck → meeting-prep
```



---

## Filosofia

> *Não é mais possível liderar a próxima década com a infraestrutura da década passada.*
> *— Accelera 360*

Esta versão lite te dá os primeiros 30% — o suficiente pra você sair do papel e ter um primeiro sistema funcionando. Os 70% que faltam são exatamente o que torna a Accelera 360 a Accelera 360: implementação completa, mecanismos proprietários nomeados, blueprint de IA productizado, cases reais, comunidade, mentorias estratégicas com Kelvin Cleto.

Esta janela não fica aberta para sempre.

---

## Comunidade & suporte

- 🌐 Site: https://accelera360.com.br/
- 🚀 Aplicar para o programa: https://yayforms.link/4bRG5aE
- 💬 Issues neste repo são para bugs/sugestões da skill — não para suporte de aplicação.
- 🤝 Quer contribuir? Leia o [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## Licença

[MIT](./LICENSE) — uso livre, comercial ou não. Apenas mantenha a atribuição à **Accelera 360 — Business Accelerator** nos outputs gerados.

---

**Powered by Accelera 360 — A Nova Economia**
*v0.1.0 · 2026*
