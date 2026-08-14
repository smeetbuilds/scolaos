# PROJECT_TRACKER.md — Live Execution Board

**Project status:** `IN PROGRESS`  
**Primary milestone:** `M0 — Product & Architecture Foundation`  
**Parallel foundation:** `M1 — installer, authorization, identity and operations foundations`  
**Last updated:** 14 August 2026

## Milestone status

| Milestone | State | Completion |
|---|---|---:|
| M0 Product & Architecture Foundation | IN PROGRESS | 57% |
| M1 Installable Platform Alpha | IN PROGRESS (parallel foundation) | ~28% |
| M2 Students & Academic Core | NOT STARTED | 0% |
| M3 Daily Operations | NOT STARTED | 0% |
| M4 Fees & Examinations | NOT STARTED | 0% |
| M5 Cross-Platform & Offline Beta | NOT STARTED | 0% |
| M6 Production 1.0 Hardening | NOT STARTED | 0% |

Percentages are task-state progress, not production-feature percentages.

## Active / blocked work

- M0-003 replacement name: external screening required.
- M0-031 Drizzle/PostgreSQL POC: real registry + PostgreSQL execution required.
- M0-052..059 UI primitives: implementation blocked by unresolved React/Vite dependency environment.
- M0-061 design catalog: executable real-component catalog still required.
- M1-002/M1-038 installer integration: REVIEW until real Fastify/Vitest execution.
- M1-033 permission seed: seed source ready; database persistence pending.
- M1-055/M1-056/M1-058/M1-059: authentication/session core exists; persistence and HTTP integration pending.
- M1-057 password reset: service/security contract implemented; PostgreSQL atomic commit, delivery/HTTP/UI and integration tests pending.
- M1-080 audit persistence: audit service exists; PostgreSQL append-only persistence pending.
- M1-066 protected-route security suite: requires persisted identity/authorization context.
- M6-091 canonical LICENSE: authoritative source verified; target replacement remains open until exact bytes are landed/verified in the repository.

## Completed M0 foundation

- M0-001/M0-002/M0-005 product/security baseline.
- M0-010..021 repository/tooling foundation.
- M0-030 Fastify POC PASSED before Actions pause.
- M0-070..078 platform contracts complete.
- M0-050/M0-051/M0-060 design definition complete.

## Completed M1 installer/security foundation

DONE: M1-001, M1-003, M1-004, M1-005, M1-030, M1-036, M1-037 and M1-085.  
Evidence: `apps/server/src/installation/`, `docs/pocs/installer-foundation.md`.

## Completed M1 authorization foundation

DONE: M1-060, M1-061, M1-062 and M1-063.  
Evidence: `apps/server/src/authorization/`, `docs/pocs/authorization-foundation.md`.

## Completed M1 identity foundation

- M1-053 authentication session transport DONE; ADR-025 accepted by amendment.
- M1-054 password hashing DONE.

Core work for M1-055, M1-056, M1-058 and M1-059 remains IN PROGRESS until persistence + real HTTP integration exist.

Evidence: `apps/server/src/identity/`, `docs/pocs/identity-auth-foundation.md`.

## Completed M1 operational service foundation

- **M1-081 audit helper/service — DONE.** Bounded secret-rejecting audit event construction plus required/best-effort persistence semantics.
- **M1-083 health-check service — DONE.** Critical/optional provider probes, timeouts, safe aggregation, runtime and filesystem probes.

Evidence: `apps/server/src/audit/`, `apps/server/src/health/`, `docs/pocs/operational-security-foundation.md`.

## Password-reset progress

M1-057 is IN PROGRESS. The core now has opaque single-use challenge semantics, hashed token persistence, trusted-base reset URL creation, normal password-policy reuse and an atomic persistence contract that includes session revocation. It remains open until the real PostgreSQL/outbox/Fastify/UI flow is proven.

## Execution evidence

No GitHub Actions or new dependencies were used for the operational-security tranche.

Local evidence:

- strict TypeScript compile of the new pure server modules: PASS;
- executable Node operational-security harness: PASS;
- permanent Vitest coverage committed for audit, health and password-reset foundations.

Full workspace Fastify/Vitest execution remains pending because repository dependencies are unavailable in the current runtime. Local Node 22 evidence does not close the Node 24 support-matrix gate.

## Next long-tranche order

1. M0-031 real Drizzle/PostgreSQL proof.
2. M0-004 supported Node/PostgreSQL matrix.
3. Execute M1-002/M1-038 installer integration outside Actions.
4. M1-050..052 identity/authorization persistence + M1-033 permission seed + M1-080 audit persistence.
5. Finish M1-055/M1-056/M1-058/M1-059 with persisted repositories, Fastify routes and audit integration.
6. Finish M1-057 password reset with atomic DB transaction, notification/outbox, HTTP/UI and attack tests.
7. M1-066 protected-route attack suite, then M1-064 RLS decision.
8. M1-013 + M1-031..035 database-backed installer completion.
9. Add concrete DB/migration/storage/mail/worker probes to the completed M1-083 health engine, then M1-084 admin health UI.
10. M0-032..038 Tauri POCs and M0-039 architecture lock.
11. M0-052..059 + M0-061 design-system implementation when dependencies resolve normally.
12. M6-091 exact canonical LICENSE replacement/verification.
13. M0 gate review.

## Decision state

ADR-025 authentication transport is ACCEPTED by `docs/decision-amendments.md`.

Still open/provisional: Vite, Tauri, final Fastify/Drizzle lock, PostgreSQL jobs, RLS, typed-client evidence, replacement brand and finance scope.

## Repository policy

Direct-to-`main` only; no branches/PRs; no new Actions; existing Actions manual-only; no bot commits; no hand-edited lockfile; one coherent final commit per tranche.

## Resume pointer

> Continue in long tranches. M0-031 is still the main architecture blocker. M1-081 and M1-083 are DONE. M1-057 has a tested security/service foundation but requires real persistence and HTTP/UI integration. Next DB-capable tranche should combine M1-050..052, M1-033, M1-080 and the persistence pieces needed to finish auth/reset flows. Do not use GitHub Actions while quota is paused or claim static database evidence as executable proof.
