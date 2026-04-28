/**
 * Shared TypeScript interfaces for the a360-mcp-server.
 *
 * All types defined here match the "Key Interfaces" section of the design document.
 */

// ---------------------------------------------------------------------------
// JSONSchema7 — Minimal subset used by the schema generator
// ---------------------------------------------------------------------------

/**
 * Minimal JSON Schema Draft 7 type covering the subset we actually use.
 * Avoids pulling in `@types/json-schema` as a dependency.
 */
export interface JSONSchema7 {
  type?: string;
  properties?: Record<string, JSONSchema7>;
  required?: string[];
  description?: string;
  enum?: unknown[];
  pattern?: string;
  default?: unknown;
  if?: JSONSchema7;
  then?: JSONSchema7;
  items?: JSONSchema7;
  additionalProperties?: boolean | JSONSchema7;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// SkillDef — Parsed SKILL.md representation
// ---------------------------------------------------------------------------

export interface SkillDef {
  /** Kebab-case skill identifier, e.g. "nicho-explorer" */
  name: string;
  /** Human-readable description */
  description: string;
  /** Free-text hint for the user */
  argumentHint: string;
  /** Claude Code tool names allowed by this skill */
  allowedTools: string[];
  /** Prerequisite paths / conditions */
  requires: {
    /** Paths/conditions that must exist before execution */
    blocking: string[];
    /** Paths that improve output quality but are not mandatory */
    recommended: string[];
  };
  /** Canonical output paths */
  writesTo: string[];
  /** Index files updated after execution */
  updatesIndex: string[];
  /** Absolute path to the source SKILL.md file */
  sourceFile: string;
}

// ---------------------------------------------------------------------------
// ToolSchema — Generated input schema for a tool
// ---------------------------------------------------------------------------

export interface ToolSchema {
  /** MCP tool name (kebab-case) */
  name: string;
  /** From SkillDef.description */
  description: string;
  /** Generated JSON Schema (Draft 7) */
  inputSchema: JSONSchema7;
}

// ---------------------------------------------------------------------------
// ToolResult — Structured response from tool execution
// ---------------------------------------------------------------------------

export interface ToolResult {
  /** Paths created or overwritten */
  filesWritten: string[];
  /** Paths modified (ledgers, indexes) */
  filesUpdated: string[];
  /** Non-blocking issues (e.g. missing recommended prereqs) */
  warnings: string[];
  /** Skill-specific data (scores, verdicts, etc.) */
  metadata?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// PrerequisiteCheckResult — Validation outcome
// ---------------------------------------------------------------------------

export interface PrerequisiteCheckResult {
  satisfied: boolean;
  missingBlocking: MissingPrerequisite[];
  missingRecommended: MissingPrerequisite[];
}

export interface MissingPrerequisite {
  /** The path that was expected */
  path: string;
  /** Why it's needed */
  reason: string;
  /** Which tool to run first */
  suggestedTool: string;
  /** If a status check failed — the current value */
  currentStatus?: string;
  /** If a status check failed — the expected value */
  requiredStatus?: string;
}

// ---------------------------------------------------------------------------
// ErrorResponse — Structured error
// ---------------------------------------------------------------------------

export type ErrorCode =
  | 'PREREQUISITE_MISSING'
  | 'INVALID_INPUT'
  | 'WORKSPACE_ERROR'
  | 'EXECUTION_ERROR';

export interface ErrorResponse {
  code: ErrorCode;
  /** PT-BR human-readable message */
  message: string;
  details?: MissingPrerequisite[] | Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// LedgerEntry — Row in a memory/shared/ ledger
// ---------------------------------------------------------------------------

export interface LedgerEntry {
  slug: string;
  /** Nichos only */
  sector?: string;
  /** Clientes only */
  company?: string;
  /** State machine value */
  status: string;
  /** ISO date */
  mappedDate?: string;
  /** Nichos only */
  mechanism?: string;
  /** Suggested next action */
  nextStep: string;
}
