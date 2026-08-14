# Institution & Academic Settings Domain Foundation

**Scope:** M1-070..075 foundation  
**Completed task:** M1-073 term/semester model  
**Evidence:** `packages/domain/src/institution.ts`, permanent tests, local executable harness

This tranche establishes the dependency-independent domain invariants for institution settings, branches, academic sessions, terms and branding metadata before those concepts are committed to PostgreSQL migrations.

## Institution settings

The domain normalizes and validates:

- institution name;
- short code;
- two-letter country code;
- IANA timezone;
- three-letter currency code supported by the runtime;
- canonical BCP 47 locale;
- configurable week-start day.

The model is intentionally country-neutral and does not embed India-, UK- or US-specific assumptions in core identifiers.

## Branding boundary

Branding metadata stores an **opaque storage key**, not an arbitrary remote URL or filesystem path. Keys that are absolute paths, contain traversal segments, or look like URLs are rejected.

Actual image upload/storage authorization remains part of the storage-provider implementation and M1-074 is therefore still IN PROGRESS.

## Branch invariants

Branch normalization and catalog validation establish:

- branch IDs are unique;
- branch code is unique inside its institution;
- an inactive branch cannot be the default;
- every institution with active branches has exactly one default branch;
- switching the default branch updates only branches from the same institution and validates the resulting catalog.

Persistence, CRUD API authorization and responsive management UX remain M1-071 work.

## Academic sessions

Academic sessions have explicit:

- institution ID;
- stable code/name;
- start/end dates;
- lifecycle state: `planned`, `active`, or `closed`.

Catalog invariants:

- session IDs are unique;
- session codes are unique inside the institution;
- there can be at most one active academic session per institution;
- activating a planned session demotes the prior active session back to planned;
- closed sessions cannot be reactivated;
- historic closed sessions remain valid domain records rather than being overwritten.

Persistence and management API/UI remain M1-072 work.

## Term / semester model

M1-073 is complete at the domain-model level.

Each term records:

- stable ID;
- parent academic-session ID;
- stable code/name;
- start/end dates;
- explicit sequence number.

Validation enforces:

- real `YYYY-MM-DD` dates;
- end after start;
- sequence 1..99;
- term ID/code/sequence uniqueness within a session;
- term dates stay inside the parent academic session;
- terms in the same session do not overlap.

This is sufficient to lock the term/semester domain model. The future Drizzle schema must persist these invariants with appropriate unique/check/FK constraints where PostgreSQL can enforce them, plus transaction/service checks where cross-row constraints are required.

## Test evidence

A strict TypeScript compile and executable Node harness passed for:

- institution settings normalization;
- invalid timezone rejection;
- opaque branding key validation;
- branch uniqueness/default switching;
- academic-session active-state switching;
- closed-session non-reactivation;
- valid term ranges;
- overlapping term rejection.

Permanent Vitest tests mirror the core invariants, but repository Vitest execution is not claimed in the current dependency-constrained environment.

## Persistence boundary

This module does **not** make M1-070, M1-071, M1-072, M1-074 or M1-075 complete. Those tasks still require the production persistence/API/authorization/UI layers appropriate to their wording.

The purpose of this foundation is to prevent the later M0-031/M1 database tranche from inventing school-core semantics directly in migrations without an independently tested domain contract.
