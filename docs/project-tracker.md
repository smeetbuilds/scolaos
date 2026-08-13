# PROJECT_TRACKER.md — Live Execution Board

**Project status:** `IN PROGRESS`  
**Current milestone:** `M0 — Product & Architecture Foundation`  
**Last updated:** 13 August 2026

This file is the authoritative compact execution state of ScolaOS. Detailed work definitions remain in `tasklist.md` and `tasklist-amendments.md`. If an older checkbox conflicts with the same task ID here, this tracker wins until backlog normalization.

---

## 1. Milestone status

| Milestone | State | Completion | Exit gate |
|---|---|---:|---|
| M0 Product & Architecture Foundation | IN PROGRESS | 33% | Architecture POCs + reproducible quality gates + design foundations |
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

None at commit boundary.

### NEXT — exact execution order

1. `M0-031` Drizzle/PostgreSQL POC with generated/committed SQL migrations, migration application/versioning, constraints/indexes, transaction behavior, and integration tests against real PostgreSQL.
2. `M0-004` Lock supported Node/PostgreSQL environment matrix from Fastify + database POC evidence.
3. `M0-032..038` Tauri desktop/mobile proof set and architecture decision.
4. `M0-039` Lock or reject Fastify/Drizzle ADRs based on the combined POC evidence.
5. `M0-050..061` Design-system foundation.
6. `M0-070..078` Platform contracts.
7. `M0-GATE` M0 release-gate review.

### BLOCKED / EXTERNAL VALIDATION

- `M0-003` Product-name trademark/domain conflict screening remains open. Repository/name availability alone is not legal trademark clearance.

### OPERATIONAL CONSTRAINT

- Automatic GitHub Actions execution is **PAUSED by owner request** because the account Actions quota is constrained.
- The existing `CI` and `Security` workflow files are retained as manual-only quality recipes using `workflow_dispatch`, read-only repository permissions, and `pnpm install --frozen-lockfile`.
- Do not restore `push`, `pull_request`, `schedule`, bot commits, or any new GitHub Actions workflow unless the owner explicitly requests it.
- New implementation work must not claim a fresh CI result while this pause is active; use previous validated evidence where code is unchanged and use another real execution environment when new runtime/database behavior must be proven.

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
- `M0-021` CI-generated `pnpm-lock.yaml` committed; frozen-install quality and dependency-audit runs were validated before the Actions pause.

Architecture POCs:

- `M0-030` Fastify API POC **PASSED**. Evidence: `apps/server`, `docs/pocs/fastify-api.md`. Proven on Fastify `5.10.0` + `@fastify/swagger` `9.8.1`: JSON Schema validation/serialization, request IDs, standardized error envelopes, typed authorization-hook seam, OpenAPI 3.0.3 generation, safe host/port parsing, graceful shutdown, HTTP injection tests and build/type/lint/format validation. The last code revision passed the repository quality workflow before automatic Actions were paused.

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

## 3. Open architecture decisions

| ADR | Decision | State |
|---|---|---|
| ADR-006 | Vite final confirmation | PROVISIONAL |
| ADR-007 | Tauri 2 final confirmation | PROVISIONAL |
| ADR-008 | Fastify; M0-030 framework POC passed | PROVISIONAL pending M0-039 |
| ADR-009 | Drizzle | PROVISIONAL; M0-031 pending |
| ADR-012 | PostgreSQL job queue implementation | PROVISIONAL |
| ADR-015 | PostgreSQL RLS strategy | OPEN |
| ADR-020 | OpenAPI; generation proven in M0-030 | PROVISIONAL pending typed-client/platform-contract evidence |
| ADR-022 | AGPL-3.0-only | ACCEPTED |
| ADR-023 | ScolaOS working name; formal screening pending | PROVISIONAL |
| ADR-024 | pnpm workspaces; no Turborepo initially | ACCEPTED |
| ADR-025 | Auth session/token transport | OPEN |
| ADR-026 | Full ledger vs fee subsystem for 1.0 | OPEN |

---

## 4. Risk register

| Risk | Severity | Mitigation |
|---|---|---|
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

While automatic GitHub Actions are paused, do not mark new executable/database POCs DONE solely from static code review.

---

## 7. Resume pointer

If work stops and the user says **continue**, resume at:

> `M0-031 — build and validate the Drizzle/PostgreSQL migration POC. Do not use or create GitHub Actions while the owner quota constraint is active. The task is DONE only after real PostgreSQL migration/integration evidence exists; then proceed to M0-004 and M0-039.`
