# Architecture and Module Contribution Guide

**Task:** M6-099  
**Status:** MAINTAINED / current architecture contract  
**Last reviewed:** 14 August 2026

This guide turns the accepted ADRs and module-boundary contract into practical rules for contributors. It is not permission to bypass an open architecture POC.

## Architecture shape

The product starts as a modular monolith with an API-first client/server boundary.

```text
apps/
  server/       Fastify API, installer, domain/application services, jobs
  web/          shared web/PWA client
  shell/        Tauri platform shell
packages/
  domain/       framework-independent shared domain contracts
  ui/           shared design-system primitives
  api-client/   client-side API boundary
  config/       foundational shared configuration
tooling/        repository tooling and executable POCs
tests/e2e/      browser/system E2E tests
```

The enforced package dependency graph is documented in `docs/contracts/module-boundaries.md` and implemented by ESLint boundaries rules. A local lint disable is not an acceptable architecture fix.

## Server modules

New business capabilities belong under an owning server module rather than a generic helpers directory.

Recommended shape when the capability is large enough to justify it:

```text
apps/server/src/modules/<feature>/
  index.ts
  domain/
  application/
  infrastructure/
  http/
```

Do not pre-create empty layers. Introduce structure when code actually needs it.

Cross-module collaboration should prefer an intentional public service/contract surface. A module must not reach through another module's internal repository implementation to mutate its tables.

## Data ownership

Every table/entity has one primary owning module.

Cross-module foreign keys are allowed when they express real integrity, but write ownership remains explicit. Reporting queries may cross boundaries when justified; they must not become hidden second write paths.

Released migrations are immutable. Schema changes must follow the migration architecture accepted by `M0-031/M0-039` once that stack is proven.

## Authorization

Never authorize by role-name branches such as `if (role === 'teacher')`.

Use the permission registry plus explicit trusted scope context. Client-supplied institution, branch, class, subject, student, or ownership IDs are request inputs, not evidence of authorization.

Protected operations must:

1. authenticate the current principal from authoritative server state;
2. resolve the target/resource scope from trusted persistence;
3. call the authorization service with the required permission;
4. fail closed on incomplete scope;
5. apply the same rule to every target in bulk operations.

UI permission checks shape the experience only; they are never the security boundary.

## Authentication and secrets

First-party authentication uses opaque server-side sessions. Browser and native transport rules are fixed by ADR-025 in `docs/decision-amendments.md`.

Do not log or audit passwords, hashes, session/reset tokens, raw authorization headers/cookies, database connection strings, private keys, or unnecessary sensitive student data.

## Audit

Use the canonical contract in `docs/contracts/audit-events.md` and the service in `apps/server/src/audit/`.

High-integrity mutations should persist the required audit event in the same durable transaction when practical. `recordRequired()` is for operations that must not commit without their audit event. `recordBestEffort()` is reserved for explicitly classified cases such as a security failure that occurs outside a successful business transaction.

Audit metadata is allow-listed context, not a request-body dump.

## Background jobs

The system assumes at-least-once execution. Every handler must be idempotent or place an idempotency guard around externally visible effects.

Read `docs/job-handler-guidelines.md` before implementing any durable worker, scheduler, import, report, notification, backup, or maintenance job.

Default self-hosting must not require Redis/RabbitMQ/Kafka unless a later ADR demonstrates measured need.

## Storage

Core storage is private by default. Business modules reference storage objects through the provider contract rather than assuming a local filesystem path. Authorized download/streaming belongs at the application boundary.

## API design

Follow `docs/api.md` and the contracts under `docs/contracts/`.

- version application APIs under `/api/v1/...`;
- use the standard error envelope;
- preserve request IDs;
- validate requests and serialize responses through schemas;
- keep machine-readable error codes stable;
- follow the pagination/filter/sort contract for collection APIs;
- update OpenAPI-facing schemas and documentation with route changes.

Do not return `200` for failed operations with an embedded error object.

## Client/platform design

One design system is shared across platforms, but 100% code sharing is not a goal. Camera, secure storage, notifications, files, deep links, background behavior and other native capabilities go behind platform bridges.

Mobile composition must be designed for mobile; it is not a scaled-down desktop layout. Component work must satisfy the responsive and WCAG 2.2 AA-oriented gates in `docs/design-system/`.

## Adding a module

Before adding a new module:

1. identify the stable roadmap/task ID;
2. state the module's owned entities and invariants;
3. identify permissions/scopes;
4. identify audit-sensitive actions;
5. identify synchronous vs background work;
6. identify private-file needs;
7. identify client roles/platforms;
8. define transaction/concurrency/idempotency expectations;
9. add tests at the appropriate domain, integration, authorization and E2E layers;
10. update PRD/ADR/contracts when the implementation changes an existing product boundary.

A module is not complete when only its CRUD happy path exists.

## Dependency changes

New dependencies require the review in `docs/dependency-policy.md`. Prefer platform/runtime capabilities already present when they are appropriate and maintainable. Never add a dependency without normally regenerating the committed lockfile.

## ADR threshold

Create or amend an ADR when a change materially affects deployment requirements, persistence, authentication/session strategy, authorization, cross-platform architecture, API compatibility, storage, job infrastructure, licensing, or other long-lived system boundaries.

Small implementation choices inside an accepted boundary do not need a new ADR.
