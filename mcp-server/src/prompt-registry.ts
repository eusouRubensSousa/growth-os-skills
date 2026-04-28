/**
 * MCP prompt (pipeline) registration.
 *
 * Registers the 5 pre-built pipelines as MCP prompts. Each pipeline chains
 * multiple tools in sequence, passing context from each tool's output to the
 * next. On tool failure the pipeline stops and returns partial results.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { SkillDef, ToolResult } from './types.js';
import { executeTool } from './tool-executor.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A single step in a pipeline. */
interface PipelineStep {
  /** MCP tool name (kebab-case skill name) */
  skillName: string;
  /** Human-readable description of what this step does */
  description: string;
  /** Function that builds the args for this step from prompt args + prior results */
  buildArgs: (
    promptArgs: Record<string, string>,
    priorResults: StepResult[],
  ) => Record<string, unknown>;
}

/** Result of a single pipeline step. */
interface StepResult {
  toolName: string;
  result: ToolResult;
}

/** Pipeline definition. */
interface PipelineDef {
  name: string;
  description: string;
  argsSchema: Record<string, z.ZodType>;
  steps: PipelineStep[];
}

// ---------------------------------------------------------------------------
// Pipeline definitions
// ---------------------------------------------------------------------------

const PIPELINES: PipelineDef[] = [
  {
    name: 'prospect-meeting',
    description:
      'Pipeline completo para preparar reunião com prospect: pesquisa do cliente → mapeamento do nicho → deck de apresentação → briefing de reunião.',
    argsSchema: {
      companyName: z.string().describe('Nome da empresa prospect'),
      clienteSlug: z.string().describe('Slug do cliente (kebab-case)'),
      nichoSlug: z.string().describe('Slug do nicho do cliente (kebab-case)'),
      nichoDescription: z
        .string()
        .optional()
        .describe('Descrição breve do nicho (opcional)'),
    },
    steps: [
      {
        skillName: 'gos-cliente-radar',
        description: 'Pesquisar o prospect e gerar perfil',
        buildArgs: (args) => ({
          companyName: args.companyName,
          clienteSlug: args.clienteSlug,
        }),
      },
      {
        skillName: 'gos-mapear-nicho',
        description: 'Mapear o nicho do prospect (9 arquivos Johnny.Decimal)',
        buildArgs: (args) => ({
          nichoSlug: args.nichoSlug,
          nichoDescription: args.nichoDescription || args.nichoSlug,
        }),
      },
      {
        skillName: 'gos-pitch-deck-builder',
        description: 'Gerar deck de apresentação para o prospect',
        buildArgs: (args) => ({
          scope: 'cliente',
          clienteSlug: args.clienteSlug,
          renderMode: 'reveal',
        }),
      },
      {
        skillName: 'gos-meeting-prep',
        description: 'Gerar briefing de 1 página para a reunião',
        buildArgs: (args) => ({
          clienteSlug: args.clienteSlug,
        }),
      },
    ],
  },
  {
    name: 'business-foundation',
    description:
      'Pipeline para fundar um negócio em um nicho: validação do nicho → mapeamento completo → estratégia GTM → landing page.',
    argsSchema: {
      nichoSlug: z.string().describe('Slug do nicho (kebab-case)'),
      nichoDescription: z
        .string()
        .optional()
        .describe('Descrição breve do nicho (opcional)'),
    },
    steps: [
      {
        skillName: 'gos-nicho-explorer',
        description: 'Validar nicho (modo B — GO/NO-GO)',
        buildArgs: (args) => ({
          mode: 'B',
          nichoSlug: args.nichoSlug,
        }),
      },
      {
        skillName: 'gos-mapear-nicho',
        description: 'Mapear o nicho completo (9 arquivos)',
        buildArgs: (args) => ({
          nichoSlug: args.nichoSlug,
          nichoDescription: args.nichoDescription || args.nichoSlug,
        }),
      },
      {
        skillName: 'gos-gtm-architect',
        description: 'Gerar estratégia GTM completa (outbound + content)',
        buildArgs: (args) => ({
          mode: 'combo',
          scope: 'oferta',
          nichoSlug: args.nichoSlug,
          ofertaSlug: args.nichoSlug,
        }),
      },
      {
        skillName: 'gos-lp-builder',
        description: 'Gerar landing page para a oferta',
        buildArgs: (args) => ({
          mode: 'oferta',
          ofertaSlug: args.nichoSlug,
          nichoSlug: args.nichoSlug,
        }),
      },
    ],
  },
  {
    name: 'client-deliverable',
    description:
      'Pipeline para gerar entregáveis para um cliente: pesquisa → mapeamento → LP personalizada → deck.',
    argsSchema: {
      companyName: z.string().describe('Nome da empresa'),
      clienteSlug: z.string().describe('Slug do cliente (kebab-case)'),
      nichoSlug: z.string().describe('Slug do nicho (kebab-case)'),
      nichoDescription: z
        .string()
        .optional()
        .describe('Descrição breve do nicho (opcional)'),
    },
    steps: [
      {
        skillName: 'gos-cliente-radar',
        description: 'Pesquisar o cliente e gerar perfil',
        buildArgs: (args) => ({
          companyName: args.companyName,
          clienteSlug: args.clienteSlug,
        }),
      },
      {
        skillName: 'gos-mapear-nicho',
        description: 'Mapear o nicho do cliente',
        buildArgs: (args) => ({
          nichoSlug: args.nichoSlug,
          nichoDescription: args.nichoDescription || args.nichoSlug,
        }),
      },
      {
        skillName: 'gos-lp-builder',
        description: 'Gerar LP personalizada para o cliente',
        buildArgs: (args) => ({
          mode: 'cliente',
          clienteSlug: args.clienteSlug,
          nichoSlug: args.nichoSlug,
        }),
      },
      {
        skillName: 'gos-pitch-deck-builder',
        description: 'Gerar deck de apresentação',
        buildArgs: (args) => ({
          scope: 'cliente',
          clienteSlug: args.clienteSlug,
          renderMode: 'reveal',
        }),
      },
    ],
  },
  {
    name: 'niche-discovery',
    description:
      'Pipeline de descoberta de nicho: exploração Top 10 → mapeamento do nicho escolhido.',
    argsSchema: {
      nichoSlug: z.string().describe('Slug do nicho a mapear (kebab-case)'),
      nichoDescription: z
        .string()
        .optional()
        .describe('Descrição breve do nicho (opcional)'),
    },
    steps: [
      {
        skillName: 'gos-nicho-explorer',
        description: 'Explorar Top 10 nichos (modo A)',
        buildArgs: () => ({
          mode: 'A',
        }),
      },
      {
        skillName: 'gos-mapear-nicho',
        description: 'Mapear o nicho escolhido',
        buildArgs: (args) => ({
          nichoSlug: args.nichoSlug,
          nichoDescription: args.nichoDescription || args.nichoSlug,
        }),
      },
    ],
  },
  {
    name: 'quick-pitch-deck',
    description:
      'Pipeline rápido: mapeamento do nicho → deck de apresentação.',
    argsSchema: {
      nichoSlug: z.string().describe('Slug do nicho (kebab-case)'),
      nichoDescription: z
        .string()
        .optional()
        .describe('Descrição breve do nicho (opcional)'),
    },
    steps: [
      {
        skillName: 'gos-mapear-nicho',
        description: 'Mapear o nicho',
        buildArgs: (args) => ({
          nichoSlug: args.nichoSlug,
          nichoDescription: args.nichoDescription || args.nichoSlug,
        }),
      },
      {
        skillName: 'gos-pitch-deck-builder',
        description: 'Gerar deck de apresentação',
        buildArgs: (args) => ({
          scope: 'oferta',
          nichoSlug: args.nichoSlug,
          ofertaSlug: args.nichoSlug,
          renderMode: 'reveal',
        }),
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Register all 5 pipeline prompts on the MCP server.
 *
 * Each prompt describes its pipeline steps and, when invoked, executes the
 * tools in sequence — passing accumulated context from prior steps.
 */
export function registerPrompts(
  server: McpServer,
  workspaceRoot: string,
  skillDefs: SkillDef[],
  executeToolFn: typeof executeTool,
): void {
  for (const pipeline of PIPELINES) {
    server.prompt(
      pipeline.name,
      pipeline.description,
      pipeline.argsSchema,
      async (args) => {
        const stringArgs = args as Record<string, string>;
        const completedSteps: StepResult[] = [];
        let failedStep: { toolName: string; error: string } | null = null;

        for (const step of pipeline.steps) {
          const skillDef = skillDefs.find((s) => s.name === step.skillName);

          if (!skillDef) {
            failedStep = {
              toolName: step.skillName,
              error: `Skill "${step.skillName}" não encontrada no registro.`,
            };
            break;
          }

          const toolArgs = step.buildArgs(stringArgs, completedSteps);

          try {
            const result = await executeToolFn(skillDef, toolArgs, workspaceRoot);
            completedSteps.push({ toolName: step.skillName, result });
          } catch (err: unknown) {
            const errorMessage =
              err && typeof err === 'object' && 'message' in err
                ? (err as { message: string }).message
                : 'Erro desconhecido';
            failedStep = {
              toolName: step.skillName,
              error: errorMessage,
            };
            break;
          }
        }

        // Build the response message
        const text = formatPipelineResult(
          pipeline,
          stringArgs,
          completedSteps,
          failedStep,
        );

        return {
          messages: [
            {
              role: 'user' as const,
              content: {
                type: 'text' as const,
                text,
              },
            },
          ],
        };
      },
    );
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Format the pipeline execution result as a human-readable message.
 */
function formatPipelineResult(
  pipeline: PipelineDef,
  args: Record<string, string>,
  completedSteps: StepResult[],
  failedStep: { toolName: string; error: string } | null,
): string {
  const lines: string[] = [];

  lines.push(`# Pipeline: ${pipeline.name}`);
  lines.push('');
  lines.push(`> ${pipeline.description}`);
  lines.push('');

  // Arguments
  lines.push('## Argumentos');
  lines.push('');
  for (const [key, value] of Object.entries(args)) {
    if (value) {
      lines.push(`- **${key}:** ${value}`);
    }
  }
  lines.push('');

  // Completed steps
  if (completedSteps.length > 0) {
    lines.push('## Etapas Concluídas');
    lines.push('');
    for (let i = 0; i < completedSteps.length; i++) {
      const step = completedSteps[i];
      const stepDef = pipeline.steps[i];
      lines.push(`### ${i + 1}. ${stepDef.description} (\`${step.toolName}\`)`);
      lines.push('');
      if (step.result.filesWritten.length > 0) {
        lines.push('**Arquivos criados:**');
        for (const f of step.result.filesWritten) {
          lines.push(`- \`${f}\``);
        }
      }
      if (step.result.filesUpdated.length > 0) {
        lines.push('**Arquivos atualizados:**');
        for (const f of step.result.filesUpdated) {
          lines.push(`- \`${f}\``);
        }
      }
      if (step.result.warnings.length > 0) {
        lines.push('**Avisos:**');
        for (const w of step.result.warnings) {
          lines.push(`- ⚠️ ${w}`);
        }
      }
      lines.push('');
    }
  }

  // Failed step
  if (failedStep) {
    lines.push('## ❌ Etapa com Falha');
    lines.push('');
    lines.push(`**Tool:** \`${failedStep.toolName}\``);
    lines.push(`**Erro:** ${failedStep.error}`);
    lines.push('');
    lines.push(
      'O pipeline foi interrompido nesta etapa. Corrija o erro e tente novamente.',
    );
  } else {
    lines.push('## ✅ Pipeline Concluído com Sucesso');
    lines.push('');
    const totalFiles = completedSteps.reduce(
      (acc, s) => acc + s.result.filesWritten.length + s.result.filesUpdated.length,
      0,
    );
    lines.push(
      `Todas as ${completedSteps.length} etapas foram executadas. ${totalFiles} arquivo(s) criados/atualizados.`,
    );
  }

  return lines.join('\n');
}
