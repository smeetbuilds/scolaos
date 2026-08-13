# API Error Contract

**Task:** M0-070  
**Status:** ACCEPTED  
**Effective:** 13 August 2026  
**Evidence:** `apps/server/src/errors.ts`, `apps/server/src/app.ts`, `apps/server/src/app.test.ts`

## Purpose

Define the stable error shape shared by the server, web client, desktop/mobile shells, integrations, logs and future generated API clients.

The contract is transport-facing. Internal exceptions, database errors and framework-specific error objects must not leak across the API boundary.

## Canonical envelope

Every application error response uses this top-level shape:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed.",
    "requestId": "c1d9c00e-7f09-4f35-bf58-d9f365dd53f3",
    "details": []
  }
}
```

Required fields:

- `error.code` — stable machine-readable application code.
- `error.message` — safe human-readable summary suitable for display or client mapping.
- `error.requestId` — correlation identifier for the request that produced the error.

Optional fields:

- `error.details` — structured, non-sensitive diagnostics when a client can act on them. It is omitted when there is no safe structured detail.

No successful response may use the `error` envelope as a normal data container.

## Request correlation

- Every request receives a server-generated request ID unless a future trusted-edge policy explicitly replaces that behavior.
- The same ID is returned in the `x-request-id` response header.
- Error envelopes carry the identical value in `error.requestId`.
- Logs for the request use the same correlation ID.
- Clients should include the request ID in support/debug surfaces, but must not treat it as an authorization token or secret.

## Error codes

Application codes use `UPPER_SNAKE_CASE` and describe a stable semantic condition, not a framework/library exception class.

Examples already proven by the Fastify POC:

- `VALIDATION_ERROR`
- `AUTH_REQUIRED`
- `AUTH_CONTEXT_MISSING`
- `NOT_FOUND`
- `INTERNAL_ERROR`

Future modules should prefer specific semantic codes such as `STUDENT_NOT_FOUND` or `PERMISSION_DENIED` when a client needs to distinguish outcomes. Do not expose PostgreSQL SQLSTATE names, driver classes, stack traces or raw third-party error strings as the public `code`.

Codes are part of the API compatibility surface. Renaming/removing a published code requires the same compatibility discipline as changing a documented response field.

## HTTP status mapping

The HTTP status communicates the transport-level class; `error.code` communicates the application-level reason.

Baseline mapping:

| HTTP | Meaning |
|---:|---|
| 400 | malformed or schema-invalid request |
| 401 | authentication required/invalid |
| 403 | authenticated actor lacks permission/scope |
| 404 | addressed resource or route is not available |
| 409 | valid request conflicts with current state/uniqueness/version |
| 422 | semantically invalid operation when schema validity alone is insufficient |
| 429 | request throttled/rate-limited |
| 500 | unexpected server failure with sanitized public message |
| 503 | temporary dependency/service unavailability when retry may be appropriate |

A module must not return `200` with an embedded error object for a failed operation.

## Validation details

Schema validation may populate `error.details` with entries shaped as:

```json
{
  "path": "/field",
  "keyword": "minLength",
  "message": "must NOT have fewer than 1 characters"
}
```

Each validation issue contains:

- `path` — request-relative location; `/` is allowed for root-level failures.
- `keyword` — validation rule identifier.
- `message` — safe validation explanation.

Validation details must never contain credentials, secrets, full database statements, internal filesystem paths or arbitrary serialized request bodies.

## Security and disclosure rules

For unexpected 5xx failures:

- log the underlying error internally with the request ID;
- return `INTERNAL_ERROR` (or another explicitly reviewed safe code);
- return a generic public message;
- never return stack traces, SQL text, connection strings, filesystem paths, access tokens, session identifiers or private upstream payloads.

Expected client-caused failures may return specific safe messages, but sensitive authorization reasoning should still be minimized when disclosure could help enumeration or privilege probing.

## Client behavior

Clients should branch primarily on `error.code`, using the HTTP status as the broader class. They should not parse English message text to determine behavior.

A generic client fallback must be able to render any unknown code using `error.message` plus the request ID. This allows newer servers to introduce codes without making older clients unusable.

## OpenAPI

Documented error responses use the shared error-envelope JSON Schema. Routes may add status-specific semantic codes in descriptions/examples, but must not fork the envelope shape locally.

The Fastify POC already proves the shared schema can be attached to route responses and emitted into OpenAPI 3.0.3.

## Change discipline

Additive changes are preferred. New optional detail fields may be introduced only when generic clients can safely ignore them. Removing/renaming required fields, changing their types, or changing the meaning of an established code is a compatibility change and must be handled through the API-versioning contract (`M0-072`).

## Acceptance evidence

M0-070 is considered complete because the contract is both documented here and implemented/tested by the already-validated Fastify POC:

- validation errors use the envelope;
- explicit application errors use the envelope;
- unknown routes use the envelope;
- request IDs match response headers;
- unexpected 5xx messages are sanitized;
- OpenAPI can reference the shared error schema.
