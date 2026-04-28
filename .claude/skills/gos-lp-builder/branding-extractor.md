# Branding Extractor — Lendo Pesquisas Anteriores

> Protocolo da skill `lp-builder` para **extrair brand tokens dinamicamente** de pesquisas anteriores feitas por outras skills do pacote (cliente-radar, mapear-nicho-lite, nicho-explorer).
>
> A skill **não usa boilerplate fixo** — ela compõe o HTML do zero baseada nestes tokens.

---

## Por que isso existe

Antes: `lp-builder` tinha 3 boilerplates fixos (a360 / saas / infoprod). Toda LP saía com cara de template.

Agora: `lp-builder` lê pesquisas anteriores → extrai brand DNA do cliente real → sintetiza tokens próprios → compõe HTML único.

---

## Passo 1 — Glob das fontes na working directory

Antes de qualquer pergunta ao usuário, rodar:

```bash
# Procurar outputs de skills companheiras
ls *.md 2>/dev/null | grep -E "^(nicho-|briefing-|cliente-|prospect-|mapear-|radar-|gtm-)" || echo "no prior research"
```

Arquivos esperados:
- `nicho-{slug}.md` — output do `mapear-nicho-lite`
- `briefing-{empresa}.md` — output do `cliente-radar`
- `nicho-{slug}-explorer.md` — output do `nicho-explorer`
- `gtm-{slug}.md` — output do `gtm-architect` (se já rodou)

Se algum existe → **Modo PESQUISA** (extrair daí).
Se nada existe → ir para o Passo 2.

---

## Passo 2 — 3 Modos de operação

### Modo PESQUISA (default quando há arquivos)

Para cada arquivo encontrado, fazer Read e extrair:

#### De `nicho-{slug}.md` extrair:
- **Nicho/setor** → cabeçalho do doc
- **ICP / persona** → seção "Persona detalhada"
- **Linguagem do nicho** → seção "Linguagem do nicho" / "8 termos"
- **Dores quantificadas** → seção "Dores"
- **Mecanismo proprietário** → seção "Mecanismo / 3 candidatos de naming"
- **Eventos gatilho** → seção "Eventos gatilho"
- **Tom de voz inferido**:
  - Se nicho é jurídico/financeiro/saúde → `editorial-sóbrio`
  - Se nicho é dev tools / API / SaaS técnico → `mono-técnico`
  - Se nicho é D2C / agência / branding → `brutalist-controlado`
  - Se nicho é coaching / educação → `editorial-quente`

#### De `briefing-{empresa}.md` extrair:
- **Nome da empresa** → cabeçalho
- **Cor de marca** → seção "Presença digital" se mencionada (raramente vem; se não vem, derivar do logo via WebFetch da URL do site)
- **URL do site** → seção "Empresa"
- **Tom da comunicação atual** → analisando posts/site (se descrito)
- **Concorrentes diretos** → 3 URLs (potencial entrada pra style-scanner)
- **Top players** → 3 URLs (referência de "padrão alto" do nicho)

#### De `gtm-{slug}.md` extrair:
- **Mensagens-chave dos emails outbound** → reusar como source de copy patterns
- **CTAs testados** → reusar como CTA primário da LP
- **Posicionamento contra concorrência** → entra como copy do bloco PROBLEMA

### Modo PERGUNTAS (quando nada encontrado, mas usuário tem dados)

Apresentar:
> *"Não achei pesquisas prévias. Pra montar uma LP que não tenha cara de IA, preciso de 4 inputs:*
>
> *(1) Nicho/setor (ex: 'clínicas de dermatologia em SP')*
> *(2) Cor de marca (hex ou descrição: 'rust orange', 'verde mineral', 'preto + lime')*
> *(3) Tom de voz: editorial-sóbrio / brutalist-direto / mono-técnico / editorial-quente*
> *(4) Headline de partida (ou tema do que vai ser oferecido)*
>
> *Se preferir, rodo `/gos-mapear-nicho` antes pra eu ter contexto completo. Diz aí."*

### Modo FICTÍCIO (quando usuário não tem nada e não quer rodar pesquisa)

Aceitar explicitamente: "modo fictício" / "vai do que tiver" / "exemplo".
Avisar:
> *"Vou gerar com dados fictícios coerentes. A LP vai funcionar visualmente, mas o copy é placeholder. Marca como `[FICTÍCIO — substituir]` em campos críticos."*

---

## Passo 3 — Sintetizar brand tokens (output deste extractor)

Independente do modo, o output é **um YAML estruturado**:

```yaml
brand:
  empresa: "{{nome ou 'FICTÍCIO'}}"
  nicho: "{{nicho/setor}}"
  url_oficial: "{{url ou null}}"
  modo_origem: "PESQUISA | PERGUNTAS | FICTICIO"

persona:
  perfil: "{{1 linha do ICP}}"
  voz_natural: "{{como o ICP fala — fonte: linguagem do nicho}}"
  dor_principal: "{{1 linha}}"

design:
  sistema_inferido: "editorial-serif | brutalist-grid | mono-tech | custom"
  justificativa: "{{1 linha sobre por que esse sistema}}"
  paleta:
    bg_base: "#XXXXXX"
    ink_primary: "#XXXXXX"
    ink_body: "#XXXXXX"
    rule: "#XXXXXX"
    accent: "#XXXXXX"  # SEMPRE 1 só
    accent_ink: "#XXXXXX"
  fontes:
    display: "{{nome google font}}"
    mono: "{{nome google font}}"
    body: "{{nome google font}}"
  texturas:
    - "{{ex: grain noise / dot grid / mesh sutil}}"

copy:
  tom_voz: "{{descritor 3-5 palavras}}"
  cta_primario: "{{texto exato — ex: 'Pegar meu diagnóstico'}}"
  headline_resultado: "{{H1 candidato — promete resultado quantificado, ≤8 palavras}}"
  prova_social_disponivel: true | false
  cases_reais: ["{{case 1 com número}}", "{{case 2}}", "{{case 3}}"]

variants_recomendados:
  hero: "{{escolha do pattern-library — ex: 'split-asymmetric'}}"
  problema: "{{ex: 'list-numbered'}}"
  solucao: "{{ex: 'pillars-grid'}}"
  prova: "{{ex: 'cases-cards' ou 'logos-marquee'}}"
  stack: "{{ex: 'inclusions-list'}}"
  faq: "{{ex: 'accordion'}}"
  urgencia: "{{ex: 'guarantee-seal' ou 'cohort-card'}}"
  cta_final: "{{ex: 'form-inline' ou 'calendar-embed'}}"

flags:
  brand_color_inferida: true | false  # true se inferimos por logo/site
  copy_fictíceo_em: ["{{lista de campos onde usamos placeholder}}"]
  precisa_revisao_humana: ["{{campos que devem ser revisados pelo aluno}}"]
```

Esse YAML é o **input principal** do `dynamic-composer.md` (próximo passo do pipeline).

---

## Passo 4 — Heurísticas de inferência

### Inferir cor de marca (quando não declarada)

Se a empresa tem URL, fazer WebFetch:
```
WebFetch(url, "Quais são as 2-3 cores principais usadas no logo, header e CTA do site? Devolve em hex se possível.")
```

Se a inferência falhar OU não houver URL, **caia em uma das 3 paletas presets** com base no tom inferido:
- Sistema editorial → accent = `#D4471C` (rust)
- Sistema brutalist → accent = `#CCFF00` (lime)
- Sistema mono-tech → accent = `#00D9A6` (mint)

### Inferir sistema de design (quando ambíguo)

Tabela de roteamento por nicho:

| Nicho/setor | Sistema default | Por quê |
|---|---|---|
| Jurídico, contábil, financeiro, médico, advisory | editorial-serif | Sobriedade transmite confiança |
| Dev tools, API, SaaS técnico, infraestrutura | mono-tech | Audiência sofisticada espera estética dev |
| Agência, branding, D2C disruptor | brutalist-grid | Personalidade > polish |
| Educação executiva, infoproduto premium | editorial-serif | Valor percebido alto |
| Clínicas (dermato, odonto, estética) | editorial-serif (luxo) ou mono-tech (tech-forward) | Depende do posicionamento |
| E-commerce SMB | brutalist-grid (disruptor) ou mono-tech (data-driven) | |
| Coaching pessoal / mindset | editorial-serif (premium) — NUNCA brutalist | |

### Inferir tom de voz (do "linguagem do nicho")

Se o ICP fala em jargões técnicos no dia-a-dia → tom técnico, mono-tech.
Se o ICP é não-técnico mas paga premium → tom editorial.
Se o ICP é jovem, irreverente, antisistema → tom brutalist.

---

## Passo 5 — Validações antes de devolver o YAML

- [ ] `accent` preenchido (UMA cor, nunca 2)
- [ ] `display` font NÃO é Inter / Roboto / Arial / Space Grotesk
- [ ] `headline_resultado` ≤ 8 palavras
- [ ] `cta_primario` é específico (não "Saiba mais" / "Submit")
- [ ] `flags.copy_fictíceo_em` lista TODOS campos que viraram placeholder
- [ ] Pelo menos 1 fonte de pesquisa (PESQUISA) OU declaração explícita de FICTICIO

Se não passar: voltar pra Passo 2 e refinar.

---

## Exemplo real — fluxo PESQUISA

**Input do aluno:** *"/gos-lp-builder ângulo dor para a Clínica Dermatologia Premium SP"*

**Glob encontra:**
- `nicho-clinicas-dermatologia-sp.md` (do mapear-nicho-lite)
- `briefing-clinica-derma-premium.md` (do cliente-radar)

**Read + parsing:**

De `nicho-clinicas-dermatologia-sp.md`:
- Nicho: clínicas de dermatologia estética em SP capital
- Persona: dermatologistas dono(a) de clínica, 35-50 anos, R$80K-300K/mês
- Linguagem: "agenda lotada", "no-show", "leads do Instagram", "ticket alto"
- Dor #1 quantificada: "20% no-show = R$ 18K/mês perdidos"
- Mecanismo candidato: "Sistema CARE™ (Clientes Ativados, Recuperados, Engajados)"
- Tom inferido: nicho médico → **editorial-serif**

De `briefing-clinica-derma-premium.md`:
- URL: `https://dermapremium.com.br`
- Cor de marca observada (via WebFetch do site): off-white #FAF9F6 + dourado #B8956A
- Cases reais NÃO disponíveis (placeholder necessário)

**Output YAML:**

```yaml
brand:
  empresa: "Clínica Dermatologia Premium SP"
  nicho: "Clínicas de dermatologia estética premium"
  url_oficial: "https://dermapremium.com.br"
  modo_origem: "PESQUISA"

persona:
  perfil: "Dermatologista dona(o) de clínica premium em SP, 35-50 anos"
  voz_natural: "Fala em 'agenda', 'no-show', 'ticket', 'leads do Instagram'"
  dor_principal: "20% de no-show = R$ 18K/mês perdidos"

design:
  sistema_inferido: "editorial-serif"
  justificativa: "Nicho médico-premium pede sobriedade; cliente já usa off-white + dourado"
  paleta:
    bg_base: "#FAF9F6"
    ink_primary: "#1B1A19"
    ink_body: "#3F3D3A"
    rule: "#E8E5DF"
    accent: "#B8956A"          # dourado da marca real (não rust default)
    accent_ink: "#FFFFFF"
  fontes:
    display: "Instrument Serif"
    mono: "JetBrains Mono"
    body: "Geist"
  texturas:
    - "grain noise sutil opacity 0.025"
    - "linha 1px decorativa entre seções"

copy:
  tom_voz: "editorial sóbrio, vocabulário operacional do nicho"
  cta_primario: "Pegar meu diagnóstico de no-show"
  headline_resultado: "Recupere R$ 18K/mês em no-shows."
  prova_social_disponivel: false
  cases_reais: ["[FICTÍCIO — pedir 3 cases reais ao aluno]"]

variants_recomendados:
  hero: "split-asymmetric-quote"
  problema: "list-numbered-large"
  solucao: "pillars-grid-named-mechanism"
  prova: "cases-cards"
  stack: "inclusions-list"
  faq: "accordion-editorial"
  urgencia: "guarantee-seal"
  cta_final: "form-inline-3-fields"

flags:
  brand_color_inferida: false  # cor veio diretamente do site
  copy_fictíceo_em: ["cases_reais"]
  precisa_revisao_humana: ["cases_reais", "valor_dourado_do_logo (confirmar hex)"]
```

---

## Próximo passo

Esse YAML alimenta o `dynamic-composer.md`, que escolhe os snippets do `pattern-library.md` e gera o HTML.

---

## Anti-pattern a evitar

❌ **Não inventar dados que possam virar erro de fato** (ex: "atendemos +500 clínicas" sem prova).
❌ **Não usar paleta default se a empresa real tem cor declarada** (sempre priorizar cor real).
❌ **Não pular o YAML** e ir direto pro HTML — o YAML é a única forma de manter o composer dinâmico.
