# Tasklist Amendments — M0/M1

`docs/project-tracker.md` is authoritative for current status. Stable task IDs remain unchanged; this file records corrected/expanded task evidence until the master backlog is normalized.

## M0 state carried forward

- [ ] **M0-003 [P1]** Replacement project name — IN PROGRESS.
- [x] **M0-005 [P0]** Initial threat model.
- [x] **M0-013..021** Repository/tooling quality foundation.
- [x] **M0-030 [P0]** Fastify API POC.
- [ ] **M0-031 [P0]** Drizzle/PostgreSQL POC — real PostgreSQL/generated-migration evidence required.
- [x] **M0-050 [P0]** Visual foundation.
- [x] **M0-051 [P0]** Responsive strategy.
- [ ] **M0-052..059** UI primitives — specifications ready; implementation dependency-blocked.
- [x] **M0-060 [P0]** Accessibility gate.
- [ ] **M0-061 [P1]** Interactive design-system catalog — IN PROGRESS.
- [x] **M0-070..078** Platform-contract module complete.

## M1 installer/security foundation

DONE: M1-001, M1-003, M1-004, M1-005, M1-030, M1-036, M1-037 and M1-085.  
REVIEW: M1-002 and M1-038 pending actual Fastify/Vitest execution.

Evidence: `apps/server/src/installation/`, `docs/pocs/installer-foundation.md`.

## M1 authorization foundation

- [x] **M1-060 [P0]** Permission registry.
- [x] **M1-061 [P0]** Default role templates.
- [x] **M1-062 [P0]** Server authorization service.
- [x] **M1-063 [P0]** Scope-model POC.

Evidence: `apps/server/src/authorization/`, `docs/pocs/authorization-foundation.md`.

Related DB/client tasks remain open: M1-033, M1-052, M1-064, M1-065 and M1-066.

## M1 identity/authentication foundation

- [x] **M1-053 [P0] Authentication session transport ADR — DONE.**  
  **Evidence:** ADR-025 amendment, `apps/server/src/identity/transport.ts`, `session-token.ts`, `csrf.ts`, `service.ts`, `docs/pocs/identity-auth-foundation.md`.  
  **Decision:** opaque server-side sessions; browser cookie transport; native bearer transport; explicit revocation/expiry; session-bound browser CSRF primitive.

- [x] **M1-054 [P0] Password hashing implementation — DONE.**  
  **Evidence:** `apps/server/src/identity/password.ts`, permanent tests, local executable harness.  
  **Locks:** versioned asynchronous `scrypt` record, random salt, normalization, constant-time verification and upgrade metadata.

Substantial core implementation exists but tasks remain open:

- [ ] **M1-055 [P0]** Login endpoint/UI — IN PROGRESS. `AuthenticationService.signIn()` exists; PostgreSQL repository, Fastify route, audit integration and UI remain.
- [ ] **M1-056 [P0]** Logout/session revocation — IN PROGRESS. Core session revocation/expiry exists; persistent repository/endpoints/session UX remain.
- [ ] **M1-057 [P0]** Forgot/reset password — OPEN.
- [ ] **M1-058 [P0]** Login rate limiting/brute-force controls — IN PROGRESS. Account throttling service/policy exists; persistent store and HTTP/source integration remain.
- [ ] **M1-059 [P0]** Current-user/permission context endpoint — IN PROGRESS. Authenticated principal resolves into the existing authorization actor; persistence/endpoint remain.

Identity persistence tasks M1-050..052 remain open until the PostgreSQL/Drizzle stack is proven.

## Identity acceptance boundary

- In-memory stores are test fixtures only, never production persistence.
- Raw session credentials must not be stored as lookup keys.
- Current account/permission state must be loaded from authoritative server persistence.
- Password create/change flows still require compromised/common-password screening before completion.
- Login/logout/current-user tasks are not DONE until persisted repositories + real protected HTTP integration are tested.

## Main-only / Actions policy

- direct-to-`main` only;
- no feature branches or pull requests;
- one coherent final commit per tranche;
- no new GitHub Actions workflows; existing Actions remain manual-only;
- no automated dependency branches/PRs or bot commits;
- do not hand-edit `pnpm-lock.yaml`.

## Open-source packaging note

`M6-091 LICENSE` remains open for production-release packaging verification until the complete canonical AGPL-3.0-only license text is verified as the final artifact.
