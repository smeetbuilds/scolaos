# Tasklist Amendments — M0

This file records task-state changes and new stable IDs discovered after the original master backlog was committed. `docs/project-tracker.md` is authoritative for current status. These amendments must be folded into `docs/tasklist.md` during backlog normalization without renumbering existing IDs.

## Naming gate

- [ ] **M0-003 [P1]** Select project name after conflict/domain/repository/trademark screening — **IN PROGRESS / replacement required**.  
  **Finding:** preliminary screening on 13 August 2026 found an unrelated active school-software product already using the exact **ScolaOS** name at `scolaos.com`.  
  **Decision:** ScolaOS is rejected as the final public product brand and retained only as a temporary repository/engineering codename.  
  **Evidence:** `docs/brand-screening.md`, `docs/decision-amendments.md`.  
  **Still required:** select a replacement and complete product/domain/repository/package/app-store screening plus appropriate formal trademark clearance before public 1.0 branding.  
  **Guardrail:** do not create new final domains, public package namespaces, app-store assets, signing identities, launch assets or permanent wordmark branding under ScolaOS.

## Completed repository/tooling tasks

- [x] **M0-005 [P0]** Initial threat model. Evidence: `docs/threat-model.md`.
- [x] **M0-013 [P0]** Linting/formatting/import-boundary rules. Evidence: `eslint.config.mjs`, `prettier.config.mjs`, `.prettierignore`.
- [x] **M0-014 [P0]** Unit-test framework. Evidence: `vitest.config.ts`, `tooling/tests/harness.test.ts`.
- [x] **M0-015 [P0]** Playwright E2E harness. Evidence: `playwright.config.ts`, `tests/e2e/harness.spec.ts`.
- [x] **M0-016 [P0]** CI quality recipe configured. Automatic execution is currently paused by owner request because the GitHub Actions quota is constrained; the workflow is retained as manual-only `workflow_dispatch`.
- [x] **M0-017 [P1]** Dependency update policy: manual review/direct-to-`main`; automated dependency PR creation disabled.
- [x] **M0-018 [P0]** Dependency-audit/security recipe configured. Automatic and scheduled execution is currently paused by owner request; the workflow is manual-only.
- [x] **M0-019 [P1]** Conventional change/release/changelog process.
- [x] **M0-020 [P1]** CODEOWNERS and maintainer review rules.
- [x] **M0-021 [P0]** Commit generated pnpm lockfile and freeze dependency installs.  
  **Evidence:** committed generated lockfile plus previously validated frozen quality/security runs.  
  **Integrity rule:** dependency changes must update package manifests and the generated lockfile together.

## Completed architecture POCs

- [x] **M0-030 [P0]** Fastify API proof of concept.  
  **Depends:** M0-012, M0-013, M0-014, M0-021  
  **Evidence:** `apps/server`, `docs/pocs/fastify-api.md`. Fastify `5.10.0` + `@fastify/swagger` `9.8.1` passed installation, formatting, lint, strict TypeScript, Vitest injection tests, build, Playwright harness and dependency audit before automatic GitHub Actions were paused.  
  **Proven:** JSON Schema validation/serialization, request IDs, standardized error envelopes, typed authorization-hook context, OpenAPI generation, safe config parsing, graceful shutdown.  
  **Decision effect:** ADR-008 and ADR-020 remain provisional until the later architecture lock; M0-030 removes the framework-level proof blocker.

## Completed platform contracts

- [x] **M0-070 [P0]** Define API error contract.  
  **Evidence:** `docs/contracts/api-errors.md`, `apps/server/src/errors.ts`, `apps/server/src/app.ts`, `apps/server/src/app.test.ts`.  
  **Locked semantics:** top-level `error` envelope; stable machine code; safe message; request correlation ID; optional structured validation details; `x-request-id` parity; no raw framework/database/stack leakage; compatibility discipline for published codes/fields.  
  **Validation basis:** the implementing Fastify error path and request-correlation behavior were already exercised by the validated M0-030 injection tests before Actions were paused. No runtime code changed to close this documentation task.

- [x] **M0-077 [P0]** Define module-boundary conventions.  
  **Evidence:** `docs/contracts/module-boundaries.md`, `eslint.config.mjs`, ADR-019.  
  **Locked semantics:** default-deny top-level dependency direction; server/client/shared-package separation; domain/config foundation rules; production cannot import tests; modular-monolith feature ownership; reviewed exception process.  
  **Validation basis:** the top-level dependency graph is already enforced with `eslint-plugin-boundaries`; the lint configuration was validated before Actions were paused. The new document formalizes the existing enforced architecture and finer-grained module convention.

## Active architecture POC

- [ ] **M0-031 [P0]** Drizzle/PostgreSQL migration POC + integration tests — **IN PROGRESS**.  
  **Depends:** M0-021, M0-030  
  **Prepared evidence:** `docs/pocs/drizzle-postgres.md`, `tooling/postgres-poc/reference-schema.sql`, `tooling/postgres-poc/verify.sql`, `tooling/postgres-poc/run.sh`.  
  **Candidate stable stack:** Drizzle ORM `0.45.2`, Drizzle Kit `0.31.10`, `pg` `8.22.0`, `@types/pg` `8.20.0`; node-postgres is the candidate driver.  
  **Prepared semantics:** UUID keys, institution-scoped uniqueness, FK enforcement, compound institution/student FK, checks, indexes, explicit rollback proof and disposable-database safety guard.  
  **Still required:** add reviewed dependencies with a normally regenerated lockfile; implement typed Drizzle schema/config; generate and commit Drizzle SQL/metadata; apply to real PostgreSQL; verify `drizzle.__drizzle_migrations`; repeat migration application; run typed query/transaction integration tests; run the prepared acceptance harness on PostgreSQL 16.14 and 18.4.  
  **Execution constraint:** current runtime has no PostgreSQL/psql/Docker/Podman and no package-registry connectivity. Do not hand-edit the lockfile or mark this POC DONE from static SQL. Do not use GitHub Actions while the owner quota constraint is active.

## Remaining platform contracts

- [ ] **M0-071 [P0]** Pagination/filter/sort contract.
- [ ] **M0-072 [P0]** API compatibility/version metadata.
- [ ] **M0-073 [P0]** Platform-bridge interfaces.
- [ ] **M0-074 [P0]** Storage-provider interface.
- [ ] **M0-075 [P0]** Notification event/channel interfaces.
- [ ] **M0-076 [P0]** Background-job contract.
- [ ] **M0-078 [P0]** Audit-event contract.

## Main-only workflow policy

- Direct-to-`main` only during bootstrap.
- No feature branches or pull requests.
- No automated dependency branches/PRs.
- No new GitHub Actions workflows.
- Existing CI/security workflows are manual-only while the account Actions quota is constrained.
- Do not restore `push`, `pull_request`, or scheduled Actions triggers without explicit owner instruction.
- No workflow or bot may commit generated files to `main`.
- One coherent final commit per implementation batch.

## Open-source packaging note

`M6-091 LICENSE` remains open for production-release readiness. The repository declares AGPL-3.0-only; release packaging must include and verify the complete canonical license text verbatim from an authoritative distribution. An attempted transfer must not be committed unless byte integrity is known.
