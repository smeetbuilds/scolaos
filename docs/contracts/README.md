# Platform Contracts

This directory contains stable cross-cutting contracts shared across server, web, desktop/mobile shells and modules.

## M0 contract module — complete

- [`api-errors.md`](api-errors.md) — **M0-070** API error envelope, request correlation and disclosure rules.
- [`pagination.md`](pagination.md) — **M0-071** collection pagination, filtering, search and sorting semantics.
- [`api-compatibility.md`](api-compatibility.md) — **M0-072** API major/version metadata and compatibility discipline.
- [`platform-bridge.md`](platform-bridge.md) — **M0-073** web/native capability bridge and normalized platform failures.
- [`storage-provider.md`](storage-provider.md) — **M0-074** private-file provider abstraction and local/S3 portability rules.
- [`notification-events.md`](notification-events.md) — **M0-075** semantic notification intents, audiences, channels and delivery lifecycle.
- [`background-jobs.md`](background-jobs.md) — **M0-076** durable job states, leases, retries, idempotency and payload versioning.
- [`module-boundaries.md`](module-boundaries.md) — **M0-077** source/module dependency direction and modular-monolith conventions.
- [`audit-events.md`](audit-events.md) — **M0-078** append-only protected-action audit semantics and privacy rules.

## What “contract complete” means

These tasks define the guarantees that later implementations must satisfy. Completion of a contract does **not** imply every adapter/service is already built.

Examples:

- M0-073 is complete while Tauri camera/secure-storage/notification POCs remain executable gates.
- M0-074 is complete while local/S3 storage adapters remain implementation work.
- M0-075 is complete while provider integrations and notification UI remain later work.
- M0-076 is complete while the proposed PostgreSQL-backed queue remains unproven until database/architecture implementation work.
- M0-078 is complete while audit persistence/admin UX remain M1 tasks.

This distinction prevents architecture documents from being mistaken for production functionality.

## Cross-contract invariants

All implementations must preserve these shared rules:

1. authorization is server-authoritative and independent of opaque IDs/cursors/object keys/deep links;
2. externally visible machine codes/identifiers are stable compatibility surfaces;
3. retries and asynchronous work assume duplicate delivery can occur and must be idempotent;
4. secrets/raw provider errors/private paths are never normal client-facing data;
5. institution/branch scope is applied independently of client filters or platform state;
6. durable events/jobs/notifications carry request/job correlation where useful, but correlation IDs are not credentials;
7. implementation-specific technology remains behind module/provider/bridge boundaries.

## Change discipline

A later implementation may refine internal representation without changing these semantics. Material contract changes update the relevant document, architecture decision where applicable, compatibility impact and tests in the same implementation batch.