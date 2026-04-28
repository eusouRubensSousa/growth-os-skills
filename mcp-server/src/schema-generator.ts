/**
 * JSON Schema generation from SkillDef.
 *
 * Maps each parsed skill to a `ToolSchema` with a JSON Schema Draft 7
 * `inputSchema`. Known skills get hand-crafted schemas; unknown skills
 * fall back to scope detection from `requires`/`writesTo` paths.
 */

import type { JSONSchema7, SkillDef, ToolSchema } from './types.js';

// ---------------------------------------------------------------------------
// Slug pattern reused across all slug properties
// ---------------------------------------------------------------------------

const SLUG_PATTERN = '^[a-z0-9]+(-[a-z0-9]+)*$';

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generate a `ToolSchema` for a single `SkillDef`.
 */
export function generateSchema(skillDef: SkillDef): ToolSchema {
  const toolName = toSnakeCase(skillDef.name);

  const builder = KNOWN_SCHEMAS[skillDef.name];
  const inputSchema: JSONSchema7 = builder
    ? builder(skillDef)
    : buildFallbackSchema(skillDef);

  return {
    name: toolName,
    description: skillDef.description,
    inputSchema,
  };
}

/**
 * Generate `ToolSchema[]` for an array of `SkillDef` objects.
 */
export function generateAllSchemas(skillDefs: SkillDef[]): ToolSchema[] {
  return skillDefs.map(generateSchema);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Convert kebab-case to snake_case. */
function toSnakeCase(name: string): string {
  return name.replace(/-/g, '_');
}

/** Create a slug property definition. */
function slugProp(description: string): JSONSchema7 {
  return {
    type: 'string',
    pattern: SLUG_PATTERN,
    description,
  };
}

// ---------------------------------------------------------------------------
// Known skill schema builders
// ---------------------------------------------------------------------------

type SchemaBuilder = (skillDef: SkillDef) => JSONSchema7;

const KNOWN_SCHEMAS: Record<string, SchemaBuilder> = {
  'gos-nicho-explorer': buildNichoExplorerSchema,
  'gos-mapear-nicho': buildMapearNichoSchema,
  'gos-cliente-radar': buildClienteRadarSchema,
  'gos-lp-builder': buildLpBuilderSchema,
  'gos-gtm-architect': buildGtmArchitectSchema,
  'gos-playbook-vendas': buildPlaybookVendasSchema,
  'gos-meeting-prep': buildMeetingPrepSchema,
  'gos-pitch-deck-builder': buildPitchDeckBuilderSchema,
};

// ---------------------------------------------------------------------------
// nicho_explorer
// ---------------------------------------------------------------------------

function buildNichoExplorerSchema(_skillDef: SkillDef): JSONSchema7 {
  return {
    type: 'object',
    properties: {
      mode: {
        type: 'string',
        enum: ['A', 'B'],
        description:
          'Mode A: Top 10 niches. Mode B: Validate specific niche (GO/NO-GO).',
      },
      nichoSlug: slugProp('Kebab-case niche slug (required for mode B).'),
      userProfile: {
        type: 'string',
        description: 'User profile description for ranking (mode A).',
      },
    },
    required: ['mode'],
    if: { properties: { mode: { const: 'B' } } },
    then: { required: ['nichoSlug'] },
    additionalProperties: false,
  };
}

// ---------------------------------------------------------------------------
// mapear_nicho
// ---------------------------------------------------------------------------

function buildMapearNichoSchema(_skillDef: SkillDef): JSONSchema7 {
  return {
    type: 'object',
    properties: {
      nichoSlug: slugProp('Kebab-case niche slug.'),
      nichoDescription: {
        type: 'string',
        description: 'Short description of the niche to map.',
      },
    },
    required: ['nichoSlug', 'nichoDescription'],
    additionalProperties: false,
  };
}

// ---------------------------------------------------------------------------
// cliente_radar
// ---------------------------------------------------------------------------

function buildClienteRadarSchema(_skillDef: SkillDef): JSONSchema7 {
  return {
    type: 'object',
    properties: {
      companyName: {
        type: 'string',
        description: 'Full company name for research.',
      },
      clienteSlug: slugProp('Kebab-case client slug.'),
      sector: {
        type: 'string',
        description: 'Industry sector of the company.',
      },
      websiteUrl: {
        type: 'string',
        description: 'Company website URL.',
      },
      decisionMakerName: {
        type: 'string',
        description: 'Name of the decision maker at the company.',
      },
    },
    required: ['companyName', 'clienteSlug'],
    additionalProperties: false,
  };
}

// ---------------------------------------------------------------------------
// lp_builder
// ---------------------------------------------------------------------------

function buildLpBuilderSchema(_skillDef: SkillDef): JSONSchema7 {
  return {
    type: 'object',
    properties: {
      mode: {
        type: 'string',
        enum: ['oferta', 'cliente'],
        description: 'Build LP for an offer or a client.',
      },
      ofertaSlug: slugProp(
        'Kebab-case offer slug (required when mode is "oferta").',
      ),
      clienteSlug: slugProp(
        'Kebab-case client slug (required when mode is "cliente").',
      ),
      angle: {
        type: 'string',
        enum: ['DOR', 'OPORTUNIDADE', 'SISTEMA'],
        description: 'LP persuasion angle.',
      },
      referenceUrl: {
        type: 'string',
        description: 'Reference URL for LP inspiration.',
      },
      aestheticSystem: {
        type: 'string',
        enum: ['editorial-serif', 'brutalist-grid', 'mono-tech'],
        description: 'Visual aesthetic system for the LP.',
      },
    },
    required: ['mode'],
    allOf: [
      {
        if: { properties: { mode: { const: 'oferta' } } },
        then: { required: ['ofertaSlug'] },
      },
      {
        if: { properties: { mode: { const: 'cliente' } } },
        then: { required: ['clienteSlug'] },
      },
    ],
    additionalProperties: false,
  };
}

// ---------------------------------------------------------------------------
// gtm_architect
// ---------------------------------------------------------------------------

function buildGtmArchitectSchema(_skillDef: SkillDef): JSONSchema7 {
  return {
    type: 'object',
    properties: {
      mode: {
        type: 'string',
        enum: ['outbound', 'content', 'combo'],
        description:
          'GTM strategy mode: outbound, content, or combo (both).',
      },
      nichoSlug: slugProp('Kebab-case niche slug.'),
      ofertaSlug: slugProp('Kebab-case offer slug.'),
      clienteSlug: slugProp('Kebab-case client slug.'),
    },
    required: ['mode', 'nichoSlug'],
    additionalProperties: false,
  };
}

// ---------------------------------------------------------------------------
// playbook_vendas
// ---------------------------------------------------------------------------

function buildPlaybookVendasSchema(_skillDef: SkillDef): JSONSchema7 {
  return {
    type: 'object',
    properties: {
      mode: {
        type: 'string',
        enum: ['oferta', 'cliente'],
        description: 'Build playbook for an offer or a client.',
      },
      ofertaSlug: slugProp(
        'Kebab-case offer slug (required when mode is "oferta").',
      ),
      clienteSlug: slugProp(
        'Kebab-case client slug (required when mode is "cliente").',
      ),
    },
    required: ['mode'],
    allOf: [
      {
        if: { properties: { mode: { const: 'oferta' } } },
        then: { required: ['ofertaSlug'] },
      },
      {
        if: { properties: { mode: { const: 'cliente' } } },
        then: { required: ['clienteSlug'] },
      },
    ],
    additionalProperties: false,
  };
}

// ---------------------------------------------------------------------------
// meeting_prep
// ---------------------------------------------------------------------------

function buildMeetingPrepSchema(_skillDef: SkillDef): JSONSchema7 {
  return {
    type: 'object',
    properties: {
      clienteSlug: slugProp('Kebab-case client slug.'),
    },
    required: ['clienteSlug'],
    additionalProperties: false,
  };
}

// ---------------------------------------------------------------------------
// pitch_deck_builder
// ---------------------------------------------------------------------------

function buildPitchDeckBuilderSchema(_skillDef: SkillDef): JSONSchema7 {
  return {
    type: 'object',
    properties: {
      nichoSlug: slugProp('Kebab-case niche slug.'),
      renderMode: {
        type: 'string',
        enum: ['reveal', 'gemini', 'markdown-only'],
        default: 'reveal',
        description:
          'Render mode for the deck (default: reveal).',
      },
      clienteSlug: slugProp('Kebab-case client slug.'),
      ofertaSlug: slugProp('Kebab-case offer slug.'),
    },
    required: ['nichoSlug'],
    additionalProperties: false,
  };
}

// ---------------------------------------------------------------------------
// Fallback: scope detection from requires / writesTo paths
// ---------------------------------------------------------------------------

/**
 * For skills not in the known mapping, detect required slug parameters
 * by inspecting `requires` and `writesTo` paths for scope patterns like
 * `nichos/{slug}/`, `clientes/{slug}/`, `ofertas/{slug}/`.
 */
function buildFallbackSchema(skillDef: SkillDef): JSONSchema7 {
  const allPaths = [
    ...skillDef.requires.blocking,
    ...skillDef.requires.recommended,
    ...skillDef.writesTo,
  ];

  const properties: Record<string, JSONSchema7> = {};
  const required: string[] = [];

  if (allPaths.some((p) => /nichos\/\{slug\}\//.test(p) || /nichos\/[^/]+\//.test(p))) {
    properties['nichoSlug'] = slugProp('Kebab-case niche slug.');
    required.push('nichoSlug');
  }

  if (allPaths.some((p) => /clientes\/\{slug\}\//.test(p) || /clientes\/[^/]+\//.test(p))) {
    properties['clienteSlug'] = slugProp('Kebab-case client slug.');
    required.push('clienteSlug');
  }

  if (allPaths.some((p) => /ofertas\/\{slug\}\//.test(p) || /ofertas\/[^/]+\//.test(p))) {
    properties['ofertaSlug'] = slugProp('Kebab-case offer slug.');
    required.push('ofertaSlug');
  }

  const schema: JSONSchema7 = {
    type: 'object',
    properties,
    additionalProperties: false,
  };

  if (required.length > 0) {
    schema.required = required;
  }

  return schema;
}
