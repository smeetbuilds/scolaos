# Tasklist Amendments — M0/M1/M6

`docs/project-tracker.md` is authoritative for current status. Stable task IDs remain unchanged; this file records corrected/expanded task evidence until the master backlog is normalized.

## M0 state carried forward

- [ ] **M0-003 [P1]** Replacement project name — IN PROGRESS.
- [x] **M0-004 [P0]** Initial supported server environments/minimum versions — DONE.  
  **Policy:** Linux x86_64 production baseline; Node 24.x LTS; PostgreSQL majors 16–18 on the current supported minor for the selected major.  
  **Evidence:** `docs/support-matrix.md`, `apps/server/src/platform-support.ts`, `apps/server/src/platform-support.test.ts`.  
  **Boundary:** this locks the compatibility promise; M0-031 still must prove generated migrations/integration behavior on supported PostgreSQL before the architecture gate can pass.
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

- [x] **M1-001 [P0]** Explicit boot states — DONE.
- [ ] **M1-002 [P0]** Restrict unconfigured server to installer-safe routes — REVIEW; implementation/tests exist, actual Fastify/Vitest execution still pending.
- [x] **M1-003 [P0]** Server config schema/safe persistence — DONE.
- [x] **M1-004 [P0]** Generated server security secrets — DONE.
- [x] **M1-005 [P0]** Structured secret/error redaction — DONE.
- [ ] **M1-011 [P0]** Requirements check screen — IN PROGRESS; backend/API complete, responsive React screen remains. Node support now consumes the central M0-004 policy.
- [ ] **M1-019 [P0]** Real installation-progress UI — IN PROGRESS; durable backend state/API complete, UI remains.
- [ ] **M1-021 [P0]** Installation-failure recovery UI — IN PROGRESS; backend retry/recovery/config-correction path complete, UI remains.
- [x] **M1-030 [P0]** Exclusive installer lock — DONE.
- [x] **M1-035 [P0]** Post-install verification engine — DONE.
- [x] **M1-036 [P0]** Permanent installer mutation lock after success — DONE.
- [x] **M1-037 [P0]** Installer CSRF/request-origin strategy — DONE.
- [ ] **M1-038 [P0]** Installer security integration tests — REVIEW; suite exists but actual Fastify/Vitest execution remains blocked.

Evidence: `apps/server/src/installation/`, `docs/pocs/installer-foundation.md`, `docs/pocs/installer-operations.md`.

## M1 institution/settings foundation

- [ ] **M1-070 [P0]** Institution settings CRUD — IN PROGRESS. Institution name/code/country/timezone/currency/locale/week-start domain validation is complete; persistence/API/authorization/UI remain.
- [ ] **M1-071 [P0]** Branch model/basic management — IN PROGRESS. Unique branch IDs/codes, active/default invariants and atomic default switching are implemented/tested; persistence/API/UI remain.
- [ ] **M1-072 [P0]** Academic session management — IN PROGRESS. Planned/active/closed lifecycle, unique code and at-most-one-active-session invariants are implemented/tested; persistence/API/UI remain.
- [x] **M1-073 [P1]** Term/semester model — DONE.  
  **Evidence:** `packages/domain/src/institution.ts`, `packages/domain/src/institution.test.ts`, `docs/pocs/institution-domain.md`.  
  **Acceptance:** stable parent session, code/name, real date range, sequence, uniqueness, session-bound dates and no-overlap invariants are defined and executable.
- [ ] **M1-074 [P1]** Branding/logo — IN PROGRESS. Opaque storage-key/alt-text metadata boundary exists; upload/storage provider authorization and UI remain.
- [ ] **M1-075 [P0]** Timezone/currency/locale settings — IN PROGRESS. IANA timezone, currency and canonical BCP 47 locale validation exists; persisted settings management remains.

## M1 authorization foundation

- [x] **M1-060 [P0]** Permission registry.
- [x] **M1-061 [P0]** Default role templates.
- [x] **M1-062 [P0]** Server authorization service.
- [x] **M1-063 [P0]** Scope-model POC.

Related DB/client tasks remain open: M1-033, M1-052, M1-064, M1-065 and M1-066.

## M1 identity/authentication foundation

- [x] **M1-053 [P0]** Authentication session transport ADR — DONE.
- [x] **M1-054 [P0]** Password hashing implementation — DONE.
- [ ] **M1-055 [P0]** Login endpoint/UI — IN PROGRESS; service exists, persistence/HTTP/audit/UI remain.
- [ ] **M1-056 [P0]** Logout/session revocation — IN PROGRESS; session lifecycle exists, persistence/HTTP/UX remain.
- [ ] **M1-057 [P0]** Forgot/reset password — IN PROGRESS; service/security contract exists; PostgreSQL atomic commit, delivery/outbox, HTTP/UI and integration tests remain.
- [ ] **M1-058 [P0]** Login rate limiting/brute-force controls — IN PROGRESS; service exists, persistent store/HTTP integration remain.
- [ ] **M1-059 [P0]** Current-user/permission context endpoint — IN PROGRESS; principal loading exists, persistence/endpoint remain.

## M1 audit/health foundation

- [ ] **M1-080 [P0]** Audit-event persistence — OPEN / database blocked.
- [x] **M1-081 [P0]** Audit helper/service — DONE.
- [ ] **M1-082 [P1]** Admin audit-list UX — OPEN.
- [x] **M1-083 [P0]** Health-check service — DONE.
- [ ] **M1-084 [P0]** Health admin screen — OPEN.
- [x] **M1-085 [P1]** Request/log correlation IDs — DONE.

## M6 documentation/open-source readiness

- [x] **M6-015 [P0]** Idempotency guidance for job handlers — DONE.
- [x] **M6-067 [P0]** Security disclosure documentation — DONE.
- [x] **M6-090 [P0]** README — DONE.
- [ ] **M6-091 [P0]** LICENSE — OPEN. Canonical SPDX source blob is verified as `0c97efd25b5974b974ed9a8a18207bc4f55bb338`, but no target-repository blob has yet matched it byte-for-byte. Unmatched candidate blobs must never be referenced by the final tree.
- [x] **M6-092 [P0]** CONTRIBUTING — DONE.
- [x] **M6-093 [P0]** SECURITY — DONE.
- [x] **M6-094 [P1]** CODE_OF_CONDUCT — DONE.
- [ ] **M6-095 [P0]** Installation docs — OPEN.
- [ ] **M6-096 [P0]** Docker docs — OPEN.
- [ ] **M6-097 [P0]** Upgrade/backup/restore docs — OPEN.
- [x] **M6-098 [P0]** Development environment docs — DONE.
- [x] **M6-099 [P1]** Architecture/module contribution docs — DONE.
- [x] **M6-100 [P1]** API docs — DONE for the current maintained pre-alpha surface.

## Acceptance boundaries carried forward

- In-memory stores are test fixtures only, never production persistence.
- Browser clients cannot assert installer phase completion/finalization.
- Database/native/browser tasks stay open until their required executable evidence exists.
- Institution/session/branch/term domain invariants must be persisted with PostgreSQL constraints/transactions where appropriate; pure-domain completion is not a substitute for CRUD persistence tasks.
- Support-matrix documentation is a compatibility promise, not proof that M0-031 has passed.
- Raw session/reset credentials must not be durable lookup keys.
- Required audit writes must fail the protected transaction when persistence fails.
- Health/provider errors must remain credential-safe.

## Main-only / Actions policy

- direct-to-`main` only;
- no feature branches or pull requests;
- one coherent final commit per tranche;
- no new GitHub Actions workflows; existing Actions remain manual-only;
- no automated dependency branches/PRs or bot commits;
- do not hand-edit `pnpm-lock.yaml`.
