/**
 * Prerequisite validation for skill execution.
 *
 * Checks blocking and recommended prerequisites declared in a SkillDef
 * against the workspace filesystem. For paths that include a status
 * condition (e.g. `status=mapped`), parses the `_index.md` frontmatter
 * and verifies the value.
 */

import * as fs from 'node:fs/promises';
import type {
  MissingPrerequisite,
  PrerequisiteCheckResult,
  SkillDef,
} from './types.js';
import {
  parseFrontmatter,
  readWorkspaceFile,
  resolvePath,
} from './workspace-manager.js';

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Validate all blocking and recommended prerequisites for a skill.
 *
 * Placeholder tokens in prerequisite paths are replaced with actual values
 * from `args`:
 *   - `{slug}`, `{slug-nicho}`  → `args.nichoSlug`
 *   - `{slug-cliente}`          → `args.clienteSlug`
 *   - `{slug-oferta}`          → `args.ofertaSlug`
 *
 * Inline comments (text after double space or parentheses) are stripped
 * before path resolution.
 */
export async function validatePrerequisites(
  skillDef: SkillDef,
  args: Record<string, unknown>,
  workspaceRoot: string,
): Promise<PrerequisiteCheckResult> {
  const missingBlocking: MissingPrerequisite[] = [];
  const missingRecommended: MissingPrerequisite[] = [];

  // Check blocking prerequisites
  for (const raw of skillDef.requires.blocking) {
    const result = await checkPrerequisite(raw, args, workspaceRoot);
    if (result) {
      missingBlocking.push(result);
    }
  }

  // Check recommended prerequisites
  for (const raw of skillDef.requires.recommended) {
    const result = await checkPrerequisite(raw, args, workspaceRoot);
    if (result) {
      missingRecommended.push(result);
    }
  }

  return {
    satisfied: missingBlocking.length === 0,
    missingBlocking,
    missingRecommended,
  };
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Parse a raw prerequisite string, resolve placeholders, check existence
 * and optional status condition. Returns a `MissingPrerequisite` if the
 * check fails, or `null` if satisfied.
 */
async function checkPrerequisite(
  raw: string,
  args: Record<string, unknown>,
  workspaceRoot: string,
): Promise<MissingPrerequisite | null> {
  const { filePath, statusKey, statusValue } = parsePrerequisitePath(
    raw,
    args,
  );

  // Skip entries that resolve to empty (e.g. lines starting with "OU")
  if (!filePath) {
    return null;
  }

  let absolutePath: string;
  try {
    absolutePath = resolvePath(workspaceRoot, filePath);
  } catch {
    // Path escapes workspace — treat as missing
    return {
      path: filePath,
      reason: `Caminho inválido: ${filePath}`,
      suggestedTool: suggestTool(filePath),
    };
  }

  // Check if the file/directory exists
  const exists = await pathExists(absolutePath);
  if (!exists) {
    return {
      path: filePath,
      reason: `Pré-requisito ausente: ${filePath}`,
      suggestedTool: suggestTool(filePath),
    };
  }

  // If a status condition is specified, verify it
  if (statusKey && statusValue) {
    try {
      const content = await readWorkspaceFile(workspaceRoot, filePath);
      const frontmatter = parseFrontmatter(content);
      const currentValue = frontmatter[statusKey];

      if (currentValue !== statusValue) {
        return {
          path: filePath,
          reason: `${filePath} requer ${statusKey}=${statusValue}, encontrado ${statusKey}=${currentValue ?? '(ausente)'}`,
          suggestedTool: suggestToolForStatus(filePath, statusValue),
          currentStatus: currentValue ?? undefined,
          requiredStatus: statusValue,
        };
      }
    } catch {
      // Could not read/parse — treat as missing
      return {
        path: filePath,
        reason: `Não foi possível verificar status em ${filePath}`,
        suggestedTool: suggestTool(filePath),
      };
    }
  }

  return null;
}

/**
 * Parse a raw prerequisite string into its components:
 * - The file path (with placeholders replaced)
 * - An optional status key/value condition
 *
 * Examples:
 *   "nichos/{slug-nicho}/_index.md status=mapped (sem nicho mapeado, LP sai genérica)"
 *   → { filePath: "nichos/my-slug/_index.md", statusKey: "status", statusValue: "mapped" }
 *
 *   "clientes/{slug-cliente}/00-perfil.md (do /cliente-radar)"
 *   → { filePath: "clientes/my-slug/00-perfil.md", statusKey: null, statusValue: null }
 */
function parsePrerequisitePath(
  raw: string,
  args: Record<string, unknown>,
): {
  filePath: string;
  statusKey: string | null;
  statusValue: string | null;
} {
  // Strip inline comments: text in parentheses or after double space
  let cleaned = raw.replace(/\s*\(.*?\)\s*/g, ' ').trim();
  cleaned = cleaned.replace(/\s{2,}.*$/, '').trim();

  // Lines starting with "OU " (Portuguese "OR") are alternative paths — skip
  if (cleaned.startsWith('OU ')) {
    return { filePath: '', statusKey: null, statusValue: null };
  }

  // Extract status condition (e.g. "status=mapped")
  let statusKey: string | null = null;
  let statusValue: string | null = null;

  const statusMatch = cleaned.match(/\s+(\w+)=(\S+)/);
  if (statusMatch) {
    statusKey = statusMatch[1];
    statusValue = statusMatch[2];
    cleaned = cleaned.replace(statusMatch[0], '').trim();
  }

  // Replace placeholders with actual values from args
  let filePath = cleaned;
  const nichoSlug =
    typeof args['nichoSlug'] === 'string' ? args['nichoSlug'] : '';
  const clienteSlug =
    typeof args['clienteSlug'] === 'string' ? args['clienteSlug'] : '';
  const ofertaSlug =
    typeof args['ofertaSlug'] === 'string' ? args['ofertaSlug'] : '';

  filePath = filePath.replace(/\{slug-nicho\}/g, nichoSlug);
  filePath = filePath.replace(/\{slug-cliente\}/g, clienteSlug);
  filePath = filePath.replace(/\{slug-oferta\}/g, ofertaSlug);
  filePath = filePath.replace(/\{slug\}/g, nichoSlug || clienteSlug || ofertaSlug);

  return { filePath, statusKey, statusValue };
}

/**
 * Suggest which tool to run based on the missing path.
 */
function suggestTool(filePath: string): string {
  if (filePath.startsWith('nichos/')) {
    return 'mapear_nicho';
  }
  if (filePath.startsWith('clientes/')) {
    return 'cliente_radar';
  }
  if (filePath.startsWith('ofertas/')) {
    return 'Criar oferta manualmente';
  }
  return 'Verificar workspace';
}

/**
 * Suggest which tool to run when a status condition fails.
 */
function suggestToolForStatus(
  filePath: string,
  requiredStatus: string,
): string {
  if (filePath.startsWith('nichos/') && requiredStatus === 'mapped') {
    return 'mapear_nicho';
  }
  if (filePath.startsWith('clientes/') && requiredStatus === 'radar-done') {
    return 'cliente_radar';
  }
  if (
    filePath.startsWith('clientes/') &&
    requiredStatus === 'meeting-prep-done'
  ) {
    return 'meeting_prep';
  }
  // Generic fallback: suggest the tool that advances the status
  return suggestTool(filePath);
}

/**
 * Check if a path exists on the filesystem.
 */
async function pathExists(absolutePath: string): Promise<boolean> {
  try {
    await fs.access(absolutePath);
    return true;
  } catch {
    return false;
  }
}
