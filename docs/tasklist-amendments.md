# Tasklist Amendments — M0/M1/M6

`docs/project-tracker.md` is authoritative for current status. Stable task IDs remain unchanged; this file records corrected/expanded task evidence until the master backlog is normalized.

## M0 state carried forward

- [ ] **M0-003 [P1]** Replacement project name — IN PROGRESS.
- [x] **M0-004 [P0]** Initial supported server environments/minimum versions — DONE. Linux x86_64; Node 24.x LTS; PostgreSQL 16–18/current minor. Evidence: `docs/support-matrix.md`, `apps/server/src/platform-support.ts`.
- [x] **M0-005 [P0]** Initial threat model.
- [x] **M0-013..021** Repository/tooling quality foundation.
- [x] **M0-030 [P0]** Fastify API POC.
- [ ] **M0-031 [P0]** Drizzle/PostgreSQL POC — real PostgreSQL/generated-migration evidence required.
- [x] **M0-050/M0-051/M0-060** visual/responsive/accessibility definition.
- [ ] **M0-052..059** UI primitives — specification complete; implementation dependency-blocked.
- [ ] **M0-061 [P1]** Interactive design-system catalog — IN PROGRESS.
- [x] **M0-070..078** Platform-contract module complete.

## M1 installer/security foundation

- [x] **M1-001 [P0]** Explicit boot states.
- [ ] **M1-002 [P0]** Installer-only pre-install route boundary — REVIEW pending actual Fastify/Vitest execution.
- [x] **M1-003 [P0]** Safe server config persistence.
- [x] **M1-004 [P0]** Generated security secrets.
- [x] **M1-005 [P0]** Secret/error redaction.
- [ ] **M1-011 [P0]** Requirements screen — backend/API complete; responsive UI pending.
- [ ] **M1-019 [P0]** Real install-progress UI — durable backend state/API complete; UI pending.
- [ ] **M1-021 [P0]** Failure-recovery UI — backend retry/recovery/config correction complete; UI pending.
- [x] **M1-030 [P0]** Exclusive installer lock.
- [x] **M1-035 [P0]** Post-install verification engine.
- [x] **M1-036 [P0]** Permanent post-install installer lock.
- [x] **M1-037 [P0]** Installer CSRF/request-origin strategy.
- [ ] **M1-038 [P0]** Installer security integration tests — REVIEW pending real Fastify/Vitest execution.

## M1 initial-school bootstrap foundation

- [ ] **M1-014 [P0]** Institution setup screen — IN PROGRESS. Normalized initial-institution input contract now exists; responsive UI/runtime persistence binding remain.
- [ ] **M1-015 [P0]** Initial academic-session fields — IN PROGRESS. Initial active-session fields/invariants now exist in the bootstrap contract; UI/persistence remain.
- [ ] **M1-016 [P0]** Administrator setup screen — IN PROGRESS. Full-name/email/login/password-confirmation contract and password-hasher port exist; production binding/UI remain.
- [ ] **M1-032 [P0]** Seed default system data — IN PROGRESS. Versioned deterministic installation seed plan + integrity fingerprint exist; PostgreSQL application/journal evidence remains.
- [ ] **M1-033 [P0]** Seed default permission catalog — IN PROGRESS. Seed plan consumes the canonical permission catalog/default roles, rejects drift/unknown permissions, and requires Super Administrator to explicitly grant every current permission; PostgreSQL application remains.
- [ ] **M1-034 [P0]** Create institution/branch/session/admin transactionally — IN PROGRESS. One transaction/idempotency port now covers seed + institution + branch + active session + admin user + membership + super-admin assignment + completion receipt. Real PostgreSQL adapter/constraints/rollback proof remain.

Evidence: `packages/domain/src/bootstrap.ts`, `packages/domain/src/bootstrap.test.ts`, `apps/server/src/installation/seed-plan.ts`, `apps/server/src/installation/seed-plan.test.ts`, `docs/pocs/installer-bootstrap.md`.

Acceptance boundary:

- IDs are trusted/generated, not accepted from browser bootstrap payloads.
- Raw administrator password/confirmation never enter persistence records/receipt.
- Production must bind the password-hasher port to the accepted identity hasher.
- Completed replay returns the durable receipt; transaction code rechecks the receipt for races.
- Seed descriptor carries system/catalog/role versions plus deterministic SHA-256 content fingerprint.
- A DB adapter performing independent non-transactional writes does **not** satisfy M1-034.

## M1 institution/settings foundation

- [ ] **M1-070 [P0]** Institution settings CRUD — IN PROGRESS; domain validation exists, persistence/API/authorization/UI remain.
- [ ] **M1-071 [P0]** Branch management — IN PROGRESS; branch invariants exist, persistence/API/UI remain.
- [ ] **M1-072 [P0]** Academic session management — IN PROGRESS; lifecycle invariants exist, persistence/API/UI remain.
- [x] **M1-073 [P1]** Term/semester model — DONE. Evidence: `packages/domain/src/institution.ts`, tests, `docs/pocs/institution-domain.md`.
- [ ] **M1-074 [P1]** Branding/logo — IN PROGRESS; opaque storage-key metadata boundary exists.
- [ ] **M1-075 [P0]** Timezone/currency/locale settings — IN PROGRESS; domain validation exists, persistence remains.

## M1 authorization / identity / operations carried forward

- [x] **M1-053/M1-054** auth transport + password hashing.
- [ ] **M1-055..059** identity HTTP/persistence tasks — IN PROGRESS.
- [x] **M1-060..063** permission registry/default roles/authorization/scope model.
- [ ] **M1-064..066** RLS/client nav/attack-suite integration remain open or blocked.
- [ ] **M1-080 [P0]** Audit persistence — database blocked.
- [x] **M1-081 [P0]** Audit helper/service.
- [x] **M1-083 [P0]** Health-check service.
- [x] **M1-085 [P1]** Request/log correlation IDs.

## M6 documentation/open-source readiness

- [x] **M6-015, M6-067, M6-090, M6-092, M6-093, M6-094, M6-098, M6-099, M6-100** — DONE.
- [ ] **M6-091 [P0]** LICENSE — OPEN unless the current commit contains a target blob exactly matching SPDX `0c97efd25b5974b974ed9a8a18207bc4f55bb338`.
- [ ] **M6-095..097** Installation/Docker/upgrade-backup-restore docs — OPEN until runtime behavior is proven.

## Acceptance boundaries carried forward

- In-memory/transactional fake stores are evidence for core behavior only, never production persistence.
- Browser clients cannot assert installer phase completion/finalization.
- Database/native/browser tasks stay open until their required executable evidence exists.
- Institution/session/branch/term/bootstrap invariants must also be enforced by PostgreSQL constraints/transactions where appropriate.
- Raw session/reset/bootstrap password credentials must never become durable lookup/content fields.
- Required audit writes must fail the protected transaction when persistence fails.
- Health/provider errors must remain credential-safe.

## Main-only / Actions policy

- direct-to-`main` only;
- no feature branches or pull requests;
- one coherent final commit per tranche;
- no new GitHub Actions workflows; existing Actions remain manual-only;
- no automated dependency branches/PRs or bot commits;
- do not hand-edit `pnpm-lock.yaml`.
