# PROJECT_TRACKER.md — Live Execution Board

**Project status:** `IN PROGRESS`  
**Current milestone:** `M0 — Product & Architecture Foundation`  
**Last updated:** 13 August 2026

This file is the authoritative compact execution state of ScolaOS. Detailed work definitions remain in `tasklist.md` and `tasklist-amendments.md`. If an older checkbox conflicts with the same task ID here, this tracker wins until backlog normalization.

---

## 1. Milestone status

| Milestone | State | Completion | Exit gate |
|---|---|---:|---|
| M0 Product & Architecture Foundation | IN PROGRESS | 30% | Architecture POCs + reproducible quality gates + design foundations |
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

1. `M0-030` Fastify API POC: validation, error envelope, request IDs, auth hook stub, OpenAPI generation.
2. `M0-031` Drizzle/PostgreSQL migration POC + integration tests.
3. `M0-004` Lock supported server/database environment from POC evidence.
4. `M0-032..038` Tauri desktop/mobile proof set and architecture decision.
5. `M0-039` Lock or reject Fastify/Drizzle ADRs based on evidence.
6. `M0-050..061` Design-system foundation.
7. `M0-070..078` Platform contracts.
8. `M0-GATE` M0 release-gate review.

### BLOCKED / EXTERNAL VALIDATION

- `M0-003` Product-name trademark/domain conflict screening remains open. Repository/name availability alone is not legal trademark clearance.

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
- `M0-016` Existing CI workflow configured on direct `main` pushes.
- `M0-017` Dependency policy moved to manual review/direct-to-`main`; automated dependency PR creation disabled.
- `M0-018` Existing dependency-audit workflow configured; secret-scanning baseline documented.
- `M0-019` Conventional change/changelog/release process added.
- `M0-020` CODEOWNERS and maintainer review rules added.
- `M0-021` CI-generated `pnpm-lock.yaml` committed verbatim; existing CI and Security workflows use frozen installs; frozen-install CI, formatting, lint, strict TypeScript, unit tests, build, Playwright E2E, and dependency audit all validated successfully.

Repository workflow policy:

- Direct-to-`main` only during bootstrap.
- No feature branches.
- No pull requests.
- No automated dependency branches/PRs.
- No additional CI workflows without an explicit project decision.
- One coherent commit per implementation batch.

---

## 3. Open architecture decisions

| ADR | Decision | State |
|---|---|---|
| ADR-006 | Vite final confirmation | PROVISIONAL |
| ADR-007 | Tauri 2 final confirmation | PROVISIONAL |
| ADR-008 | Fastify final confirmation | PROVISIONAL |
| ADR-009 | Drizzle final confirmation | PROVISIONAL |
| ADR-012 | PostgreSQL job queue implementation | PROVISIONAL |
| ADR-015 | PostgreSQL RLS strategy | OPEN |
| ADR-020 | OpenAPI implementation details | PROVISIONAL |
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

---

## 5. M0 quality evidence

| Gate | State |
|---|---|
| Dependency resolution | ✅ committed generated lockfile |
| Frozen dependency install | ✅ existing CI/Security workflows validated |
| Dependency security audit | ✅ existing Security workflow |
| Formatting | ✅ existing CI |
| Lint | ✅ existing CI |
| Typecheck | ✅ existing CI |
| Unit tests | ✅ existing CI |
| Build | ✅ existing CI |
| Playwright harness | ✅ existing CI |
| Initial threat model | ✅ |
| Documentation | ✅ |

Legend: `⬜` pending, `✅` passed, `⚠️` active issue, `❌` failed.

---

## 6. Task state rules

`NOT STARTED → IN PROGRESS` only when dependencies are satisfied or explicitly accepted as parallel work.

`IN PROGRESS → REVIEW` requires implementation, relevant executable checks, acceptance-criteria self-review, and required docs/ADR updates.

`REVIEW → DONE` requires the quality evidence appropriate to the task. Repository configuration being present is not the same as the milestone quality gate passing.

`Any → BLOCKED` must record the blocker, dependency/decision, and exact next action.

---

## 7. Resume pointer

If work stops and the user says **continue**, resume at:

> `M0-030 — implement the Fastify API proof of concept with representative schemas, request IDs, error envelope, auth hook stub, OpenAPI generation, tests, and evidence for ADR-008/ADR-020. Keep all work direct-to-main and do not begin the Drizzle POC until the Fastify POC acceptance criteria are met.`
