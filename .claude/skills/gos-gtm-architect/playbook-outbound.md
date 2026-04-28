# Playbook Outbound — gtm-architect

## ICP de targeting

Para outbound, definir filtros de prospecção:

| Filtro | Como definir |
|---|---|
| Cargo decisor | "{{cargo_principal}}", "{{cargo_secundário}}" (vem do `mapear-nicho-lite`) |
| Faturamento | Min R$ {{X}} / Max R$ {{Y}} (faixa onde a oferta cabe) |
| Tamanho equipe | {{N_min}}-{{N_max}} funcionários |
| Geografia | {{cidades_OR_estados}} |
| Setor (NAICS/CNAE) | {{códigos_específicos}} |
| Sinal de compra | Rodou ad nos últimos 30 dias / postou sobre o problema X / contratou cargo Y |

Ferramentas (apenas como referência — não obrigatórias):
- LinkedIn Sales Navigator (busca avançada).
- Apollo / Lusha (enrichment de e-mail / telefone).
- Reclame Aqui / Google Reviews (sinais de dor).

---

## Sequência de 4 toques

| Dia | Canal | Tipo | Objetivo |
|---|---|---|---|
| **D+0** | E-mail | Cold com personalização | Abrir conversa, criar curiosidade |
| **D+3** | LinkedIn DM | Connection request + nota | Aproximação no canal preferido do decisor |
| **D+7** | E-mail | Follow-up com case + soft CTA | Lembrar + agregar valor |
| **D+14** | LinkedIn DM ou voicemail | Break-up | Última tentativa — sem CTA agressivo |

### Princípios

- **Personalização > volume.** Cada toque com 1 elemento específico do prospect (post recente, anúncio ativo, mudança de cargo).
- **Valor antes de pitch.** Os 2 primeiros toques entregam algo (insight, dado, link); os 2 últimos podem pedir reunião.
- **Tom: pesquisador, não vendedor.** "Notei que vocês X — curioso pra entender Y" > "Tenho uma solução pra você".
- **Soft CTA:** propor 15min, não compromisso.
- **Break-up sem rancor:** "Imagino que não seja prioridade agora — fico à disposição. Boa sorte com [projeto que ele postou]."

---

## ICP de exclusão

Quando NÃO prospectar:
- Empresas em RJ judicial / falência.
- Decisores com < 3 meses no cargo (ainda absorvendo).
- Concorrentes diretos da Accelera 360 ou do aluno.
- Empresas que já contratam serviço similar (sinal: anúncios ativos do concorrente).

---

## KPIs de Outbound

Medir após 4 semanas:
- **Taxa de abertura de e-mail:** target ≥ 40% (cold típico).
- **Taxa de resposta:** target ≥ 5% (sequência inteira).
- **Reuniões agendadas:** target 1-2 reuniões a cada 100 contatos prospectados.
- **Conversão reunião → cliente:** depende do ICP — meta 20-40%.

Se as métricas estão abaixo do target após 100 prospects:
- Recalibrar ICP (talvez muito amplo).
- Reescrever copy do toque #1.
- Trocar o canal principal.

---

## Compliance

- **LGPD:** prospect tem direito de pedir descadastro (responder rápido).
- **CAN-SPAM-like:** incluir nome real, empresa, e link de descadastro nos e-mails.
- **Limites de plataforma:** LinkedIn limita ~25-30 connection requests/dia para contas grátis. Não exceder.
- **Tom respeitoso:** outbound mal feito queima reputação do remetente e da Accelera 360 (se aluno usa branding).

---

## O que esta versão lite NÃO entrega

- Listas de prospects geradas (aluno gera com Apollo / Sales Nav).
- A/B test de subject line.
- Sequence platform setup (Lemlist, Reply.io, Smartlead).
- Warm-up de domínio.
- Cadência de longo prazo (>4 toques) ou multi-canal completa.

Para tudo isso → Accelera 360 completa.
