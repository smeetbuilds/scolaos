# Tasklist Amendments — M0

This file records task-state changes discovered after the original master backlog. `docs/project-tracker.md` is authoritative for current status. Stable task IDs are preserved and should be folded into `docs/tasklist.md` during later backlog normalization.

## Naming gate

- [ ] **M0-003 [P1]** Select project name after conflict/domain/repository/trademark screening — **IN PROGRESS / replacement required**.  
  **Finding:** an unrelated active school-software product already uses the exact ScolaOS name.  
  **Decision:** retain ScolaOS only as a temporary repository/engineering codename; reject it as the final public brand.  
  **Evidence:** `docs/brand-screening.md`, `docs/decision-amendments.md`.  
  **Still required:** replacement candidate + product/domain/repository/package/app-store screening + appropriate formal trademark clearance.  
  **Guardrail:** no final domains, public package namespaces, app-store assets, signing identities, launch assets or permanent wordmark branding under ScolaOS.

## Completed product/repository foundation

- [x] **M0-005 [P0]** Initial threat model — `docs/threat-model.md`.
- [x] **M0-013 [P0]** Linting/formatting/import-boundary rules.
- [x] **M0-014 [P0]** Vitest unit-test framework.
- [x] **M0-015 [P0]** Playwright Chromium E2E harness.
- [x] **M0-016 [P0]** CI quality recipe configured; automatic execution currently owner-paused/manual-only.
- [x] **M0-017 [P1]** Manual dependency update policy; no automated dependency PRs.
- [x] **M0-018 [P0]** Dependency-audit/security recipe configured; automatic/scheduled execution owner-paused/manual-only.
- [x] **M0-019 [P1]** Conventional change/release/changelog process.
- [x] **M0-020 [P1]** CODEOWNERS/review rules.
- [x] **M0-021 [P0]** Generated lockfile committed; frozen-install baseline previously validated.

## Completed architecture POC

- [x] **M0-030 [P0]** Fastify API POC.  
  **Evidence:** `apps/server`, `docs/pocs/fastify-api.md`.  
  **Proven:** schema validation/serialization, request IDs, standard error envelope, typed auth-hook seam, OpenAPI generation, safe server config, graceful shutdown and injection tests.  
  **Decision:** Fastify/OpenAPI remain provisional until later architecture lock, but the framework POC gate passed.

## Active architecture POC

- [ ] **M0-031 [P0]** Drizzle/PostgreSQL migration POC + integration tests — **IN PROGRESS**.  
  **Prepared evidence:** `docs/pocs/drizzle-postgres.md`, `tooling/postgres-poc/reference-schema.sql`, `tooling/postgres-poc/verify.sql`, `tooling/postgres-poc/run.sh`.  
  **Still required:** reviewed dependency installation + normally regenerated lockfile; typed Drizzle schema/config; generated SQL/metadata; real migration/re-migration journal proof; typed query/transaction tests; real PostgreSQL 16.14/18.4 constraint/index/rollback evidence.  
  **Rule:** no static-review-only completion and no hand-edited dependency resolution.

## Completed platform-contract module — 9/9

- [x] **M0-070 [P0]** API error contract.  
  **Evidence:** `docs/contracts/api-errors.md` plus previously validated Fastify behavior.  
  **Locks:** envelope, machine codes, request correlation, validation details, HTTP mapping, sanitized disclosure.

- [x] **M0-071 [P0]** Pagination/filter/sort contract.  
  **Evidence:** `docs/contracts/pagination.md`.  
  **Locks:** opaque stable cursors, deterministic sort/tie-breakers, typed allow-listed filters/search, page-size limits, optional totals, async-export boundary.

- [x] **M0-072 [P0]** API compatibility/version metadata.  
  **Evidence:** `docs/contracts/api-compatibility.md`.  
  **Locks:** `/api/v1` major boundary, additive/breaking rules, metadata/capabilities, deprecation and client/server compatibility behavior.

- [x] **M0-073 [P0]** Platform-bridge interfaces.  
  **Evidence:** `docs/contracts/platform-bridge.md`.  
  **Locks:** capability discovery, normalized platform failures, secure-storage/camera/files/notifications/deep-links/connectivity/share seams, dependency injection and security boundaries.  
  **Important:** this does not mark Tauri capability POCs complete.

- [x] **M0-074 [P0]** Storage-provider interface.  
  **Evidence:** `docs/contracts/storage-provider.md`.  
  **Locks:** private-by-default storage, application-owned metadata/authorization, opaque keys, atomic writes, idempotent delete, local/S3 portability and backup consistency.  
  **Important:** concrete local/S3 adapters remain implementation work.

- [x] **M0-075 [P0]** Notification event/channel interfaces.  
  **Evidence:** `docs/contracts/notification-events.md`.  
  **Locks:** semantic intents, audience resolution, channel/template separation, delivery lifecycle, idempotency/retry, transaction/outbox boundary, privacy and observability.  
  **Important:** email/push/SMS providers remain implementation work.

- [x] **M0-076 [P0]** Background-job contract.  
  **Evidence:** `docs/contracts/background-jobs.md`.  
  **Locks:** at-least-once semantics, job states, leases, retry classes, idempotency/dedupe, payload versioning, authorization context, scheduling/cancellation and dead-job visibility.  
  **Important:** PostgreSQL-backed queue implementation remains provisional/unproven.

- [x] **M0-077 [P0]** Module-boundary conventions.  
  **Evidence:** `docs/contracts/module-boundaries.md`, `eslint.config.mjs`, ADR-019.  
  **Locks:** default-deny dependency direction, modular-monolith ownership, test/production boundaries and exception process.

- [x] **M0-078 [P0]** Audit-event contract.  
  **Evidence:** `docs/contracts/audit-events.md`.  
  **Locks:** actor/action/resource/outcome semantics, append-only history, transaction/correlation rules, sensitive-data prohibitions, read authorization, retention and bulk-operation behavior.  
  **Important:** audit persistence/admin UX remain M1-080/M1-081.

## Contract-completion rule

A contract task is DONE when the shared behavioral boundary is precise enough for independent implementations to conform without inventing incompatible semantics. This is distinct from implementation completion. Provider/adapter/database/native execution tasks must still pass their own executable acceptance criteria.

## Main-only workflow policy

- direct-to-`main` only during bootstrap;
- no feature branches or pull requests;
- no automated dependency branches/PRs;
- no new GitHub Actions workflows;
- existing CI/security workflows remain manual-only while the Actions quota is constrained;
- do not restore push/PR/schedule triggers without explicit owner instruction;
- no workflow/bot commits generated files to `main`;
- one coherent final commit per implementation batch.

## Open-source packaging note

`M6-091 LICENSE` remains open for production-release packaging verification until the repository contains/validates the complete canonical AGPL-3.0-only license text as the final artifact.