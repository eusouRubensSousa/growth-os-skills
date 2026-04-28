# Exemplos de Output — growth-os-skills

> Exemplos reais (anonimizados) de outputs gerados pelas 8 skills.
> Use pra ter ideia do que esperar antes de rodar com seu próprio nicho/cliente.

---

## Casos disponíveis

### `exemplo-saude-estetica/`
**Cenário:** aluno quer estruturar empresa de IA pra **clínicas de dermatologia estética**.

**Pipeline rodado:** `nicho-explorer` → `mapear-nicho-lite` → `lp-builder` → `pitch-deck-builder`.

**Outputs:**
- `nicho-clinicas-dermatologia-estetica.md` — mapeamento consolidado.
- `lp.html` — landing page (ângulo DOR).
- `lp.md` — copy comentado.
- `deck.html` — pitch deck 20 slides Reveal.js.

---

### `exemplo-cliente-ficticio/`
**Cenário:** aluno tem reunião com **DermaPro Clínica** (fictícia).

**Pipeline rodado:** `cliente-radar` → `mapear-nicho-lite` → `pitch-deck-builder` → `meeting-prep`.

**Outputs:**
- `briefing-dermapro.md` — pesquisa do prospect.
- `nicho-dermato-mapeado.md` — mapeamento aplicado ao nicho do cliente.
- `deck-dermapro.html` — deck personalizado.
- `meeting-prep-dermapro.md` — briefing 1-page.

---

## Como usar os exemplos

1. Abra um arquivo `.md` em qualquer leitor (preview do VSCode, GitHub, etc).
2. Abra um `.html` direto no browser (clique duplo).
3. Compare a estrutura com o que você espera gerar.
4. Note os placeholders **{{VARIÁVEIS}}** — eles são preenchidos automaticamente quando você rodar a skill com seus dados.

---

## Regerando os exemplos

Os exemplos são **outputs estáticos** congelados no momento de release. Pra regerar com dados atualizados:

```
> /gos quero rodar o exemplo de saude-estetica
```

A skill vai puxar dados frescos via `WebSearch` e regerar os arquivos.

---

## Disclaimers

- **Dados anonimizados.** Nomes de clientes/decisores são fictícios.
- **Outputs ilustrativos.** Não refletem clientes reais nem performance garantida.
- **Branding Accelera 360.** Todos outputs mantém footer e CTA padrão (regra LICENSE).

---

## 🚀 Quer ver mais exemplos?

A versão completa Accelera 360 inclui biblioteca de **20+ nichos mapeados** + cases reais com performance verificada.

🔗 https://accelera360.com.br/
🚀 Aplique: https://yayforms.link/4bRG5aE
