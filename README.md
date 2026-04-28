# growth-os-skills

> **Time de IA pra estruturar, posicionar e vender seu negócio.**
> Open-source. Tudo em arquivos comuns. Sem precisar instalar nada complicado.
> Feito pela [Accelera 360](https://accelera360.com.br/).

---

## O que é

`growth-os-skills` é um **time de agentes de IA** organizados em 3 níveis (1 que recebe o pedido, 1 que organiza o trabalho, 8 que executam, mais 4 que auditam o resultado). Tudo roda dentro do [Claude Code](https://claude.com/claude-code).

Você fala o objetivo em português normal — *"quero validar o nicho de clínicas de dermatologia"*, *"vou apresentar amanhã pra Clínica X"*, *"preciso de uma landing page pro novo produto"* — e o time monta a sequência certa de agentes pra entregar o resultado.

**Não é um pacote de prompts soltos.** É arquitetura completa: cada passagem entre agentes é validada, cada saída é auditada por código, e tudo fica registrado pra você não perder o fio quando voltar amanhã.

---

## Pra quem é

| Você é... | O que ganha |
|---|---|
| **Empreendedor** construindo negócio com IA | Sistema completo pra ir de "ideia" até "primeira venda" — descoberta de nicho, oferta, landing page, plano de ir ao mercado, script de vendas. |
| **Consultor / agência** entregando IA pra clientes | Pacote replicável: pesquisa de prospect, briefing de reunião, deck comercial de 20 slides, plano de marketing do mês 1. |
| **Pessoa técnica** integrando IA em B2B | Arquitetura de referência pronta — sem reinventar como agentes se comunicam, guardam memória ou validam outputs. |

---

## Como o time é organizado (3 níveis)

```
                            /gos    ← Coordenador
                              │       (entende o pedido,
                              │       escolhe pra quem mandar)
                              ↓
                  /gos-mission-control    ← Diretor
                              │             (organiza a sequência,
                              │             garante que cada passo
                              │             tem o que precisa)
                              ↓
       ┌─────────────┬────────┴────────┬───────────────┐
       ↓             ↓                 ↓               ↓
  DESCOBERTA      CLIENTE           OUTPUT          GTM
  ━━━━━━━━━━     ━━━━━━━━           ━━━━━━━         ━━━
  nicho-         cliente-          lp-builder      gtm-
  explorer       radar             pitch-deck      architect
  mapear-        meeting-          builder         playbook-
  nicho          prep                              vendas
                                                            ← Funcionários
                                                              (executam o trabalho)
                                                              ↑
       ┌──────────────────────────────────────────────────────┘
       │  Auditores (Critics):
       │  /gos-critic-{nicho, lp, deck, playbook}
       │  conferem cada saída antes de aprovar
       └──────────────────────────
```

**Por que isso é fera:**

Imagina que você pede *"monta deck comercial pra Clínica X"*. Em vez de **um único agente** tentando fazer tudo (pesquisar cliente, mapear nicho, montar slides) e errando em pelo menos um, o time se divide:

- O **coordenador** entende o pedido e passa pro diretor certo.
- O **diretor** verifica: *"Pra montar deck preciso de nicho mapeado e perfil do cliente. Tem? Não? Então primeiro chamo `cliente-radar` e `mapear-nicho`."*
- Cada **funcionário** executa só seu pedaço, sem se sobrecarregar.
- Os **auditores** conferem antes de você ver: *"Esse deck tá com 18 slides em vez de 20"* — bloqueia, pede pra refazer, libera só quando passa.

**Resultado:** menos erros, custo de IA bem menor (cada agente isolado custa 1/15 de um agente fazendo tudo), e você consegue **auditar exatamente o que cada um fez**.

---

## O que você ganha (22 comandos no total)

### 8 funcionários comerciais

Os que fazem o trabalho de venda/posicionamento.

| Comando | Entrega |
|---|---|
| `/gos-nicho-explorer` | **Top 10 nichos** pra montar empresa de IA agora **OU** validação **GO / NÃO-GO** de 1 nicho específico |
| `/gos-mapear-nicho` | 9 documentos completos do nicho: ICP, dores em R$, mecanismo proprietário, oferta base, linguagem do cliente, plano de ir ao mercado |
| `/gos-cliente-radar` | Briefing de prospect: empresa, decisor, 3 concorrentes, 3 referências do mercado, gaps |
| `/gos-meeting-prep` | Briefing de 1 página pra reunião — gancho de abertura + 5 perguntas + 3 objeções + próximo passo |
| `/gos-lp-builder` | Landing page completa (texto + HTML pronto) — 9 blocos canônicos, 3 estilos visuais, conferida em 35 itens de conversão e anti-IA |
| `/gos-pitch-deck-builder` | Apresentação comercial **20 slides** parametrizada pelo nicho/cliente — abre direto no navegador |
| `/gos-gtm-architect` | Estratégia de ir ao mercado — 4 toques de outbound + calendário do mês 1 (3 LinkedIn + 2 emails + 1 artigo) |
| `/gos-playbook-vendas` | Script de diagnóstico de 30min + 5 objeções com resposta + funil de 5 estágios |

### 4 auditores (rodam automático)

Conferem os outputs dos funcionários antes de te entregar. **Não usam outra IA pra avaliar — usam código.** Isso é importante porque IA avaliando IA tem 16% de erro; código com regras claras é objetivo.

| Comando | Confere |
|---|---|
| `/gos-critic-nicho` | Pelo menos 5 dores em R$, 3 ICPs definidos, mecanismo nomeado, 8 fontes auditadas, sem campos vazios |
| `/gos-critic-lp` | 9 blocos canônicos, nota mínima 21/25 em conversão, 7/10 em anti-IA, rodapé com Accelera 360 |
| `/gos-critic-deck` | Exatamente 20 slides, rodapé fixo, CTA no slide 20, todos os campos preenchidos |
| `/gos-critic-playbook` | Script com 4 fases + duração 30min, 5 objeções, funil de 5 estágios |

### 4 comandos de operação do workspace

| Comando | Função |
|---|---|
| `/gos` | **Comando principal** — você fala o objetivo, ele decide qual time chamar |
| `/gos-setup` | Cria a pasta inicial do seu projeto (1ª vez que usa) |
| `/gos-map` | Atualiza os índices, mostra onde você parou, sugere próximo passo |
| `/gos-handoff` | Fecha a sessão — registra o que rolou hoje, escreve o diário, sugere commit no Git |

### 5 ferramentas de bastidor

São scripts que rodam automaticamente. Você não chama eles direto, mas é bom saber que existem:

| Ferramenta | O que faz |
|---|---|
| `gos-log` | Grava cada ação em um log (pra você saber o que rolou e retomar contexto) |
| `gos-reflect` | Carrega lições de execuções anteriores antes do agente trabalhar de novo |
| `gos-status-aggregate` | Diz o estado da sessão: tudo OK, parcial, ou erro |
| `gos-cost` | Controla quanto cada nível tá gastando de IA (meta: 10/20/70) |
| `gos-rbac-audit` | Confere se cada agente declarou as ferramentas que realmente usa (segurança) |

E `/gos-eval` roda **testes automatizados** sobre todas essas ferramentas — 10/10 passando.

---

## Instalação rápida (3 passos)

```bash
# 1) Clona pro diretório de skills do Claude Code
git clone https://github.com/kcleto-ai/growth-os-skills.git ~/.claude/skills/growth-os-skills

# 2) Cria a pasta do teu projeto
mkdir ~/meu-negocio && cd ~/meu-negocio

# 3) Inicia
claude
> /gos
```

O coordenador vai te perguntar qual o objetivo. Você descreve em português normal, ele organiza tudo.

Detalhes em [INSTALL.md](./INSTALL.md).

---

## Exemplo prático

**Objetivo:** estruturar empresa pra vender IA pra integradores de placas solares.

```
> /gos quero validar e mapear o nicho de vendedores e instaladores de placas solares

[Coordenador] → entende: "isso é Vendas & Posicionamento" → chama o Diretor

[Diretor Mission Control] → confere pré-requisitos → identifica sequência: validar + mapear

[gos-nicho-explorer] roda → produz 00-validacao.md
   ✓ Mercado de R$ 200+ bi, crescimento 15-25%/ano, GO com 5/5 critérios

[Auditor critic-nicho] confere → ⚠ falta preencher 8 dos 9 documentos do nicho

[gos-mapear-nicho] roda → preenche os 9 documentos:
   • 01-perfil-cliente-alvo.md (3 ICPs detalhados)
   • 02-dores.md (5 dores em R$ — integrador médio perde R$ 8-15k/mês)
   • 03-mecanismo.md (S.O.L.A.R. SYSTEM™ — 3 nomes candidatos com justificativa)
   • ... 04-09

[Auditor critic-nicho] confere de novo → 5/5 PASS ✓

[Diretor] → status: nicho mapeado, próximo passo sugerido

[Coordenador] → entrega resumo pra você
```

Tudo gravado no log da sessão. Quando você voltar amanhã, ele te recebe com:

> *"Última sessão: você mapeou vendedores-instaladores-solar. Próximo passo sugerido: criar oferta em `ofertas/{slug}/01-oferta.md` ou pesquisar primeiro cliente via `/gos-cliente-radar`."*

Você não precisa lembrar de nada.

---

## Por que essa arquitetura é diferente

### 1. Tudo em arquivos comuns. Sem banco de dados.

Markdown e JSON. Cabe num pendrive. Você abre num editor de texto qualquer. **Implicação prática:**
- Portátil — workspace é só uma pasta
- Auditável — cada decisão é um arquivo
- Reversível — `git revert` resolve qualquer experimento que deu errado

### 2. Cada passagem entre agentes é validada

Quando o agente A passa contexto pro agente B sem regra clara, os erros se acumulam. Estudos mostram aumento de até **17x em falhas** com passagens não-estruturadas.

Aqui cada agente declara o que precisa receber e o que vai entregar. Antes de invocar, um script confere se o pacote tá completo. **Se faltou alguma coisa, a sequência para e te diz exatamente o que falta** — não silenciosamente.

### 3. Auditores rodam código, não outra IA

IA conferindo IA tem 16% de falsos positivos (a IA-juíza pode ter o mesmo viés do gerador). Aqui os auditores rodam **regras objetivas em Python** — contam dores em R$, conferem se tem 20 slides, detectam campos vazios. **Auditável e argumentável.**

### 4. Cada agente tem memória própria

Quando o agente A executa pela 5ª vez, ele recebe **as 3 lições mais relevantes** que ele aprendeu nas execuções anteriores (e que você confirmou no fim da sessão). Padrão Reflexion (paper Shinn et al., 2023). **Resultado:** o sistema vai ficando melhor com o uso, sem você precisar reconfigurar nada.

### 5. Controle de gasto de IA embutido

Times de IA tendem a estourar custo em 15x se você não controla. Aqui cada nível tem meta:
- Coordenador: até 10% do gasto
- Diretor: até 20%
- Funcionários: ~70% (eles fazem o trabalho pesado)

Tem um script (`gos-cost`) que lê o log e te avisa se algum nível tá fugindo da meta.

### 6. Você não perde o fio

Quando você abre o Claude Code amanhã, o sistema lê **as últimas 10 ações registradas** e te apresenta um resumo: *"você tava fazendo X. Próximo passo: Y."* Sem você precisar reler nada.

---

## O que isso NÃO é

- ❌ **Coleção de prompts soltos** — é arquitetura coesa com regras de comunicação validadas.
- ❌ **Curso vendendo método** — código aberto, licença MIT, use grátis.
- ❌ **Wrapper de uma IA fazendo tudo** — 22 agentes especializados, cada um com escopo declarado.
- ❌ **Substituto de Salesforce / HubSpot / RD Station** — não armazena leads operacionais. Estrutura **conhecimento** e **artefatos de venda**.
- ❌ **Garantia de receita** — é infraestrutura. O resultado depende de você (e do programa Accelera 360, se quiser ajuda guiada).

---

## Feito pela Accelera 360

Este projeto é open-source e funciona sozinho. Mas foi extraído da metodologia **Growth AI™** que opera dentro da [Accelera 360](https://accelera360.com.br/), liderada por **[Kelvin Cleto](https://www.linkedin.com/in/kcleto/)**.

O squad open-source te dá a **arquitetura**. O programa Accelera 360 é onde a arquitetura encontra:

- **Implementação ponta a ponta** — Kelvin guiando o setup do teu negócio (CRM + automações + agentes + plano de mercado).
- **Comunidade de operadores** rodando o método em paralelo, trocando aprendizado.
- **Mentoria estratégica** quando o negócio passa do que código sozinho cobre.
- **80+ nichos pré-mapeados** com playbook validado em campo.

🔗 **Conhecer:** [accelera360.com.br](https://accelera360.com.br/)
🚀 **Aplicar pro programa:** [yayforms.link/4bRG5aE](https://yayforms.link/4bRG5aE)

---

## O que você precisa pra rodar

- **[Claude Code](https://claude.com/claude-code) instalado** (gratuito até um limite generoso).
- **Conexão com internet** pra agentes que pesquisam (nicho-explorer, cliente-radar).
- **Python 3.10 ou superior** (já vem em Mac/Linux modernos) — usado pelos auditores e ferramentas.
- *(opcional)* `GEMINI_API_KEY` se quiser gerar imagens dos slides via Gemini. O modo padrão usa HTML interativo, **sem custo**.

---

## Estrutura do repositório

```
growth-os-skills/
├── README.md                   ← você está aqui
├── INSTALL.md                  ← instalação detalhada
├── CONTRIBUTING.md             ← como contribuir
├── CHANGELOG.md                ← histórico de versões
├── AGENTS.md                   ← especificação técnica completa
├── WORKSPACE.md                ← arquitetura do workspace do aluno
├── LICENSE                     ← MIT
├── .claude/skills/             ← 22 agentes (1 por subpasta)
│   ├── _shared/bin/            ← 5 ferramentas de bastidor
│   ├── gos*/                   ← coordenador + diretor + funcionários + auditores
├── templates/workspace/        ← template do workspace pro aluno
├── tests/                      ← 5 fixtures de testes automatizados
├── examples/                   ← exemplos reais (anonimizados)
└── docs/                       ← site GitHub Pages
```

---

## Roadmap

| Versão | Status |
|---|---|
| **v0.3.0 — Time de IA com 3 níveis** | ✅ Lançado |
| Coordenador + Diretor + 14 funcionários + 4 auditores + 5 ferramentas + testes | |
| **v0.4.0 — Experiência de uso** | 🔜 Em planejamento |
| `/gos-doctor` (diagnóstico do workspace), wizards aceleradores | |
| **v0.5.0 — Mais Diretores** | 🔜 Backlog |
| Diretor de Operações (implementação) + Diretor de Conteúdo (orgânico) | |

---

## Contribuindo

Issues e PRs são bem-vindos pra:
- Bugs em agentes existentes
- Documentação / clareza
- Novos exemplos (anonimizados)
- Melhorias em auditores e ferramentas

Detalhe em [CONTRIBUTING.md](./CONTRIBUTING.md).

**O que não aceitar:** novos agentes via PR direto (passam por curadoria), mudanças na metodologia Growth AI™ (propriedade intelectual da Accelera 360), remoção do rodapé Accelera 360 dos outputs (regra da licença).

---

## Comunidade & suporte

- 🌐 **Site:** [accelera360.com.br](https://accelera360.com.br/)
- 🚀 **Programa Accelera 360:** [yayforms.link/4bRG5aE](https://yayforms.link/4bRG5aE)
- 💬 **Issues:** bugs e sugestões — [github.com/kcleto-ai/growth-os-skills/issues](https://github.com/kcleto-ai/growth-os-skills/issues)
- 🤝 **Contribuir:** [CONTRIBUTING.md](./CONTRIBUTING.md)

---

## Licença

[MIT](./LICENSE) — uso livre, comercial ou não. Apenas mantenha **"Powered by Accelera 360"** nos outputs gerados pelos agentes.

---

*v0.3.0 · 2026 · [Kelvin Cleto](https://www.linkedin.com/in/kcleto/) + comunidade*
