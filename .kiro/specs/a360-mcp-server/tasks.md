# Implementation Plan: a360-mcp-server

## Overview

Build a TypeScript MCP server that wraps the 8 Accelera 360 framework-lite skills as programmatically callable tools. The implementation follows the module structure defined in the design document, building incrementally from foundational types and utilities through core logic modules, then wiring everything into the MCP server with resources and prompts. Each task references specific requirements and builds on previous tasks so there is no orphaned code.

## Tasks

- [x] 1. Set up project structure, dependencies, and shared types
  - [x] 1.1 Initialize `mcp-server/` directory with `package.json` and `tsconfig.json`
    - Create `mcp-server/package.json` with name `@accelera360/mcp-server`, `bin` entry pointing to `dist/bin/a360-mcp.js`, dependencies (`@modelcontextprotocol/sdk`, `yaml`), devDependencies (`typescript`, `vitest`, `fast-check`), and `scripts` for build/test
    - Create `mcp-server/tsconfig.json` targeting ES2022, module NodeNext, outDir `dist/`, strict mode enabled
    - _Requirements: 18.1, 18.2, 18.3, 16.3, 16.4_

  - [x] 1.2 Create `src/types.ts` with all shared interfaces
    - Define `SkillDef`, `ToolSchema`, `ToolResult`, `PrerequisiteCheckResult`, `MissingPrerequisite`, `ErrorResponse`, `ErrorCode`, and `LedgerEntry` interfaces exactly as specified in the design document
    - _Requirements: 2.1, 17.2, 17.4_

  - [x] 1.3 Create `src/error-codes.ts` with error constants and factory functions
    - Define the 4 error codes: `PREREQUISITE_MISSING`, `INVALID_INPUT`, `WORKSPACE_ERROR`, `EXECUTION_ERROR`
    - Implement factory functions that produce `ErrorResponse` objects with PT-BR messages
    - _Requirements: 17.1, 17.4_

  - [x] 1.4 Create `src/slug-utils.ts` with slug validation and normalization
    - Implement `isValidSlug(slug: string): boolean` that validates against `^[a-z0-9]+(-[a-z0-9]+)*$`
    - Implement `normalizeToSlug(input: string): string` that lowercases, removes accents, replaces spaces/underscores with hyphens, and strips invalid characters
    - _Requirements: 15.5, 15.6_

  - [ ]* 1.5 Write property test for slug validation (Property 7)
    - **Property 7: Slug validation**
    - Generate random strings (ASCII, Unicode, accented, with/without hyphens) and verify the validator accepts if and only if the string matches `^[a-z0-9]+(-[a-z0-9]+)*$`
    - **Validates: Requirements 15.5, 15.6**

- [x] 2. Implement SKILL.md parser and schema generator
  - [x] 2.1 Create `src/skill-parser.ts` — SKILL.md discovery and YAML parsing
    - Implement `parseSkillFile(filePath: string): SkillDef | null` that reads a SKILL.md file, extracts YAML frontmatter between `---` delimiters, parses it with the `yaml` library, and maps fields (`name`, `description`, `argument-hint`, `requires`, `writes_to`, `updates_index`) to a `SkillDef` object
    - Implement `parseAllSkills(repoRoot: string): { skills: SkillDef[]; warnings: { file: string; error: string }[] }` that globs `.claude/skills/**/SKILL.md`, calls `parseSkillFile` for each, collects valid results and warnings for malformed files
    - On malformed YAML: skip the file, log a warning with file path and parse error, continue loading remaining skills
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 18.4_

  - [ ]* 2.2 Write property test for YAML round-trip (Property 1)
    - **Property 1: YAML frontmatter round-trip**
    - Generate random `SkillDef` objects with varying field lengths, array sizes, and special characters; serialize to YAML frontmatter then parse back; assert deep equality
    - **Validates: Requirements 2.1, 2.4, 2.5**

  - [ ]* 2.3 Write property test for parser resilience (Property 2)
    - **Property 2: Parser resilience and tool count invariant**
    - Generate mixed sets of N valid YAML frontmatter files and M malformed files; assert parser returns exactly N `SkillDef` objects and M warnings
    - **Validates: Requirements 2.2, 2.3**

  - [x] 2.4 Create `src/schema-generator.ts` — JSON Schema generation from SkillDef
    - Implement `generateSchema(skillDef: SkillDef): ToolSchema` that maps each skill to a JSON Schema `inputSchema` based on the skill name, `requires`, `writesTo`, and `argumentHint` fields
    - For skills operating on niches (`writesTo` or `requires` paths contain `nichos/{slug}/`): include required `nichoSlug` string property with kebab-case pattern
    - For skills operating on clients (`clientes/{slug}/`): include required `clienteSlug` string property
    - For skills operating on offers (`ofertas/{slug}/`): include required `ofertaSlug` string property
    - For skills with multiple modes (nicho_explorer A/B, lp_builder oferta/cliente, gtm_architect outbound/content/combo, playbook_vendas oferta/cliente): include required `mode` enum parameter
    - For pitch_deck_builder: include optional `renderMode` enum (reveal, gemini, markdown-only) with default `reveal`
    - Implement `generateAllSchemas(skillDefs: SkillDef[]): ToolSchema[]`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ]* 2.5 Write property test for valid JSON Schema output (Property 3)
    - **Property 3: Generated schemas are valid JSON Schema**
    - Generate random `SkillDef` objects; assert the output is a valid JSON Schema Draft 7 object with `type: "object"` root and `properties` map
    - **Validates: Requirements 3.1**

  - [ ]* 2.6 Write property test for scope-based slug inclusion (Property 4)
    - **Property 4: Scope-based slug parameter inclusion**
    - Generate `SkillDef` objects with paths containing `nichos/{slug}/`, `clientes/{slug}/`, or `ofertas/{slug}/`; assert the generated schema includes the corresponding required slug property
    - **Validates: Requirements 3.2, 3.3**

- [x] 3. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement workspace manager and prerequisite validator
  - [x] 4.1 Create `src/workspace-manager.ts` — path resolution, directory creation, file I/O
    - Implement `resolvePath(workspaceRoot: string, relativePath: string): string` that resolves canonical paths relative to workspace root, rejecting `..` segments that escape the workspace boundary
    - Implement `ensureDirectory(workspaceRoot: string, scope: string, slug: string): Promise<void>` that creates `{scope}/{slug}/` by copying from `{scope}/_modelo/` if the template exists, or creating an empty directory otherwise
    - Implement `readFile(workspaceRoot: string, relativePath: string): Promise<string>` and `writeFile(workspaceRoot: string, relativePath: string, content: string): Promise<void>` with proper error wrapping as `WORKSPACE_ERROR`
    - Implement `parseFrontmatter(content: string): Record<string, string>` to extract YAML frontmatter from markdown files (for status checks)
    - _Requirements: 15.1, 15.2, 15.3, 15.4_

  - [ ]* 4.2 Write property test for path resolution (Property 8)
    - **Property 8: Path resolution relative to workspace root**
    - Generate random workspace roots and relative paths (including `..` escape attempts); assert resolved path always starts with workspace root and contains no escaping `..` segments
    - **Validates: Requirements 15.1**

  - [ ]* 4.3 Write property test for directory creation from template (Property 9)
    - **Property 9: Directory creation from template**
    - Generate random slugs and scopes with mock `_modelo/` structures; assert `ensureDirectory` creates the target with the same file structure as the template
    - **Validates: Requirements 15.2, 15.3, 15.4**

  - [x] 4.4 Create `src/prerequisite-validator.ts` — blocking and recommended prerequisite checks
    - Implement `validatePrerequisites(skillDef: SkillDef, args: Record<string, unknown>, workspaceRoot: string): Promise<PrerequisiteCheckResult>` that:
      - Checks all `requires.blocking` paths against the workspace filesystem
      - For paths requiring a specific status in `_index.md` frontmatter (e.g., `status=mapped`), parses the frontmatter and verifies the status value
      - Returns `satisfied: true` when all blocking paths exist with matching statuses
      - Returns `missingBlocking` array listing each missing path with reason, suggested tool, and status mismatch details
      - Checks `requires.recommended` paths and returns `missingRecommended` array with warnings for each missing recommended path
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [ ]* 4.5 Write property test for prerequisite validation completeness (Property 5)
    - **Property 5: Prerequisite validation completeness**
    - Generate random `SkillDef` objects with blocking prerequisites and random workspace states; assert every missing blocking path is reported, and when all exist with matching statuses, `satisfied` is `true`
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5**

  - [ ]* 4.6 Write property test for recommended prerequisite warnings (Property 6)
    - **Property 6: Recommended prerequisite warnings**
    - Generate random recommended paths and workspace states; assert exactly one warning per missing recommended path and zero warnings for existing ones
    - **Validates: Requirements 4.6**

- [x] 5. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement tool executor with skill-specific handlers
  - [x] 6.1 Create `src/tool-executor.ts` — tool execution orchestration
    - Implement `executeTool(skillDef: SkillDef, args: Record<string, unknown>, workspaceRoot: string): Promise<ToolResult>` that:
      - Validates input slug parameters using `slug-utils`
      - Runs prerequisite validation via `prerequisite-validator`
      - Ensures target directories exist via `workspace-manager`
      - Delegates to skill-specific execution logic based on `skillDef.name`
      - Returns structured `ToolResult` with `filesWritten`, `filesUpdated`, `warnings`, and optional `metadata`
      - Wraps unexpected errors: logs stack trace to stderr, returns generic `EXECUTION_ERROR` with safe PT-BR message (no internal details exposed)
    - Implement skill-specific handlers for all 8 tools:
      - `nicho_explorer` (mode A: write `nichos-top10.md`; mode B: write `nichos/{slug}/00-validacao.md`, update `_index.md`)
      - `mapear_nicho` (write 9 files `01-09` to `nichos/{slug}/`, update `_index.md` to `status: mapped`, update ledger)
      - `cliente_radar` (write `clientes/{slug}/00-perfil.md`, update `_index.md` to `status: radar-done`, update ledger)
      - `lp_builder` (write `lp.md`, `lp.html`, `README-customizar.md` to appropriate scope path)
      - `gtm_architect` (write `outbound.md` and/or `content.md` to appropriate scope path based on mode)
      - `playbook_vendas` (write playbook to appropriate scope path based on mode)
      - `meeting_prep` (write `clientes/{slug}/01-meeting-prep.md`, update `_index.md` to `status: meeting-prep-done`)
      - `pitch_deck_builder` (write `deck.html` + 20 slide markdown files for reveal mode, or only slides for markdown-only mode)
    - _Requirements: 5.1–5.4, 6.1–6.3, 7.1–7.3, 8.1–8.3, 9.1–9.3, 10.1–10.2, 11.1–11.2, 12.1–12.3, 17.1, 17.2, 17.3_

  - [ ]* 6.2 Write property test for response structure invariant (Property 13)
    - **Property 13: Response structure invariant**
    - Generate random successful `ToolResult` objects and failed `ErrorResponse` objects; assert successful responses always contain `filesWritten`, `filesUpdated`, `warnings` arrays; failed responses always contain a valid `code` and non-empty `message`
    - **Validates: Requirements 17.1, 17.2, 17.4**

  - [ ]* 6.3 Write property test for error sanitization (Property 14)
    - **Property 14: Error sanitization**
    - Generate random Error objects with arbitrary messages, stack traces, and internal file paths; assert the error response returned to the client contains only `EXECUTION_ERROR` code and a safe PT-BR message, with no stack trace, internal paths, or raw error message
    - **Validates: Requirements 17.3**

- [x] 7. Implement MCP resource and prompt registries
  - [x] 7.1 Create `src/resource-registry.ts` — MCP resource registration
    - Implement `registerResources(server: McpServer, workspaceRoot: string): void` that registers:
      - `a360://ledgers/nichos-mapeados` → `memory/shared/nichos-mapeados.md`
      - `a360://ledgers/clientes-ativos` → `memory/shared/clientes-ativos.md`
      - `a360://ledgers/ofertas` → `memory/shared/ofertas.md`
      - `a360://config/identidade` → `identidade.json`
      - `a360://outputs/{scope}/{slug}/{artifact}` → dynamic resource template resolving to `{workspaceRoot}/{scope}/{slug}/{artifact}`
    - Return error response when a resource file does not exist in the workspace
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6_

  - [ ]* 7.2 Write property test for output resource URI resolution (Property 10)
    - **Property 10: Output resource URI resolution**
    - Generate random valid scope/slug/artifact triples; assert `a360://outputs/{scope}/{slug}/{artifact}` resolves to `{workspaceRoot}/{scope}/{slug}/{artifact}`
    - **Validates: Requirements 13.6**

  - [x] 7.3 Create `src/prompt-registry.ts` — MCP prompt (pipeline) registration
    - Implement `registerPrompts(server: McpServer, workspaceRoot: string, toolExecutor: Function): void` that registers the 5 pipelines:
      - `prospect-meeting`: `cliente_radar` → `mapear_nicho` → `pitch_deck_builder` → `meeting_prep`
      - `business-foundation`: `nicho_explorer` (B) → `mapear_nicho` → `gtm_architect` (combo) → `lp_builder`
      - `client-deliverable`: `cliente_radar` → `mapear_nicho` → `lp_builder` → `pitch_deck_builder`
      - `niche-discovery`: `nicho_explorer` (A) → `mapear_nicho`
      - `quick-pitch-deck`: `mapear_nicho` → `pitch_deck_builder`
    - Implement pipeline execution that passes output context from each tool to the next
    - On tool failure: stop pipeline, return error from failed tool plus results from previously completed tools
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7_

  - [ ]* 7.4 Write property test for pipeline context passing (Property 11)
    - **Property 11: Pipeline context passing**
    - Generate random pipeline lengths with mock tool outputs; assert the Nth tool receives accumulated outputs from tools 1 through N-1
    - **Validates: Requirements 14.6**

  - [ ]* 7.5 Write property test for pipeline partial failure (Property 12)
    - **Property 12: Pipeline partial failure**
    - Generate random pipeline lengths and failure positions K; assert result contains successful results from tools 1 through K-1, error from tool K, and no results from tools K+1 through N
    - **Validates: Requirements 14.7**

- [x] 8. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Wire everything together — CLI entry point and MCP server setup
  - [x] 9.1 Create `src/index.ts` — McpServer setup, tool/resource/prompt registration, and connect
    - Import all modules: `skill-parser`, `schema-generator`, `prerequisite-validator`, `workspace-manager`, `tool-executor`, `resource-registry`, `prompt-registry`
    - Implement `createServer(workspaceRoot: string, repoRoot: string): Promise<McpServer>` that:
      - Calls `parseAllSkills(repoRoot)` to discover skills
      - If `.claude/skills/` directory not found, throw descriptive error and exit with non-zero code
      - Calls `generateAllSchemas(skills)` to build tool schemas
      - Creates `McpServer` instance with name `a360-mcp-server` and version from `package.json`
      - Registers each tool with its schema and a handler that calls `executeTool`
      - Calls `registerResources` and `registerPrompts`
      - Logs the number of tools, resources, and prompts registered to stderr
      - Returns the configured server
    - _Requirements: 1.4, 1.5, 1.6, 2.3_

  - [x] 9.2 Create `bin/a360-mcp.ts` — CLI entry point with arg parsing
    - Add shebang `#!/usr/bin/env node`
    - Parse `--workspace` argument (default to `process.cwd()`)
    - Determine repo root (directory containing `.claude/skills/`)
    - Call `createServer(workspaceRoot, repoRoot)`
    - Create `StdioServerTransport` and connect
    - Handle startup errors: log descriptive message and exit with non-zero code
    - _Requirements: 1.1, 1.2, 1.3, 16.2_

  - [ ]* 9.3 Write integration tests for server startup and tool invocation
    - Test server starts and responds to MCP `initialize` with correct tool/resource/prompt counts
    - Test each of the 8 tools: invoke with valid input against a temp workspace, verify files written to correct canonical paths
    - Test error scenarios: missing skills directory, malformed SKILL.md, missing prerequisite, invalid slug
    - Test resource read: read each ledger resource, verify content matches filesystem
    - _Requirements: 1.4, 1.5, 1.6, 2.2, 4.2, 15.5_

- [x] 10. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation after each major module group
- Property tests validate the 14 universal correctness properties defined in the design document using `fast-check`
- Unit tests validate specific examples and edge cases using `vitest`
- All code is TypeScript targeting Node.js 18+, compiled to JavaScript for distribution
- The MCP server uses stdio transport exclusively — no HTTP server needed
- SKILL.md files are read from the repo's `.claude/skills/` directory at runtime (no duplication)
