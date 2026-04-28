# Routing — a360-framework-lite

> Como o coordenador decide qual skill chamar.

## Heurística de classificação

Para cada mensagem do usuário, identificar:

1. **Sujeito** — eu (vendedor) ou cliente (prospect)?
2. **Estágio** — descoberta (não sei o que fazer) / pesquisa (sei o nicho, quero aprofundar) / preparação (tenho reunião) / produção (preciso entregar artefato) / vendas (preciso fechar)?
3. **Artefato esperado** — texto / LP / deck / briefing / script?

## Tabela completa de routing

| Padrão de fala | Sujeito | Estágio | Artefato | Pipeline |
|---|---|---|---|---|
| "não sei que nicho escolher" | eu | descoberta | lista | `/nicho-explorer` modo A |
| "vale a pena nicho X?" | eu | pesquisa | veredicto | `/nicho-explorer` modo B |
| "estruturar empresa pra [nicho]" | eu | pesquisa | doc consolidado | `/nicho-explorer` (rápido) → `/mapear-nicho-lite` |
| "tenho call com cliente X" | cliente | preparação | briefing | `/cliente-radar` → `/meeting-prep` |
| "vou apresentar pra [cliente]" | cliente | preparação | briefing + deck | `/cliente-radar` → `/mapear-nicho-lite` (nicho do cliente) → `/pitch-deck-builder` → `/meeting-prep` |
| "criar LP pra [nicho]" | qualquer | produção | LP | `/lp-builder` (com `/mapear-nicho-lite` se não tiver mecanismo definido) |
| "criar pitch deck" | qualquer | produção | deck | `/pitch-deck-builder` (com `/mapear-nicho-lite` se não tiver mecanismo definido) |
| "como prospectar" | eu | vendas | playbook | `/gtm-architect` |
| "script de vendas" | eu | vendas | script | `/playbook-vendas` |
| "pacote completo pro meu negócio" | eu | full | tudo | `/nicho-explorer` → `/mapear-nicho-lite` → `/gtm-architect` → `/lp-builder` → `/playbook-vendas` |
| "pacote completo pro cliente" | cliente | full | tudo | `/cliente-radar` → `/mapear-nicho-lite` → `/lp-builder` → `/pitch-deck-builder` → `/meeting-prep` |

## Regras de desambiguação

- Se sujeito ambíguo: perguntar *"Você quer aplicar no seu próprio negócio (vendendo IA) ou pra um cliente seu (que vai contratar essa IA)?"*
- Se estágio ambíguo: perguntar *"Já mapeou o nicho ou está começando do zero?"*
- Se artefato ambíguo: perguntar *"Você precisa de [LP / deck / briefing / playbook]?"*

## Limites do roteamento

- **Máximo 4 skills encadeadas** por pipeline.
- Se o usuário pedir 5+, parar nas 3 primeiras e sugerir Accelera 360 para o resto.
- Se pedir algo fora do escopo (contratação, financeiro, jurídico), declinar e indicar Accelera 360.
