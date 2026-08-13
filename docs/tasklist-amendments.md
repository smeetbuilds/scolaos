# Tasklist Amendments — M0/M1

`docs/project-tracker.md` is authoritative for current status. Stable IDs remain unchanged; this file records corrected/expanded task evidence until the master backlog is normalized.

## M0 state carried forward

- [ ] **M0-003 [P1]** Replacement project name — IN PROGRESS; temporary codename rejected as final public brand.
- [x] **M0-005 [P0]** Initial threat model.
- [x] **M0-013..021** Repository/tooling quality foundation.
- [x] **M0-030 [P0]** Fastify API POC.
- [ ] **M0-031 [P0]** Drizzle/PostgreSQL POC — IN PROGRESS; real PostgreSQL + generated migration evidence required.
- [x] **M0-050 [P0]** Visual foundation.
- [x] **M0-051 [P0]** Responsive strategy.
- [ ] **M0-052..059** UI primitives — specs ready, implementation blocked by unresolved React/Vite dependencies.
- [x] **M0-060 [P0]** Accessibility quality gate.
- [ ] **M0-061 [P1]** Interactive design-system catalog — IN PROGRESS; static docs alone are insufficient.
- [x] **M0-070..078** Platform-contract module complete (9/9).

## Early M1 installer backend/security tranche

DONE with executable core evidence:

- [x] **M1-001 [P0]** explicit unconfigured/configured/installed boot states.
- [x] **M1-003 [P0]** validated, atomic and restrictive server config persistence.
- [x] **M1-004 [P0]** generated server security secrets.
- [x] **M1-005 [P0]** structured secret/error redaction.
- [x] **M1-030 [P0]** exclusive installer lock.
- [x] **M1-036 [P0]** permanent installer mutation lock after verified finalization.
- [x] **M1-037 [P0]** installer CSRF/request-origin strategy.
- [x] **M1-085 [P1]** request/log correlation IDs.

REVIEW pending real Fastify/Vitest execution:

- [ ] **M1-002 [P0]** restrict unconfigured server to installer-safe routes.
- [ ] **M1-038 [P0]** installer security integration tests.

## M1 authorization foundation tranche

- [x] **M1-060 [P0] Permission registry — DONE.**  
  **Evidence:** `apps/server/src/authorization/permissions.ts`, tests, `docs/pocs/authorization-foundation.md`.  
  **Locks:** stable namespaced IDs, versioned catalog, unknown-permission fail-closed behavior.

- [x] **M1-061 [P0] Default role templates — DONE.**  
  **Evidence:** `apps/server/src/authorization/roles.ts`.  
  **Locks:** 12 initial PRD role templates; runtime never authorizes by role name; materialization enforces the role's scope strategy; Super Administrator explicitly enumerates the current catalog so new permissions require review.

- [x] **M1-062 [P0] Server authorization service — DONE.**  
  **Evidence:** `service.ts`, `scope.ts`, tests.  
  **Locks:** disabled actor denial, explicit grants, trusted targets, fail-closed scopes, all-target bulk authorization, generic `PERMISSION_DENIED` 403.

- [x] **M1-063 [P0] Scope model POC — DONE.**  
  **Proven:** institution/branch/session/class-section/subject dimensions, own-record and linked-child scopes, missing-target fail-closed behavior, and no implicit-global empty dimension scope.

Related tasks intentionally open:

- [ ] **M1-033 [P0]** Seed default permission catalog — IN PROGRESS / DB blocked; versioned catalog is the seed source, persistence waits for Drizzle/PostgreSQL.
- [ ] **M1-052 [P0]** Role/permission/assignment schemas — semantics ready; DB schema/persistence pending.
- [ ] **M1-064 [P0]** RLS ADR — scope semantics proven; PostgreSQL connection-role/context evidence required.
- [ ] **M1-065 [P0]** Permission-aware client navigation — blocked on executable React client foundation; UI remains UX only, never enforcement.
- [ ] **M1-066 [P0]** Unauthorized API integration suite — pure unit evidence is not enough; real protected routes must load actor/grants/relationships from authoritative persistence.

## Authorization security rules

- Never branch authorization on role names.
- Never treat client-supplied scope IDs as proof of access.
- Build actor/target context from trusted server-side resolution.
- Missing required target dimensions fail closed.
- Empty dimension grants match nothing; broad access is explicit.
- Bulk operations authorize every target.

## Main-only / Actions policy

- direct-to-`main` only;
- no feature branches or pull requests;
- one coherent final commit per tranche;
- no new GitHub Actions workflows; existing Actions stay manual-only while quota is constrained;
- no automated dependency branches/PRs or bot commits;
- do not hand-edit `pnpm-lock.yaml`.

## Open-source packaging note

`M6-091 LICENSE` remains open for production-release packaging verification until the complete canonical AGPL-3.0-only license text is verified as the final artifact.
