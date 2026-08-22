# PROJECT_TRACKER.md — Live Execution Board

**Project status:** `IN PROGRESS`  
**Primary milestone:** `M0 — Product & Architecture Foundation`  
**Parallel foundation:** `M1 — installer, authorization, identity, institution/bootstrap and operations foundations`  
**Parallel hardening:** `M6 — contributor/documentation readiness where implementation-independent`  
**Last updated:** 22 August 2026

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
- **M0-031 Drizzle/PostgreSQL POC:** SQL-semantic harness is now wired to the existing CI workflow against PostgreSQL 16 and 18 boundary versions with explicit server-major/CREATE-privilege checks. The task remains IN PROGRESS until `drizzle-orm`/`drizzle-kit` are added through normal pnpm resolution, a real Drizzle migration is generated/applied, the migration journal is verified, typed Drizzle queries execute, and green workflow evidence is observed.
- **M0-052..059 UI primitives / M0-061 catalog:** implementation dependency-blocked by unavailable React/Vite environment.
- **M1-002/M1-038 installer integration:** REVIEW until real Fastify/Vitest execution evidence is observed.
- **M1-011/M1-019/M1-021 installer UX:** backend requirements/progress/recovery contracts complete; responsive React UI pending.
- **M1-013 + M1-031 DB chain:** production PostgreSQL connection/version/privilege adapter and migration runner remain pending behind M0-031 driver/Drizzle resolution.
- **M1-014/015/016 first-school setup:** normalized bootstrap domain input exists; responsive UI and runtime binding remain.
- **M1-032/033 seeding:** deterministic seed plan/version/fingerprint validation exists; PostgreSQL application/journal evidence pending.
- **M1-034 atomic bootstrap:** transaction/idempotency coordinator exists; real PostgreSQL adapter/constraints/rollback evidence pending.
- **M1-050..052 identity persistence / M1-080 audit persistence:** database blocked.
- **M1-055 login:** authentication core plus framework-neutral HTTP sign-in/browser-cookie/native-bearer/audit orchestration exist; persistence, Fastify route and UI remain.
- **M1-056 logout/revocation:** session lifecycle plus CSRF-protected HTTP logout/cookie clearing exist; persistence, Fastify route and UX remain.
- **M1-057 forgot/reset password:** token/outbox contract, generic response, minimum response timing, account/source abuse gates and cheap active-challenge preflight exist; PostgreSQL challenge store, outbox worker/delivery, Fastify/UI and race tests remain.
- **M1-058 login abuse controls:** normalized-account throttle plus HMAC source-spray limiter contracts exist; persistent atomic counter store and Fastify integration remain.
- **M1-059 current-user context:** framework-neutral safe actor/grant/session response plus browser CSRF issuance exist; persisted principal loader and Fastify route remain.
- **M1-064/M1-066 authorization integration:** RLS decision and protected-route attack suite wait for persisted context/routes.
- **M1-070/071/072/074/075 institution/settings:** domain invariants exist; persistence/API/authorization/UI remain.
- **M1-084 health admin screen:** concrete installation-security/runtime/disk probes exist; responsive authorized UI plus real DB/migration/storage/mail/worker probes remain.
- **M6-091 canonical LICENSE:** remains OPEN until the target repository contains a blob byte-identical to SPDX AGPL-3.0-only blob `0c97efd25b5974b974ed9a8a18207bc4f55bb338`. Do not close this task from reconstructed or reformatted license text.
- **M6-095..097 operational docs:** intentionally open until installer/container/upgrade/backup/restore behavior is real and tested.

## Completed M0 foundation

- M0-001/M0-002/M0-005 product/security baseline.
- M0-004 initial server support matrix DONE: Linux x86_64 production baseline, Node 24.x LTS, PostgreSQL 16–18/current minor policy.
- M0-010..021 repository/tooling foundation.
- M0-030 Fastify POC PASSED before the earlier Actions pause.
- M0-050/M0-051/M0-060 design definition/accessibility baseline.
- M0-070..078 platform contracts complete.

Evidence for M0-004: `docs/support-matrix.md`, `apps/server/src/platform-support.ts`, installer runtime-gate reuse. M0-031 remains independently open.

## M0-031 PostgreSQL semantic execution tranche

The independent SQL-semantic harness remains deliberately separate from Drizzle so generated SQL can be verified without validating the ORM against itself.

Current harness coverage:

- refuses execution without an explicit destructive-POC opt-in and `DATABASE_URL`;
- verifies PostgreSQL server major is within 16–18 and optionally matches a caller-required major;
- checks database `CREATE` privilege before destructive schema work;
- validates tenant-scoped foreign keys, uniqueness/check constraints, operational indexes and transaction rollback;
- existing CI now defines PostgreSQL 16 and PostgreSQL 18 service-container jobs around that harness.

This is **not** a completed Drizzle POC. No green PostgreSQL workflow result is claimed merely because the workflow definition exists, and no `drizzle-orm`/`drizzle-kit` package or lockfile entry is fabricated. The next database step must use normal pnpm resolution and generated migrations.

Evidence: `tooling/postgres-poc/`, `.github/workflows/ci.yml`.

## M1 installer/security foundation

DONE: M1-001, M1-003, M1-004, M1-005, M1-030, M1-035, M1-036, M1-037 and M1-085.  
REVIEW: M1-002 and M1-038 pending actual Fastify/Vitest execution evidence.

The installer has durable requirements/progress/recovery/finalization foundations across `CONFIG_WRITTEN -> DB_CONNECTED -> MIGRATING -> SEEDING -> VERIFYING -> INSTALLED`.

Recent hardening also adds remote-installer bootstrap protection, trusted-proxy configuration, HTTPS-only remote base URLs, fail-closed readiness, stale-lock recovery and production-default removal of POC auth routes.

Evidence: `apps/server/src/installation/`, `apps/server/src/app.ts`, `docs/pocs/installer-foundation.md`, `docs/pocs/installer-operations.md`.

## Installer bootstrap / initial-school foundation

A dependency-independent bootstrap contract covers the first institution, default active branch, active academic session and initial administrator.

Key properties:

- trusted generated IDs rather than client-owned bootstrap IDs;
- normalized institution/session/admin input;
- administrator email/login separation and password confirmation;
- password-hasher port; raw password/confirmation never passed to persistence;
- one transaction port for seed + institution + branch + session + user + membership + role assignment + receipt;
- preflight + in-transaction receipt checks for retry/idempotency;
- duplicate generated-ID and raw-password-hasher rejection;
- deterministic seed versions + SHA-256 content fingerprint;
- seed-plan validation requires the initial Super Administrator template to explicitly grant every current permission.

Task states remain IN PROGRESS for M1-014/015/016/032/033/034 until their UI/PostgreSQL acceptance boundaries are met.

Evidence: `packages/domain/src/bootstrap.ts`, `packages/domain/src/bootstrap.test.ts`, `apps/server/src/installation/seed-plan.ts`, `apps/server/src/installation/seed-plan.test.ts`, `docs/pocs/installer-bootstrap.md`.

## M1 identity HTTP/security foundation

The identity module has a framework-neutral HTTP/security application layer rather than leaving security policy to future route handlers.

Implemented:

- one-credential-only browser cookie/native bearer extraction;
- explicit HTTPS/local-development policy;
- forwarded protocol honored only for adapter-verified trusted proxies;
- exact-origin + same-origin Fetch Metadata + session-bound CSRF for browser mutations;
- stored-session transport must match request credential transport;
- forced-password-reset sessions confined to session-read/password-change/logout routes;
- safe browser login response (cookie + CSRF; no raw token/hash) and native login response (bearer only);
- current-user actor/grant/session projection without token hashes;
- HTTP logout orchestration with browser cookie clearing;
- normalized-account throttle plus independent HMAC source spray counters;
- recovery source/account counters, generic account-level suppression, bounded minimum timing and cheap active-token preflight before scrypt;
- scrypt production work factor uses `N=2^16, r=8, p=2` with successful-login compare-and-set hash upgrades;
- password reset persistence contract requires atomic challenge creation + durable notification/outbox enqueue;
- safe auth/reset/installer audit-event builders without submitted logins/passwords/tokens/raw source addresses;
- concrete installation-security, runtime-support and disk-capacity health probes.

Task states:

- M1-053 authentication transport — DONE.
- M1-054 password hashing — DONE.
- M1-055 login endpoint/UI — IN PROGRESS; HTTP application boundary complete, persistent repo/Fastify/UI pending.
- M1-056 logout/revocation — IN PROGRESS; HTTP mutation/cookie-clearing orchestration complete, persistence/Fastify/UX pending.
- M1-057 forgot/reset password — IN PROGRESS; security/abuse/timing/preflight/outbox contract complete, PostgreSQL/Fastify/UI/race evidence pending.
- M1-058 brute-force controls — IN PROGRESS; account + source contracts complete, persistent atomic counter store/Fastify integration pending.
- M1-059 current-user context — IN PROGRESS; safe response/route guard complete, persisted principal/Fastify route pending.

Evidence: `apps/server/src/identity/`, `apps/server/src/audit/identity-events.ts`, `apps/server/src/health/security-probes.ts`, `docs/pocs/identity-http-security.md`.

## Institution / academic settings foundation

- **M1-073 term/semester model — DONE.** Stable parent session, date/sequence/uniqueness/session-bound/no-overlap invariants are implemented and tested.
- **M1-070/071/072/074/075 — IN PROGRESS.** Institution settings, branches, session lifecycle, safe branding metadata and locale/timezone/currency domain invariants exist; persistence/API/authorization/UI remain.

Evidence: `packages/domain/src/institution.ts`, `packages/domain/src/institution.test.ts`, `docs/pocs/institution-domain.md`.

## Completed M1 authorization / operational foundations

- M1-060/M1-061/M1-062/M1-063 authorization foundation — DONE.
- M1-081 audit helper/service — DONE; typed identity/installer event builders extend it.
- M1-083 health-check service — DONE; installation/runtime/disk probes extend it and provider timeouts now receive cancellation signals.
- M1-085 request/log correlation IDs — DONE.

M1-080 audit persistence remains database blocked. M1-082 audit-list UI and M1-084 health admin UI remain open.

## Completed M6 contributor/documentation readiness

DONE: M6-015, M6-067, M6-090, M6-092, M6-093, M6-094, M6-098, M6-099 and M6-100.

M6-091 LICENSE remains OPEN pending exact canonical blob transfer. M6-095 installation, M6-096 Docker and M6-097 upgrade/backup/restore docs remain open until their runtime features are proven.

## Execution/evidence policy

Static inspection is never reported as a database/native/browser pass.

For this PostgreSQL tranche:

- Bash syntax and the harness control flow can be checked without a database;
- the SQL semantic claims require an actual PostgreSQL process;
- the CI definition now provisions PostgreSQL 16 and 18 boundary service containers and runs the destructive disposable harness;
- a workflow definition is not itself a successful workflow run;
- Drizzle remains unproven until dependencies are resolved normally, migrations are generated/applied, journal state is checked and typed queries execute.

The repository still forbids hand-editing `pnpm-lock.yaml` to bypass package-resolution evidence.

## Next long-tranche order

1. Observe/repair the PostgreSQL 16/18 semantic CI matrix until both boundary jobs are green.
2. In an environment with normal npm/pnpm registry resolution, add `drizzle-orm`, `drizzle-kit`, the selected PostgreSQL driver and typings with pnpm so the lockfile is generated normally.
3. Complete M0-031 with generated/appplied Drizzle migrations, migration-journal assertions and typed query/transaction integration tests on PostgreSQL 16 and 18; then decide ADR-009/M0-039.
4. Implement M1-013 DB connection/version/privilege adapter and M1-031 migration runner using the accepted database stack.
5. Implement PostgreSQL adapters for M1-032/033/034 plus identity/session/reset/counter/audit persistence; wire real M1-035 verification.
6. Persist M1-070..075 institution/session/term rules plus M1-050..052 authorization/identity relationships.
7. Bind the identity HTTP application to real Fastify routes and execute M1-002/M1-038 plus identity integration tests.
8. Finish M1-055..059 and M1-057 UI/outbox flows.
9. M1-066 protected-route attack suite, then M1-064 RLS decision.
10. Complete concrete DB/migration/storage/mail/worker health probes then M1-084 admin UI and M1-082 audit UI.
11. Implement responsive installer/institution UI when React/Vite dependencies resolve normally.
12. M0-032..038 Tauri POCs and M0-039 architecture lock.
13. M0-052..059 + M0-061 design-system implementation.
14. M6-091 exact canonical LICENSE.
15. M6-095..097 operational docs only after runtime features are proven.
16. M0 gate review.

## Decision state

ADR-025 authentication transport is ACCEPTED. M0-004 support matrix policy is locked.

Still open/provisional: Vite, Tauri, Fastify final lock, Drizzle final lock, PostgreSQL jobs, RLS, typed-client evidence, replacement brand and finance scope.

## Repository policy

Direct-to-`main` only; no feature branches/PRs for current owner workflow; no new GitHub Actions workflow files; existing CI/Security workflows may run automatically and be strengthened in place; no bot commits; no hand-edited lockfile; one coherent final commit per tranche.

## Resume pointer

> Continue in long tranches. The SQL-semantic PostgreSQL boundary harness is now wired for PG16/PG18 CI but M0-031 is not a Drizzle pass. First repair/observe those DB jobs, then add Drizzle/driver dependencies only through normal pnpm resolution and complete the generated-migration + typed-query proof before building production persistence on top of it.
