# API Guide

**Task:** M6-100  
**Status:** MAINTAINED / documents the current pre-alpha API surface and contracts  
**Last reviewed:** 22 August 2026

The server is an API-first Fastify application. The current route surface is intentionally small because product modules are still being built. This document describes both the routes that exist now and the contracts future routes must follow.

## Base and versioning

Application APIs use the `/api/v1/...` namespace. Installer bootstrap endpoints are separately rooted at `/start/installation/...` because they exist before the normal application is installed.

The API compatibility and version-metadata policy is defined in `docs/contracts/api-compatibility.md`.

## Reverse proxies and request origin

Forwarded client/protocol data is trusted only when the operator explicitly configures `SCOLA_TRUST_PROXY` with the reverse-proxy addresses/CIDRs. An unconfigured server does not implicitly trust arbitrary forwarded headers.

## OpenAPI

Fastify registers OpenAPI 3.0.3 generation. On an installed instance, the development proof route is:

```text
GET /openapi.json
```

Before verified installation, normal application/OpenAPI routes are intentionally blocked by the boot gate.

Generated OpenAPI is a contract artifact, not a substitute for authorization or business tests.

## Request correlation

Every request receives a server-generated request ID. Responses expose it through:

```text
x-request-id: <id>
```

Response/error metadata uses the same correlation identifier. A request ID is diagnostic context, never an authentication credential.

## Response/error conventions

Successful route response shapes are schema-defined. Errors follow `docs/contracts/api-errors.md`:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed.",
    "requestId": "...",
    "details": []
  }
}
```

Clients branch on stable `error.code`, not English message text.

Baseline status semantics:

- `400` malformed/schema-invalid request;
- `401` authentication required/invalid;
- `403` authorization/policy denial;
- `404` unavailable resource/route;
- `409` state/version/uniqueness conflict;
- `422` semantically invalid operation when the request shape itself is valid;
- `429` throttled request;
- `500` sanitized unexpected failure;
- `503` temporarily unavailable dependency or pre-install application surface.

Unexpected server errors must not expose stack traces, SQL, connection strings, tokens, private paths or upstream private payloads.

## Current routes

### Process liveness

```text
GET /health
```

This is the lightweight process liveness probe used even before installation. It intentionally does not claim that PostgreSQL or other production dependencies are ready.

### Dependency readiness

```text
GET /health/ready
```

Runs the health service and returns dependency readiness. A critical dependency that is unhealthy or unknown makes readiness unavailable and returns HTTP `503`. Until the production PostgreSQL adapter supplies a real database probe, the default server deliberately fails readiness closed rather than reporting a false-ready state.

### Installer status and progress

```text
GET /start/installation/status
```

Returns safe boot/configuration state plus durable installer progress while configured. The current phase model is:

```text
UNCONFIGURED
  -> CONFIG_WRITTEN
  -> DB_CONNECTED
  -> MIGRATING
  -> SEEDING
  -> VERIFYING
  -> INSTALLED
```

Running/failed progress may include the active phase, attempt number and a bounded credential-safe failure record. Database passwords and generated server secrets are excluded.

### Installer requirements

```text
GET /start/installation/requirements
```

Runs safe bootstrap diagnostics for the Node runtime, cryptographic randomness, writable data/storage/temp directories, disk-space recommendation and HTTPS/base-URL classification. Remote HTTP is a blocking failure; HTTP remains permitted for direct localhost development. Results do not return private filesystem paths.

### Installer recovery

```text
GET /start/installation/recovery
```

Returns the safe recovery posture for the current installer phase: whether work is running, retryable, requires manual intervention, or permits correcting configuration before database setup advances. It does not expose credentials or make recovery mutations itself.

A stale installer lock may be reclaimed only after the configured stale-age boundary when its recorded process is no longer alive; active or ambiguous locks continue to fail closed.

### Installer CSRF session

```text
GET /start/installation/session
```

Issues the installer CSRF session while installation remains mutable. Direct loopback installation can request the session normally. Remote first-run installation additionally requires:

```text
x-installer-bootstrap: <SCOLA_INSTALLER_BOOTSTRAP_TOKEN>
```

The bootstrap credential is operator-supplied, is treated as secret log data, and is only needed to cross the remote first-run bootstrap boundary. After successful installation the endpoint is disabled.

### Initial installer configuration

```text
POST /start/installation/config
```

Requires the installer cookie + `x-installer-csrf` token and origin/fetch-site checks. Accepts base URL and PostgreSQL connection input, then returns only the safe public projection. Persisted remote base URLs must use HTTPS; loopback HTTP remains available for local development.

### Correct pending installer configuration

```text
PUT /start/installation/config
```

Uses the same CSRF/origin protections. It permits correcting the pending base URL/database configuration only before database setup has advanced beyond the pre-DB checkpoint. The update preserves the installation ID and generated server security secrets and never returns the database password.

These configuration routes do **not** complete installation. Database connection/privilege validation, real migrations, seeds and transactional institution/admin creation remain pending backend stages.

There is intentionally no public endpoint that accepts browser-supplied phase-completion or finalization assertions. Phase transitions and finalization belong to the trusted installer backend/orchestrator. The finalization engine requires seed completion and successful mandatory verification before the installed marker can be created.

### Schema-validation POC

```text
POST /api/v1/poc/echo
```

Exists only as framework/schema proof and is not part of the default production route surface. It is registered only when `enablePocRoutes: true` is explicitly supplied by a POC/test harness.

### Authorization-hook POC

```text
GET /api/v1/poc/protected
```

Uses the temporary POC actor header and is subject to the same explicit `enablePocRoutes: true` gate. It is not production authentication and must be removed/replaced when real persisted authentication routes are integrated.

## Authentication transport

ADR-025 defines first-party session transport:

- browser: opaque server-side credential in the approved HttpOnly cookie;
- desktop/mobile: opaque bearer credential stored through the native secure-storage bridge.

The raw credential is not a durable authorization claim. The server loads current account, grants and relationship context from authoritative persistence.

Authentication/login/logout/current-user routes are not yet part of the executable public API surface; their services are foundations only until persistence + Fastify integration are complete.

## Authorization

Every protected use case enforces authorization server-side through permission + scope, independent of UI visibility.

Route code must not treat client-supplied IDs as proof of membership, ownership or guardian linkage.

Denied operations use a generic stable 403 boundary rather than exposing the actor's internal grant evaluation.

## Collection routes

Future list endpoints follow `docs/contracts/pagination.md`:

- deterministic ordering;
- bounded pagination;
- allow-listed filter/sort fields;
- authorization applied before data is exposed;
- stable pagination metadata/cursors;
- no unbounded default collection dumps.

## Sensitive operations

Security-sensitive operations must integrate the relevant cross-cutting services:

- authorization service;
- required/best-effort audit policy;
- transaction boundaries;
- background job/outbox contract when asynchronous work follows a committed change;
- redaction and safe error policy;
- idempotency/concurrency controls for retryable or bulk effects.

## Adding a route

A route change is not complete until the relevant items are addressed:

1. stable path/method and versioning decision;
2. request schema with `additionalProperties` policy where appropriate;
3. response schemas for success and expected errors;
4. authentication and permission/scope requirement;
5. target resolution from trusted data;
6. business validation and transaction semantics;
7. audit requirement;
8. idempotency/concurrency behavior;
9. request correlation/error contract;
10. unit/integration/authorization tests;
11. OpenAPI generation and this guide/contract updates when user-facing API semantics change.

## Contract index

- `docs/contracts/api-errors.md`
- `docs/contracts/pagination.md`
- `docs/contracts/api-compatibility.md`
- `docs/contracts/module-boundaries.md`
- `docs/contracts/audit-events.md`
- `docs/contracts/background-jobs.md`
- `docs/contracts/storage-provider.md`
- `docs/contracts/notification-events.md`
