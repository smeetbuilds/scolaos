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

- [x] **M1-053 [P0]** Authentication session transport ADR — DONE.
- [x] **M1-054 [P0]** Password hashing implementation — DONE.
- [ ] **M1-055 [P0]** Login endpoint/UI — IN PROGRESS; service exists, persistence/HTTP/audit/UI remain.
- [ ] **M1-056 [P0]** Logout/session revocation — IN PROGRESS; session lifecycle exists, persistence/HTTP/UX remain.
- [ ] **M1-057 [P0]** Forgot/reset password — IN PROGRESS; service/security contract and tests now exist, but PostgreSQL atomic commit, delivery/outbox, HTTP/UI and integration tests remain.
- [ ] **M1-058 [P0]** Login rate limiting/brute-force controls — IN PROGRESS; service exists, persistent store/HTTP integration remain.
- [ ] **M1-059 [P0]** Current-user/permission context endpoint — IN PROGRESS; principal loading exists, persistence/endpoint remain.

Evidence: `apps/server/src/identity/`, `docs/pocs/identity-auth-foundation.md`, `docs/pocs/operational-security-foundation.md`.

Identity persistence tasks M1-050..052 remain open until the PostgreSQL/Drizzle stack is proven.

## M1 audit/health foundation

- [ ] **M1-080 [P0]** Audit-event persistence — OPEN / database blocked.
- [x] **M1-081 [P0]** Audit helper/service — DONE.  
  **Evidence:** `apps/server/src/audit/`, `docs/contracts/audit-events.md`, `docs/pocs/operational-security-foundation.md`.  
  **Locks:** trusted server ID/time, normalized action/actor/resource semantics, bounded metadata, secret rejection, required-vs-best-effort write behavior and transaction-compatible store injection.
- [ ] **M1-082 [P1]** Admin audit-list UX — OPEN.
- [x] **M1-083 [P0]** Health-check service — DONE.  
  **Evidence:** `apps/server/src/health/`, `docs/pocs/operational-security-foundation.md`.  
  **Locks:** critical/optional probes, timeouts, safe aggregation, generic provider failures, secret-safe details, runtime/filesystem probes and provider adapters.
- [ ] **M1-084 [P0]** Health admin screen — OPEN.
- [x] **M1-085 [P1]** Request/log correlation IDs — DONE previously.

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

## Open-source packaging note

`M6-091 LICENSE` remains open. The canonical SPDX `AGPL-3.0-only` source blob is verified as `0c97efd25b5974b974ed9a8a18207bc4f55bb338`, but the target repository must still replace its abbreviated file with byte-verbatim canonical text and verify the resulting blob before the task is marked DONE.
