# ScolaOS — Product & Engineering Docs

Status: **M0 implementation in progress**  
Planning baseline: **13 August 2026**

This pack is the execution baseline for an open-source, self-hostable School Operating System designed for excellent UX, simple installation, strong performance, and a shared product experience across web, desktop, Android, and iOS.

## Documents

- [`prd.md`](./prd.md) — master product requirements and product boundaries.
- [`design.md`](./design.md) — technical architecture, UX architecture, data/security principles, deployment model, and cross-platform design.
- [`decision.md`](./decision.md) — architecture decision records (ADRs), including locked, provisional, and open decisions.
- [`tasklist.md`](./tasklist.md) — detailed implementation backlog with task IDs, dependencies, acceptance criteria, and release gates.
- [`project-tracker.md`](./project-tracker.md) — live execution tracker and milestone status board.
- `prds/001-installer-self-hosting.md` — installer, upgrades, deployment, backup, restore, health.
- `prds/002-identity-access.md` — authentication, RBAC/ABAC, scoping, auditability.
- `prds/003-school-core.md` — institutions, branches, sessions, students, guardians, academics.
- `prds/004-cross-platform-client.md` — responsive web, PWA, desktop, Android/iOS shell.
- `prds/005-platform-operations.md` — jobs, storage, email, notifications, diagnostics, observability.
- `prds/006-module-roadmap.md` — complete school-management feature map and staged module rollout.

## Status vocabulary

| Status | Meaning |
|---|---|
| `NOT STARTED` | No implementation work has begun. |
| `IN PROGRESS` | Actively being implemented in the current milestone. |
| `BLOCKED` | Cannot progress without a dependency or decision. |
| `REVIEW` | Implementation complete and awaiting review/testing. |
| `DONE` | Acceptance criteria and tests have passed. |
| `DEFERRED` | Intentionally moved to a later milestone. |

## Priority vocabulary

| Priority | Meaning |
|---|---|
| `P0` | Release/security blocker. |
| `P1` | Required for the target milestone. |
| `P2` | Important but can ship after core workflow. |
| `P3` | Enhancement / later optimization. |

## Delivery principle

A feature is not `DONE` merely because the happy-path screen exists. For this project, `DONE` requires the applicable items below:

1. UX flow implemented for desktop, tablet, and mobile.
2. Server-side authorization implemented.
3. Validation and error states implemented.
4. Database constraints/indexes reviewed.
5. Audit/event requirements implemented where applicable.
6. Unit/integration/E2E coverage added at the appropriate layer.
7. Accessibility keyboard/focus behavior reviewed.
8. Empty/loading/error states reviewed.
9. Performance reviewed with realistic dataset size.
10. Documentation updated.

## Technical baseline

The working baseline is:

- React + TypeScript shared client.
- Vite-based web client/PWA.
- Tauri 2 shell for desktop and mobile packaging.
- Fastify + TypeScript API server.
- PostgreSQL as the only mandatory infrastructure service.
- Drizzle ORM + versioned SQL migrations.
- Local filesystem storage by default; S3-compatible storage optional.
- PostgreSQL-backed background job queue initially.
- REST/OpenAPI API boundary.
- Web installer at `/start/installation`.

These are planning decisions, not unchangeable dogma. Any material change must be recorded in `decision.md` before implementation diverges.

## Primary official references

- Tauri 2: https://v2.tauri.app/
- Fastify validation/serialization: https://fastify.io/docs/latest/Reference/Validation-and-Serialization/
- Drizzle migrations: https://orm.drizzle.team/docs/migrations
- Drizzle PostgreSQL: https://orm.drizzle.team/docs/get-started/postgresql-new
- PostgreSQL row security: https://www.postgresql.org/docs/current/ddl-rowsecurity.html
