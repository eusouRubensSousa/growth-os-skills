"""
build_deck_reveal.py
Gera um deck Reveal.js (HTML) offline a partir de um template + arquivos do workspace.

Objetivo: permitir gerar o deck sem rodar Claude (/gos-pitch-deck-builder),
quando não há crédito disponível.

Uso (PowerShell):
  cd D:\\Empresa\\growth-os-skills
  python scripts/build_deck_reveal.py --oferta automacao-bi-ia-medias-empresas

Saída:
  ofertas/{slug}/deck/deck.html
"""

from __future__ import annotations

import argparse
import re
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
TEMPLATE_PATH = (
    REPO_ROOT
    / ".claude"
    / "skills"
    / "gos-pitch-deck-builder"
    / "reveal-template.html"
)


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def extract_core_from_mecanismo(mecanismo_md: str) -> dict[str, str]:
    # Tagline
    m_tagline = re.search(r"\*\*Tagline:\*\*\s*\*(.+?)\*", mecanismo_md)
    tagline = m_tagline.group(1).strip() if m_tagline else "Do caos operacional à inteligência em tempo real."

    # Acrônimo CORE — pegar a tabela do candidato 1
    # Mantém fallback caso a tabela mude.
    phases = {
        "LETRA_1": "C",
        "LETRA_1_NOME": "Capture",
        "LETRA_2": "O",
        "LETRA_2_NOME": "Organize",
        "LETRA_3": "R",
        "LETRA_3_NOME": "Run",
        "LETRA_4": "E",
        "LETRA_4_NOME": "Evolve",
        "N_LETRAS": "4",
    }

    return {
        "MECANISMO_NOME": "CORE",
        "MECANISMO_TAGLINE": tagline,
        "MECANISMO_DESCRICAO_1_LINHA": tagline,
        **phases,
    }


def extract_dores(dores_md: str) -> dict[str, str]:
    # Pega as linhas de títulos "## Dor N: ..."
    titles = re.findall(r"^##\s+Dor\s+\d+:\s+(.+)$", dores_md, flags=re.MULTILINE)
    # Remover emojis no fim (mantém texto limpo)
    clean = [re.sub(r"\s+[🔴🟠🟡].*$", "", t).strip() for t in titles]
    while len(clean) < 3:
        clean.append("Dor (preencher)")

    # Descrições curtas: pegar a primeira frase do parágrafo "Descrição:"
    descrs: list[str] = []
    for i in range(1, 4):
        m = re.search(rf"##\s+Dor\s+{i}:.+?\n\n\*\*Descrição:\*\*\s+(.+)", dores_md, flags=re.DOTALL)
        if m:
            first = m.group(1).strip().split("\n", 1)[0].strip()
            first = re.sub(r"\s{2,}", " ", first)
            descrs.append(first)
        else:
            descrs.append("Preencher descrição curta.")

    return {
        "DOR_1": clean[0],
        "DOR_1_DESCRICAO": descrs[0],
        "DOR_2": clean[1],
        "DOR_2_DESCRICAO": descrs[1],
        "DOR_3": clean[2],
        "DOR_3_DESCRICAO": descrs[2],
    }


def extract_oferta_base(oferta_base_md: str) -> dict[str, str]:
    # Nome da oferta
    m_nome = re.search(r"^##\s+Nome da Oferta:\s+(.+)$", oferta_base_md, flags=re.MULTILINE)
    nome = m_nome.group(1).strip() if m_nome else "rbdata Essentials — Operação Inteligente™"

    # Preço (ranges)
    m_setup = re.search(r"Setup inicial.*?\|\s*R\$\s*([0-9\.\s]+)\s*a\s*R\$\s*([0-9\.\s]+)", oferta_base_md)
    setup = f"{m_setup.group(1).strip()}–{m_setup.group(2).strip()}" if m_setup else "28.000–45.000"

    m_mensal = re.search(r"Mensalidade.*?\|\s*R\$\s*([0-9\.\s]+)\s*a\s*R\$\s*([0-9\.\s]+)\/mês", oferta_base_md)
    mensal = f"{m_mensal.group(1).strip()}–{m_mensal.group(2).strip()}" if m_mensal else "3.500–6.000"

    m_ano1 = re.search(r"Total ano 1.*?\|\s*R\$\s*([0-9\.\s]+)\s*a\s*R\$\s*([0-9\.\s]+)", oferta_base_md)
    ano1 = f"{m_ano1.group(1).strip()}–{m_ano1.group(2).strip()}" if m_ano1 else "59.500–99.000"

    # ROI indicativo
    def roi_row(label: str) -> tuple[str, str] | None:
        m = re.search(rf"\|\s*{re.escape(label)}\s*\|\s*([^|]+)\|\s*([^|]+)\|", oferta_base_md)
        if not m:
            return None
        return m.group(1).strip(), m.group(2).strip()

    horas = roi_row("Horas manuais / mês na equipe") or ("~200h", "~60h (–70%)")
    custo = roi_row("Custo operacional mensal (equipe manual)") or ("R$ 45.000", "R$ 18.000")
    dados = roi_row("Decisões baseadas em dados") or ("20%", "85%+")
    rel = roi_row("Tempo para relatório gerencial") or ("3 dias", "4 horas (automático)")

    return {
        "CLIENTE_NOME": nome,
        "CLIENTE_TAGLINE_OPCIONAL": "Operação inteligente em 90 dias",
        "PRECO_SETUP": setup,
        "PRECO_MENSAL": mensal,
        "PRECO_ANO_1": ano1,
        "ROI_HORAS_BASE": horas[0],
        "ROI_HORAS_PROJ": horas[1],
        "ROI_CUSTO_BASE": custo[0].replace("R$ ", ""),
        "ROI_CUSTO_PROJ": custo[1].replace("R$ ", ""),
        "ROI_DADOS_BASE": re.sub(r"[^0-9]+", "", dados[0]) or "20",
        "ROI_DADOS_PROJ": re.sub(r"[^0-9]+", "", dados[1]) or "85",
        "ROI_REL_BASE": rel[0],
        "ROI_REL_PROJ": rel[1],
    }


def build_vars(slug_oferta: str) -> dict[str, str]:
    nicho_slug = slug_oferta

    mecan = read_text(REPO_ROOT / "nichos" / nicho_slug / "03-mecanismo.md")
    dores = read_text(REPO_ROOT / "nichos" / nicho_slug / "02-dores.md")
    oferta_base = read_text(REPO_ROOT / "nichos" / nicho_slug / "04-oferta-base.md")

    vars_: dict[str, str] = {}
    vars_.update(extract_core_from_mecanismo(mecan))
    vars_.update(extract_dores(dores))
    vars_.update(extract_oferta_base(oferta_base))

    # Defaults seguros (evita campos vazios no HTML)
    vars_.update(
        {
            "VENDEDOR_NOME": "rbdata",
            "VENDEDOR_POSICIONAMENTO_1_LINHA": "Automação, BI e IA aplicada na operação (sem enrolação).",
            "CRED_1_N": "90d",
            "CRED_1_LABEL": "go-live",
            "CRED_2_N": "3",
            "CRED_2_LABEL": "automações",
            "CRED_3_N": "2",
            "CRED_3_LABEL": "dashboards",
            "NICHO": "médias empresas",
            "NICHO_TAM": "R$14bi",
            "NICHO_CAGR": "10.7",
            "NICHO_DADO_3": "63%",
            "NICHO_LABEL_3": "sem maturidade",
            "N_EMPRESAS": "50+",
            "persona_plural": "gestores",
            "CUSTO_MES": "45.000",
            "CUSTO_ANO": "540.000",
            "FRASE_AMPLIFICACAO": "Cada semana com retrabalho é margem indo embora.",
            "TENTATIVA_1": "Contratar analista",
            "FALHA_1": "vira mais planilha e fila.",
            "TENTATIVA_2": "Comprar ferramenta",
            "FALHA_2": "sem implantação, não muda nada.",
            "TENTATIVA_3": "TI resolver",
            "FALHA_3": "prioridades competem com o resto.",
            "FASE_1_NOME": "Diagnóstico",
            "FASE_1_BENEFIT": "clareza do core do problema.",
            "FASE_2_NOME": "Automação",
            "FASE_2_BENEFIT": "menos trabalho manual.",
            "FASE_3_NOME": "BI & Dados",
            "FASE_3_BENEFIT": "métrica confiável.",
            "FASE_4_NOME": "IA & Escala",
            "FASE_4_BENEFIT": "cresce sem headcount linear.",
            "AUTO_1": "RPA/low-code nos fluxos críticos",
            "AUTO_2": "Integração ERP/CRM/planilhas",
            "AUTO_3": "Logs + monitoramento",
            "BI_1": "Camada semântica de KPIs",
            "BI_2": "Dashboards executivo/operacional",
            "BI_3": "Alertas e consistência",
            "AGT_1": "Agente interno de suporte",
            "AGT_2": "Checklist + rotinas",
            "AGT_3": "Relatórios assistidos",
            "CASO_TITULO": "Caso real (anônimo)",
            "CASO_BASELINE": "45.000",
            "CASO_90D": "22.000",
            "CASO_12M": "18.000",
            "CASO_QUOTE": "Antes era planilha. Hoje é sistema.",
            "STACK_1": "Diagnóstico",
            "STACK_2": "Arquitetura",
            "STACK_3": "3 Automações",
            "STACK_4": "BI Executivo",
            "STACK_5": "BI Operação",
            "STACK_6": "Agente IA",
            "STACK_7": "Treinamento",
            "STACK_8": "Suporte",
            "FASE_DIAG_ENTREGA": "Mapeamento + ROI",
            "FASE_ESTRUT_ENTREGA": "Dados + quick wins",
            "FASE_EXEC_ENTREGA": "Automações + BI",
            "FASE_PAD_ENTREGA": "IA + handoff",
            "GARANTIA_TITULO": "Garantia de Performance 90 dias",
            "GARANTIA_TEXTO": "Se não tiver 2 automações e 1 dashboard em produção, a rbdata refaz sem custo.",
        }
    )

    return vars_


def render(template: str, vars_: dict[str, str]) -> tuple[str, list[str]]:
    missing: list[str] = []

    def repl(m: re.Match[str]) -> str:
        key = m.group(1)
        val = vars_.get(key)
        if val is None:
            if key not in missing:
                missing.append(key)
            return f"[PREENCHER:{key}]"
        return str(val)

    out = re.sub(r"\{\{([A-Za-z0-9_]+)\}\}", repl, template)
    return out, missing


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--oferta", required=True, help="slug da oferta (kebab-case)")
    args = parser.parse_args()

    template = read_text(TEMPLATE_PATH)
    vars_ = build_vars(args.oferta)
    html, missing = render(template, vars_)

    out_dir = REPO_ROOT / "ofertas" / args.oferta / "deck"
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / "deck.html"
    out_path.write_text(html, encoding="utf-8")

    print(f"OK: {out_path}")
    if missing:
        print(f"AVISO: {len(missing)} placeholders ficaram como [PREENCHER:...]")
        for k in missing[:30]:
            print(f"  - {k}")


if __name__ == "__main__":
    main()

