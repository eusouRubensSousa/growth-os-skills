# Checklist de Conversão + Anti-AI — 35 itens (self-check duplo)

> A skill `lp-builder` roda este checklist antes de entregar a LP.
>
> **Bloqueio:** score total < 28/35 = **BLOQUEIA** entrega e itera o copy/HTML.
> **Bloqueio independente:** anti-AI < 8/10 = **BLOQUEIA** mesmo se CRO estiver alto.
>
> Razão do bloqueio anti-AI: uma LP com cara de IA perde conversão antes mesmo do visitante ler o copy. Score CRO alto não compensa estética genérica.

---

## A. Hero acima da dobra (8 itens — CRO)

- [ ] **1.** H1 com ≤ 8 palavras / ≤ 44 caracteres
- [ ] **2.** Sub-headline responde "para quem é" em 1 linha
- [ ] **3.** CTA primário visível sem scroll (mobile + desktop)
- [ ] **4.** CTA com texto de ação específico (não "Submit", "Enviar", "Saiba mais")
- [ ] **5.** Prova social mínima visível acima da dobra (logos / nº de clientes / 5 estrelas / micro-prova textual)
- [ ] **6.** Visual do produto/resultado/quote (não stock photo genérica de "equipe rindo")
- [ ] **7.** Carrega em < 3s (Tailwind CDN + 1 chamada de Google Fonts + zero imagem pesada)
- [ ] **8.** Mobile-first — testado em 375px

---

## B. Copy (8 itens — CRO)

- [ ] **9.** 2ª pessoa ("você") em ≥80% do texto
- [ ] **10.** Benefícios > features (FAB aplicado em SOLUÇÃO)
- [ ] **11.** Números reais (sem "muitos", "vários", "rápido")
- [ ] **12.** Tom de voz coerente com o sistema escolhido (ver `templates.md` — editorial-serif / brutalist-grid / mono-tech)
- [ ] **13.** Zero jargão técnico não traduzido (ou glossário inline)
- [ ] **14.** Português Brasil — termos de mercado em inglês mantidos
- [ ] **15.** Headlines de cada bloco escaneáveis (negrito + frase forte)
- [ ] **16.** P.S. final com reforço de promessa

---

## C. Conversão (9 itens — CRO)

- [ ] **17.** 1 único CTA primário em toda a página
- [ ] **18.** CTA repetido ≥ 2x (HERO + final, idealmente também após PROVA SOCIAL)
- [ ] **19.** Formulário com ≤ 4 campos (regra: -120% conversão se >11 campos)
- [ ] **20.** Sem links de saída concorrentes (menu top simplificado ou removido)
- [ ] **21.** Footer com contato + LGPD + powered by Accelera 360
- [ ] **22.** Placeholder de pixel/analytics comentado (não ativo — aluno conecta o seu)
- [ ] **23.** FAQ com 3-5 objeções principais
- [ ] **24.** Garantia ou prova de resultado próxima ao CTA final
- [ ] **25.** Tag de dados Open Graph + favicon + meta description configurados

---

## D. Anti-AI (10 itens — bloqueio independente)

> Origem: `anti-ai-design.md` (8 sintomas + 6 táticas). Esta seção evita que a LP cheire a IA, perdendo conversão no primeiro 3-5s.

- [ ] **26.** Display font NÃO é Inter / Roboto / Arial / Space Grotesk / system-ui / Open Sans / Lato
- [ ] **27.** Pelo menos 2 famílias tipográficas diferentes em uso (display + body, idealmente +mono)
- [ ] **28.** ZERO gradiente roxo→azul / indigo→violet / blue→purple (`#6366f1 → #a855f7` proibido)
- [ ] **29.** UMA cor de destaque dominante (não 2, não 3) — `--accent` única
- [ ] **30.** Hero NÃO termina em 3 cards idênticos com ícones Lucide imediatamente abaixo
- [ ] **31.** ZERO emoji em H1 e H2 (emoji só permitido em ícones decorativos pequenos)
- [ ] **32.** Headline H1 promete resultado concreto/quantificado, não feature ou estado vago ("Recupere R$ 18K/mês" > "Transforme seu negócio")
- [ ] **33.** Tem pelo menos 1 elemento de textura (grain noise / dot grid / mesh sutil / linha decorativa entre seções)
- [ ] **34.** Layout NÃO é 100% simétrico — pelo menos 1 quebra de grid intencional (split assimétrico, asymmetric column, número grande deslocado)
- [ ] **35.** Linguagem operacional específica (nada de "Soluções" / "Transforme" / "Empodere" / "Saiba mais" / "Empower your team")

---

## Cálculo do score

### Score CRO (itens 1-25)
- 23-25/25 = ✅ aprovado
- 20-22/25 = ⚠️ entrega com ressalvas (warning indicando itens faltantes)
- < 20/25 = 🔴 reprocessar antes de entregar

### Score Anti-AI (itens 26-35)
- 9-10/10 = ✅ aprovado
- 8/10 = ⚠️ entrega com ressalva (item específico precisa ser revisado pelo aluno)
- < 8/10 = 🔴 **BLOQUEIA** — voltar pro composer e ajustar variantes/tokens/copy

### Score total (35 itens)
- 32-35/35 = ✅ entrega green-light
- 28-31/35 = ⚠️ entrega com ressalvas
- < 28/35 = 🔴 **BLOQUEIA** entrega

---

## Relatório do score (formato)

Anexar ao output:

```markdown
## ✅ Self-check — Score: {{X}}/35

### A. Hero acima da dobra: {{X}}/8
✅ {{itens_atendidos}}
❌ {{itens_pendentes}}

### B. Copy: {{X}}/8
✅ {{itens_atendidos}}
❌ {{itens_pendentes}}

### C. Conversão: {{X}}/9
✅ {{itens_atendidos}}
❌ {{itens_pendentes}}

### D. Anti-AI: {{X}}/10  ← bloqueio independente
✅ {{itens_atendidos}}
❌ {{itens_pendentes}}

### Status: ✅ APROVADO / ⚠️ COM RESSALVAS / 🔴 BLOQUEADO
{{razão se bloqueado}}
```

---

## Como reprocessar quando bloqueado

1. **Anti-AI < 8/10:** voltar ao Passo 3.4 do `SKILL.md` (Dynamic Composer) e:
   - Trocar variante do bloco que tá quebrando (ex: hero `mono-tech-terminal` → `split-asymmetric-quote` se for 3-cards-idênticos).
   - Trocar fonte se for banida.
   - Substituir gradiente proibido por background sólido + accent única.
   - Reescrever H1 com resultado quantificado (ver `anti-ai-design.md` seção F).
2. **CRO < 20/25:** voltar ao Passo 3.3 (Copy Agent) e:
   - Reescrever copy aplicando AIDA + PAS + FAB onde estiver fraco.
   - Reduzir formulário para ≤ 4 campos.
   - Acrescentar prova social acima da dobra.
3. **Total 28-31/35:** entregar com warning, mas listar explicitamente os itens pendentes pro aluno revisar.
