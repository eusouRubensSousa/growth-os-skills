# Pipeline Gemini (Modo Avançado, Opcional)

> Como gerar **imagens AI dos slides** ao invés do Reveal.js HTML.
> Custo aproximado: US$ 0.20/slide × 20 slides ≈ US$ 4 por deck.
> **Default da skill é `reveal` (zero custo)** — este modo é opcional.

---

## Caminho recomendado: OpenRouter (Gemini Image)

Se você já usa **OpenRouter** (ex.: modelo `google/gemini-2.5-flash-image`), não precisa da API direta do Google.

1. **OPENROUTER_API_KEY** — crie em https://openrouter.ai/ e exporte ou coloque no `.env` na raiz do workspace do aluno:
   ```bash
   set OPENROUTER_API_KEY=sk-or-...
   ```
2. **Python 3.10+** e dependências:
   ```bash
   cd .claude/skills/gos-pitch-deck-builder
   pip install -r requirements.txt
   ```
3. Rodar o gerador (PNGs em `{escopo}/{slug}/deck/slides/`, `deck.html` na pasta `deck/`):
   ```bash
   python generate_deck.py --cliente "Nome Da Oferta"
   python generate_deck.py --escopo cliente --cliente "nome-cliente" --slides-dir ofertas/meuslug/deck/slides-md/
   ```

O script usa a API **compatível com OpenAI** (`https://openrouter.ai/api/v1/chat/completions`) e envia `modalities: ["image", "text"]` + `image_config.aspect_ratio: "16:9"` (obrigatório para o modelo devolver `message.images` com data URL, não só texto). Outros modelos de imagem: `--model ...`.

---

## Alternativa: API direta Google (GEMINI_API_KEY)

1. **GEMINI_API_KEY** configurada no shell:
   ```bash
   export GEMINI_API_KEY="sua-chave-aqui"
   ```
   Pegue uma em https://ai.google.dev/

2. **Python 3.10+** instalado.

3. **Dependências Python:**
   ```bash
   cd ~/.claude/skills/growth-os-skills/.claude/skills/gos-pitch-deck-builder
   pip install -r requirements.txt
   ```

---

## requirements.txt

**OpenRouter (`generate_deck.py`):** use o `requirements.txt` desta skill (`requests`, `Pillow`, `python-dotenv`).

**API Google direta (legado / não coberto pelo script atual):** típico seria `google-genai`, `Pillow`, `pillow-heif`, `python-dotenv` — só necessário se você mantiver um pipeline separado com SDK Google.

---

## Fluxo do modo `gemini`

1. A skill `pitch-deck-builder` gera as 20 roteirizações `templates/slide_NN_*.md` parametrizadas com o nicho/cliente.

2. A skill escreve em `{escopo}/{slug}/deck/`:
   - `slides-md/` — as 20 roteirizações (`.md`).
   - Após rodar o Python: `slides/` — PNGs gerados; `deck.html` — viewer com as imagens.

3. Rodar a partir da pasta da skill (ou com caminho absoluto ao script):
   ```bash
   python generate_deck.py --cliente "{{SLUG_OU_NOME}}" --slides-dir "{escopo}/{slug}/deck/slides-md"
   ```

4. O `generate_deck.py`:
   - Monta o prompt (baseline visual + conteúdo do `.md` do slide).
   - Chama **OpenRouter** (`OPENROUTER_API_KEY`), default `--model google/gemini-2.5-flash-image`.
   - Grava PNGs em `{escopo}/{slug}/deck/slides/` e gera `deck.html` no diretório `deck/`.

5. Uso do deck: abrir `deck.html` no navegador, ou importar os PNGs em Google Slides / Canva.

---

## Estrutura de prompt por slide

Cada prompt tem 3 partes:

### Parte 1 — Brand baseline (fixo — rbdata company)
```
Create a BEAUTIFUL, sophisticated presentation slide (16:9) as a premium INFOGRAPHIC.
Dark deep-navy background (#070C14 base) with electric blue atmospheric glow and bokeh effects (#4090F7 accents, #44CCFF highlights).
Vertical line texture on the left side with subtle blue glow. Atmospheric blue radial gradient on the right.
Hexagonal/circular cards with blue (#4090F7) icons inside, glowing elements, depth and blur effects.
Numbers in bold white. Money/positive values in cyan (#44CCFF). Negative/risk values in red (#FF4444).
Maximum 25 words visible. Title 3-6 words bold.
Style: cinematic, premium, tech-forward — like high-end data company presentation.
NOT flat, NOT PowerPoint. Think data dashboard visualization with depth and precision.
Manrope typography for titles, Inter for body. Clean, modern, tech aesthetic.
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
