/**
 * SKILL.md discovery and YAML frontmatter parsing.
 *
 * Reads `.claude/skills/**​/SKILL.md` files, extracts YAML frontmatter,
 * and maps them to `SkillDef` objects for the tool registry.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { parse } from 'yaml';
import type { SkillDef } from './types.js';

// ---------------------------------------------------------------------------
// Single-file parser
// ---------------------------------------------------------------------------

/**
 * Parse a single SKILL.md file and return a `SkillDef`, or `null` if the
 * file is missing required fields or the YAML is malformed.
 */
export function parseSkillFile(filePath: string): SkillDef | null {
  let content: string;
  try {
    content = fs.readFileSync(filePath, 'utf-8');
  } catch {
    return null;
  }

  // Extract YAML frontmatter between the first two `---` lines.
  const frontmatter = extractFrontmatter(content);
  if (frontmatter === null) {
    return null;
  }

  let data: Record<string, unknown>;
  try {
    data = parse(frontmatter) as Record<string, unknown>;
  } catch {
    return null;
  }

  if (data === null || typeof data !== 'object') {
    return null;
  }

  // Required fields
  const name = typeof data['name'] === 'string' ? data['name'] : undefined;
  const description =
    typeof data['description'] === 'string' ? data['description'] : undefined;

  if (!name || !description) {
    return null;
  }

  // Optional fields with sensible defaults
  const argumentHint =
    typeof data['argument-hint'] === 'string' ? data['argument-hint'] : '';

  const allowedTools = parseStringOrArray(data['allowed-tools']);

  const requires = parseRequires(data['requires']);

  const writesTo = parseStringArray(data['writes_to']);

  const updatesIndex = parseStringArray(data['updates_index']);

  return {
    name,
    description,
    argumentHint,
    allowedTools,
    requires,
    writesTo,
    updatesIndex,
    sourceFile: path.resolve(filePath),
  };
}

// ---------------------------------------------------------------------------
// Multi-file discovery
// ---------------------------------------------------------------------------

/**
 * Discover all SKILL.md files under `{repoRoot}/.claude/skills/` and parse
 * each one. Returns the successfully parsed skills and any warnings for
 * files that could not be parsed.
 */
export function parseAllSkills(repoRoot: string): {
  skills: SkillDef[];
  warnings: { file: string; error: string }[];
} {
  const skills: SkillDef[] = [];
  const warnings: { file: string; error: string }[] = [];

  const skillsDir = path.join(repoRoot, '.claude', 'skills');

  if (!fs.existsSync(skillsDir)) {
    return { skills, warnings };
  }

  const skillFiles = findSkillFiles(skillsDir);

  for (const file of skillFiles) {
    try {
      const skill = parseSkillFile(file);
      if (skill) {
        skills.push(skill);
      } else {
        warnings.push({
          file,
          error: 'Failed to parse SKILL.md: missing required fields or malformed YAML',
        });
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Unknown parse error';
      warnings.push({ file, error: message });
    }
  }

  return { skills, warnings };
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Extract the YAML frontmatter string between the first two `---` lines.
 * Returns `null` if the delimiters are not found.
 */
function extractFrontmatter(content: string): string | null {
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
    return null;
  }

  return lines.slice(firstDelimiter + 1, secondDelimiter).join('\n');
}

/**
 * Parse a value that can be either a comma-separated string or an array of
 * strings. Returns an array of trimmed, non-empty strings.
 */
function parseStringOrArray(value: unknown): string[] {
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (Array.isArray(value)) {
    return value
      .filter((v): v is string => typeof v === 'string')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

/**
 * Parse an array of strings, tolerating non-array or missing values.
 */
function parseStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .filter((v): v is string => typeof v === 'string')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (typeof value === 'string') {
    return [value.trim()].filter(Boolean);
  }
  return [];
}

/**
 * Parse the `requires` block from YAML, normalising to `{ blocking, recommended }`.
 */
function parseRequires(value: unknown): {
  blocking: string[];
  recommended: string[];
} {
  const defaults = { blocking: [] as string[], recommended: [] as string[] };

  if (value === null || value === undefined || typeof value !== 'object') {
    return defaults;
  }

  const obj = value as Record<string, unknown>;

  return {
    blocking: parseStringArray(obj['blocking']),
    recommended: parseStringArray(obj['recommended']),
  };
}

/**
 * Recursively find all files named `SKILL.md` under the given directory.
 */
function findSkillFiles(dir: string): string[] {
  const results: string[] = [];

  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return results;
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findSkillFiles(fullPath));
    } else if (entry.isFile() && entry.name === 'SKILL.md') {
      results.push(fullPath);
    }
  }

  return results;
}
