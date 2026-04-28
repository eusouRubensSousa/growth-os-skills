/**
 * MCP resource registration.
 *
 * Registers workspace state (ledgers, identity, generated outputs) as MCP
 * resources so that clients can read them via the standard resources/read
 * protocol without parsing files manually.
 */

import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { readWorkspaceFile } from './workspace-manager.js';

// ---------------------------------------------------------------------------
// Static resource definitions
// ---------------------------------------------------------------------------

interface StaticResource {
  /** MCP resource name (human-readable) */
  name: string;
  /** MCP resource URI */
  uri: string;
  /** Workspace-relative file path */
  filePath: string;
  /** MIME type for the resource content */
  mimeType: string;
  /** Description shown to MCP clients */
  description: string;
}

const STATIC_RESOURCES: StaticResource[] = [
  {
    name: 'nichos-mapeados',
    uri: 'a360://ledgers/nichos-mapeados',
    filePath: 'memory/shared/nichos-mapeados.md',
    mimeType: 'text/markdown',
    description: 'Ledger de nichos mapeados — status e próximos passos de cada nicho.',
  },
  {
    name: 'clientes-ativos',
    uri: 'a360://ledgers/clientes-ativos',
    filePath: 'memory/shared/clientes-ativos.md',
    mimeType: 'text/markdown',
    description: 'Ledger de clientes ativos — status do pipeline de cada prospect.',
  },
  {
    name: 'ofertas',
    uri: 'a360://ledgers/ofertas',
    filePath: 'memory/shared/ofertas.md',
    mimeType: 'text/markdown',
    description: 'Ledger de ofertas — catálogo de ofertas e seus status.',
  },
  {
    name: 'identidade',
    uri: 'a360://config/identidade',
    filePath: 'identidade.json',
    mimeType: 'application/json',
    description: 'Identidade visual e design system do negócio.',
  },
];

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Register all MCP resources on the server.
 *
 * - 3 ledger resources (nichos-mapeados, clientes-ativos, ofertas)
 * - 1 config resource (identidade.json)
 * - 1 dynamic resource template for generated outputs
 */
export function registerResources(
  server: McpServer,
  workspaceRoot: string,
): void {
  // Register static resources (ledgers + identity)
  for (const res of STATIC_RESOURCES) {
    server.resource(
      res.name,
      res.uri,
      { description: res.description, mimeType: res.mimeType },
      async (uri) => {
        try {
          const text = await readWorkspaceFile(workspaceRoot, res.filePath);
          return {
            contents: [
              {
                uri: uri.href,
                text,
                mimeType: res.mimeType,
              },
            ],
          };
        } catch {
          return {
            contents: [
              {
                uri: uri.href,
                text: JSON.stringify({
                  error: `Arquivo não encontrado: ${res.filePath}`,
                }),
                mimeType: 'application/json',
              },
            ],
          };
        }
      },
    );
  }

  // Register dynamic resource template for generated outputs
  // URI pattern: a360://outputs/{scope}/{slug}/{artifact}
  const outputTemplate = new ResourceTemplate(
    'a360://outputs/{scope}/{slug}/{artifact}',
    { list: undefined },
  );

  server.resource(
    'outputs',
    outputTemplate,
    {
      description:
        'Artefatos gerados (LPs, decks, briefings) — acesse via a360://outputs/{scope}/{slug}/{artifact}',
      mimeType: 'text/plain',
    },
    async (uri, variables) => {
      const scope = variables.scope as string;
      const slug = variables.slug as string;
      const artifact = variables.artifact as string;

      const relativePath = `${scope}/${slug}/${artifact}`;

      // Determine MIME type from artifact extension
      const mimeType = guessMimeType(artifact);

      try {
        const text = await readWorkspaceFile(workspaceRoot, relativePath);
        return {
          contents: [
            {
              uri: uri.href,
              text,
              mimeType,
            },
          ],
        };
      } catch {
        return {
          contents: [
            {
              uri: uri.href,
              text: JSON.stringify({
                error: `Arquivo não encontrado: ${relativePath}`,
              }),
              mimeType: 'application/json',
            },
          ],
        };
      }
    },
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Guess MIME type from a file name / artifact path.
 */
function guessMimeType(artifact: string): string {
  if (artifact.endsWith('.html')) return 'text/html';
  if (artifact.endsWith('.md')) return 'text/markdown';
  if (artifact.endsWith('.json')) return 'application/json';
  if (artifact.endsWith('.yaml') || artifact.endsWith('.yml'))
    return 'text/yaml';
  return 'text/plain';
}
