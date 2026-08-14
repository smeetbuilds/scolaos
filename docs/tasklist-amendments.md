# Tasklist Amendments — M0/M1/M6

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

- [x] **M1-001 [P0]** Explicit boot states — DONE.
- [ ] **M1-002 [P0]** Restrict unconfigured server to installer-safe routes — REVIEW; implementation/tests exist, actual Fastify/Vitest execution still pending.
- [x] **M1-003 [P0]** Server config schema/safe persistence — DONE.
- [x] **M1-004 [P0]** Generated server security secrets — DONE.
- [x] **M1-005 [P0]** Structured secret/error redaction — DONE.
- [ ] **M1-011 [P0]** Requirements check screen — IN PROGRESS; backend requirement service + API are complete, responsive React screen remains.
- [ ] **M1-019 [P0]** Real installation-progress UI — IN PROGRESS; durable real backend phase/progress state + API are complete, UI remains.
- [ ] **M1-021 [P0]** Installation-failure recovery UI — IN PROGRESS; backend failure/retry state, recovery guidance and safe pre-DB config correction are complete, UI remains.
- [x] **M1-030 [P0]** Exclusive installer lock — DONE.
- [x] **M1-035 [P0]** Post-install verification engine — DONE.  
  **Evidence:** `apps/server/src/installation/verification.ts`, `apps/server/src/installation/service.ts`, `apps/server/src/installation/operations.test.ts`, `docs/pocs/installer-operations.md`.  
  **Boundary:** mandatory database/migration/permission-seed/bootstrap checks are provider-driven and finalization fails closed without a provider. Production provider wiring depends on M1-031..034; this task does not imply those tasks or fresh-install E2E are complete.
- [x] **M1-036 [P0]** Permanent installer mutation lock after success — DONE.
- [x] **M1-037 [P0]** Installer CSRF/request-origin strategy — DONE.
- [ ] **M1-038 [P0]** Installer security integration tests — REVIEW; suite updated for requirements/recovery/config-correction/finalization but actual Fastify/Vitest execution remains blocked.

Evidence: `apps/server/src/installation/`, `docs/pocs/installer-foundation.md`, `docs/pocs/installer-operations.md`.

### Installer operations acceptance boundary

- Ordered durable phases are `CONFIG_WRITTEN -> DB_CONNECTED -> MIGRATING -> SEEDING -> VERIFYING -> INSTALLED`.
- Phase skipping and rewinding fail closed.
- Stored progress is private/atomic and tied to the active `installationId`.
- Failure messages must be bounded and credential-safe.
- Pending DB/base-URL configuration can be corrected only before DB setup advances; installation identity and generated secrets are preserved.
- Correcting a failed DB setup resets only the pre-DB checkpoint, not migration/seed state.
- Browser clients cannot directly assert phase completion or finalization.
- Installed marker creation requires seed completion plus a passing mandatory verification report.
- PostgreSQL migration/seed/bootstrap implementations remain M1-031..034 and are not substituted by fake providers.

## M1 authorization foundation

- [x] **M1-060 [P0]** Permission registry.
- [x] **M1-061 [P0]** Default role templates.
- [x] **M1-062 [P0]** Server authorization service.
- [x] **M1-063 [P0]** Scope-model POC.

Evidence: `apps/server/src/authorization/`, `docs/pocs/authorization-foundation.md`.

Related DB/client tasks remain open: M1-033, M1-052, M1-064, M1-065 and M1-066.

## M1 identity/authentication foundation

- [x] **M1-053 [P0]** Authentication session transport ADR — DONE.
- [x] **M1-054 [P0]** Password hashing implementation — DONE.
- [ ] **M1-055 [P0]** Login endpoint/UI — IN PROGRESS; service exists, persistence/HTTP/audit/UI remain.
- [ ] **M1-056 [P0]** Logout/session revocation — IN PROGRESS; session lifecycle exists, persistence/HTTP/UX remain.
- [ ] **M1-057 [P0]** Forgot/reset password — IN PROGRESS; service/security contract and tests exist, but PostgreSQL atomic commit, delivery/outbox, HTTP/UI and integration tests remain.
- [ ] **M1-058 [P0]** Login rate limiting/brute-force controls — IN PROGRESS; service exists, persistent store/HTTP integration remain.
- [ ] **M1-059 [P0]** Current-user/permission context endpoint — IN PROGRESS; principal loading exists, persistence/endpoint remain.

Evidence: `apps/server/src/identity/`, `docs/pocs/identity-auth-foundation.md`, `docs/pocs/operational-security-foundation.md`.

Identity persistence tasks M1-050..052 remain open until the PostgreSQL/Drizzle stack is proven.

## M1 audit/health foundation

- [ ] **M1-080 [P0]** Audit-event persistence — OPEN / database blocked.
- [x] **M1-081 [P0]** Audit helper/service — DONE.  
  **Evidence:** `apps/server/src/audit/`, `docs/contracts/audit-events.md`, `docs/pocs/operational-security-foundation.md`.
- [ ] **M1-082 [P1]** Admin audit-list UX — OPEN.
- [x] **M1-083 [P0]** Health-check service — DONE.  
  **Evidence:** `apps/server/src/health/`, `docs/pocs/operational-security-foundation.md`.
- [ ] **M1-084 [P0]** Health admin screen — OPEN.
- [x] **M1-085 [P1]** Request/log correlation IDs — DONE previously.

## M6 documentation/open-source readiness tranche

The following are living documentation/guidance tasks. They are complete for the current pre-alpha architecture and must remain synchronized as implementation evolves; the M6 release gate still revalidates the final documentation set.

- [x] **M6-015 [P0]** Idempotency guidance for job handlers — DONE.  
  **Evidence:** `docs/contracts/background-jobs.md`, `docs/job-handler-guidelines.md`.
- [x] **M6-067 [P0]** Security disclosure documentation — DONE.  
  **Evidence:** `SECURITY.md`, `docs/security-disclosure.md`.
- [x] **M6-090 [P0]** README — DONE as maintained project/readiness entry point.
- [ ] **M6-091 [P0]** LICENSE — OPEN; target repository still needs byte-verbatim canonical SPDX `AGPL-3.0-only` text.
- [x] **M6-092 [P0]** CONTRIBUTING — DONE.
- [x] **M6-093 [P0]** SECURITY — DONE.
- [x] **M6-094 [P1]** CODE_OF_CONDUCT — DONE.
- [ ] **M6-095 [P0]** Installation docs — OPEN; final production docs wait for DB-backed installer completion.
- [ ] **M6-096 [P0]** Docker docs — OPEN.
- [ ] **M6-097 [P0]** Upgrade/backup/restore docs — OPEN.
- [x] **M6-098 [P0]** Development environment docs — DONE.
- [x] **M6-099 [P1]** Architecture/module contribution docs — DONE.
- [x] **M6-100 [P1]** API docs — DONE for the current maintained pre-alpha surface.

## Identity/operations acceptance boundary

- In-memory stores are test fixtures only, never production persistence.
- Raw session/reset credentials must not be stored as lookup keys.
- Password-reset consumption/password replacement/reset invalidation/session revocation must be atomic in the real persistence layer.
- Password-reset request HTTP behavior still needs abuse controls and timing/equalization work.
- Audit metadata rejects secrets rather than silently retaining redacted durable copies.
- Required audit writes must fail the protected transaction when persistence fails.
- Health provider exceptions must not expose internal exception/credential text to the client.
- Login/logout/current-user/reset tasks are not DONE until persisted repositories + real protected HTTP integration are tested.

## Main-only / Actions policy

- direct-to-`main` only;
- no feature branches or pull requests;
- one coherent final commit per tranche;
- no new GitHub Actions workflows; existing Actions remain manual-only;
- no automated dependency branches/PRs or bot commits;
- do not hand-edit `pnpm-lock.yaml`.
