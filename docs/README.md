# Product & Engineering Documentation

**Status:** pre-alpha; M0 is the primary milestone with dependency-independent M1 foundations and M6 documentation/readiness work proceeding in parallel.  
**Authoritative execution state:** [`project-tracker.md`](./project-tracker.md)

The repository is building an open-source, self-hostable school operating system with a guided installation model, strong security/integrity boundaries, and a coherent product experience across web, desktop and mobile targets.

The current repository name is a temporary engineering codename, not an approved final public brand.

## Core product and execution

- [`prd.md`](./prd.md) — master product requirements and boundaries.
- [`design.md`](./design.md) — system/UX architecture and deployment principles.
- [`decision.md`](./decision.md) — architecture decision log.
- [`decision-amendments.md`](./decision-amendments.md) — authoritative corrections not yet normalized into the main ADR log.
- [`tasklist.md`](./tasklist.md) — master implementation backlog and release gates.
- [`tasklist-amendments.md`](./tasklist-amendments.md) — task-state/evidence corrections while the master backlog is normalized.
- [`project-tracker.md`](./project-tracker.md) — compact live execution board and resume pointer.

## Contributor and engineering guides

- [`development-environment.md`](./development-environment.md) — current executable contributor environment and explicit unresolved setup gates.
- [`architecture-contributions.md`](./architecture-contributions.md) — module ownership, boundaries, authorization, API, jobs, storage and ADR contribution rules.
- [`api.md`](./api.md) — current API surface plus route/version/error/auth/authorization conventions.
- [`job-handler-guidelines.md`](./job-handler-guidelines.md) — practical at-least-once/idempotency/retry/outbox guidance for durable workers.
- [`dependency-policy.md`](./dependency-policy.md) — dependency adoption/update rules.
- [`releasing.md`](./releasing.md) — change/release discipline.
- [`formatting.md`](./formatting.md) — formatting notes.

Root contributor-facing policies:

- [`../CONTRIBUTING.md`](../CONTRIBUTING.md)
- [`../SECURITY.md`](../SECURITY.md)
- [`../CODE_OF_CONDUCT.md`](../CODE_OF_CONDUCT.md)

## Security

- [`threat-model.md`](./threat-model.md) — initial maintained threat model.
- [`security-disclosure.md`](./security-disclosure.md) — private vulnerability reporting, testing boundaries and coordinated disclosure policy.
- [`contracts/audit-events.md`](./contracts/audit-events.md) — durable audit semantics.
- [`prds/002-identity-access.md`](./prds/002-identity-access.md) — authentication/authorization product requirements.

## Platform contracts

Start with [`contracts/README.md`](./contracts/README.md).

The accepted contract set covers:

- API errors;
- pagination/filter/sort;
- API compatibility/version metadata;
- platform bridges;
- private storage providers;
- notification events/channels;
- background jobs;
- module boundaries;
- audit events.

A contract being complete does not imply every adapter/provider/database/native implementation exists.

## Design system

Start with [`design-system/README.md`](./design-system/README.md).

- `visual-foundation.md` — semantic visual system.
- `responsive-layout.md` — desktop/tablet/mobile composition rules.
- `accessibility.md` — WCAG 2.2 AA-oriented component gate.
- `component-specs.md` — implementation contracts for the pending shared UI primitives.

## Proof-of-concept / executable evidence

- [`pocs/fastify-api.md`](./pocs/fastify-api.md)
- [`pocs/drizzle-postgres.md`](./pocs/drizzle-postgres.md)
- [`pocs/installer-foundation.md`](./pocs/installer-foundation.md)
- [`pocs/authorization-foundation.md`](./pocs/authorization-foundation.md)
- [`pocs/identity-auth-foundation.md`](./pocs/identity-auth-foundation.md)
- [`pocs/operational-security-foundation.md`](./pocs/operational-security-foundation.md)

POC documents must distinguish executed evidence from planned/static acceptance criteria.

## Module PRDs

- [`prds/001-installer-self-hosting.md`](./prds/001-installer-self-hosting.md)
- [`prds/002-identity-access.md`](./prds/002-identity-access.md)
- [`prds/003-school-core.md`](./prds/003-school-core.md)
- [`prds/004-cross-platform-client.md`](./prds/004-cross-platform-client.md)
- [`prds/005-platform-operations.md`](./prds/005-platform-operations.md)
- [`prds/006-module-roadmap.md`](./prds/006-module-roadmap.md)

## Status vocabulary

| Status | Meaning |
|---|---|
| `NOT STARTED` | No material task implementation has begun. |
| `IN PROGRESS` | Material implementation/guidance exists but acceptance is incomplete. |
| `BLOCKED` | Required dependency/environment/decision prevents valid progress. |
| `REVIEW` | Implementation exists but required review/executable evidence is still pending. |
| `DONE` | The task's actual acceptance boundary has been satisfied with the appropriate evidence. |
| `DEFERRED` | Intentionally moved outside the current target. |

`DONE` is task-specific. A documentation/contract task may be DONE when the maintained artifact is complete enough to guide independent implementation; a database/native/runtime task is not DONE until its required executable evidence passes.

## Delivery principle

Do not optimize for checked boxes. Apply the relevant gates for business invariants, database integrity/concurrency, authentication/authorization, audit, safe errors, responsive/accessibility behavior, failure states, idempotency, private data, tests and documentation.

When the required execution environment is unavailable, record the limitation and keep the runtime-dependent task open.
