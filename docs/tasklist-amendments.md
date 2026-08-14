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
  **Boundary:** guidance is complete; PostgreSQL queue/worker implementation remains M6-010..014.

- [x] **M6-067 [P0]** Security disclosure documentation — DONE.  
  **Evidence:** `SECURITY.md`, `docs/security-disclosure.md`.

- [x] **M6-090 [P0]** README — DONE as maintained project/readiness entry point.  
  **Evidence:** `README.md` includes product status, architecture, implementation boundaries, documentation map, development, API, workflow, security and license status.

- [ ] **M6-091 [P0]** LICENSE — OPEN.  
  **Evidence:** canonical SPDX `AGPL-3.0-only` source blob verified as `0c97efd25b5974b974ed9a8a18207bc4f55bb338`; target repository still contains the abbreviated artifact and must land byte-verbatim canonical text before DONE.

- [x] **M6-092 [P0]** CONTRIBUTING — DONE as maintained contributor policy.  
  **Evidence:** `CONTRIBUTING.md` plus architecture/dev/API/job/security references.

- [x] **M6-093 [P0]** SECURITY — DONE as maintained root security policy.  
  **Evidence:** `SECURITY.md`, `docs/security-disclosure.md`, `docs/threat-model.md`.

- [x] **M6-094 [P1]** CODE_OF_CONDUCT — DONE.  
  **Evidence:** `CODE_OF_CONDUCT.md` with scope, behavior, education-data privacy, reporting and enforcement rules.

- [ ] **M6-095 [P0]** Installation docs — OPEN; do not document a production installer flow before DB migration/seed/post-install verification is implemented and tested.
- [ ] **M6-096 [P0]** Docker docs — OPEN; Docker is optional and no production container baseline is locked yet.
- [ ] **M6-097 [P0]** Upgrade/backup/restore docs — OPEN; implementation and N-1/restore evidence must exist before final operational instructions are accepted.

- [x] **M6-098 [P0]** Development environment docs — DONE for the current executable baseline.  
  **Evidence:** `docs/development-environment.md`; unresolved DB/frontend/native setup is explicitly gated rather than fabricated.

- [x] **M6-099 [P1]** Architecture/module contribution docs — DONE.  
  **Evidence:** `docs/architecture-contributions.md`, `docs/contracts/module-boundaries.md`.

- [x] **M6-100 [P1]** API docs — DONE for the current pre-alpha surface as a maintained living guide.  
  **Evidence:** `docs/api.md` plus generated OpenAPI strategy and `docs/contracts/`.

This tranche closes 9 of the 66 numbered M6 tasks before the release gate (~14% task-state progress). This does **not** mean M6 production hardening is 14% complete in effort or risk terms.

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
