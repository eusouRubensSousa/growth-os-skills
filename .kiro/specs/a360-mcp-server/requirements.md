# Requirements Document

## Introduction

The a360-mcp-server is a Model Context Protocol (MCP) server that exposes the 8 Accelera 360 framework-lite skills as programmatically callable tools from any MCP-compatible client (Node.js backends, chatbots, dashboards, SaaS products). The server lives inside the existing `a360-framework-lite` monorepo under `mcp-server/`, reads the existing SKILL.md files for I/O contracts, reads/writes to the canonical workspace paths, validates prerequisites before executing tools, and exposes workspace state as MCP resources and pre-built pipelines as MCP prompts. It is published as an npm package runnable via `npx`.

## Glossary

- **MCP_Server**: The TypeScript Node.js process that implements the Model Context Protocol, exposing tools, resources, and prompts to MCP clients.
- **MCP_Client**: Any application that connects to the MCP_Server using the Model Context Protocol (e.g., a Node.js backend, a chatbot, Claude Desktop).
- **Tool**: An MCP primitive representing a callable skill. Each of the 8 Accelera 360 skills is exposed as one tool.
- **Resource**: An MCP primitive representing readable workspace state (ledgers, generated outputs, visual identity).
- **Prompt**: An MCP primitive representing a pre-built pipeline template that chains multiple tools in sequence.
- **SKILL_MD**: The SKILL.md file inside each skill directory under `.claude/skills/`, containing YAML frontmatter with the skill's I/O contract (`name`, `description`, `requires`, `writes_to`, `updates_index`, `allowed-tools`).
- **Workspace**: The user's local directory following the canonical PARA + Johnny.Decimal structure defined in WORKSPACE.md, where all skill outputs are written.
- **Prerequisite**: A blocking or recommended dependency declared in a skill's `requires:` block that must be satisfied before the skill can execute.
- **Ledger**: A markdown table in `memory/shared/` that tracks state across skills (mapped niches, active clients, offers).
- **Pipeline**: A predefined sequence of tool invocations that fulfills a high-level user intent (e.g., prospect-meeting, business-foundation).
- **Canonical_Path**: A workspace-relative file path defined in WORKSPACE.md where skills read from and write to (e.g., `nichos/{slug}/03-mecanismo.md`).

## Requirements

### Requirement 1: MCP Server Initialization and Transport

**User Story:** As a backend developer, I want to start the MCP server and connect to it from my application, so that I can call Accelera 360 skills programmatically.

#### Acceptance Criteria

1. WHEN the MCP_Server process is started, THE MCP_Server SHALL accept a `--workspace` argument specifying the absolute path to the user's workspace directory.
2. WHEN no `--workspace` argument is provided, THE MCP_Server SHALL default to the current working directory as the workspace root.
3. WHEN the MCP_Server starts, THE MCP_Server SHALL support the stdio transport as defined by the MCP specification.
4. WHEN the MCP_Server starts, THE MCP_Server SHALL read all SKILL_MD files from the `.claude/skills/` directory relative to the repository root to build the tool registry.
5. IF the `.claude/skills/` directory is not found at the expected path, THEN THE MCP_Server SHALL return a descriptive error message indicating the skills directory is missing and exit with a non-zero code.
6. WHEN the MCP_Server starts successfully, THE MCP_Server SHALL log the number of tools, resources, and prompts registered.

### Requirement 2: SKILL.md Parsing and Tool Registry

**User Story:** As a backend developer, I want the MCP server to automatically discover skills from SKILL.md files, so that I do not need to manually configure each tool.

#### Acceptance Criteria

1. WHEN the MCP_Server reads a SKILL_MD file, THE MCP_Server SHALL parse the YAML frontmatter to extract `name`, `description`, `argument-hint`, `requires`, `writes_to`, and `updates_index` fields.
2. WHEN the YAML frontmatter of a SKILL_MD file is malformed, THE MCP_Server SHALL skip that skill, log a warning with the file path and parse error, and continue loading remaining skills.
3. THE MCP_Server SHALL register one MCP tool per valid SKILL_MD file, using the `name` field as the tool name and the `description` field as the tool description.
4. WHEN a SKILL_MD file contains a `requires.blocking` array, THE MCP_Server SHALL store those prerequisites in the tool metadata for runtime validation.
5. FOR ALL valid SKILL_MD files parsed and then serialized back to YAML, parsing the serialized output SHALL produce an equivalent data structure (round-trip property).

### Requirement 3: Tool Input Schema Generation

**User Story:** As a backend developer, I want each tool to have a well-defined JSON Schema for its inputs, so that my application can validate parameters before calling a tool.

#### Acceptance Criteria

1. THE MCP_Server SHALL generate a JSON Schema `inputSchema` for each registered tool based on the skill's `argument-hint` and `requires` fields from the SKILL_MD.
2. WHEN a tool corresponds to a skill that operates on a niche (reads from `nichos/{slug}/`), THE MCP_Server SHALL include a required `nichoSlug` string parameter in the tool's input schema.
3. WHEN a tool corresponds to a skill that operates on a client (reads from `clientes/{slug}/`), THE MCP_Server SHALL include a required `clienteSlug` string parameter in the tool's input schema.
4. WHEN a tool corresponds to a skill that supports multiple modes (e.g., nicho_explorer with mode A/B, lp_builder with oferta/cliente), THE MCP_Server SHALL include a required `mode` enum parameter in the tool's input schema.
5. WHEN a tool corresponds to a skill that supports render modes (e.g., pitch_deck_builder with reveal/gemini/markdown-only), THE MCP_Server SHALL include an optional `renderMode` enum parameter in the tool's input schema with a documented default.

### Requirement 4: Prerequisite Validation Before Tool Execution

**User Story:** As a backend developer, I want the server to validate prerequisites before running a skill, so that I get clear error messages instead of degraded outputs.

#### Acceptance Criteria

1. WHEN an MCP_Client invokes a tool, THE MCP_Server SHALL check all `requires.blocking` paths declared in the corresponding SKILL_MD against the workspace filesystem before executing the skill.
2. WHEN a blocking prerequisite path does not exist in the workspace, THE MCP_Server SHALL return an error response listing each missing prerequisite path and suggesting which tool to run first to produce it.
3. WHEN a blocking prerequisite requires a specific status in a `_index.md` frontmatter (e.g., `status=mapped`), THE MCP_Server SHALL parse the frontmatter and verify the status value matches.
4. IF a blocking prerequisite status check fails, THEN THE MCP_Server SHALL return an error response stating the current status, the required status, and which tool to run to advance the status.
5. WHEN all blocking prerequisites are satisfied, THE MCP_Server SHALL proceed with tool execution.
6. WHEN a `requires.recommended` path is missing, THE MCP_Server SHALL include a warning in the tool response indicating the recommended prerequisite is absent and the output may be less detailed.

### Requirement 5: Tool Execution — nicho_explorer

**User Story:** As a backend developer, I want to call the nicho_explorer tool to research niches programmatically, so that my application can present niche recommendations to users.

#### Acceptance Criteria

1. WHEN the MCP_Client invokes `nicho_explorer` with mode A, THE MCP_Server SHALL return a structured result containing a ranked list of up to 10 niches, each with scores for market size, growth, pain intensity, and AI applicability.
2. WHEN the MCP_Client invokes `nicho_explorer` with mode B and a `nichoSlug`, THE MCP_Server SHALL return a structured result containing a GO/NO-GO/MAYBE verdict with TAM/SAM/SOM estimates, top 3 pains, and supporting evidence.
3. WHEN `nicho_explorer` mode B completes successfully, THE MCP_Server SHALL write the validation output to `nichos/{slug}/00-validacao.md` in the workspace.
4. WHEN `nicho_explorer` mode A completes successfully, THE MCP_Server SHALL write the overview to `nichos-top10.md` at the workspace root.

### Requirement 6: Tool Execution — mapear_nicho

**User Story:** As a backend developer, I want to call the mapear_nicho tool to generate a complete niche mapping, so that downstream tools (LP, deck, playbook) have the data they need.

#### Acceptance Criteria

1. WHEN the MCP_Client invokes `mapear_nicho` with a `nichoSlug`, THE MCP_Server SHALL write the 9 Johnny.Decimal files (01 through 09) to `nichos/{slug}/` in the workspace.
2. WHEN `mapear_nicho` completes successfully, THE MCP_Server SHALL update `nichos/{slug}/_index.md` frontmatter to `status: mapped`.
3. WHEN `mapear_nicho` completes successfully, THE MCP_Server SHALL update the `memory/shared/nichos-mapeados.md` ledger with the new entry.

### Requirement 7: Tool Execution — cliente_radar

**User Story:** As a backend developer, I want to call the cliente_radar tool to research a prospect, so that my application can prepare meeting briefings.

#### Acceptance Criteria

1. WHEN the MCP_Client invokes `cliente_radar` with a company name and `clienteSlug`, THE MCP_Server SHALL write the prospect profile to `clientes/{slug}/00-perfil.md` in the workspace.
2. WHEN `cliente_radar` completes successfully, THE MCP_Server SHALL update `clientes/{slug}/_index.md` frontmatter to `status: radar-done`.
3. WHEN `cliente_radar` completes successfully, THE MCP_Server SHALL add an entry to `memory/shared/clientes-ativos.md`.

### Requirement 8: Tool Execution — lp_builder

**User Story:** As a backend developer, I want to call the lp_builder tool to generate landing pages, so that my application can deliver LP copy and HTML to users.

#### Acceptance Criteria

1. WHEN the MCP_Client invokes `lp_builder` in mode `oferta` with an `ofertaSlug`, THE MCP_Server SHALL write `lp.md`, `lp.html`, and `README-customizar.md` to `ofertas/{slug}/lp/` in the workspace.
2. WHEN the MCP_Client invokes `lp_builder` in mode `cliente` with a `clienteSlug`, THE MCP_Server SHALL write `lp.md`, `lp.html`, and `README-customizar.md` to `clientes/{slug}/lp/` in the workspace.
3. WHEN `lp_builder` completes successfully, THE MCP_Server SHALL include the CRO self-check score and anti-AI score in the tool response.

### Requirement 9: Tool Execution — gtm_architect

**User Story:** As a backend developer, I want to call the gtm_architect tool to generate go-to-market strategies, so that my application can deliver outbound and content plans.

#### Acceptance Criteria

1. WHEN the MCP_Client invokes `gtm_architect` with mode `outbound`, THE MCP_Server SHALL write `outbound.md` to the appropriate scope path (`ofertas/{slug}/gtm/` or `clientes/{slug}/gtm/`).
2. WHEN the MCP_Client invokes `gtm_architect` with mode `content`, THE MCP_Server SHALL write `content.md` to the appropriate scope path.
3. WHEN the MCP_Client invokes `gtm_architect` with mode `combo`, THE MCP_Server SHALL write both `outbound.md` and `content.md` to the appropriate scope path.

### Requirement 10: Tool Execution — playbook_vendas

**User Story:** As a backend developer, I want to call the playbook_vendas tool to generate sales scripts, so that my application can deliver sales playbooks to users.

#### Acceptance Criteria

1. WHEN the MCP_Client invokes `playbook_vendas` in mode `oferta`, THE MCP_Server SHALL write the playbook to `ofertas/{slug}/playbook.md`.
2. WHEN the MCP_Client invokes `playbook_vendas` in mode `cliente`, THE MCP_Server SHALL write the playbook to `clientes/{slug}/02-playbook.md`.

### Requirement 11: Tool Execution — meeting_prep

**User Story:** As a backend developer, I want to call the meeting_prep tool to generate meeting briefings, so that my application can deliver 1-page briefings for sales meetings.

#### Acceptance Criteria

1. WHEN the MCP_Client invokes `meeting_prep` with a `clienteSlug`, THE MCP_Server SHALL write the briefing to `clientes/{slug}/01-meeting-prep.md`.
2. WHEN `meeting_prep` completes successfully, THE MCP_Server SHALL update `clientes/{slug}/_index.md` frontmatter to `status: meeting-prep-done`.

### Requirement 12: Tool Execution — pitch_deck_builder

**User Story:** As a backend developer, I want to call the pitch_deck_builder tool to generate presentation decks, so that my application can deliver slide decks to users.

#### Acceptance Criteria

1. WHEN the MCP_Client invokes `pitch_deck_builder` with renderMode `reveal`, THE MCP_Server SHALL write `deck.html` and 20 slide markdown files to the appropriate scope path (`ofertas/{slug}/deck/` or `clientes/{slug}/deck/`).
2. WHEN the MCP_Client invokes `pitch_deck_builder` with renderMode `markdown-only`, THE MCP_Server SHALL write only the 20 slide markdown files to `slides-md/` under the appropriate scope path.
3. WHEN `pitch_deck_builder` completes successfully, THE MCP_Server SHALL include the self-check score in the tool response.

### Requirement 13: MCP Resources — Workspace State

**User Story:** As a backend developer, I want to read workspace state (ledgers, outputs, identity) through MCP resources, so that my application can display current state without parsing files manually.

#### Acceptance Criteria

1. THE MCP_Server SHALL expose the `memory/shared/nichos-mapeados.md` ledger as an MCP resource with URI `a360://ledgers/nichos-mapeados`.
2. THE MCP_Server SHALL expose the `memory/shared/clientes-ativos.md` ledger as an MCP resource with URI `a360://ledgers/clientes-ativos`.
3. THE MCP_Server SHALL expose the `memory/shared/ofertas.md` ledger as an MCP resource with URI `a360://ledgers/ofertas`.
4. THE MCP_Server SHALL expose the `identidade.json` file as an MCP resource with URI `a360://config/identidade`.
5. WHEN an MCP_Client reads a resource that does not exist in the workspace, THE MCP_Server SHALL return an error response indicating the resource file is not found.
6. THE MCP_Server SHALL expose generated outputs (LPs, decks, briefings) as MCP resources using a URI pattern `a360://outputs/{scope}/{slug}/{artifact}` where scope is `nichos`, `clientes`, or `ofertas`.

### Requirement 14: MCP Prompts — Pre-built Pipelines

**User Story:** As a backend developer, I want to invoke pre-built pipelines through MCP prompts, so that my application can orchestrate multi-step workflows with a single call.

#### Acceptance Criteria

1. THE MCP_Server SHALL register the `prospect-meeting` prompt that chains `cliente_radar`, `mapear_nicho`, `pitch_deck_builder`, and `meeting_prep` in sequence.
2. THE MCP_Server SHALL register the `business-foundation` prompt that chains `nicho_explorer` (mode B), `mapear_nicho`, `gtm_architect` (combo), and `lp_builder` in sequence.
3. THE MCP_Server SHALL register the `client-deliverable` prompt that chains `cliente_radar`, `mapear_nicho`, `lp_builder`, and `pitch_deck_builder` in sequence.
4. THE MCP_Server SHALL register the `niche-discovery` prompt that chains `nicho_explorer` (mode A) followed by `mapear_nicho` for a user-selected niche.
5. THE MCP_Server SHALL register the `quick-pitch-deck` prompt that chains `mapear_nicho` and `pitch_deck_builder` in sequence.
6. WHEN a prompt is invoked, THE MCP_Server SHALL pass the output context of each tool as input to the next tool in the pipeline sequence.
7. IF a tool in a pipeline fails, THEN THE MCP_Server SHALL stop the pipeline, return the error from the failed tool, and include the results of tools that completed successfully before the failure.

### Requirement 15: Workspace Path Resolution and File Operations

**User Story:** As a backend developer, I want the server to correctly resolve and manage workspace paths, so that all outputs land in the canonical locations defined by WORKSPACE.md.

#### Acceptance Criteria

1. THE MCP_Server SHALL resolve all canonical paths relative to the workspace root provided at startup.
2. WHEN a tool writes to a path under `nichos/{slug}/` and the directory does not exist, THE MCP_Server SHALL create the directory by copying the structure from `nichos/_modelo/` (if the template directory exists).
3. WHEN a tool writes to a path under `clientes/{slug}/` and the directory does not exist, THE MCP_Server SHALL create the directory by copying the structure from `clientes/_modelo/`.
4. WHEN a tool writes to a path under `ofertas/{slug}/` and the directory does not exist, THE MCP_Server SHALL create the directory by copying the structure from `ofertas/_modelo/`.
5. THE MCP_Server SHALL validate that slug parameters conform to kebab-case format (lowercase, no accents, hyphens only) before using them in file paths.
6. IF a slug parameter contains invalid characters, THEN THE MCP_Server SHALL return an error response describing the valid slug format.

### Requirement 16: npm Package and CLI Distribution

**User Story:** As a backend developer, I want to install and run the MCP server via npm/npx, so that I can integrate it into my project without cloning the full repo.

#### Acceptance Criteria

1. THE MCP_Server SHALL be publishable as an npm package named `@accelera360/mcp-server` (or equivalent scoped name).
2. WHEN a user runs `npx @accelera360/mcp-server --workspace /path/to/workspace`, THE MCP_Server SHALL start and connect via stdio transport.
3. THE MCP_Server SHALL include a `bin` entry in `package.json` that maps to the compiled CLI entry point.
4. THE MCP_Server SHALL target Node.js 18 or later as the minimum supported runtime.

### Requirement 17: Error Handling and Structured Responses

**User Story:** As a backend developer, I want consistent, structured error responses from the MCP server, so that my application can handle failures gracefully.

#### Acceptance Criteria

1. WHEN a tool execution encounters an error, THE MCP_Server SHALL return an MCP error response with a machine-readable error code and a human-readable message in Portuguese (PT-BR).
2. WHEN a tool completes successfully, THE MCP_Server SHALL return a structured result containing the list of files written, files updated, and any warnings.
3. IF an unexpected error occurs during tool execution, THEN THE MCP_Server SHALL catch the error, log the stack trace, and return a generic error response without exposing internal details to the MCP_Client.
4. THE MCP_Server SHALL use consistent error codes: `PREREQUISITE_MISSING` for failed prerequisite checks, `INVALID_INPUT` for schema validation failures, `WORKSPACE_ERROR` for filesystem errors, and `EXECUTION_ERROR` for skill execution failures.

### Requirement 18: Monorepo Structure and Build

**User Story:** As a contributor, I want the MCP server to live cleanly inside the existing monorepo, so that it can reference skill files without duplication.

#### Acceptance Criteria

1. THE MCP_Server source code SHALL reside in the `mcp-server/` directory at the repository root.
2. THE MCP_Server SHALL have its own `package.json` with its own dependencies, separate from the root repository.
3. THE MCP_Server SHALL use TypeScript as the implementation language and compile to JavaScript for distribution.
4. THE MCP_Server SHALL reference SKILL_MD files from the repository's `.claude/skills/` directory at build time or runtime, without duplicating skill definitions.
