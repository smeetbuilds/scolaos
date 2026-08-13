# API Compatibility and Version Metadata Contract

**Task:** M0-072  
**Status:** ACCEPTED  
**Effective:** 13 August 2026  
**Related:** ADR-004, ADR-020, M0-070, M0-071

## Purpose

Keep web, desktop, mobile and integrations compatible with a self-hosted server that may be upgraded independently from its clients.

## Version axes

The system has two separate version concepts:

1. **API major** — compatibility boundary for public HTTP contracts.
2. **Server release version** — product build/release identifier.

The server release version changing does not imply an API-major change.

## URL versioning

Public application API routes use a major-version prefix:

```text
/api/v1/...
```

The major in the URL is authoritative for routing compatibility. Internal health/installation routes may sit outside `/api/v1` when they are explicitly platform bootstrap surfaces rather than normal application APIs.

Do not add minor versions to paths such as `/api/v1.2`.

## Compatibility metadata endpoint

The server exposes a lightweight metadata document under the active API major, conceptually:

```json
{
  "data": {
    "apiMajor": 1,
    "serverVersion": "0.0.0",
    "capabilities": [],
    "compatibility": {
      "minimumClientVersion": null
    }
  },
  "meta": {
    "requestId": "..."
  }
}
```

`capabilities` is for explicit feature/protocol negotiation when a client cannot safely infer support from release numbers. Capability identifiers are stable machine strings.

`minimumClientVersion` remains nullable until native/web release mechanics are established; clients must not invent policy when it is absent.

## Response metadata

The server may additionally return simple response headers such as `x-api-version` and `x-server-version` for diagnostics. Clients must treat the path major and metadata endpoint as the durable compatibility contract, not rely exclusively on optional diagnostic headers.

Avoid permanent branded header names while the final product name is unresolved.

## What is additive

Within one API major, these are normally backward-compatible when implemented safely:

- adding a new endpoint;
- adding a new optional request field with a backward-compatible default;
- adding a new optional response field;
- adding a new error code while preserving the error envelope;
- adding a new filter/sort option;
- adding a capability identifier;
- broadening an enum only when clients are already required to tolerate unknown values.

Clients must ignore unknown response fields unless a specific contract states otherwise.

## What is breaking

The following normally require a new API major or an explicit compatibility shim:

- removing/renaming a published field or endpoint;
- changing a field type or required/optional meaning incompatibly;
- changing authorization semantics in a way that makes a formerly valid client request structurally unusable;
- changing pagination cursor semantics so existing continuation tokens cannot be handled safely without a defined expiry/migration rule;
- changing the meaning of a published error code;
- narrowing an enum when existing clients may legitimately send the old value;
- changing identifier meaning/format when consumers persist it;
- changing a mutation from idempotent to non-idempotent without a new contract.

Security fixes may intentionally reject behavior that was previously accepted. Such cases must be documented as security-hardening exceptions rather than hidden as ordinary compatibility changes.

## Deprecation

Before removing a non-security-critical contract:

1. mark it deprecated in OpenAPI/documentation;
2. provide the replacement path/field;
3. keep both working for a documented transition window appropriate to self-hosted upgrade cadence;
4. collect implementation evidence that supported clients have migrated;
5. remove it only in a compatible major transition or under an explicitly approved exception.

A deprecation warning must not contain secrets or user data.

## OpenAPI discipline

OpenAPI is generated from server route schemas where possible and is part of the compatibility surface.

Rules:

- `info.version` identifies the server/API document build, while an explicit extension/description identifies the API major;
- published response schemas must match runtime serialization;
- reusable error and pagination schemas should be shared rather than forked per route;
- `deprecated: true` is used when a route/operation is formally deprecated;
- generated clients must still tolerate additive unknown response fields.

## Client startup behavior

A client connecting to a server should resolve compatibility before performing sensitive mutations when there is a realistic major-version mismatch.

Expected behavior:

- supported API major → continue;
- server exposes newer optional capabilities → older client continues unless it needs them;
- unsupported API major → fail with a clear upgrade/admin message rather than sending guessed requests;
- minimum supported client is explicitly higher than current client → block sensitive usage with a deterministic upgrade message;
- metadata endpoint unavailable due to old server → fall back only to an explicitly supported legacy rule, never assume newest compatibility.

## Native shell compatibility

Desktop/mobile releases can lag behind a self-hosted server. Server-side compatibility therefore cannot assume every user upgrades clients at the same moment as the administrator upgrades the backend.

Any future forced-upgrade policy must distinguish critical security incompatibility from ordinary feature drift.

## Database/internal versions

Database migration versions and job payload schema versions are internal compatibility axes. They must not be exposed as substitutes for the API major.

## Naming independence

Protocol identifiers should avoid unnecessary coupling to the temporary repository codename. Product-facing display names can change later without forcing an API-major break.

## Acceptance

M0-072 is complete because the project now has a precise major-version, additive-change, breaking-change, deprecation and client-negotiation policy. Actual compatibility endpoints/headers are implemented and tested with the first production API modules; this contract prevents those modules from inventing incompatible rules independently.