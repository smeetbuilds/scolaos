# PROJECT_TRACKER.md — Live Execution Board

**Project status:** `IN PROGRESS`  
**Primary milestone:** `M0 — Product & Architecture Foundation`  
**Parallel foundation:** `M1 — installer, authorization and identity foundations`  
**Last updated:** 13 August 2026

## Milestone status

| Milestone | State | Completion |
|---|---|---:|
| M0 Product & Architecture Foundation | IN PROGRESS | 57% |
| M1 Installable Platform Alpha | IN PROGRESS (parallel foundation) | ~24% |
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
- M1-066 protected-route security suite: requires persisted identity/authorization context.

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

- **M1-053 authentication session transport — DONE.** ADR-025 is accepted by amendment.
- **M1-054 password hashing implementation — DONE.** Versioned asynchronous `scrypt` records with migration metadata are implemented.

Evidence: `apps/server/src/identity/`, `docs/pocs/identity-auth-foundation.md`, `docs/decision-amendments.md`.

Meaningful core implementation also exists for:

- M1-055 sign-in service;
- M1-056 session revocation lifecycle;
- M1-058 login throttling service;
- M1-059 authenticated principal/authorization-context loading.

Those tasks remain IN PROGRESS until PostgreSQL repositories and real HTTP integration exist.

## Execution evidence

No GitHub Actions or new dependencies were used for the identity tranche.

Local evidence:

- strict identity-core TypeScript check: PASS;
- executable identity/session harness: PASS;
- permanent Vitest coverage committed for password and transport primitives.

Full workspace Fastify/Vitest execution remains pending because repository dependencies are unavailable in the current runtime. Local Node 22 evidence does not close the project Node 24 support-matrix gate.

## Next long-tranche order

1. M0-031 real Drizzle/PostgreSQL proof.
2. M0-004 supported Node/PostgreSQL matrix.
3. Execute M1-002/M1-038 integration verification outside Actions.
4. M1-050..052 identity/authorization persistence plus M1-033 permission seed.
5. Finish M1-055/M1-056/M1-058/M1-059 with persisted repositories + Fastify routes + audit integration.
6. M1-057 password reset/change flows.
7. M1-066 protected-route attack suite, then M1-064 RLS decision.
8. M1-013 + M1-031..035 database-backed installer completion.
9. M0-032..038 Tauri POCs and M0-039 architecture lock.
10. M0-052..059 + M0-061 design-system implementation when dependencies resolve normally.
11. M0 gate review.

## Decision state

ADR-025 authentication transport is **ACCEPTED** by `docs/decision-amendments.md`.

Still open/provisional: Vite, Tauri, final Fastify/Drizzle lock, PostgreSQL jobs, RLS, typed-client evidence, replacement brand and finance scope.

## Repository policy

Direct-to-`main` only; no branches/PRs; no new Actions; existing Actions manual-only; no bot commits; no hand-edited lockfile; one coherent final commit per tranche.

## Resume pointer

> Continue in long tranches. M0-031 remains the main architecture blocker. M1-053/M1-054 are DONE; M1-055/M1-056/M1-058/M1-059 have core implementations but require persistence and HTTP integration before DONE. Do not substitute in-memory production persistence, hand-edit dependencies, run GitHub Actions while quota is paused, or create permanent branding under the temporary codename.
