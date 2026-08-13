# Tasklist Amendments — M0/M1

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

- [x] **M0-070 [P0]** API error contract — `docs/contracts/api-errors.md`.
- [x] **M0-071 [P0]** Pagination/filter/sort contract — `docs/contracts/pagination.md`.
- [x] **M0-072 [P0]** API compatibility/version metadata — `docs/contracts/api-compatibility.md`.
- [x] **M0-073 [P0]** Platform-bridge interfaces — `docs/contracts/platform-bridge.md`.
- [x] **M0-074 [P0]** Storage-provider interface — `docs/contracts/storage-provider.md`.
- [x] **M0-075 [P0]** Notification event/channel interfaces — `docs/contracts/notification-events.md`.
- [x] **M0-076 [P0]** Background-job contract — `docs/contracts/background-jobs.md`.
- [x] **M0-077 [P0]** Module-boundary conventions — `docs/contracts/module-boundaries.md`, `eslint.config.mjs`, ADR-019.
- [x] **M0-078 [P0]** Audit-event contract — `docs/contracts/audit-events.md`.

**Contract-completion rule:** a contract task is DONE when the shared behavioral boundary is precise enough for independent implementations to conform without inventing incompatible semantics. Provider/adapter/database/native execution tasks must still pass their own executable acceptance criteria.

## Design-system foundation tranche

Completed definition/gate tasks:

- [x] **M0-050 [P0]** Define visual direction: typography, spacing, color semantics, radius, elevation, density.  
  **Evidence:** `docs/design-system/visual-foundation.md`.

- [x] **M0-051 [P0]** Define responsive layout principles and breakpoint strategy.  
  **Evidence:** `docs/design-system/responsive-layout.md`.

- [x] **M0-060 [P0]** Establish component accessibility tests/checklist.  
  **Evidence:** `docs/design-system/accessibility.md`.

Implementation specifications prepared but tasks remain open:

- [ ] **M0-052 [P0]** Button/IconButton/Link primitives — spec prepared in `docs/design-system/component-specs.md`; implementation/tests pending.
- [ ] **M0-053 [P0]** Form primitives/validation — spec prepared; implementation/tests pending.
- [ ] **M0-054 [P0]** Dialog/Sheet/Popover/Tooltip — spec prepared; implementation/tests pending.
- [ ] **M0-055 [P0]** Navigation primitives — spec prepared; implementation/tests pending.
- [ ] **M0-056 [P0]** Table/data-list foundation — spec prepared; implementation/tests pending.
- [ ] **M0-057 [P0]** Empty/loading/error/status primitives — spec prepared; implementation/tests pending.
- [ ] **M0-058 [P1]** Date/time/calendar primitives — spec prepared; implementation/tests pending.
- [ ] **M0-059 [P1]** Chart wrapper/metric components — spec prepared; implementation/tests pending.
- [ ] **M0-061 [P1]** Design-system documentation/demo workspace — **IN PROGRESS**.  
  **Prepared:** `docs/design-system/README.md` documentation workspace + component specification catalog.  
  **Still required:** executable interactive demo/catalog rendering the real `packages/ui` components and representative responsive/accessibility states. Static Markdown alone is not completion evidence.

## Early M1 installer backend/security tranche

Core tasks with executable local evidence:

- [x] **M1-001 [P0]** Explicit unconfigured/configured/installed boot states.  
  **Evidence:** `apps/server/src/installation/types.ts`, `config-store.ts`, `service.ts`, `core.test.ts`, `docs/pocs/installer-foundation.md`.

- [x] **M1-003 [P0]** Server config schema and safe persistence.  
  **Evidence:** validated config input/stored-config parsing, temp-file + fsync + atomic rename, restrictive directory/file modes, no secret fields in public config.

- [x] **M1-004 [P0]** Generated server security secrets.  
  **Evidence:** independent 32-byte server-generated session/installer secrets; installer input cannot supply them.

- [x] **M1-005 [P0]** Secret redaction from structured logs/errors.  
  **Evidence:** recursive key/text redaction, logger redact paths, sanitized unexpected/startup error logging.

- [x] **M1-030 [P0]** Installer lock against concurrent execution.  
  **Evidence:** exclusive `installer.lock` with ownership token and guarded release; concurrent-acquire runtime proof.

- [x] **M1-036 [P0]** Permanent installer mutation lock after success.  
  **Evidence:** matching installed marker + `markInstalledAfterVerification()`; config mutation and CSRF-session issuance disabled after installed state.

- [x] **M1-037 [P0]** Installer CSRF/request-origin strategy.  
  **Evidence:** HttpOnly host cookie, SameSite=Strict, Secure on HTTPS, HMAC header token, `Sec-Fetch-Site` rejection, Origin/Host/protocol match; local runtime verification passed.

Implemented but awaiting real Fastify/Vitest execution before DONE:

- [ ] **M1-002 [P0]** Restrict unconfigured server to installer-safe routes — **REVIEW**.  
  **Implemented:** global boot gate allows health + `/start/installation...` only until installed; application/OpenAPI routes return `INSTALLATION_REQUIRED`.  
  **Pending:** execute `apps/server/src/installation/integration.test.ts` with the repository's actual Fastify/Vitest dependencies.

- [ ] **M1-038 [P0]** Installer security integration tests — **REVIEW**.  
  **Implemented:** pre-install route gating, CSRF/cross-site rejection, secret-free config response, configured-vs-installed behavior, permanent installer lockout.  
  **Pending:** dependency-capable execution; no GitHub Actions while owner quota is paused.

Related existing foundation:

- [x] **M1-085 [P1]** Request/log correlation IDs.  
  **Evidence:** Fastify request IDs + `x-request-id` were previously validated in M0-030; unexpected API errors include the request ID and now use sanitized structured error data.

**Evidence note:** the installer core passed a local executable runtime harness and strict TypeScript check. The full changed TypeScript surface was syntax-transpiled. Fastify/Vitest runtime integration remains explicitly REVIEW because the current environment cannot install repository dependencies.

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
