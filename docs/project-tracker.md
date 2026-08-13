# PROJECT_TRACKER.md — Live Execution Board

**Project status:** `IN PROGRESS`  
**Primary milestone:** `M0 — Product & Architecture Foundation`  
**Parallel foundation:** `M1 — Installer backend/security started where independent of blocked M0 POCs`  
**Last updated:** 13 August 2026

This file is the authoritative compact execution state for the project currently stored in `smeetbuilds/scolaos`. Detailed definitions/evidence live in `tasklist.md`, `tasklist-amendments.md`, `docs/contracts/`, `docs/design-system/`, `docs/pocs/` and the ADR files.

---

## 1. Milestone status

| Milestone | State | Completion | Exit gate |
|---|---|---:|---|
| M0 Product & Architecture Foundation | IN PROGRESS | 57% | Architecture POCs + reproducible quality gates + usable design foundations |
| M1 Installable Platform Alpha | IN PROGRESS (parallel foundation) | 14% | Installer + auth + permissions + health |
| M2 Students & Academic Core | NOT STARTED | 0% | Academic structure + secure student lifecycle |
| M3 Daily Operations | NOT STARTED | 0% | Timetable + attendance + assignments + announcements |
| M4 Fees & Examinations | NOT STARTED | 0% | Financial/exam integrity gates |
| M5 Cross-Platform & Offline Beta | NOT STARTED | 0% | Desktop/mobile + selective offline |
| M6 Production 1.0 Hardening | NOT STARTED | 0% | Security + backup + upgrade + docs + release |
| M7+ Extended Modules | DEFERRED | 0% | Post-1.0 module gates |

Percentages are task-state progress, not claims about production feature completeness. M1 work is being done only where it does not bypass unresolved M0 architecture evidence.

---

## 2. Active / blocked work

### M0-003 — replacement product name

**State:** IN PROGRESS / external validation required.

- The exact temporary codename conflicts with an unrelated active school-software product.
- Do not create permanent domains, package namespaces, app-store assets, signing identities or final wordmark branding under this name.
- Done only after a replacement passes product/domain/repository/package/app-store screening plus appropriate formal trademark clearance.

### M0-031 — Drizzle/PostgreSQL POC

**State:** IN PROGRESS / executable environment blocked.

Prepared:

- `docs/pocs/drizzle-postgres.md`;
- guarded SQL acceptance harness in `tooling/postgres-poc/`;
- reviewed candidate Drizzle/node-postgres stack.

Still required before DONE:

1. package-registry-capable environment;
2. normally generated lockfile update;
3. typed Drizzle schema/config;
4. generated committed SQL/metadata;
5. migration/re-migration journal proof;
6. typed query/transaction tests;
7. real PostgreSQL constraint/index/rollback evidence;
8. PostgreSQL 16.14 and 18.4 acceptance runs.

Static SQL review is not completion evidence.

### M0-052..059 — design-system implementation

**State:** BLOCKED by executable dependency environment, not by design ambiguity.

- `packages/ui` and `apps/web` remain dependency-light package shells.
- React/Vite packages are not currently resolved in the repository dependency graph.
- Complete implementation specs exist in `docs/design-system/component-specs.md`.
- Do not add unresolvable TSX or hand-edit `pnpm-lock.yaml` merely to mark tasks complete.

### M0-061 — interactive design-system catalog

**State:** IN PROGRESS.

Documentation workspace exists. DONE still requires a real executable catalog using implemented `packages/ui` components.

### M1-002 — pre-install route restriction

**State:** REVIEW.

Implemented in `apps/server/src/app.ts`/`installation/routes.ts`:

- before installed state, process health + `/start/installation...` are the only installer-safe surface;
- normal application/OpenAPI paths return `INSTALLATION_REQUIRED`;
- configured-but-unverified state remains blocked.

Pending: execute the committed Fastify injection tests with actual repository dependencies.

### M1-038 — installer security integration tests

**State:** REVIEW.

Committed coverage includes:

- pre-install route restriction;
- missing-CSRF rejection;
- cross-site rejection;
- secret-free config response;
- configured-vs-installed behavior;
- permanent installer mutation lockout.

Pending: actual Vitest/Fastify execution in a dependency-capable environment. GitHub Actions remain owner-paused.

---

## 3. Completed M0 foundation

### Product/security/tooling

- `M0-001` master PRD baseline.
- `M0-002` AGPL-3.0-only selected.
- `M0-005` initial threat model.
- `M0-010..021` repository/tooling baseline complete, including strict TypeScript, ESLint/Prettier boundaries, Vitest, Playwright, manual-only CI/security recipes, review policy and committed frozen lockfile.

### Architecture

- `M0-030` Fastify API POC **PASSED** before the Actions pause.
  - schema validation/serialization;
  - request IDs/error envelope;
  - typed authorization-hook seam;
  - OpenAPI 3.0.3 generation;
  - safe server config/graceful shutdown;
  - injection/unit/build/lint/type/format evidence.

### Platform contracts — 9/9 complete

- `M0-070` API errors.
- `M0-071` pagination/filter/sort.
- `M0-072` API compatibility/version metadata.
- `M0-073` platform bridge.
- `M0-074` storage provider.
- `M0-075` notification events/channels.
- `M0-076` background jobs.
- `M0-077` module boundaries.
- `M0-078` audit events.

Evidence: `docs/contracts/`.

### Design definition

- `M0-050` visual foundation DONE.
- `M0-051` responsive strategy DONE.
- `M0-060` accessibility quality gate DONE.
- M0-052..059 implementation specs prepared.

Evidence: `docs/design-system/`.

---

## 4. Completed early M1 installer/security foundation

Evidence: `apps/server/src/installation/`, updated Fastify server files, and `docs/pocs/installer-foundation.md`.

### DONE with executable core evidence

- `M1-001` explicit unconfigured/configured/installed boot states.
- `M1-003` server config validation + atomic/restrictive persistence.
- `M1-004` server-generated security secrets.
- `M1-005` structured secret/error redaction.
- `M1-030` exclusive installer lock.
- `M1-036` permanent installer mutation lock after verified finalization.
- `M1-037` CSRF/request-origin protection strategy.
- `M1-085` request/log correlation IDs (request-ID behavior previously validated in M0-030; logging now uses sanitized request-correlated errors).

### Security properties now encoded

- marker without matching valid config fails closed;
- database password and generated secrets never appear in public installer responses;
- generated secrets are not browser inputs;
- config writes use temp file + fsync + atomic rename + restrictive permissions;
- concurrent installer mutation is rejected;
- final installed marker has no public direct-write endpoint;
- CSRF sessions use HttpOnly host cookie + SameSite=Strict + HMAC header token;
- cross-site fetch metadata and mismatched Origin/Host/protocol are rejected;
- process restart invalidates outstanding installer CSRF sessions;
- unexpected/startup errors are logged through a sanitized structure rather than raw error stacks/credential strings.

---

## 5. Installer execution evidence

This tranche used **no GitHub Actions**.

Locally executed evidence:

- installer core TypeScript: strict check passed;
- full changed TypeScript surface: syntax transpile passed;
- executable installer core harness: PASS.

The runtime harness exercised:

- boot-state transitions;
- generated secrets;
- public secret non-disclosure;
- POSIX `0600` config mode;
- marker/config consistency;
- lock exclusivity;
- permanent post-install lockout;
- same-origin CSRF acceptance;
- cross-site rejection;
- nested credential/error redaction.

Not yet executed in this environment:

- actual Fastify/Vitest integration suite for the changed tree;
- project TypeScript 6 full workspace check;
- project build/Playwright/dependency audit.

Reason: repository packages are not installed in the local runtime and npm registry access is unavailable; GitHub Actions are intentionally paused by owner request.

---

## 6. Next long-tranche execution order

1. **M0-031** — finish real Drizzle/PostgreSQL proof as soon as a PostgreSQL + registry-capable runtime is available.
2. **M0-004** — lock supported Node/PostgreSQL matrix from actual DB evidence.
3. **M1 installer verification tranche** — run M1-002/M1-038 Fastify/Vitest tests in a dependency-capable non-Actions environment and fix any integration defects before marking DONE.
4. **M1-013 + M1-031..035** — DB test, migration, seed, transactional institution/admin creation and post-install verification after M0-031 establishes the DB stack.
5. **M0-032..038** — Tauri desktop/mobile/camera/secure-storage/notification proof set.
6. **M0-039** — accept/reject Fastify + Drizzle architecture from combined evidence.
7. **M0-052..059 + M0-061** — implement shared React design-system primitives/catalog once dependency resolution can be regenerated normally.
8. M0 gate review.

Do not use a blocked task as justification for hand-edited lockfiles, fake runtime evidence, or weakened security gates.

---

## 7. Architecture/product decisions still open

| ADR | Decision | State |
|---|---|---|
| ADR-006 | Vite final confirmation | PROVISIONAL |
| ADR-007 | Tauri 2 | PROVISIONAL pending POCs |
| ADR-008 | Fastify | PROVISIONAL; M0-030 passed, final M0-039 pending |
| ADR-009 | Drizzle | PROVISIONAL; executable M0-031 pending |
| ADR-012 | PostgreSQL-backed jobs | PROVISIONAL; contract complete, implementation unproven |
| ADR-015 | PostgreSQL RLS | OPEN |
| ADR-020 | OpenAPI documented API | PROVISIONAL; generation proven, typed-client evidence later |
| ADR-023 | temporary codename as final public brand | REJECTED; replacement OPEN |
| ADR-025 | auth session/token transport | OPEN |
| ADR-026 | full ledger vs fee subsystem | OPEN |

---

## 8. Risk register

| Risk | Severity | Mitigation |
|---|---|---|
| Exact-name school-software conflict | High | Replace/screen final brand before public launch assets |
| Database POC accepted from static review | Critical | M0-031 requires generated migrations + real PostgreSQL execution |
| Installer remains privileged after setup | Critical | M1-036 verified marker + no public finalization endpoint + M1-038 integration suite |
| Installer concurrent execution corrupts setup | Critical | M1-030 exclusive lock + ownership-token release |
| Installer CSRF/cross-site mutation | Critical | M1-037 SameSite cookie + HMAC token + origin/fetch-site verification |
| Server config leaks credentials | Critical | private server config + public projection + redaction policy + 0600 file mode |
| Permission model becomes unmaintainable | Critical | role + permission + scope catalog/service/tests |
| Cross-institution data leakage | Critical | server authorization + scoped DB relationships + audit tests |
| Private uploads become public | Critical | M0-074 private-by-default provider contract + authorized serving |
| Duplicate background work causes side effects | Critical | M0-076 at-least-once + idempotency/dedupe rules |
| Audit logs leak sensitive data | Critical | M0-078 metadata limits + M1-005 redaction |
| Mobile becomes shrunken desktop | High | M0-051 composition/table/navigation strategies |
| Accessibility deferred until release | Critical | M0-060 component-level gate |
| Actions quota hides regressions | High | auto Actions paused; REVIEW state used when executable evidence is unavailable |

---

## 9. Repository workflow policy

- direct-to-`main` only during bootstrap;
- no feature branches;
- no pull requests;
- no automated dependency branches/PRs;
- no new GitHub Actions workflows;
- existing Actions workflows remain manual-only while quota is constrained;
- no workflow/bot commits generated files to `main`;
- one coherent final commit per implementation tranche.

---

## 10. Resume pointer

If work stops and the user says **continue**:

> `Continue in long tranches. M0-031 remains the primary architecture blocker. The early M1 installer core is implemented: M1-001/003/004/005/030/036/037 and M1-085 are DONE with core evidence; M1-002 and M1-038 are REVIEW until actual Fastify/Vitest execution. Do not implement DB migration/seed/final verification until the Drizzle/PostgreSQL stack is proven. Do not hand-edit dependency resolution, use GitHub Actions while quota is paused, or create permanent branding under the temporary codename.`
