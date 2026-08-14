# Contributing

This repository is pre-alpha and its architecture is still being proven. Contributions are welcome, but changes must preserve the self-hosting, security, data-integrity and cross-platform boundaries already accepted by the project.

The public product name is not final; **ScolaOS is only the current repository codename**.

## Before starting

Read, at minimum:

1. `docs/project-tracker.md` — authoritative current execution state;
2. `docs/prd.md` — product requirements;
3. `docs/design.md` and `docs/decision.md` — architecture baseline;
4. `docs/decision-amendments.md` — authoritative corrections not yet normalized;
5. `docs/threat-model.md` — security boundaries;
6. `docs/architecture-contributions.md` — module/implementation rules;
7. the relevant task/contract/PRD for the area you are changing.

Do not implement around a known architecture blocker simply to mark a task complete.

## Development setup

Follow [`docs/development-environment.md`](docs/development-environment.md).

The current baseline is Node 24 + pnpm 11. PostgreSQL versions, React/Vite implementation dependencies and Tauri native setup must follow their open POC gates rather than undocumented assumptions.

## Current repository workflow

During bootstrap, the repository owner has requested:

- direct commits to `main`;
- no feature branches;
- no pull requests;
- no automated dependency-update branches/PRs;
- no new GitHub Actions workflows;
- existing Actions remain manual-only;
- one coherent final commit per implementation tranche.

Do not reinterpret this bootstrap workflow as permission to skip code review/evidence. Architecture, security, database, CI, server and documentation changes require explicit maintainer review before the final direct commit.

## Task and decision discipline

- Work against a stable task ID when one exists.
- Keep `docs/project-tracker.md` and task-state amendments accurate when task status changes.
- If implementation contradicts an accepted ADR/contract, update the decision explicitly in the same change; do not silently diverge.
- If a POC requires runtime proof, keep it open until the required environment has actually executed it.
- Distinguish **implemented**, **tested locally**, **integration-tested**, and **production-ready** evidence.

## Quality commands

Use the relevant subset while iterating:

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test:unit
pnpm test:unit:coverage
pnpm test:e2e
pnpm build
```

The aggregate repository gate is:

```bash
pnpm check
```

Never claim a command passed if it was not executed against the changed tree.

## Definition of done

A change is not done because its happy path compiles or renders. Apply the relevant gates for:

- domain/business invariants;
- database constraints and transaction/concurrency behavior;
- authentication and permission/scope authorization;
- audit requirements;
- validation and safe error handling;
- idempotency/retry semantics;
- private-file/storage boundaries;
- responsive UX and accessibility;
- loading/empty/error/destructive states;
- tests at the appropriate unit/integration/E2E layers;
- documentation and upgrade/compatibility impact.

## Architecture and modules

Follow [`docs/architecture-contributions.md`](docs/architecture-contributions.md) and `docs/contracts/module-boundaries.md`.

Key rules:

- modular monolith first;
- shared packages never import app implementations;
- clients do not import server internals;
- server business rules do not depend on UI packages;
- `packages/domain` remains framework-independent;
- cross-module writes go through the owning module rather than hidden direct table mutation;
- do not add shared packages merely to silence a boundary rule.

## Authentication and authorization

Never authorize by hardcoded role names.

Protected operations must use the permission registry plus trusted server-resolved scope/relationship context. Client-supplied institution/student/class/subject IDs are not proof of access.

Do not place authorization only in UI code.

## Database and migrations

Until the Drizzle/PostgreSQL POC is accepted, do not fabricate ORM dependency/lockfile changes or label reference SQL as production migrations.

After migrations are accepted:

- generated/committed migrations are source-controlled;
- released migrations are immutable;
- schema changes add a new migration;
- integrity belongs in database constraints where appropriate;
- transaction and concurrency behavior is tested on real PostgreSQL.

## APIs

Read [`docs/api.md`](docs/api.md) and the contracts in `docs/contracts/`.

New/changed routes must preserve request correlation, the standard error envelope, schema validation/serialization, authorization, versioning and collection-query rules. Update OpenAPI-facing schemas and documentation with semantic route changes.

## Background jobs

Read [`docs/job-handler-guidelines.md`](docs/job-handler-guidelines.md).

At-least-once execution means every durable handler must be idempotent or guard externally visible side effects with a correct idempotency strategy. A dedupe key alone does not provide exactly-once execution.

## Security and privacy

Follow [`SECURITY.md`](SECURITY.md), [`docs/security-disclosure.md`](docs/security-disclosure.md) and `docs/threat-model.md`.

Never commit real school/student/staff/finance data, production secrets, tokens, private keys, provider credentials or production backups. Use synthetic fixtures.

Do not weaken installer, authentication, authorization, audit, redaction or private-file controls for test convenience.

## UI/accessibility

Shared UI work follows `docs/design-system/`.

Core workflows target WCAG 2.2 AA behavior. Mobile/tablet composition must be intentionally designed rather than produced by shrinking desktop layouts.

## Dependencies

Follow `docs/dependency-policy.md`.

A new dependency must justify maintenance, security, license, bundle/runtime and self-hosting impact. Manifest changes require a normally regenerated `pnpm-lock.yaml`; never hand-edit dependency resolution.

## Commit messages

Use the conventional change style described in `docs/releasing.md`, for example:

```text
feat: establish identity authentication foundation
fix: prevent cross-scope attendance mutation
docs: document contributor environment
```

Keep the final tranche commit coherent. Do not hide unrelated refactors inside a feature/security change.

## Vulnerabilities

Do not open public issues containing exploitable security details. Use the private process described in [`docs/security-disclosure.md`](docs/security-disclosure.md).

## License of contributions

By contributing, you represent that you have the right to submit the contribution and agree that the contribution is provided under the repository's declared **AGPL-3.0-only** license.
