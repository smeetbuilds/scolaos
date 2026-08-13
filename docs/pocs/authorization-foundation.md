# Authorization Foundation POC

**Tasks:** M1-060, M1-061, M1-062, M1-063  
**Status:** ACCEPTED for the dependency-independent authorization core  
**Date:** 13 August 2026

## Purpose

Establish a fail-closed Role + Permission + Scope authorization core before database persistence, authentication sessions, or module APIs are built.

## Implemented module

`apps/server/src/authorization/` contains a versioned permission registry, configurable default-role templates, grant/actor/target types, fail-closed scope matching, single/bulk authorization services, a stable 403 boundary, and permanent Vitest regression coverage.

## Security model

- Runtime authorization never branches on role names.
- Role templates expand to explicit grants and enforce their allowed scope strategy.
- Super Administrator explicitly enumerates the current permission catalog, so a new permission requires a deliberate role-template/test update rather than silent privilege expansion.
- Unknown permissions fail closed.
- Empty dimension grants match nothing; broad access requires an explicit reviewed scope.
- Every dimension present on a grant must be present and equal on the trusted target.
- Student self-service uses an actor-owned record/student relationship.
- Guardian access uses trusted linked-child student IDs.
- Bulk authorization passes only when every target is allowed.
- Public denial is the stable generic `PERMISSION_DENIED` 403 and does not disclose grant/scope internals.

## Trusted-context boundary

The evaluator is not a database ownership oracle. `AuthorizationActor` relationships and `AuthorizationTarget` dimensions must be constructed from authoritative server-side resolution. Routes must not treat client-supplied institution, branch, class, subject, or student IDs as proof of access.

Future API/application-service integration must resolve the target resource and actor assignments/relationships first, then call this authorization service.

## Scope POC

Dimension scopes support institution, branch, academic session, class section, and subject. Relationship scopes support own-record and linked-children access. Missing required target dimensions fail closed.

Default role materialization also rejects scope escalation: institution roles require an institution dimension, assigned roles require an institution plus a narrower assignment, Student requires own-record, and Parent/Guardian requires linked-children.

## Executed evidence

This tranche used no GitHub Actions and added no dependency. A strict local TypeScript compile and executable Node harness passed against the module design, covering catalog consistency, role-scope escalation rejection, teacher assignment boundaries, disabled actors, unknown permissions, student self-access, guardian linked-child access, bulk denial, and stable 403 behavior.

The committed Vitest suite records the same invariants for normal repository execution.

## Task effects

DONE: M1-060 permission registry, M1-061 default role templates, M1-062 server authorization service, and M1-063 scope model POC.

Prepared but open: M1-033 DB permission seed, M1-052 persistence schemas, M1-064 RLS decision, M1-065 client navigation, and M1-066 unauthorized API integration suite.

Pure authorization evidence is not a substitute for persistence or direct API attack tests.
