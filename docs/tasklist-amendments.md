# Tasklist Amendments — M0

This file records task-state changes and new stable IDs discovered after the original master backlog was committed. `docs/project-tracker.md` is authoritative for current status. These amendments must be folded into `docs/tasklist.md` during backlog normalization without renumbering existing IDs.

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

## Next architecture POC

- [ ] **M0-031 [P0]** Drizzle/PostgreSQL migration POC + integration tests.  
  **Depends:** M0-021, M0-030  
  **Must prove:** committed SQL migrations, deterministic apply order/version tracking, relational constraints/indexes, transaction semantics, repeatable integration tests against real PostgreSQL, safe failure behavior and evidence for ADR-009/environment support.  
  **Execution constraint:** do not create, re-enable, or trigger GitHub Actions while the owner quota constraint is active. Static code alone is not sufficient to mark this POC DONE.

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

`M6-091 LICENSE` remains open for production-release readiness. The repository declares AGPL-3.0-only; release packaging must include the canonical license text verbatim from an authoritative distribution.
