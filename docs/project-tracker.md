# PROJECT_TRACKER.md — Live Execution Board

**Project status:** `IN PROGRESS`  
**Current milestone:** `M0 — Product & Architecture Foundation`  
**Last updated:** 13 August 2026

This file is the authoritative compact execution state for the project currently stored in the `smeetbuilds/scolaos` repository. Detailed work definitions remain in `tasklist.md` and `tasklist-amendments.md`. Decision corrections discovered after the baseline ADR log are recorded in `decision-amendments.md`.

---

## 1. Milestone status

| Milestone | State | Completion | Exit gate |
|---|---|---:|---|
| M0 Product & Architecture Foundation | IN PROGRESS | 37% | Architecture POCs + reproducible quality gates + design foundations |
| M1 Installable Platform Alpha | NOT STARTED | 0% | Web installer + auth + permissions + health |
| M2 Students & Academic Core | NOT STARTED | 0% | Academic structure + secure student lifecycle |
| M3 Daily Operations | NOT STARTED | 0% | Timetable + attendance + assignments + announcements |
| M4 Fees & Examinations | NOT STARTED | 0% | Financial/exam core passes integrity gates |
| M5 Cross-Platform & Offline Beta | NOT STARTED | 0% | Desktop/mobile + offline attendance |
| M6 Production 1.0 Hardening | NOT STARTED | 0% | Security + backup + upgrade + docs + release |
| M7+ Extended Modules | DEFERRED | 0% | Per-module gates after 1.0 |

---

## 2. Current work queue

### IN PROGRESS

- `M0-003` Replacement product-name selection.
  - Preliminary conflict screening found an unrelated active school-software product already using the exact **ScolaOS** name at `scolaos.com`.
  - The current name is rejected as the final public product brand and is now only a temporary repository/engineering codename.
  - Evidence and constraints: `docs/brand-screening.md` and `docs/decision-amendments.md`.
  - Task remains open until a replacement candidate passes product/domain/repository/package/app-store screening and appropriate trademark clearance.

- `M0-031` Drizzle/PostgreSQL migration POC.
  - Fastify prerequisite and reproducible dependency foundation are complete.
  - Real-PostgreSQL acceptance model is defined in `docs/pocs/drizzle-postgres.md`.
  - Disposable SQL acceptance harness is prepared in `tooling/postgres-poc/`.
  - Candidate stable stack recorded: Drizzle ORM `0.45.2`, Drizzle Kit `0.31.10`, `pg` `8.22.0`, `@types/pg` `8.20.0`.
  - No Drizzle packages have been added because the current runtime cannot reach the package registry and the lockfile must not be hand-edited.
  - Task remains open until generated Drizzle SQL, migration journal behavior, typed Drizzle queries, transaction behavior and the acceptance harness pass against real PostgreSQL.

### NEXT — exact execution order

1. Finish `M0-031` in a PostgreSQL/package-registry-capable environment: add reviewed dependencies, regenerate the lockfile normally, generate/apply Drizzle migrations, run typed integration tests and execute the prepared acceptance harness on PostgreSQL 16.14 and 18.4.
2. `M0-004` Lock supported Node/PostgreSQL environment matrix from Fastify + database POC evidence.
3. `M0-032..038` Tauri desktop/mobile proof set and architecture decision.
4. `M0-039` Lock or reject Fastify/Drizzle ADRs based on the combined POC evidence.
5. `M0-050..061` Design-system foundation. Do not invest in permanent wordmark/product-name branding until M0-003 closes.
6. Remaining platform contracts: `M0-071..076` and `M0-078`. `M0-070` and `M0-077` are complete.
7. `M0-GATE` M0 release-gate review.

### BLOCKED / EXTERNAL VALIDATION

- `M0-003` cannot complete under the current exact name: the active same-market ScolaOS product makes the existing brand unsuitable. A replacement name must be selected and screened. This is a product-conflict finding, not a legal trademark judgment.
- `M0-031` executable database proof is blocked in the current runtime because PostgreSQL/`psql`/Docker/Podman are unavailable and package-registry connectivity is unavailable. Static SQL review is not accepted as completion evidence.

### OPERATIONAL CONSTRAINT

- Automatic GitHub Actions execution is **PAUSED by owner request** because the account Actions quota is constrained.
- The existing `CI` and `Security` workflow files are retained as manual-only quality recipes using `workflow_dispatch`, read-only repository permissions, and `pnpm install --frozen-lockfile`.
- Do not restore `push`, `pull_request`, `schedule`, bot commits, or any new GitHub Actions workflow unless the owner explicitly requests it.
- New implementation work must not claim a fresh CI result while this pause is active; use previous validated evidence only where code is unchanged and use another real execution environment when new runtime/database behavior must be proven.

### DONE

Product/security foundation:

- `M0-001` Master PRD accepted as implementation baseline.
- `M0-002` AGPL-3.0-only selected.
- `M0-005` Initial threat model created.

Repository/tooling foundation:

- `M0-010` Monorepo structure initialized.
- `M0-011` pnpm workspaces selected.
- `M0-012` Strict TypeScript baseline added.
- `M0-013` ESLint flat config, Prettier, and import-boundary policy configured.
- `M0-014` Vitest unit-test harness configured.
- `M0-015` Playwright Chromium E2E harness configured.
- `M0-016` CI quality recipe configured; automatic execution is currently paused by owner request.
- `M0-017` Dependency policy moved to manual review/direct-to-`main`; automated dependency PR creation disabled.
- `M0-018` Dependency-audit/security recipe configured; automatic/scheduled execution is currently paused by owner request.
- `M0-019` Conventional change/changelog/release process added.
- `M0-020` CODEOWNERS and maintainer review rules added.
- `M0-021` Generated `pnpm-lock.yaml` committed; frozen-install quality and dependency-audit runs were validated before the Actions pause.

Architecture POCs:

- `M0-030` Fastify API POC **PASSED**. Evidence: `apps/server`, `docs/pocs/fastify-api.md`. Proven on Fastify `5.10.0` + `@fastify/swagger` `9.8.1`: JSON Schema validation/serialization, request IDs, standardized error envelopes, typed authorization-hook seam, OpenAPI 3.0.3 generation, safe host/port parsing, graceful shutdown, HTTP injection tests and build/type/lint/format validation. The last code revision passed the repository quality workflow before automatic Actions were paused.

Platform contracts:

- `M0-070` API error contract **DONE**. Evidence: `docs/contracts/api-errors.md` plus the already-validated Fastify error/request-correlation implementation. Locked: standard envelope, stable codes, HTTP mapping, validation details, request-ID correlation and safe disclosure rules.
- `M0-077` Module-boundary conventions **DONE**. Evidence: `docs/contracts/module-boundaries.md`, ADR-019 and existing default-deny `eslint-plugin-boundaries` enforcement. Locked: app/package dependency direction, modular-monolith ownership and boundary exception discipline.

Repository workflow policy:

- Direct-to-`main` only during bootstrap.
- No feature branches.
- No pull requests.
- No automated dependency branches/PRs.
- No new GitHub Actions workflows.
- Existing Actions workflows are manual-only while quota is constrained.
- No workflow/bot is allowed to commit generated files to `main`.
- One coherent final commit per implementation batch.

---

## 3. Open architecture/product decisions

| ADR | Decision | State |
|---|---|---|
| ADR-006 | Vite final confirmation | PROVISIONAL |
| ADR-007 | Tauri 2 final confirmation | PROVISIONAL |
| ADR-008 | Fastify; M0-030 framework POC passed | PROVISIONAL pending M0-039 |
| ADR-009 | Drizzle; M0-031 acceptance contract prepared | PROVISIONAL; executable DB proof pending |
| ADR-012 | PostgreSQL job queue implementation | PROVISIONAL |
| ADR-015 | PostgreSQL RLS strategy | OPEN |
| ADR-020 | OpenAPI; generation proven in M0-030 | PROVISIONAL pending typed-client/platform-contract evidence |
| ADR-022 | AGPL-3.0-only | ACCEPTED |
| ADR-023 | ScolaOS as final public brand | REJECTED; temporary repo codename only; replacement OPEN |
| ADR-024 | pnpm workspaces; no Turborepo initially | ACCEPTED |
| ADR-025 | Auth session/token transport | OPEN |
| ADR-026 | Full ledger vs fee subsystem for 1.0 | OPEN |

`docs/decision-amendments.md` supersedes the older ADR-023 wording until the main ADR log is normalized.

---

## 4. Risk register

| Risk | Severity | Mitigation |
|---|---|---|
| Exact-name school-software brand conflict | High | Reject ScolaOS as final brand; select/screen replacement before public branding |
| Tauri mobile limitations harm native UX | High | Platform POCs before architecture lock |
| Installer stays privileged after setup | Critical | Explicit install state/lock + security integration tests |
| Permission model becomes unmaintainable | Critical | Permission catalog + scoped authorization service/tests |
| Academic model embeds one country's rules | High | Generic domain model + regional adapters/configuration |
| Fees imply accounting guarantees not implemented | High | Resolve ADR-026 + audit/integrity rules |
| Offline attendance sync corrupts state | High | Idempotency + conflict/version strategy + E2E |
| Self-host upgrades break database | Critical | Immutable migrations + compatibility tests + backup gate |
| Private uploads become publicly reachable | Critical | Authorized file serving + path hardening + security tests |
| Feature breadth destroys UX quality | High | Milestone gates + role-specific information architecture |
| Toolchain drift breaks reproducibility | High | Exact pins + committed generated lockfile + frozen installs |
| Actions quota hides regressions if treated as green CI | High | Auto Actions paused explicitly; never claim new CI evidence without execution |
| Database POC is falsely accepted from static SQL | Critical | M0-031 cannot pass without generated Drizzle migrations + real PostgreSQL execution |
| API clients couple to message strings/framework errors | High | M0-070 stable machine codes + shared error envelope |
| Module graph becomes cyclic as domains grow | High | M0-077 default-deny boundaries + explicit ownership/exception process |

---

## 5. M0 quality evidence

| Gate | State |
|---|---|
| Dependency resolution | ✅ committed generated lockfile |
| Frozen dependency install | ✅ validated before Actions pause |
| Dependency security audit | ✅ validated before Actions pause |
| Formatting | ✅ Fastify POC revision validated before Actions pause |
| Lint | ✅ Fastify POC revision validated before Actions pause |
| Typecheck | ✅ Fastify POC revision validated before Actions pause |
| Unit/injection tests | ✅ Fastify POC revision validated before Actions pause |
| Build | ✅ Fastify POC revision validated before Actions pause |
| Playwright harness | ✅ Fastify POC revision validated before Actions pause |
| M0-030 Fastify POC | ✅ PASSED |
| M0-031 PostgreSQL acceptance contract/harness | ⚠️ prepared; real execution pending |
| M0-070 API error contract | ✅ documented + implementation previously validated |
| M0-077 module-boundary contract | ✅ documented + top-level enforcement previously validated |
| Product-name conflict screen | ⚠️ exact-name conflict confirmed; replacement pending |
| Initial threat model | ✅ |
| Documentation | ✅ |
| Automatic GitHub Actions | ⏸️ PAUSED by owner request |

Legend: `⬜` pending, `✅` passed, `⚠️` active issue, `❌` failed, `⏸️` intentionally paused.

---

## 6. Task state rules

`NOT STARTED → IN PROGRESS` only when dependencies are satisfied or explicitly accepted as parallel work.

`IN PROGRESS → REVIEW` requires implementation, relevant executable checks, acceptance-criteria self-review, and required docs/ADR updates.

`REVIEW → DONE` requires the quality evidence appropriate to the task. Repository configuration being present is not the same as an executable quality gate passing.

`Any → BLOCKED` must record the blocker, dependency/decision, and exact next action.

While automatic GitHub Actions are paused, do not mark new executable/database POCs DONE solely from static code review. Documentation contracts may close when they formalize behavior/enforcement that was already executable and validated before the pause, provided no underlying runtime code changes.

---

## 7. Resume pointer

If work stops and the user says **continue**, resume at:

> `M0-031 remains the primary architecture blocker: execute the prepared Drizzle/PostgreSQL POC in a real PostgreSQL + package-registry-capable environment without GitHub Actions. If that environment is still unavailable, continue independent M0 work that does not require unvalidated runtime changes; remaining platform-contract tasks are M0-071..076 and M0-078. Do not create permanent public branding under the ScolaOS name while M0-003 remains open.`
