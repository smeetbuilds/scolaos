# Authorization enforcement and navigation foundation

**Date:** 15 August 2026  
**Status:** framework-neutral enforcement/projection core complete; real Fastify integration and client-shell consumption pending

This tranche closes the gap between the existing permission/scope evaluator and future API/client adapters. It does not make client navigation a security boundary and does not claim M1-066 API integration completion without real Fastify execution.

## Server enforcement

`apps/server/src/authorization/http-application.ts` combines the authenticated request boundary with the accepted permission/scope evaluator.

Properties:

- every protected operation carries a stable operation ID, one canonical `PermissionId`, and explicit single/bulk target mode;
- operation IDs and permission IDs are validated before use;
- authentication/transport/CSRF/forced-password-reset checks happen before permission evaluation;
- single-target operations evaluate the trusted server target;
- bulk operations require every target to pass; one scope escape rejects the entire operation;
- empty or unreasonably large bulk target sets are rejected;
- client-visible denial is always generic `PERMISSION_DENIED` regardless of missing grant vs scope mismatch;
- detailed denial reason is available only to safe audit metadata;
- the enforcement layer never branches on role names.

`AuthorizationPolicyRegistry` gives future route adapters a fail-closed registry: duplicate operation IDs are rejected and unregistered operations cannot be looked up silently.

## Permission-aware navigation

`apps/server/src/authorization/navigation.ts` provides a server-side navigation projection for client consumption. Visibility is derived from potentially usable permission grants, not role names.

Navigation is convenience only. A visible item does not imply access to every record under that route; the API must still evaluate target scope. A hidden item must never be the only protection for an API.

Projection rules include disabled actors receiving no navigation, empty dimension grants exposing nothing, linked-child navigation requiring at least one trusted linked child, empty sections being pruned, and catalog validation rejecting duplicate IDs/hrefs, unsafe external hrefs and unknown permissions.

## Denial audit semantics

`apps/server/src/audit/authorization-events.ts` emits `authorization.denied` drafts with user ID, stable operation ID, permission ID, internal decision reason, bounded target count, request ID when available, and institution/branch only when targets share one unambiguous value. It omits credentials and per-target resource lists.

## Unauthorized-access attack matrix

`security-matrix.ts` is a dependency-independent runner for maintained authorization attack cases. Permanent coverage includes allowed scoped access, wrong institution, wrong branch, disabled actor, linked child vs unrelated child, partial bulk scope escape, generic HTTP denial, target-mode misuse and empty-bulk rejection.

The matrix is core evidence only. M1-066 remains REVIEW until the same attack classes execute against real Fastify endpoints with persisted identity/grant data.

## Executed evidence

The current environment still lacks pnpm/Fastify/Vitest/PostgreSQL runtime dependencies. Dependency-independent evidence executed locally with Node 22.16.0 and global TypeScript 5.8.3:

- strict production-source typecheck: PASS;
- permanent test-source typecheck using a minimal Vitest declaration shim: PASS;
- `authorization-enforcement-harness: PASS`.

No repository Vitest, Fastify or PostgreSQL execution is claimed.

## Task impact

- **M1-065 permission-aware client navigation — IN PROGRESS:** projection/catalog core complete; actual web/native shell consumption remains.
- **M1-066 unauthorized API integration suite — REVIEW:** maintained attack matrix and enforcement tests exist; real Fastify endpoint execution remains.
- **M1-059 current-user/permission context — IN PROGRESS:** this projection can be attached by the eventual route adapter, but persisted principal loading/Fastify execution remain.
