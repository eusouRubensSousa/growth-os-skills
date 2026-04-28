/**
 * Tool execution orchestration.
 *
 * Validates inputs, checks prerequisites, ensures target directories,
 * delegates to skill-specific handlers, and returns structured ToolResult.
 * Unexpected errors are logged to stderr and wrapped as EXECUTION_ERROR.
 */

import type { SkillDef, ToolResult } from './types.js';
import { isValidSlug } from './slug-utils.js';
import { validatePrerequisites } from './prerequisite-validator.js';
import {
  ensureDirectory,
  writeWorkspaceFile,
  readWorkspaceFile,
} from './workspace-manager.js';
import {
  prerequisiteMissing,
  invalidInput,
  executionError,
} from './error-codes.js';

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Execute a tool based on its SkillDef and user-provided arguments.
 *
 * 1. Validates slug parameters
 * 2. Runs prerequisite validation
 * 3. Ensures target directories exist
 * 4. Delegates to skill-specific handler
 * 5. Returns structured ToolResult
 */
export async function executeTool(
  skillDef: SkillDef,
  args: Record<string, unknown>,
  workspaceRoot: string,
): Promise<ToolResult> {
  try {
    // 1. Validate slug parameters
    validateSlugs(args);

    // 2. Prerequisite validation
    const prereqResult = await validatePrerequisites(
      skillDef,
      args,
      workspaceRoot,
    );

    // Collect warnings from missing recommended prerequisites
    const warnings: string[] = prereqResult.missingRecommended.map(
      (m) => `Recomendado ausente: ${m.path} — ${m.reason}`,
    );

    // 3. If blocking prerequisites fail, throw
    if (!prereqResult.satisfied) {
      throw prerequisiteMissing(prereqResult.missingBlocking);
    }

    // 4. Delegate to skill-specific handler
    const handler = SKILL_HANDLERS[skillDef.name];
    if (!handler) {
      throw invalidInput(
        `Skill desconhecida: "${skillDef.name}". Nenhum handler registrado.`,
      );
    }

    const result = await handler(args, workspaceRoot, warnings);
    return result;
  } catch (err: unknown) {
    // Re-throw structured errors (ErrorResponse objects)
    if (isErrorResponse(err)) {
      throw err;
    }

    // Wrap unexpected errors: log stack trace, throw safe message
    console.error(
      `[tool-executor] Erro inesperado na skill "${skillDef.name}":`,
      err instanceof Error ? err.stack : err,
    );
    throw executionError(skillDef.name);
  }
}

// ---------------------------------------------------------------------------
// Slug validation
// ---------------------------------------------------------------------------

/** Validate all slug-like parameters in args. */
function validateSlugs(args: Record<string, unknown>): void {
  const slugKeys = ['nichoSlug', 'clienteSlug', 'ofertaSlug'];
  for (const key of slugKeys) {
    const value = args[key];
    if (typeof value === 'string' && value.length > 0 && !isValidSlug(value)) {
      throw invalidInput(
        `Slug "${value}" (parâmetro ${key}) é inválido. Use apenas letras minúsculas, números e hífens (ex: "clinicas-derma-sp").`,
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Error response type guard
// ---------------------------------------------------------------------------

function isErrorResponse(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    'message' in err &&
    typeof (err as Record<string, unknown>)['code'] === 'string' &&
    typeof (err as Record<string, unknown>)['message'] === 'string'
  );
}

// ---------------------------------------------------------------------------
// Skill handler type
// ---------------------------------------------------------------------------

type SkillHandler = (
  args: Record<string, unknown>,
  workspaceRoot: string,
  warnings: string[],
) => Promise<ToolResult>;

// ---------------------------------------------------------------------------
// Handler registry
// ---------------------------------------------------------------------------

const SKILL_HANDLERS: Record<string, SkillHandler> = {
  'gos-nicho-explorer': handleNichoExplorer,
  'gos-mapear-nicho': handleMapearNicho,
  'gos-cliente-radar': handleClienteRadar,
  'gos-lp-builder': handleLpBuilder,
  'gos-gtm-architect': handleGtmArchitect,
  'gos-playbook-vendas': handlePlaybookVendas,
  'gos-meeting-prep': handleMeetingPrep,
  'gos-pitch-deck-builder': handlePitchDeckBuilder,
};

// ---------------------------------------------------------------------------
// Helper: today's date in ISO format
// ---------------------------------------------------------------------------

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// Helper: safe read (returns empty string if file doesn't exist)
// ---------------------------------------------------------------------------

async function safeRead(
  workspaceRoot: string,
  relativePath: string,
): Promise<string> {
  try {
    return await readWorkspaceFile(workspaceRoot, relativePath);
  } catch {
    return '';
  }
}

// ---------------------------------------------------------------------------
// Helper: append entry to a ledger file
// ---------------------------------------------------------------------------

async function appendToLedger(
  workspaceRoot: string,
  ledgerPath: string,
  entry: string,
): Promise<void> {
  const existing = await safeRead(workspaceRoot, ledgerPath);
  if (existing) {
    // Append the entry to the existing ledger
    await writeWorkspaceFile(
      workspaceRoot,
      ledgerPath,
      existing.trimEnd() + '\n' + entry + '\n',
    );
  } else {
    // Create new ledger with header
    await writeWorkspaceFile(workspaceRoot, ledgerPath, entry + '\n');
  }
}

// ---------------------------------------------------------------------------
// Helper: update or create _index.md with status
// ---------------------------------------------------------------------------

async function updateIndexStatus(
  workspaceRoot: string,
  indexPath: string,
  status: string,
  extraFields?: Record<string, string>,
): Promise<void> {
  const existing = await safeRead(workspaceRoot, indexPath);

  if (existing && existing.includes('---')) {
    // Update existing frontmatter status
    const updated = existing.replace(
      /status:\s*\S+/,
      `status: ${status}`,
    );
    if (updated !== existing) {
      await writeWorkspaceFile(workspaceRoot, indexPath, updated);
    } else {
      // status field not found — inject it after first ---
      const lines = existing.split('\n');
      const firstDelim = lines.findIndex((l) => l.trim() === '---');
      if (firstDelim !== -1) {
        const extra = extraFields
          ? Object.entries(extraFields)
              .map(([k, v]) => `${k}: ${v}`)
              .join('\n')
          : '';
        lines.splice(
          firstDelim + 1,
          0,
          `status: ${status}`,
          ...(extra ? [extra] : []),
        );
        await writeWorkspaceFile(workspaceRoot, indexPath, lines.join('\n'));
      }
    }
  } else {
    // Create new _index.md with frontmatter
    const extra = extraFields
      ? '\n' +
        Object.entries(extraFields)
          .map(([k, v]) => `${k}: ${v}`)
          .join('\n')
      : '';
    const content = `---\nstatus: ${status}\nupdated: ${today()}${extra}\n---\n`;
    await writeWorkspaceFile(workspaceRoot, indexPath, content);
  }
}

// ---------------------------------------------------------------------------
// 1. nicho_explorer
// ---------------------------------------------------------------------------

async function handleNichoExplorer(
  args: Record<string, unknown>,
  workspaceRoot: string,
  warnings: string[],
): Promise<ToolResult> {
  const mode = args['mode'] as string;
  const filesWritten: string[] = [];
  const filesUpdated: string[] = [];
  const metadata: Record<string, unknown> = {};

  if (mode === 'A') {
    // Mode A: Generate nichos-top10.md
    const userProfile =
      typeof args['userProfile'] === 'string' ? args['userProfile'] : '';

    const content = `---
title: Top 10 Nichos para IA
generated: ${today()}
profile: "${userProfile}"
---

# 🎯 Top 10 Nichos para Montar Empresa de IA

> Gerado pela skill **gos-nicho-explorer** (Modo A) — Accelera 360

## Critérios de Avaliação

| Critério | Peso | Descrição |
|---|---|---|
| Tamanho de Mercado | 1-10 | TAM estimado em R$ |
| Crescimento | 1-10 | CAGR e tendências |
| Intensidade da Dor | 1-10 | Queixas recorrentes, frustração |
| Aplicabilidade de IA | 1-10 | Processos automatizáveis, ROI |

## Ranking

| # | Nicho | Mercado | Crescimento | Dor | IA | Total | Veredicto |
|---|---|---|---|---|---|---|---|
| 1 | <!-- PREENCHER --> | /10 | /10 | /10 | /10 | /40 | <!-- GO/MAYBE --> |
| 2 | <!-- PREENCHER --> | /10 | /10 | /10 | /10 | /40 | |
| 3 | <!-- PREENCHER --> | /10 | /10 | /10 | /10 | /40 | |
| 4 | <!-- PREENCHER --> | /10 | /10 | /10 | /10 | /40 | |
| 5 | <!-- PREENCHER --> | /10 | /10 | /10 | /10 | /40 | |
| 6 | <!-- PREENCHER --> | /10 | /10 | /10 | /10 | /40 | |
| 7 | <!-- PREENCHER --> | /10 | /10 | /10 | /10 | /40 | |
| 8 | <!-- PREENCHER --> | /10 | /10 | /10 | /10 | /40 | |
| 9 | <!-- PREENCHER --> | /10 | /10 | /10 | /10 | /40 | |
| 10 | <!-- PREENCHER --> | /10 | /10 | /10 | /10 | /40 | |

## Top 3 Recomendados para Seu Perfil

### 1. <!-- NICHO -->
- **Por quê:** <!-- JUSTIFICATIVA -->
- **Próximo passo:** Rodar \`nicho_explorer\` modo B com slug do nicho

### 2. <!-- NICHO -->
- **Por quê:** <!-- JUSTIFICATIVA -->

### 3. <!-- NICHO -->
- **Por quê:** <!-- JUSTIFICATIVA -->

---
*Accelera 360 — Business Accelerator*
`;

    await writeWorkspaceFile(workspaceRoot, 'nichos-top10.md', content);
    filesWritten.push('nichos-top10.md');
    metadata['mode'] = 'A';
    metadata['nicheCount'] = 10;
  } else {
    // Mode B: Validate specific niche
    const nichoSlug = args['nichoSlug'] as string;

    // Ensure nichos/{slug}/ directory exists
    await ensureDirectory(workspaceRoot, 'nichos', nichoSlug);

    const validacaoContent = `---
title: "Validação GO/NO-GO — ${nichoSlug}"
nicho: ${nichoSlug}
generated: ${today()}
verdict: "<!-- GO / NO-GO / MAYBE -->"
---

# 🔍 Validação GO/NO-GO: ${nichoSlug}

> Gerado pela skill **gos-nicho-explorer** (Modo B) — Accelera 360

## Veredicto

| Dimensão | Valor | Fonte |
|---|---|---|
| **Veredicto** | <!-- GO / NO-GO / MAYBE --> | |
| **Confiança** | <!-- Alta / Média / Baixa --> | |

## TAM / SAM / SOM

| Métrica | Valor (R$) | Fonte |
|---|---|---|
| TAM | <!-- PREENCHER --> | |
| SAM | <!-- PREENCHER --> | |
| SOM | <!-- PREENCHER --> | |
| CAGR | <!-- PREENCHER --> | |

## Top 3 Dores do Nicho

1. **<!-- DOR 1 -->** — <!-- evidência -->
2. **<!-- DOR 2 -->** — <!-- evidência -->
3. **<!-- DOR 3 -->** — <!-- evidência -->

## Gap Competitivo

<!-- Análise de concorrentes e oportunidade -->

## ICP Acessível

<!-- Perfil do cliente ideal e canais de acesso -->

## Evidências de Suporte

<!-- Links, dados, pesquisas -->

## Recomendação

<!-- Próximos passos baseados no veredicto -->

---
*Accelera 360 — Business Accelerator*
`;

    const validacaoPath = `nichos/${nichoSlug}/00-validacao.md`;
    await writeWorkspaceFile(workspaceRoot, validacaoPath, validacaoContent);
    filesWritten.push(validacaoPath);

    // Update _index.md with status: researching
    const indexPath = `nichos/${nichoSlug}/_index.md`;
    await updateIndexStatus(workspaceRoot, indexPath, 'researching');
    filesUpdated.push(indexPath);

    // Add entry to nichos-mapeados ledger
    const ledgerEntry = `| ${nichoSlug} | <!-- setor --> | researching | ${today()} | <!-- mecanismo --> | Rodar \`mapear_nicho\` |`;
    await appendToLedger(
      workspaceRoot,
      'memory/shared/nichos-mapeados.md',
      ledgerEntry,
    );
    filesUpdated.push('memory/shared/nichos-mapeados.md');

    metadata['mode'] = 'B';
    metadata['nichoSlug'] = nichoSlug;
    metadata['verdict'] = 'PENDING';
  }

  return { filesWritten, filesUpdated, warnings, metadata };
}


// ---------------------------------------------------------------------------
// 2. mapear_nicho
// ---------------------------------------------------------------------------

async function handleMapearNicho(
  args: Record<string, unknown>,
  workspaceRoot: string,
  warnings: string[],
): Promise<ToolResult> {
  const nichoSlug = args['nichoSlug'] as string;
  const nichoDescription =
    typeof args['nichoDescription'] === 'string'
      ? args['nichoDescription']
      : nichoSlug;

  const filesWritten: string[] = [];
  const filesUpdated: string[] = [];

  // Ensure nichos/{slug}/ directory exists
  await ensureDirectory(workspaceRoot, 'nichos', nichoSlug);

  // Read existing validation if available
  const validacao = await safeRead(
    workspaceRoot,
    `nichos/${nichoSlug}/00-validacao.md`,
  );
  const contextNote = validacao
    ? '> Contexto de validação (00-validacao.md) disponível.'
    : '> Nenhuma validação prévia encontrada.';

  // Write 9 Johnny.Decimal files (01-09)
  const files: Array<{ name: string; title: string; content: string }> = [
    {
      name: '01-perfil-cliente-alvo.md',
      title: 'Perfil do Cliente-Alvo (ICP)',
      content: `## ICP — ${nichoDescription}

${contextNote}

### Dados Demográficos
- **Segmento:** <!-- B2B / B2C / B2B2C -->
- **Porte:** <!-- micro / pequena / média / grande -->
- **Faturamento típico:** <!-- R$ -->
- **Localização:** <!-- região / nacional -->
- **Decisor:** <!-- cargo / perfil -->

### Dados Psicográficos
- **Motivação principal:** <!-- PREENCHER -->
- **Medo principal:** <!-- PREENCHER -->
- **Nível de maturidade digital:** <!-- baixo / médio / alto -->

### Canais de Acesso
1. <!-- Canal 1 -->
2. <!-- Canal 2 -->
3. <!-- Canal 3 -->`,
    },
    {
      name: '02-dores.md',
      title: 'Dores do Nicho',
      content: `## Dores — ${nichoDescription}

### Top 5 Dores (ordenadas por intensidade)

| # | Dor | Intensidade (1-10) | Frequência | Evidência |
|---|---|---|---|---|
| 1 | <!-- PREENCHER --> | /10 | | |
| 2 | <!-- PREENCHER --> | /10 | | |
| 3 | <!-- PREENCHER --> | /10 | | |
| 4 | <!-- PREENCHER --> | /10 | | |
| 5 | <!-- PREENCHER --> | /10 | | |

### Dor #1 em Profundidade
- **Sintoma visível:** <!-- PREENCHER -->
- **Causa raiz:** <!-- PREENCHER -->
- **Custo da inação:** <!-- R$/mês estimado -->
- **Solução atual (workaround):** <!-- PREENCHER -->`,
    },
    {
      name: '03-mecanismo.md',
      title: 'Mecanismo Proprietário',
      content: `## Mecanismo Proprietário — ${nichoDescription}

### 3 Candidatos

#### Candidato 1: <!-- NOME DO MECANISMO -->
- **Descrição (1 frase):** <!-- PREENCHER -->
- **Diferencial vs. genérico:** <!-- PREENCHER -->
- **Viabilidade técnica:** <!-- alta / média / baixa -->

#### Candidato 2: <!-- NOME -->
- **Descrição:** <!-- PREENCHER -->
- **Diferencial:** <!-- PREENCHER -->
- **Viabilidade:** <!-- alta / média / baixa -->

#### Candidato 3: <!-- NOME -->
- **Descrição:** <!-- PREENCHER -->
- **Diferencial:** <!-- PREENCHER -->
- **Viabilidade:** <!-- alta / média / baixa -->

### Mecanismo Escolhido
- **Nome:** <!-- PREENCHER -->
- **Justificativa:** <!-- PREENCHER -->`,
    },
    {
      name: '04-oferta-base.md',
      title: 'Oferta Base',
      content: `## Oferta Base — ${nichoDescription}

### Estrutura da Oferta

| Campo | Valor |
|---|---|
| **Nome da oferta** | <!-- PREENCHER --> |
| **Promessa principal** | <!-- PREENCHER --> |
| **Prazo de entrega** | <!-- PREENCHER --> |
| **Preço sugerido** | R$ <!-- PREENCHER --> |
| **Garantia** | <!-- PREENCHER --> |
| **Modelo** | <!-- recorrente / projeto / híbrido --> |

### Entregáveis
1. <!-- Entregável 1 -->
2. <!-- Entregável 2 -->
3. <!-- Entregável 3 -->

### Stack Técnica Sugerida
- <!-- Ferramenta/plataforma 1 -->
- <!-- Ferramenta/plataforma 2 -->`,
    },
    {
      name: '05-linguagem.md',
      title: 'Linguagem do Nicho',
      content: `## Linguagem do Nicho — ${nichoDescription}

### Termos Técnicos do Setor
| Termo | Significado | Uso em Copy |
|---|---|---|
| <!-- TERMO --> | <!-- SIGNIFICADO --> | <!-- COMO USAR --> |

### Frases que o ICP Usa
1. "<!-- FRASE 1 -->"
2. "<!-- FRASE 2 -->"
3. "<!-- FRASE 3 -->"

### Palavras Proibidas (geram rejeição)
- <!-- PALAVRA 1 -->
- <!-- PALAVRA 2 -->

### Tom de Voz Recomendado
<!-- Descrever tom: formal/informal, técnico/acessível, etc. -->`,
    },
    {
      name: '06-eventos-gatilho.md',
      title: 'Eventos Gatilho',
      content: `## Eventos Gatilho — ${nichoDescription}

### Eventos que Abrem Janela de Compra

| # | Evento | Canal de Detecção | Timing | Abordagem |
|---|---|---|---|---|
| 1 | <!-- EVENTO --> | <!-- onde detectar --> | <!-- quando --> | <!-- como abordar --> |
| 2 | <!-- EVENTO --> | | | |
| 3 | <!-- EVENTO --> | | | |
| 4 | <!-- EVENTO --> | | | |
| 5 | <!-- EVENTO --> | | | |

### Sazonalidade
<!-- Meses fortes / fracos para o nicho -->`,
    },
    {
      name: '07-objecoes.md',
      title: 'Objeções Comuns',
      content: `## Objeções Comuns — ${nichoDescription}

### Top 5 Objeções + Quebra

| # | Objeção | Tipo | Quebra (1 frase) |
|---|---|---|---|
| 1 | "<!-- OBJEÇÃO -->" | <!-- preço/tempo/confiança/técnica --> | <!-- QUEBRA --> |
| 2 | "<!-- OBJEÇÃO -->" | | <!-- QUEBRA --> |
| 3 | "<!-- OBJEÇÃO -->" | | <!-- QUEBRA --> |
| 4 | "<!-- OBJEÇÃO -->" | | <!-- QUEBRA --> |
| 5 | "<!-- OBJEÇÃO -->" | | <!-- QUEBRA --> |

### Objeção #1 — Roteiro Completo
- **Objeção:** "<!-- PREENCHER -->"
- **Empatia:** "<!-- PREENCHER -->"
- **Reframe:** "<!-- PREENCHER -->"
- **Prova:** "<!-- PREENCHER -->"
- **Fechamento:** "<!-- PREENCHER -->"`,
    },
    {
      name: '08-fontes.md',
      title: 'Fontes e Referências',
      content: `## Fontes e Referências — ${nichoDescription}

### Fontes Primárias
| # | Fonte | URL | Tipo | Data |
|---|---|---|---|---|
| 1 | <!-- FONTE --> | <!-- URL --> | <!-- relatório/artigo/dado --> | |
| 2 | <!-- FONTE --> | | | |
| 3 | <!-- FONTE --> | | | |

### Concorrentes Mapeados
| # | Empresa | URL | Diferencial | Fraqueza |
|---|---|---|---|---|
| 1 | <!-- EMPRESA --> | | | |
| 2 | <!-- EMPRESA --> | | | |
| 3 | <!-- EMPRESA --> | | | |

### Top Players (referência)
| # | Empresa | País | O que fazem bem |
|---|---|---|---|
| 1 | <!-- EMPRESA --> | | |
| 2 | <!-- EMPRESA --> | | |`,
    },
    {
      name: '09-gtm-outline.md',
      title: 'GTM Outline',
      content: `## GTM Outline — ${nichoDescription}

### Canais Prioritários
1. **<!-- Canal 1 -->** — <!-- justificativa -->
2. **<!-- Canal 2 -->** — <!-- justificativa -->
3. **<!-- Canal 3 -->** — <!-- justificativa -->

### Funil Simplificado
| Estágio | Ação | Métrica | Meta Mês 1 |
|---|---|---|---|
| Topo | <!-- PREENCHER --> | | |
| Meio | <!-- PREENCHER --> | | |
| Fundo | <!-- PREENCHER --> | | |

### Primeiros 30 Dias
- **Semana 1:** <!-- PREENCHER -->
- **Semana 2:** <!-- PREENCHER -->
- **Semana 3:** <!-- PREENCHER -->
- **Semana 4:** <!-- PREENCHER -->

### Próximo Passo
Rodar \`gtm_architect\` para estratégia completa (outbound + content).`,
    },
  ];

  for (const file of files) {
    const filePath = `nichos/${nichoSlug}/${file.name}`;
    const content = `---\ntitle: "${file.title}"\nnicho: ${nichoSlug}\ngenerated: ${today()}\n---\n\n# ${file.title}\n\n${file.content}\n\n---\n*Accelera 360 — Business Accelerator*\n`;
    await writeWorkspaceFile(workspaceRoot, filePath, content);
    filesWritten.push(filePath);
  }

  // Update _index.md to status: mapped
  const indexPath = `nichos/${nichoSlug}/_index.md`;
  await updateIndexStatus(workspaceRoot, indexPath, 'mapped', {
    nicho: nichoSlug,
    mapped_date: today(),
  });
  filesUpdated.push(indexPath);

  // Update ledger
  const ledgerEntry = `| ${nichoSlug} | <!-- setor --> | mapped | ${today()} | <!-- mecanismo --> | Rodar \`lp_builder\` ou \`gtm_architect\` |`;
  await appendToLedger(
    workspaceRoot,
    'memory/shared/nichos-mapeados.md',
    ledgerEntry,
  );
  filesUpdated.push('memory/shared/nichos-mapeados.md');

  return {
    filesWritten,
    filesUpdated,
    warnings,
    metadata: { nichoSlug, filesCount: files.length },
  };
}


// ---------------------------------------------------------------------------
// 3. cliente_radar
// ---------------------------------------------------------------------------

async function handleClienteRadar(
  args: Record<string, unknown>,
  workspaceRoot: string,
  warnings: string[],
): Promise<ToolResult> {
  const clienteSlug = args['clienteSlug'] as string;
  const companyName = args['companyName'] as string;
  const sector =
    typeof args['sector'] === 'string' ? args['sector'] : '<!-- setor -->';
  const websiteUrl =
    typeof args['websiteUrl'] === 'string' ? args['websiteUrl'] : '';
  const decisionMakerName =
    typeof args['decisionMakerName'] === 'string'
      ? args['decisionMakerName']
      : '';

  const filesWritten: string[] = [];
  const filesUpdated: string[] = [];

  // Ensure clientes/{slug}/ directory exists
  await ensureDirectory(workspaceRoot, 'clientes', clienteSlug);

  const perfilContent = `---
title: "Perfil — ${companyName}"
cliente: ${clienteSlug}
company: "${companyName}"
sector: "${sector}"
website: "${websiteUrl}"
decision_maker: "${decisionMakerName}"
generated: ${today()}
---

# 🔍 Perfil do Prospect: ${companyName}

> Gerado pela skill **gos-cliente-radar** — Accelera 360

## Dados da Empresa

| Campo | Valor |
|---|---|
| **Nome** | ${companyName} |
| **Setor** | ${sector} |
| **Website** | ${websiteUrl || '<!-- PREENCHER -->'} |
| **Porte** | <!-- micro / pequena / média / grande --> |
| **Faturamento estimado** | R$ <!-- PREENCHER --> |
| **Nº funcionários** | <!-- PREENCHER --> |
| **Localização** | <!-- PREENCHER --> |

## Decisor

| Campo | Valor |
|---|---|
| **Nome** | ${decisionMakerName || '<!-- PREENCHER -->'} |
| **Cargo** | <!-- PREENCHER --> |
| **LinkedIn** | <!-- URL --> |
| **Estilo de decisão** | <!-- analítico / relacional / pragmático --> |

## Análise da Empresa

### Pontos Fortes
1. <!-- PREENCHER -->
2. <!-- PREENCHER -->
3. <!-- PREENCHER -->

### Gaps / Oportunidades
1. <!-- PREENCHER -->
2. <!-- PREENCHER -->
3. <!-- PREENCHER -->

## Concorrentes Diretos (3)

| # | Empresa | Diferencial | Fraqueza |
|---|---|---|---|
| 1 | <!-- PREENCHER --> | | |
| 2 | <!-- PREENCHER --> | | |
| 3 | <!-- PREENCHER --> | | |

## Top Players Nacionais/Globais (3)

| # | Empresa | País | O que fazem bem |
|---|---|---|---|
| 1 | <!-- PREENCHER --> | | |
| 2 | <!-- PREENCHER --> | | |
| 3 | <!-- PREENCHER --> | | |

## Ganchos de Abertura
1. <!-- GANCHO 1 -->
2. <!-- GANCHO 2 -->
3. <!-- GANCHO 3 -->

## Perguntas SPIN

### Situação
1. <!-- PERGUNTA -->
2. <!-- PERGUNTA -->

### Problema
1. <!-- PERGUNTA -->
2. <!-- PERGUNTA -->

### Implicação
1. <!-- PERGUNTA -->
2. <!-- PERGUNTA -->

### Necessidade de Solução
1. <!-- PERGUNTA -->
2. <!-- PERGUNTA -->

---
*Accelera 360 — Business Accelerator*
`;

  const perfilPath = `clientes/${clienteSlug}/00-perfil.md`;
  await writeWorkspaceFile(workspaceRoot, perfilPath, perfilContent);
  filesWritten.push(perfilPath);

  // Update _index.md to status: radar-done
  const indexPath = `clientes/${clienteSlug}/_index.md`;
  await updateIndexStatus(workspaceRoot, indexPath, 'radar-done', {
    cliente: clienteSlug,
    company: companyName,
  });
  filesUpdated.push(indexPath);

  // Update clientes-ativos ledger
  const ledgerEntry = `| ${clienteSlug} | ${companyName} | radar-done | ${today()} | Rodar \`meeting_prep\` ou \`pitch_deck_builder\` |`;
  await appendToLedger(
    workspaceRoot,
    'memory/shared/clientes-ativos.md',
    ledgerEntry,
  );
  filesUpdated.push('memory/shared/clientes-ativos.md');

  return {
    filesWritten,
    filesUpdated,
    warnings,
    metadata: { clienteSlug, companyName },
  };
}


// ---------------------------------------------------------------------------
// 4. lp_builder
// ---------------------------------------------------------------------------

async function handleLpBuilder(
  args: Record<string, unknown>,
  workspaceRoot: string,
  warnings: string[],
): Promise<ToolResult> {
  const mode = args['mode'] as string; // 'oferta' | 'cliente'
  const angle =
    typeof args['angle'] === 'string' ? args['angle'] : 'DOR';
  const referenceUrl =
    typeof args['referenceUrl'] === 'string' ? args['referenceUrl'] : '';
  const aestheticSystem =
    typeof args['aestheticSystem'] === 'string'
      ? args['aestheticSystem']
      : 'editorial-serif';

  const scope = mode === 'oferta' ? 'ofertas' : 'clientes';
  const slug =
    mode === 'oferta'
      ? (args['ofertaSlug'] as string)
      : (args['clienteSlug'] as string);

  const filesWritten: string[] = [];
  const filesUpdated: string[] = [];

  // Ensure scope/{slug}/lp/ directory exists
  await ensureDirectory(workspaceRoot, scope, slug);

  // Read niche data if available for context
  const nichoSlug =
    typeof args['nichoSlug'] === 'string' ? args['nichoSlug'] : '';
  const nichoContext = nichoSlug
    ? await safeRead(workspaceRoot, `nichos/${nichoSlug}/03-mecanismo.md`)
    : '';
  const contextNote = nichoContext
    ? '> Contexto de mecanismo disponível do nicho mapeado.'
    : '> Nenhum contexto de nicho encontrado — LP será genérica.';

  // 1. lp.md — Copy in markdown
  const lpMdContent = `---
title: "Landing Page — ${slug}"
scope: ${scope}
slug: ${slug}
angle: ${angle}
aesthetic: ${aestheticSystem}
reference: "${referenceUrl}"
generated: ${today()}
---

# Landing Page Copy — ${slug}

> Gerado pela skill **gos-lp-builder** — Accelera 360
${contextNote}

## Configuração

| Campo | Valor |
|---|---|
| **Ângulo** | ${angle} |
| **Sistema Estético** | ${aestheticSystem} |
| **Referência** | ${referenceUrl || 'nenhuma'} |

## Bloco 1 — Hero (5 segundos)
- **Headline:** <!-- PREENCHER — promessa principal -->
- **Subheadline:** <!-- PREENCHER — qualificação -->
- **CTA primário:** <!-- PREENCHER -->
- **Prova social rápida:** <!-- PREENCHER -->

## Bloco 2 — Problema (PAS)
<!-- Agitar a dor principal do ICP -->

## Bloco 3 — Mecanismo
<!-- Apresentar o mecanismo proprietário como solução -->

## Bloco 4 — Benefícios (FAB)
| Feature | Advantage | Benefit |
|---|---|---|
| <!-- F1 --> | <!-- A1 --> | <!-- B1 --> |
| <!-- F2 --> | <!-- A2 --> | <!-- B2 --> |
| <!-- F3 --> | <!-- A3 --> | <!-- B3 --> |

## Bloco 5 — Prova Social
<!-- Depoimentos, logos, números -->

## Bloco 6 — Como Funciona
1. <!-- Passo 1 -->
2. <!-- Passo 2 -->
3. <!-- Passo 3 -->

## Bloco 7 — Oferta + Preço
<!-- Estrutura da oferta, preço, garantia -->

## Bloco 8 — FAQ
<!-- 5 perguntas frequentes -->

## Bloco 9 — CTA Final
<!-- Repetir CTA com urgência -->

---
*Accelera 360 — Business Accelerator*
`;

  // 2. lp.html — Standalone HTML
  const lpHtmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LP — ${slug}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    /* Sistema estético: ${aestheticSystem} */
    /* Gerado pela skill gos-lp-builder — Accelera 360 */
    /* Ângulo: ${angle} */
  </style>
</head>
<body class="bg-white text-gray-900">

  <!-- HERO -->
  <section class="min-h-screen flex items-center justify-center px-6 py-20">
    <div class="max-w-3xl text-center">
      <h1 class="text-4xl md:text-6xl font-bold mb-6">
        <!-- HEADLINE: promessa principal -->
      </h1>
      <p class="text-xl text-gray-600 mb-8">
        <!-- SUBHEADLINE: qualificação -->
      </p>
      <a href="#cta" class="inline-block bg-black text-white px-8 py-4 text-lg font-semibold rounded">
        <!-- CTA PRIMÁRIO -->
      </a>
    </div>
  </section>

  <!-- PROBLEMA -->
  <section class="px-6 py-20 bg-gray-50">
    <div class="max-w-3xl mx-auto">
      <h2 class="text-3xl font-bold mb-6"><!-- PROBLEMA --></h2>
      <!-- Agitar a dor (PAS framework) -->
    </div>
  </section>

  <!-- MECANISMO -->
  <section class="px-6 py-20">
    <div class="max-w-3xl mx-auto">
      <h2 class="text-3xl font-bold mb-6"><!-- MECANISMO --></h2>
      <!-- Apresentar solução proprietária -->
    </div>
  </section>

  <!-- BENEFÍCIOS -->
  <section class="px-6 py-20 bg-gray-50">
    <div class="max-w-3xl mx-auto">
      <h2 class="text-3xl font-bold mb-6"><!-- BENEFÍCIOS --></h2>
      <!-- FAB: Feature → Advantage → Benefit -->
    </div>
  </section>

  <!-- PROVA SOCIAL -->
  <section class="px-6 py-20">
    <div class="max-w-3xl mx-auto">
      <h2 class="text-3xl font-bold mb-6"><!-- PROVA SOCIAL --></h2>
      <!-- Depoimentos, logos, números -->
    </div>
  </section>

  <!-- COMO FUNCIONA -->
  <section class="px-6 py-20 bg-gray-50">
    <div class="max-w-3xl mx-auto">
      <h2 class="text-3xl font-bold mb-6">Como Funciona</h2>
      <!-- 3 passos -->
    </div>
  </section>

  <!-- OFERTA -->
  <section class="px-6 py-20">
    <div class="max-w-3xl mx-auto text-center">
      <h2 class="text-3xl font-bold mb-6"><!-- OFERTA --></h2>
      <!-- Preço, garantia, entregáveis -->
    </div>
  </section>

  <!-- FAQ -->
  <section class="px-6 py-20 bg-gray-50">
    <div class="max-w-3xl mx-auto">
      <h2 class="text-3xl font-bold mb-6">Perguntas Frequentes</h2>
      <!-- 5 FAQs -->
    </div>
  </section>

  <!-- CTA FINAL -->
  <section id="cta" class="px-6 py-20 text-center">
    <div class="max-w-3xl mx-auto">
      <h2 class="text-3xl font-bold mb-6"><!-- CTA FINAL --></h2>
      <a href="#" class="inline-block bg-black text-white px-8 py-4 text-lg font-semibold rounded">
        <!-- BOTÃO CTA -->
      </a>
    </div>
  </section>

</body>
</html>
`;

  // 3. README-customizar.md
  const readmeContent = `---
title: "Como Customizar a LP"
scope: ${scope}
slug: ${slug}
generated: ${today()}
---

# Como Customizar esta LP

> Guia de personalização — Accelera 360

## Arquivos

| Arquivo | Propósito |
|---|---|
| \`lp.md\` | Copy em markdown (edite o texto aqui) |
| \`lp.html\` | HTML standalone (Tailwind CDN, mobile-first) |
| \`README-customizar.md\` | Este guia |

## Passos para Customizar

### 1. Editar o Copy (\`lp.md\`)
- Preencha todos os campos marcados com \`<!-- PREENCHER -->\`
- Mantenha o ângulo ${angle} consistente em todos os blocos

### 2. Atualizar o HTML (\`lp.html\`)
- Substitua os placeholders HTML pelos textos finais
- Ajuste cores no bloco \`<style>\` conforme identidade visual
- Teste em mobile (responsivo por padrão)

### 3. Self-Check CRO (25 itens)
- [ ] Hero carrega em < 5 segundos
- [ ] Headline comunica promessa principal
- [ ] CTA visível above the fold
- [ ] Prova social presente
- [ ] FAQ cobre objeções principais
<!-- ... completar 25 itens -->

### 4. Self-Check Anti-AI (10 itens)
- [ ] Sem frases genéricas de IA
- [ ] Linguagem do nicho presente
- [ ] Dados específicos (não inventados)
- [ ] Tom de voz consistente
<!-- ... completar 10 itens -->

## Deploy
- Abrir \`lp.html\` no browser para preview
- Hospedar em qualquer servidor estático
- Ou conectar ao domínio do cliente

---
*Accelera 360 — Business Accelerator*
`;

  const basePath = `${scope}/${slug}/lp`;
  const lpMdPath = `${basePath}/lp.md`;
  const lpHtmlPath = `${basePath}/lp.html`;
  const readmePath = `${basePath}/README-customizar.md`;

  await writeWorkspaceFile(workspaceRoot, lpMdPath, lpMdContent);
  await writeWorkspaceFile(workspaceRoot, lpHtmlPath, lpHtmlContent);
  await writeWorkspaceFile(workspaceRoot, readmePath, readmeContent);

  filesWritten.push(lpMdPath, lpHtmlPath, readmePath);

  return {
    filesWritten,
    filesUpdated,
    warnings,
    metadata: {
      scope,
      slug,
      angle,
      aestheticSystem,
      croScore: 'PENDING',
      antiAiScore: 'PENDING',
    },
  };
}


// ---------------------------------------------------------------------------
// 5. gtm_architect
// ---------------------------------------------------------------------------

async function handleGtmArchitect(
  args: Record<string, unknown>,
  workspaceRoot: string,
  warnings: string[],
): Promise<ToolResult> {
  const mode = args['mode'] as string; // 'outbound' | 'content' | 'combo'
  const nichoSlug = args['nichoSlug'] as string;

  // Determine scope and slug
  const ofertaSlug =
    typeof args['ofertaSlug'] === 'string' ? args['ofertaSlug'] : '';
  const clienteSlug =
    typeof args['clienteSlug'] === 'string' ? args['clienteSlug'] : '';

  const scope = clienteSlug ? 'clientes' : 'ofertas';
  const slug = clienteSlug || ofertaSlug || nichoSlug;

  const filesWritten: string[] = [];
  const filesUpdated: string[] = [];

  // Ensure scope/{slug}/gtm/ directory exists
  await ensureDirectory(workspaceRoot, scope, slug);

  // Read niche data for context
  const nichoData = await safeRead(
    workspaceRoot,
    `nichos/${nichoSlug}/01-perfil-cliente-alvo.md`,
  );
  const contextNote = nichoData
    ? '> Contexto de ICP disponível do nicho mapeado.'
    : '> Nenhum contexto de ICP encontrado.';

  const basePath = `${scope}/${slug}/gtm`;

  if (mode === 'outbound' || mode === 'combo') {
    const outboundContent = `---
title: "GTM Outbound — ${slug}"
nicho: ${nichoSlug}
scope: ${scope}
mode: ${mode}
generated: ${today()}
---

# 📤 Estratégia GTM — Outbound

> Gerado pela skill **gos-gtm-architect** — Accelera 360
${contextNote}

## ICP de Targeting

| Campo | Valor |
|---|---|
| **Cargo decisor** | <!-- PREENCHER --> |
| **Porte empresa** | <!-- PREENCHER --> |
| **Setor** | <!-- PREENCHER --> |
| **Localização** | <!-- PREENCHER --> |
| **Sinal de compra** | <!-- PREENCHER --> |

## Sequência de 4 Toques

### D+0 — Primeiro Contato
- **Canal:** <!-- email / LinkedIn / telefone -->
- **Assunto:** <!-- PREENCHER -->
- **Corpo:** <!-- PREENCHER -->

### D+3 — Follow-up
- **Canal:** <!-- PREENCHER -->
- **Corpo:** <!-- PREENCHER -->

### D+7 — Valor Adicional
- **Canal:** <!-- PREENCHER -->
- **Corpo:** <!-- PREENCHER -->

### D+14 — Último Toque
- **Canal:** <!-- PREENCHER -->
- **Corpo:** <!-- PREENCHER -->

## Templates

### 3 Templates de Email
1. **Email Dor:** <!-- PREENCHER -->
2. **Email Case:** <!-- PREENCHER -->
3. **Email Direto:** <!-- PREENCHER -->

### 2 LinkedIn DMs
1. **DM Conexão:** <!-- PREENCHER -->
2. **DM Valor:** <!-- PREENCHER -->

---
*Accelera 360 — Business Accelerator*
`;

    const outboundPath = `${basePath}/outbound.md`;
    await writeWorkspaceFile(workspaceRoot, outboundPath, outboundContent);
    filesWritten.push(outboundPath);
  }

  if (mode === 'content' || mode === 'combo') {
    const contentMdContent = `---
title: "GTM Content — ${slug}"
nicho: ${nichoSlug}
scope: ${scope}
mode: ${mode}
generated: ${today()}
---

# 📝 Estratégia GTM — Content Marketing

> Gerado pela skill **gos-gtm-architect** — Accelera 360
${contextNote}

## Calendário Mês 1

### Semana 1
| Dia | Canal | Tipo | Tema |
|---|---|---|---|
| Seg | LinkedIn | Post | <!-- PREENCHER --> |
| Qua | Email | Newsletter | <!-- PREENCHER --> |

### Semana 2
| Dia | Canal | Tipo | Tema |
|---|---|---|---|
| Seg | LinkedIn | Post | <!-- PREENCHER --> |
| Qui | Substack | Artigo | <!-- PREENCHER --> |

### Semana 3
| Dia | Canal | Tipo | Tema |
|---|---|---|---|
| Seg | LinkedIn | Post | <!-- PREENCHER --> |
| Qua | Email | Newsletter | <!-- PREENCHER --> |

### Semana 4
| Dia | Canal | Tipo | Tema |
|---|---|---|---|
| Seg | LinkedIn | Post | <!-- PREENCHER --> |
| Sex | Email | Newsletter | <!-- PREENCHER --> |

## 3 Posts LinkedIn

### Post 1: <!-- TEMA -->
<!-- PREENCHER — framework LinkedInPro -->

### Post 2: <!-- TEMA -->
<!-- PREENCHER -->

### Post 3: <!-- TEMA -->
<!-- PREENCHER -->

## 2 Emails
### Email 1: <!-- TEMA -->
<!-- PREENCHER -->

### Email 2: <!-- TEMA -->
<!-- PREENCHER -->

## 1 Artigo Substack (Long-form)
### Título: <!-- PREENCHER -->
<!-- PREENCHER — outline do artigo -->

---
*Accelera 360 — Business Accelerator*
`;

    const contentPath = `${basePath}/content.md`;
    await writeWorkspaceFile(workspaceRoot, contentPath, contentMdContent);
    filesWritten.push(contentPath);
  }

  return {
    filesWritten,
    filesUpdated,
    warnings,
    metadata: { mode, scope, slug, nichoSlug },
  };
}


// ---------------------------------------------------------------------------
// 6. playbook_vendas
// ---------------------------------------------------------------------------

async function handlePlaybookVendas(
  args: Record<string, unknown>,
  workspaceRoot: string,
  warnings: string[],
): Promise<ToolResult> {
  const mode = args['mode'] as string; // 'oferta' | 'cliente'

  const scope = mode === 'oferta' ? 'ofertas' : 'clientes';
  const slug =
    mode === 'oferta'
      ? (args['ofertaSlug'] as string)
      : (args['clienteSlug'] as string);

  const filesWritten: string[] = [];
  const filesUpdated: string[] = [];

  // Ensure scope/{slug}/ directory exists
  await ensureDirectory(workspaceRoot, scope, slug);

  // Read niche context
  const nichoSlug =
    typeof args['nichoSlug'] === 'string' ? args['nichoSlug'] : '';
  const objecoes = nichoSlug
    ? await safeRead(workspaceRoot, `nichos/${nichoSlug}/07-objecoes.md`)
    : '';
  const contextNote = objecoes
    ? '> Objeções do nicho disponíveis para personalização.'
    : '> Nenhum contexto de objeções encontrado.';

  const playbookContent = `---
title: "Playbook de Vendas — ${slug}"
scope: ${scope}
slug: ${slug}
mode: ${mode}
generated: ${today()}
---

# 📋 Playbook de Vendas — ${slug}

> Gerado pela skill **gos-playbook-vendas** — Accelera 360
${contextNote}

## Script de Diagnóstico (30 min)

### Framework D.E.A.L. Lite

#### D — Descoberta (10 min)
- **Abertura:** <!-- PREENCHER -->
- **Pergunta 1 (Situação):** <!-- PREENCHER -->
- **Pergunta 2 (Problema):** <!-- PREENCHER -->
- **Pergunta 3 (Implicação):** <!-- PREENCHER -->

#### E — Exploração (8 min)
- **Aprofundar dor principal:** <!-- PREENCHER -->
- **Quantificar impacto:** "Quanto isso custa por mês?" <!-- adaptar -->
- **Pergunta SPIN (Necessidade):** <!-- PREENCHER -->

#### A — Apresentação (7 min)
- **Transição:** <!-- PREENCHER -->
- **Mecanismo (1 frase):** <!-- PREENCHER -->
- **3 benefícios-chave:**
  1. <!-- BENEFÍCIO 1 -->
  2. <!-- BENEFÍCIO 2 -->
  3. <!-- BENEFÍCIO 3 -->
- **Prova:** <!-- case / número / depoimento -->

#### L — Levantamento de Objeções + Fechamento (5 min)
- **Pergunta de temperatura:** "De 0 a 10, quanto isso faz sentido pra você?"
- **Se < 7:** explorar objeção
- **Se ≥ 7:** propor próximo passo

## 5 Quebras de Objeção

| # | Objeção | Tipo | Resposta |
|---|---|---|---|
| 1 | "Está caro" | Preço | <!-- PREENCHER --> |
| 2 | "Preciso pensar" | Tempo | <!-- PREENCHER --> |
| 3 | "Já tentei IA e não funcionou" | Confiança | <!-- PREENCHER --> |
| 4 | "Minha equipe não vai usar" | Técnica | <!-- PREENCHER --> |
| 5 | "Não é prioridade agora" | Timing | <!-- PREENCHER --> |

## Funil de 5 Estágios

| Estágio | Ação | Critério de Avanço | Tempo Médio |
|---|---|---|---|
| 1. Lead | Primeiro contato | Respondeu | 0-3 dias |
| 2. Qualificado | Call diagnóstico | Dor confirmada + budget | 3-7 dias |
| 3. Proposta | Enviar proposta | Proposta aberta | 7-14 dias |
| 4. Negociação | Follow-up | Objeções tratadas | 14-21 dias |
| 5. Fechamento | Contrato | Assinatura | 21-30 dias |

## Checklist Pré-Call
- [ ] Perfil do prospect lido (00-perfil.md)
- [ ] Dores do nicho revisadas
- [ ] Mecanismo memorizado (1 frase)
- [ ] 3 objeções preparadas
- [ ] Próximo passo definido

---
*Accelera 360 — Business Accelerator*
`;

  // Write to the correct path based on mode
  const outputPath =
    mode === 'oferta'
      ? `ofertas/${slug}/playbook.md`
      : `clientes/${slug}/02-playbook.md`;

  await writeWorkspaceFile(workspaceRoot, outputPath, playbookContent);
  filesWritten.push(outputPath);

  return {
    filesWritten,
    filesUpdated,
    warnings,
    metadata: { mode, scope, slug },
  };
}


// ---------------------------------------------------------------------------
// 7. meeting_prep
// ---------------------------------------------------------------------------

async function handleMeetingPrep(
  args: Record<string, unknown>,
  workspaceRoot: string,
  warnings: string[],
): Promise<ToolResult> {
  const clienteSlug = args['clienteSlug'] as string;

  const filesWritten: string[] = [];
  const filesUpdated: string[] = [];

  // Ensure clientes/{slug}/ directory exists
  await ensureDirectory(workspaceRoot, 'clientes', clienteSlug);

  // Read existing profile for context
  const perfil = await safeRead(
    workspaceRoot,
    `clientes/${clienteSlug}/00-perfil.md`,
  );
  const playbook = await safeRead(
    workspaceRoot,
    `clientes/${clienteSlug}/02-playbook.md`,
  );

  const perfilNote = perfil
    ? '> Perfil do prospect (00-perfil.md) disponível.'
    : '> ⚠️ Perfil não encontrado — briefing será genérico.';
  const playbookNote = playbook
    ? '> Playbook de vendas (02-playbook.md) disponível.'
    : '> Playbook não encontrado — usando template padrão.';

  const meetingPrepContent = `---
title: "Meeting Prep — ${clienteSlug}"
cliente: ${clienteSlug}
generated: ${today()}
---

# 📋 Briefing 1-Page: Reunião com ${clienteSlug}

> Gerado pela skill **gos-meeting-prep** — Accelera 360
${perfilNote}
${playbookNote}

## Quem é o Prospect

| Campo | Valor |
|---|---|
| **Empresa** | <!-- extrair de 00-perfil.md --> |
| **Decisor** | <!-- nome + cargo --> |
| **Setor** | <!-- PREENCHER --> |
| **Porte** | <!-- PREENCHER --> |

## Contexto da Reunião

- **Objetivo:** <!-- PREENCHER --> |
- **Duração estimada:** 30 min
- **Canal:** <!-- presencial / video / telefone -->

## Dores Prováveis (top 3)

1. **<!-- DOR 1 -->** — <!-- evidência do perfil -->
2. **<!-- DOR 2 -->** — <!-- evidência -->
3. **<!-- DOR 3 -->** — <!-- evidência -->

## Gancho de Abertura

> "<!-- PREENCHER — frase de abertura personalizada -->"

## 5 Perguntas SPIN

### Situação
1. <!-- PERGUNTA -->

### Problema
2. <!-- PERGUNTA -->

### Implicação
3. <!-- PERGUNTA -->
4. <!-- PERGUNTA -->

### Necessidade de Solução
5. <!-- PERGUNTA -->

## 3 Objeções Prováveis + Quebra

| # | Objeção | Quebra |
|---|---|---|
| 1 | "<!-- OBJEÇÃO -->" | <!-- QUEBRA --> |
| 2 | "<!-- OBJEÇÃO -->" | <!-- QUEBRA --> |
| 3 | "<!-- OBJEÇÃO -->" | <!-- QUEBRA --> |

## Próximo Passo

- **Se interesse alto (≥7/10):** <!-- PREENCHER -->
- **Se interesse médio (4-6):** <!-- PREENCHER -->
- **Se interesse baixo (<4):** <!-- PREENCHER -->

## Checklist Pré-Reunião

- [ ] Perfil do prospect revisado
- [ ] Gancho de abertura memorizado
- [ ] 5 perguntas SPIN prontas
- [ ] 3 objeções + quebra preparadas
- [ ] Próximo passo definido
- [ ] Material de apoio (deck/LP) pronto

---
*Accelera 360 — Business Accelerator*
`;

  const meetingPrepPath = `clientes/${clienteSlug}/01-meeting-prep.md`;
  await writeWorkspaceFile(workspaceRoot, meetingPrepPath, meetingPrepContent);
  filesWritten.push(meetingPrepPath);

  // Update _index.md to status: meeting-prep-done
  const indexPath = `clientes/${clienteSlug}/_index.md`;
  await updateIndexStatus(workspaceRoot, indexPath, 'meeting-prep-done');
  filesUpdated.push(indexPath);

  return {
    filesWritten,
    filesUpdated,
    warnings,
    metadata: { clienteSlug },
  };
}


// ---------------------------------------------------------------------------
// 8. pitch_deck_builder
// ---------------------------------------------------------------------------

async function handlePitchDeckBuilder(
  args: Record<string, unknown>,
  workspaceRoot: string,
  warnings: string[],
): Promise<ToolResult> {
  const nichoSlug = args['nichoSlug'] as string;
  const renderMode =
    typeof args['renderMode'] === 'string' ? args['renderMode'] : 'reveal';

  // Determine scope and slug
  const clienteSlug =
    typeof args['clienteSlug'] === 'string' ? args['clienteSlug'] : '';
  const ofertaSlug =
    typeof args['ofertaSlug'] === 'string' ? args['ofertaSlug'] : '';

  const scope = clienteSlug ? 'clientes' : 'ofertas';
  const slug = clienteSlug || ofertaSlug || nichoSlug;

  const filesWritten: string[] = [];
  const filesUpdated: string[] = [];

  // Ensure scope/{slug}/deck/ directory exists
  await ensureDirectory(workspaceRoot, scope, slug);

  const basePath = `${scope}/${slug}/deck`;

  // Read niche data for context
  const mecanismo = await safeRead(
    workspaceRoot,
    `nichos/${nichoSlug}/03-mecanismo.md`,
  );
  const dores = await safeRead(
    workspaceRoot,
    `nichos/${nichoSlug}/02-dores.md`,
  );
  const contextNote =
    mecanismo || dores
      ? '> Contexto de nicho disponível para personalização dos slides.'
      : '> Nenhum contexto de nicho encontrado — slides serão genéricos.';

  // Generate 20 slide markdown files
  const slides: Array<{ num: string; title: string; content: string }> = [
    { num: '01', title: 'Capa', content: '<!-- Logo + Nome da empresa + Tagline -->' },
    { num: '02', title: 'Quem Somos', content: '<!-- Breve apresentação da empresa/parceiro -->' },
    { num: '03', title: 'O Problema', content: '<!-- Dor #1 do nicho — dados concretos -->' },
    { num: '04', title: 'Impacto do Problema', content: '<!-- Custo da inação — R$/mês perdido -->' },
    { num: '05', title: 'A Oportunidade', content: '<!-- Tamanho do mercado + tendência -->' },
    { num: '06', title: 'Nossa Solução', content: '<!-- Mecanismo proprietário (1 frase) -->' },
    { num: '07', title: 'Como Funciona', content: '<!-- 3 passos visuais -->' },
    { num: '08', title: 'Diferencial', content: '<!-- Por que somos diferentes (vs. genérico) -->' },
    { num: '09', title: 'Case 1', content: '<!-- Resultado concreto — antes/depois -->' },
    { num: '10', title: 'Case 2', content: '<!-- Segundo resultado / depoimento -->' },
    { num: '11', title: 'Benefício 1', content: '<!-- Feature → Advantage → Benefit -->' },
    { num: '12', title: 'Benefício 2', content: '<!-- Feature → Advantage → Benefit -->' },
    { num: '13', title: 'Benefício 3', content: '<!-- Feature → Advantage → Benefit -->' },
    { num: '14', title: 'ROI Esperado', content: '<!-- Projeção de retorno — números -->' },
    { num: '15', title: 'Planos e Preços', content: '<!-- Estrutura de pricing -->' },
    { num: '16', title: 'Implementação', content: '<!-- Timeline de implementação -->' },
    { num: '17', title: 'Garantia', content: '<!-- Garantia oferecida -->' },
    { num: '18', title: 'FAQ', content: '<!-- 3 perguntas frequentes -->' },
    { num: '19', title: 'Próximos Passos', content: '<!-- CTA claro — o que fazer agora -->' },
    { num: '20', title: 'Contato', content: '<!-- Dados de contato + CTA final -->' },
  ];

  // Write slide markdown files
  const slideDir = renderMode === 'markdown-only' ? 'slides-md' : 'slides-md';
  for (const slide of slides) {
    const slideContent = `---
slide: ${slide.num}
title: "${slide.title}"
nicho: ${nichoSlug}
generated: ${today()}
---

# Slide ${slide.num}: ${slide.title}

${slide.content}

${contextNote}
`;
    const slidePath = `${basePath}/${slideDir}/slide-${slide.num}.md`;
    await writeWorkspaceFile(workspaceRoot, slidePath, slideContent);
    filesWritten.push(slidePath);
  }

  // Write deck.html for reveal and gemini modes
  if (renderMode !== 'markdown-only') {
    const slideSections = slides
      .map(
        (s) => `      <section>
        <h2>${s.title}</h2>
        <p>${s.content}</p>
      </section>`,
      )
      .join('\n');

    const deckHtmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Deck — ${slug}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@4/dist/reveal.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@4/dist/theme/white.css">
  <style>
    /* Gerado pela skill gos-pitch-deck-builder — Accelera 360 */
    /* Nicho: ${nichoSlug} | Render: ${renderMode} */
    .reveal h2 { font-size: 1.8em; }
    .reveal p { font-size: 1.1em; }
  </style>
</head>
<body>
  <div class="reveal">
    <div class="slides">
${slideSections}
    </div>
  </div>
  <script src="https://cdn.jsdelivr.net/npm/reveal.js@4/dist/reveal.js"></script>
  <script>
    Reveal.initialize({
      hash: true,
      transition: 'slide',
    });
  </script>
</body>
</html>
`;

    const deckPath = `${basePath}/deck.html`;
    await writeWorkspaceFile(workspaceRoot, deckPath, deckHtmlContent);
    filesWritten.push(deckPath);
  }

  return {
    filesWritten,
    filesUpdated,
    warnings,
    metadata: {
      scope,
      slug,
      nichoSlug,
      renderMode,
      slideCount: slides.length,
      selfCheckScore: 'PENDING',
    },
  };
}
