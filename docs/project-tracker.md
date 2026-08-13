# PROJECT_TRACKER.md — Live Execution Board

**Project status:** `IN PROGRESS`  
**Current milestone:** `M0 — Product & Architecture Foundation`  
**Last updated:** 13 August 2026

This file is the authoritative compact execution state for the project currently stored in `smeetbuilds/scolaos`. Detailed definitions live in `tasklist.md`, `tasklist-amendments.md`, `docs/contracts/`, `docs/design-system/`, `docs/pocs/` and the ADR files.

---

## 1. Milestone status

| Milestone | State | Completion | Exit gate |
|---|---|---:|---|
| M0 Product & Architecture Foundation | IN PROGRESS | 57% | Architecture POCs + reproducible quality gates + design foundations |
| M1 Installable Platform Alpha | NOT STARTED | 0% | Installer + auth + permissions + health |
| M2 Students & Academic Core | NOT STARTED | 0% | Academic structure + secure student lifecycle |
| M3 Daily Operations | NOT STARTED | 0% | Timetable + attendance + assignments + announcements |
| M4 Fees & Examinations | NOT STARTED | 0% | Financial/exam integrity gates |
| M5 Cross-Platform & Offline Beta | NOT STARTED | 0% | Desktop/mobile + selective offline |
| M6 Production 1.0 Hardening | NOT STARTED | 0% | Security + backup + upgrade + docs + release |
| M7+ Extended Modules | DEFERRED | 0% | Post-1.0 module gates |

The percentage is task-state progress, not a claim that 57% of production functionality exists.

---

## 2. Active work

### M0-003 — replacement product name

**State:** IN PROGRESS / external validation required.

- An unrelated active school-software product already uses the exact ScolaOS name.
- ScolaOS is rejected as the final public brand and retained only as a temporary repository/engineering codename.
- Evidence: `docs/brand-screening.md`, `docs/decision-amendments.md`.
- Do not create permanent domains, package namespaces, app-store assets, signing identities or final wordmark branding under this name.
- Done only after a replacement passes product/domain/repository/package/app-store screening plus appropriate formal trademark clearance.

### M0-031 — Drizzle/PostgreSQL POC

**State:** IN PROGRESS / executable environment blocked.

Prepared:

- `docs/pocs/drizzle-postgres.md` acceptance plan;
- `tooling/postgres-poc/reference-schema.sql`;
- `tooling/postgres-poc/verify.sql`;
- guarded `tooling/postgres-poc/run.sh`;
- candidate stack: Drizzle ORM `0.45.2`, Drizzle Kit `0.31.10`, `pg` `8.22.0`, `@types/pg` `8.20.0`.

Still required before DONE:

1. registry-capable environment;
2. normally generated lockfile update for reviewed dependencies;
3. typed Drizzle schema/config;
4. Drizzle-generated committed SQL + metadata;
5. migration apply/re-apply journal verification;
6. typed query/transaction integration tests;
7. real PostgreSQL constraint/index/rollback evidence;
8. PostgreSQL 16.14 and 18.4 acceptance runs.

Static SQL review is not completion evidence.

### M0-061 — design-system documentation/demo workspace

**State:** IN PROGRESS.

Prepared:

- `docs/design-system/README.md` documentation workspace;
- `docs/design-system/component-specs.md` implementation specification for M0-052..059;
- completed visual/responsive/accessibility definition docs.

Still required before DONE:

- executable component demo/catalog using the real `packages/ui` components;
- representative component states;
- responsive examples;
- accessibility/keyboard examples;
- long/localized content examples;
- reduced-motion examples.

Static Markdown alone is not completion evidence for the demo requirement.

---

## 3. Next execution order

1. Finish `M0-031` real Drizzle/PostgreSQL proof when a suitable runtime is available.
2. `M0-004` lock Node/PostgreSQL support matrix from Fastify + database evidence.
3. `M0-032..038` Tauri desktop/mobile/camera/secure-storage/notification proof set and decision.
4. `M0-039` accept/reject Fastify + Drizzle architecture from combined evidence.
5. Implement `M0-052..059` shared design-system primitives against the now-locked M0-050/M0-051/M0-060 specifications.
6. Finish `M0-061` interactive design-system demo/catalog after real components exist.
7. M0 gate review after remaining architecture/design work is executable and documented.

The **M0-070..078 platform-contract module is complete** and no longer appears in the pending queue.

---

## 4. Completed foundation

### Product/security

- `M0-001` master PRD baseline.
- `M0-002` AGPL-3.0-only selected.
- `M0-005` initial threat model.

### Repository/tooling

- `M0-010` monorepo structure.
- `M0-011` pnpm workspaces/no Turborepo initially.
- `M0-012` strict TypeScript baseline.
- `M0-013` ESLint/Prettier/import boundaries.
- `M0-014` Vitest harness.
- `M0-015` Playwright Chromium harness.
- `M0-016` CI quality recipe configured; automatic execution currently paused.
- `M0-017` manual dependency update policy/direct-to-main.
- `M0-018` dependency-audit/security recipe configured; automatic/scheduled execution paused.
- `M0-019` changelog/release process.
- `M0-020` CODEOWNERS/review rules.
- `M0-021` generated lockfile committed and frozen-install baseline previously validated.

### Architecture POC

- `M0-030` Fastify API POC **PASSED**.
  - Fastify `5.10.0`, `@fastify/swagger` `9.8.1`.
  - JSON Schema validation/serialization.
  - request IDs/error envelope.
  - typed authorization-hook seam.
  - OpenAPI 3.0.3 generation.
  - safe host/port parsing and graceful shutdown.
  - injection/unit/build/lint/type/format evidence validated before Actions pause.

### Platform contracts — module complete (9/9)

- `M0-070` API errors — `docs/contracts/api-errors.md`.
- `M0-071` pagination/filter/sort — `docs/contracts/pagination.md`.
- `M0-072` API compatibility/version metadata — `docs/contracts/api-compatibility.md`.
- `M0-073` platform bridge — `docs/contracts/platform-bridge.md`.
- `M0-074` storage provider — `docs/contracts/storage-provider.md`.
- `M0-075` notification event/channel — `docs/contracts/notification-events.md`.
- `M0-076` background jobs — `docs/contracts/background-jobs.md`.
- `M0-077` module boundaries — `docs/contracts/module-boundaries.md`.
- `M0-078` audit events — `docs/contracts/audit-events.md`.

Contract completion defines required behavior. It does not claim every adapter/provider/persistence layer is already implemented.

### Design-system definition tranche

- `M0-050` visual direction **DONE** — `docs/design-system/visual-foundation.md`.
  - semantic token architecture;
  - typography/spacing/density/radii/elevation;
  - restrained color/status system;
  - icon/focus/motion rules;
  - data/form hierarchy;
  - naming-independent brand layer.

- `M0-051` responsive layout principles **DONE** — `docs/design-system/responsive-layout.md`.
  - reference layout bands/gutters;
  - adaptive desktop/tablet/mobile shell behavior;
  - action prioritization;
  - forms/overlays;
  - explicit table narrow-screen strategies;
  - touch/pointer/keyboard;
  - zoom/localization/responsive acceptance checklist.

- `M0-060` accessibility gate **DONE** — `docs/design-system/accessibility.md`.
  - WCAG 2.2 AA-oriented semantics;
  - keyboard/focus;
  - contrast/touch/zoom/reflow;
  - forms/overlays/tables/custom widgets;
  - dates/timetables/charts;
  - reduced motion/high contrast;
  - manual + automated component test matrix.

- M0-052..059 implementation specifications prepared in `docs/design-system/component-specs.md`; tasks remain open until actual components/tests exist.

---

## 5. Architecture/product decisions still open

| ADR | Decision | State |
|---|---|---|
| ADR-006 | Vite final confirmation | PROVISIONAL |
| ADR-007 | Tauri 2 | PROVISIONAL pending POCs |
| ADR-008 | Fastify | PROVISIONAL; M0-030 passed, final M0-039 pending |
| ADR-009 | Drizzle | PROVISIONAL; executable M0-031 pending |
| ADR-012 | PostgreSQL-backed jobs | PROVISIONAL; contract complete, implementation unproven |
| ADR-015 | PostgreSQL RLS | OPEN |
| ADR-020 | OpenAPI documented API | PROVISIONAL; generation proven, typed-client evidence later |
| ADR-023 | ScolaOS final public brand | REJECTED; replacement OPEN |
| ADR-025 | auth session/token transport | OPEN |
| ADR-026 | full ledger vs fee subsystem | OPEN |

`docs/decision-amendments.md` supersedes older ADR-023 wording until ADR normalization.

---

## 6. Risk register

| Risk | Severity | Mitigation |
|---|---|---|
| Exact-name school-software conflict | High | Replace/screen final brand before public launch assets |
| Database POC accepted from static review | Critical | M0-031 requires real generated migrations + PostgreSQL execution |
| Installer remains privileged after setup | Critical | explicit install state/lock + integration tests |
| Permission model becomes unmaintainable | Critical | role + permission + scope catalog/service/tests |
| Cross-institution data leakage | Critical | server authorization + scoped DB relationships + audit tests |
| Private uploads become public | Critical | M0-074 private-by-default provider contract + authorized serving |
| Duplicate background work causes side effects | Critical | M0-076 at-least-once + idempotency/dedupe rules |
| Notifications race rolled-back writes | High | M0-075 transactional intent/outbox boundary |
| Audit logs leak sensitive data | Critical | M0-078 allow-listed metadata + secret prohibitions |
| Clients diverge across releases | High | M0-072 API major/capability compatibility discipline |
| Large lists become unstable/slow | High | M0-071 stable cursors + allow-listed queries + async exports |
| Platform-specific code contaminates features | High | M0-073 bridge + M0-077 dependency boundaries |
| Design system fragments by module | High | M0-050/M0-051 locked semantics + M0-052..059 shared implementation only |
| Mobile becomes shrunken desktop | High | M0-051 explicit composition/table/navigation strategies |
| Accessibility is deferred until release | Critical | M0-060 component-level definition-of-done gate |
| Tauri mobile limitations harm UX | High | platform POCs before ADR lock |
| Actions quota hides regressions | High | auto Actions paused; never claim fresh CI evidence without execution |

---

## 7. Quality evidence

| Gate | State |
|---|---|
| Dependency resolution/frozen lockfile | ✅ previously validated |
| Dependency audit | ✅ previously validated |
| Formatting/lint/typecheck/unit/build | ✅ Fastify revision validated before Actions pause |
| Playwright harness | ✅ validated before Actions pause |
| M0-030 Fastify POC | ✅ PASSED |
| M0-031 PostgreSQL POC | ⚠️ acceptance harness prepared; real execution pending |
| Platform contracts M0-070..078 | ✅ 9/9 defined |
| Design definition M0-050/M0-051/M0-060 | ✅ 3/3 defined |
| Design primitives M0-052..059 | ⬜ specifications ready; implementation pending |
| Design demo M0-061 | ⚠️ docs workspace ready; executable catalog pending |
| Product-name clearance | ⚠️ current name rejected; replacement pending |
| Automatic GitHub Actions | ⏸️ PAUSED by owner request |

No runtime source/dependencies/workflows are changed by the design-definition tranche, so earlier executable evidence is not being represented as validation of new component behavior.

---

## 8. Repository workflow policy

- direct-to-`main` only during bootstrap;
- no feature branches;
- no pull requests;
- no automated dependency branches/PRs;
- no new GitHub Actions workflows;
- existing Actions workflows remain manual-only while quota is constrained;
- no workflow/bot commits generated files to `main`;
- one coherent final commit per implementation batch.

---

## 9. Resume pointer

If work stops and the user says **continue**:

> `Prefer another long tranche, not one micro-task. M0-031 remains the primary executable blocker. If PostgreSQL/registry tooling is still unavailable, proceed with the actual M0-052..059 design-system implementation only in an environment where the new UI code can be typechecked/tested without GitHub Actions; otherwise continue non-runtime architecture work. M0-050, M0-051, M0-060 and all M0-070..078 contracts are defined. M0-061 remains open until an interactive component catalog exists. Do not use GitHub Actions while quota is constrained and do not create permanent branding under the temporary ScolaOS codename.`
