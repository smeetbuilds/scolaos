# Operational administration foundation

**Date:** 15 August 2026  
**Status:** framework-neutral audit-query and health-admin backend complete; PostgreSQL/Fastify/UI adapters pending

This tranche establishes the backend read/application boundaries for the M1 administrative audit and health work. It deliberately does not claim audit persistence, a real Fastify endpoint, or responsive UI completion.

## Audit query model

`apps/server/src/audit/query.ts` provides a bounded keyset-pagination contract over `(occurredAt DESC, id DESC)` rather than mutable offset pagination.

Properties:

- page size defaults to 50 and is capped at 100;
- the read store is required to return newest-first rows and the service rejects adapter ordering/limit violations;
- cursors are opaque `aq1_` values authenticated with HMAC-SHA-256 using a server secret of at least 32 characters;
- cursor tampering produces a generic `AUDIT_CURSOR_INVALID` response;
- filters support institution, branch, actor user, exact action or action prefix, outcome/source sets and ISO time bounds;
- contradictory exact-action/action-prefix queries and invalid ranges are rejected before persistence;
- the service requests `limit + 1` rows to determine continuation without exposing internal primary-key pagination details.

The read-store port is persistence evidence only at the contract level. M1-080 remains open until PostgreSQL stores/queries audit events and the required durability/transaction behavior is executed.

## Audit export safety

The same query service supports a bounded export path capped at 5,000 rows. Oversized results fail and require narrower filters rather than silently truncating history.

CSV output includes stable audit columns and neutralizes values beginning with spreadsheet-formula prefixes (`=`, `+`, `-`, `@`, tab or carriage return) before RFC-style quoting. Metadata is intentionally not flattened into arbitrary CSV columns.

Successful authorized exports emit a separate `operations.audit.exported` audit draft containing only the actor, authorized institution/branch scope, request ID when available and exported row count.

## Authorization scope coupling

`apps/server/src/operations/admin-application.ts` composes the authorization layer with audit/health services.

Protected operations:

- `operations.audit.list` → `system.audit.read`;
- `operations.audit.export` → `system.audit.read`;
- `operations.health.read` → `system.health.read`.

Authorization is not only an entry gate. If the authorized target contains an institution or branch, those values are forced into the audit query. A caller authorized for one target cannot submit a different institution/branch filter and reach the read store.

## Health administration/readiness

`apps/server/src/health/admin.ts` projects fresh `HealthSnapshot` data into two separate views:

- full admin view with state counts, critical-first checks, summaries, bounded sanitized details and latency;
- minimal public readiness with only `ready`, `degraded`, or `unavailable` plus observation time.

A noncritical degraded check keeps the service ready-but-degraded. A critical `unhealthy` or `unknown` check makes readiness unavailable. Full health details remain behind `system.health.read` authorization in the operations application.

The existing `HealthCheckService` remains responsible for probe timeout/error normalization and prohibited-detail-key protection. Real DB/migration/storage/mail/worker providers still need production adapters before M1-084 can be called complete.

## Executed evidence

The current environment remains Node 22.16.0 with no pnpm/PostgreSQL/Docker/Podman and npm registry resolution failing with `EAI_AGAIN`.

Dependency-independent evidence executed locally:

- strict production-source TypeScript check: PASS;
- permanent test-source TypeScript check using a minimal Vitest declaration shim: PASS;
- `operations-admin-harness: PASS`.

The harness covered signed-cursor roundtrip/tampering, keyset continuation, spreadsheet-formula neutralization, degraded/critical readiness behavior, authorization-scope narrowing, scope-escape rejection, export auditing and health permission selection.

No repository Vitest, Fastify, PostgreSQL, Drizzle or browser execution is claimed.

## Task impact

- **M1-080 audit persistence — IN PROGRESS:** write service plus deterministic read-store/query contract now exist; real PostgreSQL durability/query execution remains.
- **M1-082 admin audit-list UX — IN PROGRESS:** secure filter/pagination/export backend/read model exists; Fastify route and responsive UI remain.
- **M1-083 health service — remains DONE:** the existing service now has an admin/readiness projection layer.
- **M1-084 health admin screen — IN PROGRESS:** authorized admin projection/readiness semantics exist; concrete DB/migration/storage/mail/worker providers and responsive UI remain.
- **M1-066 unauthorized API integration suite — remains REVIEW:** operational admin methods reuse the framework-neutral authorization boundary; real Fastify attack execution remains outstanding.
