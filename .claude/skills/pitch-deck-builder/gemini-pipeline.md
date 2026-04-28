# Pipeline Gemini (Modo Avançado, Opcional)

> Como gerar **imagens AI dos slides** ao invés do Reveal.js HTML.
> Custo aproximado: US$ 0.20/slide × 20 slides ≈ US$ 4 por deck.
> **Default da skill é `reveal` (zero custo)** — este modo é opcional.

---

## Pré-requisitos

1. **GEMINI_API_KEY** configurada no shell:
   ```bash
   export GEMINI_API_KEY="sua-chave-aqui"
   ```
   Pegue uma em https://ai.google.dev/

2. **Python 3.10+** instalado.

3. **Dependências Python:**
   ```bash
   cd ~/.claude/skills/growth-os-skills/.claude/skills/pitch-deck-builder
   pip install -r requirements.txt
   ```

---

## requirements.txt (referência)

```
google-genai>=0.3.0
Pillow>=10.0.0
pillow-heif>=0.13.0
python-dotenv>=1.0.0
```

---

## Fluxo do modo `gemini`

1. A skill `pitch-deck-builder` gera as 20 roteirizações `templates/slide_NN_*.md` parametrizadas com o nicho/cliente.

2. A skill cria/atualiza `workspace/{cliente}/` com:
   - `slides_md/` — as 20 roteirizações.
   - `prompts/` — 20 prompts de geração (um por slide), construídos a partir do `brand-style-deck.md`.
   - `output/` — onde os PNGs vão cair.

3. A skill orienta o aluno a rodar:
   ```bash
   python generate_deck.py --cliente "{{CLIENTE_NOME}}"
   ```

4. O script `generate_deck.py` (incluso nesta skill — adaptado do `_GERADOR_APRESENTACAO/scripts/generate_all_slides.py` interno):
   - Itera os 20 slides.
   - Para cada slide, monta o prompt (instruções visuais do `brand-style-deck.md` + conteúdo específico).
   - Chama Gemini 3 Pro Image Preview API.
   - Salva PNG em `output/`.

5. A skill orienta como compor o deck final:
   - Importar os 20 PNGs em Google Slides ou Canva.
   - Ou montar via HTML com `<img>` tags (template `gemini-deck.html` simples).

---

## Estrutura de prompt por slide

Cada prompt tem 3 partes:

### Parte 1 — Brand baseline (fixo)
```
Create a BEAUTIFUL, sophisticated presentation slide (16:9) as a premium INFOGRAPHIC.
Dark navy-black background with rich purple atmospheric glow and bokeh effects (#0A0A12 base, #7C5CFC accents).
Vertical line texture on the left side, atmospheric purple glow on the right.
Hexagonal/circular cards with purple icons inside, glowing elements, depth.
Numbers in bold white. Money values in neon green (#00E639).
Maximum 25 words visible. Title 3-6 words bold.
Style: cinematic, premium, sophisticated — like high-end agency presentation.
NOT flat, NOT PowerPoint. Think dashboard visualization with depth.
Inter typography. Clean, modern, elegant.
Do NOT include any logo. Do NOT add any caption text below visual elements.
```

### Parte 2 — Conteúdo do slide específico
Vem da roteirização .md de cada slide:
- Título
- Bullets (1-2 palavras)
- Números
- Tipo de elemento gráfico (hexágonos, fluxo, comparativo, etc.)

### Parte 3 — Referências visuais
- *(Opcional)* incluir 1-2 PNGs de referência via `--reference` para o Gemini calibrar estilo.
- Default: sem referências externas (fica genérico mas dentro do brand).

---

## Por que o modo `reveal` é o default

- **Zero custo** — Reveal.js + CSS estilizado dão visual praticamente equivalente.
- **Edição rápida** — aluno mexe em texto/cor sem regerar.
- **Funciona offline** após primeiro carregamento.
- **Exporta PDF nativamente** (Print → Save as PDF).
- **Performance** — load instantâneo vs. 30-60s por slide gerado.

O modo `gemini` faz sentido apenas quando:
- Aluno quer apresentação **muito mais polida** visualmente para deal de alto ticket.
- Aluno está confortável com Python + API keys.
- O custo de US$ 4/deck cabe no orçamento.

---

## Limitações do modo `gemini`

- Requer chave Gemini válida (custos por uso).
- Imagens geradas têm variação artística — pode precisar regerar alguns slides.
- Texto dentro de imagens AI pode sair com erros (Gemini ainda erra letras às vezes).
- Não há controle pixel-perfect — é IA imagem.
- Lentidão: 30-60s por slide.

---

## Versão completa Accelera 360

A versão Accelera completa do gerador de apresentação:
- 54 slides (vs. 20 desta skill).
- Pipeline com SerpAPI para referências visuais reais do nicho.
- Pipeline com OpenAI gpt-4o-image (alternativa) + Gemini.
- Pós-processamento com Pillow (logos compostos, headers/footers automáticos).
- Versão compacta de 10 slides para reuniões mais curtas.
- Versão VSL (12-15 min vídeo) com narração TTS.

🔗 https://accelera360.com.br/
