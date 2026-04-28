/**
 * Workspace filesystem operations: path resolution, directory creation,
 * file I/O, and YAML frontmatter parsing.
 *
 * All paths are resolved relative to the workspace root. Operations that
 * fail are wrapped as WORKSPACE_ERROR for consistent error handling.
 */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { parse } from 'yaml';
import { workspaceError } from './error-codes.js';

// ---------------------------------------------------------------------------
// Path resolution
// ---------------------------------------------------------------------------

/**
 * Resolve a relative path against the workspace root.
 *
 * Throws a WORKSPACE_ERROR if the resolved path escapes the workspace
 * boundary (e.g. via `..` segments).
 */
export function resolvePath(
  workspaceRoot: string,
  relativePath: string,
): string {
  const root = path.resolve(workspaceRoot);
  const resolved = path.resolve(root, relativePath);

  if (!resolved.startsWith(root + path.sep) && resolved !== root) {
    throw workspaceError(
      `Caminho "${relativePath}" escapa do workspace root.`,
      { workspaceRoot: root, resolved },
    );
  }

  return resolved;
}

// ---------------------------------------------------------------------------
// Directory creation (from _modelo/ template or empty)
// ---------------------------------------------------------------------------

/**
 * Ensure `{scope}/{slug}/` exists inside the workspace.
 *
 * If `{scope}/_modelo/` exists, copies its contents into the new directory.
 * Otherwise creates an empty directory. Uses recursive mkdir.
 */
export async function ensureDirectory(
  workspaceRoot: string,
  scope: string,
  slug: string,
): Promise<void> {
  const targetDir = resolvePath(workspaceRoot, path.join(scope, slug));

  // If the directory already exists, nothing to do.
  try {
    const stat = await fs.stat(targetDir);
    if (stat.isDirectory()) return;
  } catch {
    // Directory does not exist — continue to create it.
  }

  const templateDir = resolvePath(
    workspaceRoot,
    path.join(scope, '_modelo'),
  );

  let templateExists = false;
  try {
    const stat = await fs.stat(templateDir);
    templateExists = stat.isDirectory();
  } catch {
    templateExists = false;
  }

  if (templateExists) {
    await copyDirectory(templateDir, targetDir);
  } else {
    await fs.mkdir(targetDir, { recursive: true });
  }
}

// ---------------------------------------------------------------------------
// File I/O
// ---------------------------------------------------------------------------

/**
 * Read a file from the workspace. Wraps errors as WORKSPACE_ERROR.
 */
export async function readWorkspaceFile(
  workspaceRoot: string,
  relativePath: string,
): Promise<string> {
  const absolute = resolvePath(workspaceRoot, relativePath);
  try {
    return await fs.readFile(absolute, 'utf-8');
  } catch (err: unknown) {
    const detail =
      err instanceof Error ? err.message : 'Erro desconhecido ao ler arquivo';
    throw workspaceError(`Falha ao ler "${relativePath}": ${detail}`);
  }
}

/**
 * Write a file to the workspace, creating parent directories as needed.
 * Wraps errors as WORKSPACE_ERROR.
 */
export async function writeWorkspaceFile(
  workspaceRoot: string,
  relativePath: string,
  content: string,
): Promise<void> {
  const absolute = resolvePath(workspaceRoot, relativePath);
  try {
    await fs.mkdir(path.dirname(absolute), { recursive: true });
    await fs.writeFile(absolute, content, 'utf-8');
  } catch (err: unknown) {
    const detail =
      err instanceof Error
        ? err.message
        : 'Erro desconhecido ao escrever arquivo';
    throw workspaceError(`Falha ao escrever "${relativePath}": ${detail}`);
  }
}

// ---------------------------------------------------------------------------
// Frontmatter parsing
// ---------------------------------------------------------------------------

/**
 * Extract YAML frontmatter from a markdown file (between the first two
 * `---` lines) and return key-value pairs.
 *
 * Returns an empty object when no valid frontmatter is found.
 */
export function parseFrontmatter(content: string): Record<string, string> {
  const lines = content.split('\n');

  let firstDelimiter = -1;
  let secondDelimiter = -1;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      if (firstDelimiter === -1) {
        firstDelimiter = i;
      } else {
        secondDelimiter = i;
        break;
      }
    }
  }

  if (firstDelimiter === -1 || secondDelimiter === -1) {
    return {};
  }

  const yamlBlock = lines.slice(firstDelimiter + 1, secondDelimiter).join('\n');

  try {
    const parsed = parse(yamlBlock) as unknown;
    if (parsed === null || typeof parsed !== 'object') {
      return {};
    }

    // Flatten to Record<string, string> — only keep string values.
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(
      parsed as Record<string, unknown>,
    )) {
      if (typeof value === 'string') {
        result[key] = value;
      } else if (value !== null && value !== undefined) {
        result[key] = String(value);
      }
    }
    return result;
  } catch {
    return {};
  }
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Recursively copy a directory tree from `src` to `dest`.
 */
async function copyDirectory(src: string, dest: string): Promise<void> {
  await fs.mkdir(dest, { recursive: true });

  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}
