# Checklist de Conversão — 25 itens (self-check)

> A skill `lp-builder` roda este checklist mentalmente antes de entregar.
> Score < 20/25 = bloqueia entrega e ajusta a LP.

---

## Hero acima da dobra (8 itens)

- [ ] **1.** H1 com ≤ 8 palavras / ≤ 44 caracteres
- [ ] **2.** Sub-headline responde "para quem é" em 1 linha
- [ ] **3.** CTA primário visível sem scroll (mobile + desktop)
- [ ] **4.** CTA com texto de ação específico (não "Submit", "Enviar", "Saiba mais")
- [ ] **5.** Prova social mínima visível acima da dobra (logos / nº de clientes / 5 estrelas)
- [ ] **6.** Visual do produto/resultado (não stock photo genérica)
- [ ] **7.** Carrega em < 3s (Tailwind CDN + fontes Google + 1 imagem hero comprimida)
- [ ] **8.** Mobile-first — testado em 375px

---

## Copy (8 itens)

- [ ] **9.** 2ª pessoa ("você") em ≥80% do texto
- [ ] **10.** Benefícios > features (FAB aplicado em SOLUÇÃO)
- [ ] **11.** Números reais (sem "muitos", "vários", "rápido")
- [ ] **12.** Tom de voz Accelera 360 quando o aluno opta pelo boilerplate-a360
- [ ] **13.** Zero jargão técnico não traduzido (ou glossário inline)
- [ ] **14.** Português Brasil — termos de mercado em inglês mantidos
- [ ] **15.** Headlines de cada bloco escaneáveis (negrito + frase forte)
- [ ] **16.** P.S. final com reforço de promessa

---

## Conversão (9 itens)

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

## Cálculo do score

- 25/25 = entrega green-light
- 20-24/25 = entrega com warning indicando itens faltantes
- < 20/25 = **BLOQUEIA** e itera o copy/HTML antes de entregar

## Relatório do score (formato)

Anexar ao output:

```markdown
## ✅ Self-check de conversão — Score: {{X}}/25

### Hero acima da dobra: {{X}}/8
✅ {{itens_atendidos}}
❌ {{itens_pendentes}}

### Copy: {{X}}/8
✅ {{itens_atendidos}}
❌ {{itens_pendentes}}

### Conversão: {{X}}/9
✅ {{itens_atendidos}}
❌ {{itens_pendentes}}

### Status: ✅ APROVADO / ⚠️ COM RESSALVAS / 🔴 BLOQUEADO
```
