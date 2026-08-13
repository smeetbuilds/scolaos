# PROJECT_TRACKER.md — Live Execution Board

**Project status:** `IN PROGRESS`  
**Current milestone:** `M0 — Product & Architecture Foundation`  
**Last updated:** 13 August 2026

This file is the authoritative compact execution state of the project. Detailed work-item definitions live in `tasklist.md` plus post-baseline additions in `tasklist-amendments.md`. If an older checkbox disagrees with a same-ID status recorded here, this tracker wins until backlog normalization.

---

## 1. Milestone status

| Milestone | State | Completion | Entry criteria | Exit gate |
|---|---|---:|---|---|
| M0 Product & Architecture Foundation | IN PROGRESS | 28% | Planning pack accepted | Architecture POCs + CI + design foundations |
| M1 Installable Platform Alpha | NOT STARTED | 0% | M0 gate | Web install + auth + permissions + health |
| M2 Students & Academic Core | NOT STARTED | 0% | M1 gate | Academic structure + secure student lifecycle |
| M3 Daily Operations | NOT STARTED | 0% | M2 gate | Timetable + attendance + assignments + announcements |
| M4 Fees & Examinations | NOT STARTED | 0% | M3 gate | Financial/exam core passes integrity gates |
| M5 Cross-Platform & Offline Beta | NOT STARTED | 0% | Stable core client/API | Desktop/mobile + offline attendance |
| M6 Production 1.0 Hardening | NOT STARTED | 0% | M4/M5 stable | Security + backup + upgrade + docs + release |
| M7+ Extended Modules | DEFERRED | 0% | 1.0 | Per-module gates |

---

## 2. Current work queue

### IN PROGRESS

None at commit boundary.

### NEXT — exact execution order

1. `M0-021` Generate/commit `pnpm-lock.yaml` from the approved CI toolchain and switch CI/security installs to `--frozen-lockfile`.
2. `M0-030` Fastify API POC with validation, error envelope, request IDs, auth hook stub, and OpenAPI generation.
3. `M0-031` Drizzle/PostgreSQL migration POC + integration tests; use evidence to lock supported PostgreSQL matrix.
4. `M0-004` Confirm supported server environment after API/database POCs.
5. `M0-032..038` Tauri desktop/mobile proof set and Tauri ADR decision.
6. `M0-039` Decide Fastify/Drizzle ADRs based on POC results.
7. `M0-050..061` Design-system foundation.
8. `M0-070..078` Platform contracts.
9. `M0-GATE` M0 release gate review.

### BLOCKED / EXTERNAL VALIDATION

- `M0-003` Product-name trademark/domain conflict screening remains intentionally open. Repository/name availability alone is not a legal trademark clearance.
- `M0-021` Lockfile cannot be generated in the current execution container because outbound npm access is unavailable; CI is configured to generate and upload it as a short-lived artifact.

### DONE

Product/security foundation:

- `M0-001` Master PRD boundaries accepted as implementation baseline.
- `M0-002` AGPL-3.0-only selected.
- `M0-005` Initial threat model created for installer, auth, scopes, files, finance, updates, backups, jobs, logs, and native/offline clients.

Repository/tooling foundation:

- `M0-010` Monorepo structure initialized.
- `M0-011` pnpm workspaces selected.
- `M0-012` Strict TypeScript baseline added.
- `M0-013` ESLint flat config, Prettier, and monorepo import-boundary policy configured.
- `M0-014` Vitest unit-test harness and V8 coverage configuration added.
- `M0-015` Playwright Chromium E2E harness added.
- `M0-016` CI workflow configured for formatting, lint, typecheck, unit tests, build, and E2E harness.
- `M0-017` Weekly Dependabot policy configured for npm and GitHub Actions.
- `M0-018` Dependency-audit workflow configured; public-repository GitHub secret scanning documented as baseline.
- `M0-019` Conventional change/changelog/release process added.
- `M0-020` CODEOWNERS and review checklist added for the current maintainer.

Planning pack committed:

- Master PRD.
- Architecture/design baseline.
- ADR/decision log.
- Detailed execution tasklist + M0 amendments.
- Live tracker.
- Threat model.
- Installer PRD.
- Identity/access PRD.
- School-core PRD.
- Cross-platform PRD.
- Platform-operations PRD.
- Module roadmap PRD.

---

## 3. Open decisions

| ADR | Decision | Blocking milestone | State |
|---|---|---|---|
| ADR-006 | Vite final confirmation | M0 | PROVISIONAL |
| ADR-007 | Tauri 2 final confirmation | M0 | PROVISIONAL |
| ADR-008 | Fastify final confirmation | M0 | PROVISIONAL |
| ADR-009 | Drizzle final confirmation | M0 | PROVISIONAL |
| ADR-012 | PostgreSQL job queue implementation | M0/M6 | PROVISIONAL |
| ADR-015 | PostgreSQL RLS strategy | M1 | OPEN |
| ADR-020 | OpenAPI implementation details | M0 | PROVISIONAL |
| ADR-022 | AGPL-3.0-only | M0 | ACCEPTED |
| ADR-023 | ScolaOS working name; formal screening pending | Pre-1.0 | PROVISIONAL |
| ADR-024 | pnpm workspaces; no Turborepo initially | M0 | ACCEPTED |
| ADR-025 | Auth session/token transport | M1 | OPEN |
| ADR-026 | Full ledger vs fee subsystem for 1.0 | M4 | OPEN |

---

## 4. Risk register

| Risk | Severity | Probability | Mitigation | Owner/status |
|---|---|---|---|---|
| Tauri mobile limitations create poor iOS/Android UX | High | Medium | POC before core architecture lock; retain alternative shell path | M0 |
| Installer exposes privileged setup after install | Critical | Medium | explicit boot state, installer lock, security integration tests | M1 |
| Permissions become unmaintainable | Critical | Medium | permission catalog + scopes + dedicated authorization service/tests | M1 |
| Academic model embeds one country's assumptions | High | Medium | generic session/class/term model; regional adapters/settings | M2 |
| Fees implementation behaves like accounting without accounting guarantees | High | Medium | resolve ADR-026; explicit scope; audit and immutable receipts | M4 |
| Offline sync corrupts attendance | High | Medium | limited workflow, idempotency, conflict/version strategy, E2E | M5 |
| Self-host upgrades break DB | Critical | Medium | immutable migrations, compatibility metadata, N-1 tests, backups | M6 |
| Local private uploads become publicly exposed | Critical | Medium | authorized file serving + path hardening + security tests | M6 |
| Feature breadth destroys UX quality | High | High | milestone gating; role-specific IA; each module requires responsive UX acceptance | Always |
| Open-source contributions erode architecture | Medium | Medium | module boundaries, ADRs, contribution docs, CI checks | M6+ |
| Dependency/toolchain drift breaks reproducibility | High | Medium | exact pins, lockfile task, frozen CI after artifact commit, Dependabot | M0 |

---

## 5. Quality gates dashboard

| Gate | M0 | M1 | M2 | M3 | M4 | M5 | M6 |
|---|---|---|---|---|---|---|---|
| Typecheck/lint | ⬜ CI run pending | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Unit tests | ⬜ CI run pending | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Integration tests | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| E2E critical paths | ⬜ CI harness pending | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Authorization tests | N/A | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Responsive review | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Accessibility review | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Performance review | POC | POC | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Security review | ✅ initial threat model | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Docs updated | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |

Legend: `⬜` pending, `✅` passed, `⚠️` passed with accepted issue, `❌` failed.

---

## 6. Definition of task status changes

### NOT STARTED → IN PROGRESS

Allowed only when dependencies are satisfied or explicitly accepted as parallel work.

### IN PROGRESS → REVIEW

Requires:

- implementation present;
- local relevant tests pass where executable in the current environment;
- acceptance criteria self-checked;
- docs/ADR updated if behavior changed.

### REVIEW → DONE

Requires reviewer/CI/quality gate pass appropriate to the task. For repository-configuration tasks, `DONE` means the requested control is committed/configured; the milestone quality gate still remains pending until CI evidence exists.

### Any → BLOCKED

Record:

- blocker;
- exact decision/dependency;
- next action;
- owner if known.

---

## 7. Resume pointer

If work stops and the user says **continue**, resume at:

> `M0-021 — commit the CI-generated pnpm-lock.yaml and freeze installs`. If the CI artifact is unavailable or the workflow failed before generating it, diagnose/fix that workflow first in the same milestone, then continue to `M0-030`.
