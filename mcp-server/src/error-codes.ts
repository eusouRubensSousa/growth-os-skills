/**
 * Error code constants and factory functions for structured error responses.
 *
 * All user-facing messages are in PT-BR as required by the spec.
 */

import type { ErrorCode, ErrorResponse, MissingPrerequisite } from './types.js';

// ---------------------------------------------------------------------------
// Error code constants
// ---------------------------------------------------------------------------

export const PREREQUISITE_MISSING: ErrorCode = 'PREREQUISITE_MISSING';
export const INVALID_INPUT: ErrorCode = 'INVALID_INPUT';
export const WORKSPACE_ERROR: ErrorCode = 'WORKSPACE_ERROR';
export const EXECUTION_ERROR: ErrorCode = 'EXECUTION_ERROR';

// ---------------------------------------------------------------------------
// Factory functions
// ---------------------------------------------------------------------------

/**
 * Build an error for missing blocking prerequisites.
 */
export function prerequisiteMissing(
  missing: MissingPrerequisite[],
): ErrorResponse {
  const paths = missing.map((m) => m.path).join(', ');
  return {
    code: PREREQUISITE_MISSING,
    message: `Pré-requisito ausente: ${paths}. Execute a ferramenta sugerida antes de prosseguir.`,
    details: missing,
  };
}

/**
 * Build an error for invalid input (schema validation or malformed slug).
 */
export function invalidInput(
  detail: string,
  extra?: Record<string, unknown>,
): ErrorResponse {
  return {
    code: INVALID_INPUT,
    message: `Entrada inválida: ${detail}`,
    details: extra,
  };
}

/**
 * Build an error for workspace filesystem problems.
 */
export function workspaceError(
  detail: string,
  extra?: Record<string, unknown>,
): ErrorResponse {
  return {
    code: WORKSPACE_ERROR,
    message: `Erro no workspace: ${detail}`,
    details: extra,
  };
}

/**
 * Build a generic execution error (safe for client consumption — no internals).
 */
export function executionError(skillName: string): ErrorResponse {
  return {
    code: EXECUTION_ERROR,
    message: `Erro inesperado durante execução da skill ${skillName}. Verifique os logs do servidor.`,
  };
}
