#!/usr/bin/env node

/**
 * CLI entry point for the a360-mcp-server.
 *
 * Parses --workspace argument, determines the repo root, creates the MCP
 * server, and connects it via stdio transport.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer } from '../src/index.js';

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------

function parseArgs(argv: string[]): { workspace: string } {
  let workspace = process.cwd();

  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--workspace' && i + 1 < argv.length) {
      workspace = path.resolve(argv[i + 1]);
      i++; // skip the value
    } else if (argv[i].startsWith('--workspace=')) {
      workspace = path.resolve(argv[i].slice('--workspace='.length));
    }
  }

  return { workspace };
}

// ---------------------------------------------------------------------------
// Repo root detection
// ---------------------------------------------------------------------------

/**
 * Find the repository root by looking for `.claude/skills/` directory.
 *
 * Strategy:
 * 1. Check from the workspace directory upward
 * 2. Check from the script's own directory upward (since the MCP server
 *    lives inside the repo at `mcp-server/bin/`)
 *
 * Returns the directory that contains `.claude/skills/`, or null if not found.
 */
function findRepoRoot(workspaceRoot: string): string | null {
  // Strategy 1: Walk up from workspace root
  const fromWorkspace = walkUpForSkills(workspaceRoot);
  if (fromWorkspace) return fromWorkspace;

  // Strategy 2: Walk up from the script's own directory
  // The compiled script lives at mcp-server/dist/bin/a360-mcp.js
  // so the repo root is typically 3 levels up.
  const scriptDir = path.dirname(new URL(import.meta.url).pathname);
  const fromScript = walkUpForSkills(scriptDir);
  if (fromScript) return fromScript;

  return null;
}

/**
 * Walk up the directory tree looking for a `.claude/skills/` directory.
 */
function walkUpForSkills(startDir: string): string | null {
  let current = path.resolve(startDir);
  const root = path.parse(current).root;

  while (current !== root) {
    const skillsDir = path.join(current, '.claude', 'skills');
    if (fs.existsSync(skillsDir)) {
      return current;
    }
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }

  return null;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const { workspace } = parseArgs(process.argv);

  // Determine repo root
  const repoRoot = findRepoRoot(workspace);

  if (!repoRoot) {
    process.stderr.write(
      `[FATAL] Não foi possível encontrar o diretório .claude/skills/.\n` +
        `Verificado a partir de:\n` +
        `  - Workspace: ${workspace}\n` +
        `  - Script: ${path.dirname(new URL(import.meta.url).pathname)}\n` +
        `Certifique-se de que o servidor está sendo executado dentro do repositório a360-framework-lite.\n`,
    );
    process.exit(1);
  }

  process.stderr.write(
    `[INFO] Workspace: ${workspace}\n` +
      `[INFO] Repo root: ${repoRoot}\n`,
  );

  // Create and connect the server
  const server = createServer(workspace, repoRoot);
  const transport = new StdioServerTransport();
  await server.connect(transport);

  process.stderr.write('[INFO] a360-mcp-server conectado via stdio.\n');
}

main().catch((err: unknown) => {
  const message =
    err instanceof Error ? err.message : 'Erro desconhecido ao iniciar o servidor.';
  process.stderr.write(`[FATAL] ${message}\n`);
  process.exit(1);
});
