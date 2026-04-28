/**
 * MCP server setup, tool/resource/prompt registration, and connect.
 *
 * Exports `createServer(workspaceRoot, repoRoot)` which discovers skills,
 * generates schemas, creates an McpServer instance, registers tools,
 * resources, and prompts, then returns the configured server.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { parseAllSkills } from './skill-parser.js';
import { generateAllSchemas } from './schema-generator.js';
import { executeTool } from './tool-executor.js';
import { registerResources } from './resource-registry.js';
import { registerPrompts } from './prompt-registry.js';
import type { JSONSchema7, SkillDef, ToolSchema } from './types.js';

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Create and configure the MCP server.
 *
 * 1. Discovers skills from `.claude/skills/` under `repoRoot`
 * 2. Generates JSON Schemas for each skill
 * 3. Creates an McpServer and registers tools, resources, and prompts
 * 4. Returns the configured (but not yet connected) server
 */
export function createServer(
  workspaceRoot: string,
  repoRoot: string,
): McpServer {
  // 1. Discover skills
  const { skills, warnings } = parseAllSkills(repoRoot);

  // Log warnings for malformed SKILL.md files
  for (const w of warnings) {
    process.stderr.write(
      `[WARN] Skipping ${w.file}: ${w.error}\n`,
    );
  }

  // 2. If no skills found and the skills directory doesn't exist, throw
  const skillsDir = path.join(repoRoot, '.claude', 'skills');
  if (skills.length === 0 && !fs.existsSync(skillsDir)) {
    throw new Error(
      `Diretório de skills não encontrado: ${skillsDir}\n` +
        'Verifique se o repositório contém .claude/skills/ com arquivos SKILL.md válidos.',
    );
  }

  // 3. Generate tool schemas
  const toolSchemas = generateAllSchemas(skills);

  // 4. Create McpServer instance
  const server = new McpServer(
    { name: 'a360-mcp-server', version: '0.1.0' },
  );

  // 5. Register each tool
  const skillsByName = new Map<string, SkillDef>();
  for (const skill of skills) {
    skillsByName.set(skill.name, skill);
  }

  for (const schema of toolSchemas) {
    const skillDef = skillsByName.get(
      schema.name.replace(/_/g, '-'),
    );

    if (!skillDef) continue;

    const zodShape = jsonSchemaToZodShape(schema.inputSchema);

    server.tool(
      schema.name,
      schema.description,
      zodShape,
      async (args) => {
        try {
          const result = await executeTool(
            skillDef,
            args as Record<string, unknown>,
            workspaceRoot,
          );
          return {
            content: [{ type: 'text' as const, text: JSON.stringify(result) }],
          };
        } catch (err: unknown) {
          const message =
            err && typeof err === 'object' && 'message' in err
              ? (err as { message: string }).message
              : 'Erro desconhecido na execução da tool.';

          // If it's a structured error (has code), pass it through
          if (err && typeof err === 'object' && 'code' in err) {
            return {
              content: [{ type: 'text' as const, text: JSON.stringify(err) }],
              isError: true,
            };
          }

          return {
            content: [
              {
                type: 'text' as const,
                text: JSON.stringify({
                  code: 'EXECUTION_ERROR',
                  message,
                }),
              },
            ],
            isError: true,
          };
        }
      },
    );
  }

  // 6. Register resources
  registerResources(server, workspaceRoot);

  // 7. Register prompts
  registerPrompts(server, workspaceRoot, skills, executeTool);

  // 8. Log registration counts
  const toolCount = toolSchemas.length;
  const resourceCount = 5; // 4 static + 1 template
  const promptCount = 5; // 5 pipelines
  process.stderr.write(
    `[INFO] a360-mcp-server registrado: ${toolCount} tools, ${resourceCount} resources, ${promptCount} prompts\n`,
  );

  return server;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Convert a JSON Schema `properties` map to a Zod shape compatible with
 * the McpServer `tool()` method.
 *
 * This produces a loose Zod shape that mirrors the JSON Schema structure
 * for MCP client discovery. Actual input validation is handled by the
 * tool executor.
 */
function jsonSchemaToZodShape(
  schema: JSONSchema7,
): Record<string, z.ZodTypeAny> {
  const shape: Record<string, z.ZodTypeAny> = {};
  const properties = schema.properties ?? {};
  const required = new Set(schema.required ?? []);

  for (const [key, propSchema] of Object.entries(properties)) {
    let zodType: z.ZodTypeAny;

    if (propSchema.enum && Array.isArray(propSchema.enum)) {
      // Enum property
      const values = propSchema.enum.filter(
        (v): v is string => typeof v === 'string',
      );
      if (values.length >= 2) {
        zodType = z.enum(values as [string, ...string[]]);
      } else if (values.length === 1) {
        zodType = z.literal(values[0]);
      } else {
        zodType = z.string();
      }
    } else if (propSchema.type === 'string') {
      zodType = z.string();
    } else if (propSchema.type === 'number' || propSchema.type === 'integer') {
      zodType = z.number();
    } else if (propSchema.type === 'boolean') {
      zodType = z.boolean();
    } else {
      zodType = z.string();
    }

    // Add description if present
    if (propSchema.description) {
      zodType = zodType.describe(propSchema.description);
    }

    // Make optional if not required
    if (!required.has(key)) {
      zodType = zodType.optional();
    }

    shape[key] = zodType;
  }

  return shape;
}
