"""
generate_deck.py — gos-pitch-deck-builder (growth-os-skills)
Gera imagens dos slides via OpenRouter (default: google/gemini-2.5-flash-image)
e monta um deck.html com os PNGs em deck/slides/.

Uso:
  python generate_deck.py --cliente "Nome do Cliente"
  python generate_deck.py --escopo cliente --cliente "slug-cliente" --slides-dir caminho/slides-md/
  python generate_deck.py --cliente "Nome" --model google/gemini-2.5-flash-image

Variável de ambiente:
  OPENROUTER_API_KEY=sk-or-...
  (opcional) arquivo .env na raiz do workspace com a mesma variável — carregado via python-dotenv
"""

import argparse
import base64
import os
import sys
import time
from pathlib import Path

try:
    import requests
except ImportError:
    sys.exit("Dependência faltando. Rode: pip install requests")

try:
    from dotenv import load_dotenv
except ImportError:
    def load_dotenv():
        pass

# ---------------------------------------------------------------------------
# Configuração
# ---------------------------------------------------------------------------

OPENROUTER_BASE = "https://openrouter.ai/api/v1"
DEFAULT_MODEL   = "google/gemini-2.5-flash-image"

# Pastas do workspace: ofertas/ e clientes/ (plural), nao o nome do --escopo.
SCOPE_TO_DIR = {"oferta": "ofertas", "cliente": "clientes"}

BRAND_BASELINE = """
Create a BEAUTIFUL, sophisticated presentation slide (16:9, 1920x1080) as a premium INFOGRAPHIC.

VISUAL IDENTITY — rbdata company:
- Background: deep dark navy #070C14
- Primary accent: electric blue #4090F7 (hexagons, borders, glow, highlights)
- Secondary accent: cyan #44CCFF (gradients, effects, positive values)
- Danger/risk: red #FF4444
- Text: white #FFFFFF (titles), #828E9D (body/muted)
- Atmospheric effect: radial blue glow (rgba(64,144,247,0.15)) top-right
- Left edge: subtle vertical line texture in blue opacity 0.06
- Cards: dark background rgba(7,12,20,0.8) with blue border rgba(64,144,247,0.2), border-radius 12px, backdrop blur

TYPOGRAPHY:
- Titles: Manrope 800, bold, white
- Body: Inter 400-500, muted gray
- Labels/kickers: uppercase, letter-spacing 4px, blue #4090F7
- Code/data: JetBrains Mono

DESIGN RULES:
- Maximum 25 words visible on screen
- Title: 3-6 words, very large and bold
- Hexagonal shapes with blue glow for data metrics
- Numbers: huge (80-120px equivalent), white with blue text-shadow glow
- Money/positive values: cyan #44CCFF, bold
- Negative/cost values: red #FF4444
- Style: cinematic, premium, tech-forward — like elite data company presentation
- NOT flat, NOT generic PowerPoint
- Think: Vercel × Bloomberg Terminal × premium consulting deck
- Do NOT include any logo
- Do NOT add caption text below visual elements
"""

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def build_prompt(brand_baseline: str, slide_content: str) -> str:
    return f"{brand_baseline.strip()}\n\nSLIDE CONTENT:\n{slide_content.strip()}"


def call_openrouter_image(prompt: str, model: str, api_key: str) -> bytes | None:
    """Chama OpenRouter e retorna bytes da imagem PNG, ou None em erro."""
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://rbdata.company",
        "X-Title": "growth-os-skills - pitch deck generator",
    }

    # OpenRouter: sem modalities o modelo devolve so texto descritivo; imagens ficam em message.images
    payload = {
        "model": model,
        "modalities": ["image", "text"],
        "image_config": {"aspect_ratio": "16:9"},
        "messages": [{"role": "user", "content": prompt}],
    }

    try:
        resp = requests.post(
            f"{OPENROUTER_BASE}/chat/completions",
            headers=headers,
            json=payload,
            timeout=120,
        )
        resp.raise_for_status()
    except requests.exceptions.HTTPError as e:
        print(f"    HTTP error: {e.response.status_code} - {e.response.text[:300]}")
        return None
    except requests.exceptions.Timeout:
        print("    Timeout na requisição (>120s)")
        return None

    data = resp.json()
    msg = data.get("choices", [{}])[0].get("message", {}) or {}

    for image in msg.get("images") or []:
        url = (image.get("image_url") or {}).get("url", "")
        if url.startswith("data:image/"):
            return base64.b64decode(url.split(",", 1)[1])

    content = msg.get("content", "")

    # Caso 1: conteúdo é lista de partes (multimodal)
    if isinstance(content, list):
        for part in content:
            if isinstance(part, dict):
                # image_url como data URL
                if part.get("type") == "image_url":
                    url = part["image_url"].get("url", "")
                    if url.startswith("data:image/"):
                        return base64.b64decode(url.split(",", 1)[1])
                # inline_data (formato Gemini nativo)
                if part.get("type") == "image" or "inline_data" in part:
                    b64 = part.get("inline_data", {}).get("data") or part.get("data", "")
                    if b64:
                        return base64.b64decode(b64)

    # Caso 2: conteúdo é string com data URL
    if isinstance(content, str) and content.startswith("data:image/"):
        return base64.b64decode(content.split(",", 1)[1])

    # Caso 3: resposta tem campo separado de imagem (alguns providers)
    if "data" in data:
        for item in data.get("data", []):
            b64 = item.get("b64_json", "")
            if b64:
                return base64.b64decode(b64)

    print(f"    Imagem não encontrada na resposta. Preview: {str(content)[:200]}")
    return None


def make_html_viewer(deck_root: Path, cliente: str, slide_paths: list[Path]) -> Path:
    """Monta um deck.html em deck_root referenciando PNGs (paths relativos ao HTML)."""
    slides_html = "\n".join(
        f'<div class="slide"><img src="{p.relative_to(deck_root).as_posix()}" alt="Slide {i+1}">'
        f'<div class="num">{i+1}/{len(slide_paths)}</div></div>'
        for i, p in enumerate(slide_paths)
    )

    html = f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8"/>
<title>{cliente} — rbdata company</title>
<style>
  body {{ margin:0; background:#070C14; font-family:'Inter',sans-serif; color:#fff; }}
  h1   {{ text-align:center; padding:24px; color:#4090F7; font-size:20px; letter-spacing:2px; text-transform:uppercase; }}
  .grid{{ display:grid; grid-template-columns:repeat(auto-fit,minmax(480px,1fr)); gap:16px; padding:16px; max-width:1600px; margin:0 auto; }}
  .slide {{ position:relative; background:#0B1628; border:1px solid rgba(64,144,247,0.2); border-radius:8px; overflow:hidden; }}
  .slide img {{ width:100%; display:block; }}
  .num {{ position:absolute; bottom:8px; right:12px; font-size:11px; color:#485E79; letter-spacing:1px; }}
  .nav {{ text-align:center; padding:32px; color:#485E79; font-size:13px; }}
</style>
</head>
<body>
<h1>{cliente} — Deck rbdata company</h1>
<div class="grid">
{slides_html}
</div>
<div class="nav">rbdata.company · growth-os-skills · {len(slide_paths)} slides</div>
</body>
</html>"""

    out = deck_root / "deck.html"
    out.write_text(html, encoding="utf-8")
    return out


# ---------------------------------------------------------------------------
# Slides padrão (fallback quando não há slides_dir)
# ---------------------------------------------------------------------------

DEFAULT_SLIDES = [
    ("01-capa",        "COVER SLIDE. Title: [CLIENTE_NOME]. Subtitle: 'Apresentação Comercial'. Bottom: 'rbdata company — Automação · BI · IA'. Dark background, large electric blue title glow."),
    ("02-speaker",     "WHO WE ARE. Title: 'Quem fala com você'. Three hexagon metrics with numbers. Left: speaker name and 1-line positioning. Right: 3 credential hexagons (years, clients, projects)."),
    ("03-agenda",      "AGENDA. Title: 'Próximos 30 minutos'. Three cards: 1) O cenário (market data), 2) O que capturar (opportunity), 3) Caminhar junto? (decision). Dark cards with blue borders."),
    ("04-cenario",     "MARKET DATA. Title: 'O cenário mudou'. Three large hexagons with huge numbers: TAM R$14bi, CAGR 10.7% a.a., 63% das médias empresas sem maturidade digital. Electric blue glow."),
    ("05-dores",       "3 PAINS. Title: 'As 3 dores que mais aparecem'. Three stacked cards with icons: 🔴 Processos manuais (R$540K/ano perdidos), 🟠 Dados fragmentados (decisões no escuro), 🟡 Operação que não escala."),
    ("06-custo",       "COST OF INACTION. Title: 'Quanto isso custa'. Two large hexagons: left 'R$45K/mês' in red (custo operacional manual), right '200h/mês' in red (horas manuais). Amplification text below."),
    ("07-tentativas",  "FAILED ATTEMPTS. Title: 'O que outros já tentaram'. Three faded/dimmed cards with ❌: 1) Contratar analista de dados, 2) Comprar ferramenta sem implementar, 3) Time de TI interno resolver."),
    ("08-virada",      "THE TURN. Title: name of the proprietary mechanism in huge gradient text (white to blue). One-line description below. Cinematic, atmospheric, full blue glow background."),
    ("09-mecanismo",   "MECHANISM. Title: mechanism name with ™. Tagline in italics. Grid of hexagons with each letter of the acronym and its meaning. Electric blue letters, white labels."),
    ("10-fluxo",       "FLOW. Title: 'Como funciona'. Four cards in sequence connected by blue arrows: Diagnóstico → Automação → BI & Dados → IA & Escala. Each card: phase name + 1 benefit."),
    ("11-arquitetura", "ARCHITECTURE. Title: 'Automação + BI + Agentes IA'. Three columns: ⚙️ Automação (3 bullets), 📊 Business Intelligence (3 bullets), 🤖 Agentes IA (3 bullets). Blue icon headers."),
    ("12-caso",        "CASE STUDY. Title: 'Caso real — distribuição 200 funcionários'. Three comparison cards: ANTES (R$45K custo mensal, plain), 90 DIAS (R$22K in cyan), 12 MESES (R$18K in cyan). Quote below."),
    ("13-stack",       "DELIVERABLES. Title: 'Stack de entregas'. 8 hexagons in a grid: Diagnóstico, Arquitetura de Dados, 3 Automações, Dashboard Executivo, Dashboard Operacional, Agente IA, Treinamento, Suporte Mensal."),
    ("14-cronograma",  "TIMELINE. Title: 'Implementação em 4 fases — 90 dias'. Four horizontal cards: Sem1-2 Diagnóstico, Sem3-7 Automação, Sem6-10 BI, Sem10-12 IA & Go-live. Blue phase labels."),
    ("15-metricas",    "METRICS. Title: 'O que vamos medir'. Six cards in 3x2 grid: Processos automáticos, Horas recuperadas/mês, ROI, Dashboards ativos, Redução de erros, NPS interno. Blue metric labels."),
    ("16-roi",         "ROI TABLE. Title: 'Antes / Depois (12 meses)'. Table with 4 rows: Horas manuais (200h → 60h), Custo operacional (R$45K → R$18K), Decisões por dados (20% → 85%), Tempo de relatório (3 dias → 4h). Cyan for 'depois' values."),
    ("17-garantia",    "GUARANTEE. Large shield icon 🛡️ centered. Title: 'Garantia de Performance 90 dias'. Description: refaz sem custo se não entregar 2 automações + 1 dashboard BI em produção. White on dark, elegant."),
    ("18-investimento","INVESTMENT. Title: 'Investimento'. Central card with blue border: 'Setup R$28.000–45.000' in huge cyan, '+ R$3.500–6.000/mês' in cyan. 'Total ano 1: R$59.500–99.000' in small text below."),
    ("19-proximos",    "NEXT STEPS. Title: 'Para avançar'. Three step cards: HOJE — Decisão, ESTA SEMANA — Contrato + Onboarding, 2 SEMANAS — Kickoff operacional. Blue timeline labels, sequential flow."),
    ("20-cta",         "FINAL CTA. Title: 'Topa começar a transformar sua empresa hoje?' in large bold text. Three option cards: ✅ Topa (green border), 🤔 Preciso pensar, ❌ Não agora. Bottom: 'Dados que geram decisão. Automação que gera resultado. — rbdata company'"),
]


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    load_dotenv()
    parser = argparse.ArgumentParser(description="Gera deck de slides via OpenRouter (imagem)")
    parser.add_argument("--cliente", required=True, help="Nome ou slug do cliente/oferta (define pasta kebab-case)")
    parser.add_argument(
        "--escopo",
        choices=("oferta", "cliente"),
        default="oferta",
        help="oferta -> pasta ofertas/; cliente -> clientes/ (default: oferta)",
    )
    parser.add_argument("--model", default=DEFAULT_MODEL, help="Model ID no OpenRouter")
    parser.add_argument("--slides-dir", default=None, help="Diretório com .md por slide (opcional)")
    parser.add_argument(
        "--output-dir",
        default=None,
        help="Raiz do deck (default: {escopo}/{slug}/deck); PNGs vão em …/deck/slides/",
    )
    parser.add_argument("--delay", type=float, default=3, help="Segundos entre requisições (default: 3)")
    args = parser.parse_args()

    api_key = os.environ.get("OPENROUTER_API_KEY", "")
    if not api_key:
        sys.exit(
            "OPENROUTER_API_KEY não definida. Defina no ambiente ou em .env na raiz do workspace."
        )

    slug = args.cliente.lower().replace(" ", "-")
    if args.output_dir:
        deck_root = Path(args.output_dir)
    else:
        deck_root = Path(SCOPE_TO_DIR[args.escopo]) / slug / "deck"
    deck_root.mkdir(parents=True, exist_ok=True)
    slides_out = deck_root / "slides"
    slides_out.mkdir(parents=True, exist_ok=True)

    # Carrega slides
    if args.slides_dir:
        slides_dir = Path(args.slides_dir)
        slide_files = sorted(slides_dir.glob("*.md"))
        slides = [(p.stem, p.read_text(encoding="utf-8")) for p in slide_files]
        if not slides:
            sys.exit(f"Nenhum .md encontrado em {slides_dir}")
    else:
        print("slides_dir não informado — usando roteirizações padrão embutidas.")
        slides = DEFAULT_SLIDES

    total = len(slides)
    if total != 20:
        print(
            f"AVISO: o quality gate do gos-pitch-deck-builder exige 20 slides; "
            f"foram carregados {total}.\n"
        )
    print(f"\ngrowth-os-skills — Deck Generator (OpenRouter)")
    print(f"Escopo  : {args.escopo}")
    print(f"Cliente : {args.cliente}")
    print(f"Modelo  : {args.model}")
    print(f"Slides  : {total}")
    print(f"Output  : {deck_root.resolve()} (PNGs em slides/)")
    print(f"{'─'*50}\n")

    generated: list[Path] = []
    failed: list[str] = []

    for i, (name, content) in enumerate(slides, 1):
        slide_label = f"Slide {i:02d}/{total} — {name}"
        print(f"[{i:02d}/{total}] Gerando {name}...", end=" ", flush=True)

        prompt = build_prompt(BRAND_BASELINE, content)
        img_bytes = call_openrouter_image(prompt, args.model, api_key)

        if img_bytes:
            out_path = slides_out / f"slide_{i:02d}_{name}.png"
            out_path.write_bytes(img_bytes)
            generated.append(out_path)
            print(f"✓ ({len(img_bytes)//1024}KB)")
        else:
            print("✗ FALHOU")
            failed.append(slide_label)

        if i < total:
            time.sleep(args.delay)

    # HTML viewer
    if generated:
        html_path = make_html_viewer(deck_root, args.cliente, generated)
        print(f"\nDeck HTML gerado: {html_path.resolve()}")

    # Relatório final
    print(f"\n{'─'*50}")
    print(f"Gerados : {len(generated)}/{total}")
    if failed:
        print(f"Falhas  : {len(failed)}")
        for f in failed:
            print(f"  - {f}")
    print(f"Output  : {deck_root.resolve()} (PNGs em slides/)")
    print(f"{'─'*50}\n")


if __name__ == "__main__":
    main()
