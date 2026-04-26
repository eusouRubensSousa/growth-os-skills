# Snippet: progress.txt template para projetos longos
#
# Use em `projects/<slug>/progress.txt`. Permite reset de contexto
# (limpar histórico inflado) sem perder progresso entre sessões.
#
# A cada checkpoint significativo (ou no fim do heartbeat), o agente atualiza
# este arquivo. Quando contexto enche, próxima sessão começa lendo este arquivo.

## Status: in_progress
## Last Update: 2026-04-25T14:30:00Z
## Last Agent: engineer-bot
## Heartbeat ID: hb-2026042514300012

## Goal
Implement user authentication with JWT + refresh tokens. Must be backwards
compatible with existing session-based clients during 30-day rollout.

## Done
- [x] Implemented user auth middleware (`src/auth/middleware.ts`)
- [x] Added JWT validation with rotating keys (`src/auth/jwt.ts`)
- [x] Created 3 unit tests for middleware (PR #142, merged)
- [x] Refactored `User.session` into `User.authToken` (commit `a1b2c3`)

## In Progress
- Refactoring session storage layer (50% done)
  - File: `src/auth/session.ts`, line 142
  - Next: extract `SessionAdapter` interface so we can swap impl per client type
  - Blocker: pending decision on Redis vs in-memory for session cache (asked CTO)

## Next (ordered)
1. Complete session refactor (~2h)
2. Add integration tests for refresh token flow
3. Update OpenAPI spec
4. PR review with QA agent
5. Coordinate with CMO for rollout messaging

## Blockers
- CTO decision pending: Redis vs in-memory session cache (issue #156)

## Decisions made (durable, log here for handoff)
- 2026-04-22: rejected Auth0 (vendor lock-in, cost). Going custom JWT.
- 2026-04-23: refresh token TTL = 7 days (matches mobile session expectations).
- 2026-04-24: rotating signing key with 3-day overlap (prevents revocation gap).

## Files of interest (for the next session to load)
- `src/auth/middleware.ts` (current focus)
- `src/auth/session.ts` (current focus)
- `docs/auth-design.md` (architecture reference, do NOT re-derive)
- `tests/auth/integration.test.ts` (where new tests go)

## Context that's NOT in code (the load-bearing why)
- Customers on plan "legacy-pro" use API key auth, not JWT — keep middleware
  branching there.
- Mobile app (v3.x) caches refresh tokens in keychain; revoking by deleting
  `auth_keys` row breaks UX. Always pair with broadcast to mobile.

## Lessons learned this project
- 2026-04-23: tried RS256 with HSM — too slow per-request. Switched to ES256.
  Don't try HSM again unless we add caching layer.
