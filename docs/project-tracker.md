# PROJECT_TRACKER.md — Live Execution Board

**Project status:** `IN PROGRESS`  
**Primary milestone:** `M0 — Product & Architecture Foundation`  
**Parallel foundation:** `M1 — installer, authorization, identity, institution and operations foundations`  
**Parallel hardening:** `M6 — contributor/documentation readiness where implementation-independent`  
**Last updated:** 14 August 2026

## Milestone status

| Milestone | State | Completion |
|---|---|---:|
| M0 Product & Architecture Foundation | IN PROGRESS | ~59% task-state |
| M1 Installable Platform Alpha | IN PROGRESS (parallel foundation) | ~32% task-state |
| M2 Students & Academic Core | NOT STARTED | 0% |
| M3 Daily Operations | NOT STARTED | 0% |
| M4 Fees & Examinations | NOT STARTED | 0% |
| M5 Cross-Platform & Offline Beta | NOT STARTED | 0% |
| M6 Production 1.0 Hardening | IN PROGRESS (documentation foundation only) | ~14% task-state |

Percentages are task-state indicators, not effort/risk/production-readiness percentages.

## Active / blocked work

- **M0-003 replacement name:** external screening remains required; repository name is temporary only.
- **M0-031 Drizzle/PostgreSQL POC:** still the main architecture blocker; real package-registry + PostgreSQL execution required.
- **M0-052..059 UI primitives / M0-061 catalog:** implementation dependency-blocked by unavailable React/Vite environment.
- **M1-002/M1-038 installer integration:** REVIEW until real Fastify/Vitest execution.
- **M1-011/M1-019/M1-021 installer UX:** backend requirements/progress/recovery contracts complete; responsive React UI pending.
- **M1-013 + M1-031..034 DB installer chain:** PostgreSQL connection/version/privilege testing, migrations, seed and atomic bootstrap pending.
- **M1-050..052 identity persistence / M1-033 permission seed / M1-080 audit persistence:** database blocked.
- **M1-055..059 identity HTTP/persistence:** core exists; real persistence/routes/audit/UI remain.
- **M1-064/M1-066 authorization integration:** RLS decision and protected-route attack suite wait for persisted context.
- **M1-070/071/072/074/075 institution/settings:** domain invariants now exist; persistence/API/authorization/UI remain.
- **M6-091 canonical LICENSE:** authoritative source blob remains `0c97efd25b5974b974ed9a8a18207bc4f55bb338`; target repository still needs a byte-identical write.
- **M6-095..097 operational docs:** intentionally open until installer/container/upgrade/backup/restore behavior is real and tested.

## Completed M0 foundation

- M0-001/M0-002/M0-005 product/security baseline.
- M0-004 initial server support matrix DONE: Linux x86_64 production baseline, Node 24.x LTS, PostgreSQL 16–18/current minor policy.
- M0-010..021 repository/tooling foundation.
- M0-030 Fastify POC PASSED before Actions pause.
- M0-050/M0-051/M0-060 design definition/accessibility baseline.
- M0-070..078 platform contracts complete.

Evidence for M0-004: `docs/support-matrix.md`, `apps/server/src/platform-support.ts`, installer runtime-gate reuse. M0-031 remains independently open and must execute the DB stack on supported PostgreSQL before the architecture gate can pass.

## Completed M1 installer/security foundation

DONE: M1-001, M1-003, M1-004, M1-005, M1-030, M1-035, M1-036, M1-037 and M1-085.  
REVIEW: M1-002 and M1-038 pending actual Fastify/Vitest execution.

The installer additionally has durable requirements/progress/recovery/finalization foundations across `CONFIG_WRITTEN -> DB_CONNECTED -> MIGRATING -> SEEDING -> VERIFYING -> INSTALLED`.

Evidence: `apps/server/src/installation/`, `docs/pocs/installer-foundation.md`, `docs/pocs/installer-operations.md`.

## Completed M1 authorization foundation

DONE: M1-060, M1-061, M1-062 and M1-063.  
Evidence: `apps/server/src/authorization/`, `docs/pocs/authorization-foundation.md`.

## Completed M1 identity foundation

- M1-053 authentication session transport DONE; ADR-025 accepted.
- M1-054 password hashing DONE.
- M1-057 password-reset security/service foundation remains IN PROGRESS pending PostgreSQL/outbox/Fastify/UI integration.

Evidence: `apps/server/src/identity/`, `docs/pocs/identity-auth-foundation.md`, `docs/pocs/operational-security-foundation.md`.

## Institution / academic settings foundation

- **M1-073 term/semester model — DONE.** Stable term identity/code/name, parent session, real date range, explicit sequence, uniqueness, session-bound range and no-overlap invariants are implemented and tested.
- **M1-070 institution settings CRUD — IN PROGRESS.** Country-neutral institution settings validation exists; persistence/API/authorization/UI remain.
- **M1-071 branch model/basic management — IN PROGRESS.** Unique branch code + exactly-one-default active branch invariants and default switching exist; persistence/API/UI remain.
- **M1-072 academic session management — IN PROGRESS.** Planned/active/closed lifecycle, at-most-one active session and closed-session non-reactivation exist; persistence/API/UI remain.
- **M1-074 branding/logo — IN PROGRESS.** Opaque safe logo-storage-key metadata exists; upload/storage/UX remain.
- **M1-075 timezone/currency/locale settings — IN PROGRESS.** IANA timezone, currency and canonical BCP 47 locale validation exists; persisted management remains.

Evidence: `packages/domain/src/institution.ts`, `packages/domain/src/institution.test.ts`, `docs/pocs/institution-domain.md`.

## Completed M1 operational service foundation

- M1-081 audit helper/service DONE.
- M1-083 health-check service DONE.

Evidence: `apps/server/src/audit/`, `apps/server/src/health/`, `docs/pocs/operational-security-foundation.md`.

## Completed M6 contributor/documentation readiness

DONE: M6-015, M6-067, M6-090, M6-092, M6-093, M6-094, M6-098, M6-099 and M6-100.

M6-091 LICENSE remains OPEN. M6-095 installation, M6-096 Docker and M6-097 upgrade/backup/restore docs remain open until their runtime features are proven.

## Execution/evidence policy

This tranche ran two real dependency-independent executable harnesses with global TypeScript 5.8.3 + Node 22:

- `platform-support-harness: PASS`;
- `institution-domain-harness: PASS`.

The support logic itself is version-policy code and does not claim the local Node 22 runtime is supported; the harness explicitly verified Node 22/26 rejection and Node 24 acceptance.

Permanent Vitest suites are committed for both modules, but repository Vitest/Fastify execution is not claimed because dependencies remain unavailable. PostgreSQL/Drizzle execution is still not available and no database task is marked complete from static evidence.

## Next long-tranche order

1. M0-031 real Drizzle/PostgreSQL proof using the M0-004 support matrix (minimum PG16 + current PG18 first).
2. Execute M1-002/M1-038 Fastify/Vitest installer integration when dependencies are available.
3. M1-013 DB connection/privilege/version endpoint using `platform-support.ts`.
4. M1-031..034 migration/seed/transactional bootstrap, then wire the real M1-035 verifier.
5. Persist M1-070..075 institution/session/term domain rules in Drizzle/PostgreSQL together with identity/authorization/audit persistence where practical.
6. Finish M1-055..059 and M1-057 HTTP/persistence/outbox flows.
7. M1-066 protected-route attack suite, then M1-064 RLS decision.
8. Implement responsive installer/institution UI when React/Vite dependencies resolve normally.
9. M0-032..038 Tauri POCs and M0-039 architecture lock.
10. M0-052..059 + M0-061 design-system implementation.
11. M6-091 exact canonical LICENSE write/verification.
12. M6-095..097 operational docs only after their runtime features are proven.
13. M0 gate review.

## Decision state

ADR-025 authentication transport is ACCEPTED. Support matrix policy is now locked by M0-004.

Still open/provisional: Vite, Tauri, final Fastify/Drizzle lock, PostgreSQL jobs, RLS, typed-client evidence, replacement brand and finance scope.

## Repository policy

Direct-to-`main` only; no branches/PRs; no new Actions; existing Actions manual-only; no bot commits; no hand-edited lockfile; one coherent final commit per tranche.

## Resume pointer

> Continue in long tranches. M0-004 and M1-073 are complete. The institution/settings domain foundation is established, but persistence/API/UI remain open. M0-031 real PostgreSQL/Drizzle execution remains the primary architecture unlock. Do not claim DB/native/browser evidence that was not executed.
