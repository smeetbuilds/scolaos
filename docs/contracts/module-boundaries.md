# Module Boundary Conventions

**Task:** M0-077  
**Status:** ACCEPTED  
**Effective:** 13 August 2026  
**Enforcement evidence:** `eslint.config.mjs`

## Purpose

Keep the project a modular monolith with explicit dependency direction so school domains can grow without turning the repository into a single cyclic application graph.

These rules govern source-code dependencies. Deployment remains simple: one server application, one shared client family and PostgreSQL by default.

## Top-level dependency graph

The current allowed imports are:

```text
apps/web
  -> apps/web
  -> packages/ui
  -> packages/domain
  -> packages/api-client
  -> packages/config

apps/shell
  -> apps/shell
  -> packages/ui
  -> packages/domain
  -> packages/api-client
  -> packages/config

apps/server
  -> apps/server
  -> packages/domain
  -> packages/config

packages/ui
  -> packages/ui
  -> packages/domain
  -> packages/config

packages/api-client
  -> packages/api-client
  -> packages/domain
  -> packages/config

packages/domain
  -> packages/domain

packages/config
  -> packages/config
```

Anything not explicitly allowed is disallowed by default.

## Hard rules

1. Shared packages never import from `apps/*`.
2. The server never imports UI, shell or API-client code.
3. Web/shell clients never import server implementation code.
4. `packages/domain` remains framework-independent and cannot depend on UI, HTTP clients, server frameworks or platform shells.
5. `packages/config` is foundational and must not depend on application/domain feature packages.
6. Production source must never import test/spec files.
7. Cross-boundary exceptions require an architecture decision; they are not solved with local ESLint disables.
8. Do not introduce a new shared package merely to break a lint error. A new package needs a clear responsibility and dependency direction.

## Server modular-monolith convention

Feature implementation under `apps/server/src` should converge on explicit modules:

```text
apps/server/src/
  core/                  cross-cutting server/runtime infrastructure
  modules/
    students/
    academics/
    attendance/
    finance/
    ...
```

A feature module should expose a small public surface and keep persistence, services, policies and HTTP adapters internal where possible.

Recommended module shape when a feature becomes large enough to need it:

```text
modules/students/
  index.ts               public module registration/export surface
  domain/                server-only feature rules when not cross-platform domain contracts
  application/           use cases/orchestration
  infrastructure/        DB/repositories/external adapters
  http/                  routes/schemas/controllers
```

This is a convention, not a requirement to create empty folders before functionality exists.

## Cross-module communication

Prefer these mechanisms in order:

1. Import another module's intentional public service/contract surface when synchronous collaboration is necessary.
2. Use shared domain contracts from `packages/domain` only when the concept is genuinely shared across platforms or modules.
3. Use durable domain/application events for decoupled side effects when the job/event contracts are defined.

Do not reach into another feature's internal repository, table helper or route implementation to save a few lines of code.

## Database ownership

The database is physically shared by the modular monolith, but logical ownership still matters.

- Each table/entity has one primary owning module.
- Another module may reference an owned entity through reviewed foreign keys and public application/query contracts.
- Cross-module writes should go through the owning module's application service unless a deliberately designed transactional workflow requires otherwise.
- Raw SQL spanning modules is allowed for reporting/performance when justified, but it must not quietly create a second write path that bypasses invariants.
- Migration ordering and ownership conventions will be refined by `M0-031`/`M0-039`; this document does not claim the database POC has passed.

## Client boundaries

`apps/web` and `apps/shell` compose shared UI/domain/API-client packages. Platform-specific capabilities belong behind bridge interfaces rather than being imported directly throughout feature code.

The shell may own native integration/bootstrap code; reusable screens and components belong in shared packages when their behavior is actually shared.

Mobile composition may differ structurally from desktop. Boundary reuse does not require identical layouts.

## Public entry points

As packages/modules mature, external consumers should import from explicit public entry points rather than deep internal paths. Until package `exports` maps are introduced, contributors should still treat implementation folders as private unless the owning module documents them as public.

A future lint/build step may enforce public-entry-point imports more strictly; this task defines the convention now without inventing unvalidated tooling.

## Tests

Tests may import production code. Production code must not import tests.

Integration/E2E helpers belong under test/tooling locations and are not application dependencies. A test fixture that becomes required at runtime must be promoted into an appropriate production package/module rather than imported from test code.

## Enforcement

`eslint-plugin-boundaries` currently enforces the top-level dependency graph with `default: disallow` and explicit allow policies. Test/spec files are categorized and forbidden as production dependencies.

Documentation and review enforce finer-grained feature-module ownership until the codebase is large enough to justify additional automated element types/public-entry-point rules.

## Exception process

A boundary exception is acceptable only when all of these are true:

- the dependency is architecturally necessary, not merely convenient;
- the new direction does not create a cycle;
- responsibility/ownership remains clear;
- the relevant ADR or this contract is updated in the same change;
- enforcement is updated rather than bypassed with a permanent local disable.

## Acceptance evidence

M0-077 is complete because the project now has:

- a documented dependency direction;
- default-deny automated top-level enforcement;
- explicit server/client/shared-package separation;
- test-to-production dependency protection;
- a server modular-monolith feature convention aligned with ADR-019;
- a defined exception/change process.
