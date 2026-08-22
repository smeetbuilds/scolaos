# ScolaOS — temporary repository codename

**An open-source, self-hostable operating system for schools.**

> **Naming warning:** an August 2026 conflict screen found an unrelated active school-software product using the exact **ScolaOS** name. The current name is therefore rejected as the final public product brand and retained only as a temporary repository/engineering codename. Do not register final domains, publish permanent package/app-store identities, or create launch branding under this name.

## Status

**Pre-alpha. No production release exists yet.**

The repository is being built milestone-by-milestone against committed product, architecture, security, UX and quality gates. Current tracker percentages are **task-state progress**, not percentages of a production-ready school ERP.

Already established in code/contracts include:

- Fastify/OpenAPI server proof of concept;
- fail-closed installer boot/config/security foundation;
- Role + Permission + Scope authorization foundation;
- opaque session/password/authentication security foundation;
- audit-event helper/service foundation;
- operational health-check service foundation;
- platform contracts for errors, pagination, compatibility, storage, notifications, jobs, module boundaries and audit;
- responsive/accessibility/design-system implementation contracts.

Still unresolved or incomplete include the real Drizzle/PostgreSQL proof and persistence layer, the database-backed installer stages, production authentication HTTP/persistence, React/Vite component implementation, Tauri native POCs, and most school business modules.

See [`docs/project-tracker.md`](docs/project-tracker.md) for the authoritative current state.

## Product principles

- **Self-hosting first:** no mandatory proprietary backend-as-a-service.
- **Easy installation:** target deployment is the application + PostgreSQL with guided `/start/installation` setup.
- **One product across devices:** shared React/TypeScript client architecture with platform-specific adapters where native behavior is required.
- **Role-aware UX:** administrators, teachers, students, parents/guardians, finance staff and operations users get purpose-built workflows.
- **Security by architecture:** authentication, scoped authorization, auditing, installer hardening, private files, safe upgrades and backups are core product requirements.
- **Quality over checkbox features:** a workflow is not complete until its integrity, authorization, responsive UX, accessibility, failure states, tests and documentation meet the relevant gates.

## Architecture baseline

Current evidence-driven baseline:

- React + TypeScript shared client
- Vite web/PWA tooling *(provisional pending final M0 lock)*
- Tauri 2 desktop/mobile shells *(provisional pending native POCs)*
- Fastify + TypeScript API *(framework POC passed; final architecture lock pending)*
- PostgreSQL mandatory database
- Drizzle + committed SQL migrations *(provisional; real PostgreSQL proof still open)*
- local filesystem storage by default with optional S3-compatible adapter
- PostgreSQL-backed jobs initially, without mandatory Redis/RabbitMQ
- REST/OpenAPI-compatible API boundary
- guided installer at `/start/installation`
- modular monolith server first

Material decisions live in [`docs/decision.md`](docs/decision.md). [`docs/decision-amendments.md`](docs/decision-amendments.md) is retained as historical evidence for amendments that have now been folded into the canonical decision log.

## Repository layout

```text
apps/
  web/          shared web/PWA client
  server/       API, installer, application services, jobs
  shell/        Tauri desktop/mobile shell
packages/
  ui/           shared design system
  domain/       shared framework-independent domain contracts
  api-client/   typed client-side API boundary
  config/       foundational shared configuration
tooling/        repository tooling and executable POCs
tests/e2e/      browser/system E2E tests
docs/           product, architecture, contracts, security and contributor docs
```

## Documentation map

### Start here

- [Product requirements](docs/prd.md)
- [Architecture/design](docs/design.md)
- [Architecture decisions](docs/decision.md)
- [Decision amendment history](docs/decision-amendments.md)
- [Live execution tracker](docs/project-tracker.md)
- [Master tasklist](docs/tasklist.md)
- [Task-state amendments](docs/tasklist-amendments.md)

### Engineering contracts

- [Platform contracts](docs/contracts/README.md)
- [API guide](docs/api.md)
- [Architecture/module contribution guide](docs/architecture-contributions.md)
- [Development environment](docs/development-environment.md)
- [Background-job handler/idempotency guide](docs/job-handler-guidelines.md)
- [Dependency policy](docs/dependency-policy.md)
- [Release/change process](docs/releasing.md)

### Security

- [Security policy](SECURITY.md)
- [Vulnerability reporting/disclosure](docs/security-disclosure.md)
- [Threat model](docs/threat-model.md)
- [Identity/access PRD](docs/prds/002-identity-access.md)

### UX/design system

- [Design-system workspace](docs/design-system/README.md)
- [Visual foundation](docs/design-system/visual-foundation.md)
- [Responsive strategy](docs/design-system/responsive-layout.md)
- [Accessibility gate](docs/design-system/accessibility.md)
- [Component specifications](docs/design-system/component-specs.md)

### Architecture evidence

- [Fastify API POC](docs/pocs/fastify-api.md)
- [Drizzle/PostgreSQL POC plan](docs/pocs/drizzle-postgres.md)
- [Installer foundation](docs/pocs/installer-foundation.md)
- [Authorization foundation](docs/pocs/authorization-foundation.md)
- [Identity/authentication foundation](docs/pocs/identity-auth-foundation.md)
- [Operational security services](docs/pocs/operational-security-foundation.md)

## Development quick start

Current tooling baseline is Node.js 24 and pnpm 11.

```bash
git clone https://github.com/smeetbuilds/scolaos.git
cd scolaos
pnpm install --frozen-lockfile
pnpm check
```

Read [`docs/development-environment.md`](docs/development-environment.md) before setting up database/native/frontend work. PostgreSQL support versions are intentionally not prescribed until the real database POC passes.

Useful commands:

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test:unit
pnpm test:e2e
pnpm build
```

Never hand-edit `pnpm-lock.yaml`. Dependency changes must be normally resolved and committed with the regenerated lockfile.

## API

The server generates OpenAPI 3.0.3 from Fastify schemas. The current route surface and future route rules are documented in [`docs/api.md`](docs/api.md).

Before verified installation, the server intentionally restricts access to process liveness, safe readiness, and installer-safe routes. Application APIs are unavailable until installation is complete.

## Contributing

Read [`CONTRIBUTING.md`](CONTRIBUTING.md) and the [architecture/module contribution guide](docs/architecture-contributions.md) before changing implementation boundaries.

During the current bootstrap phase the owner has requested direct-to-`main` work, no feature branches/PRs, and one coherent final commit per implementation tranche. This is a temporary repository workflow, not a claim that public contributors should bypass review once the project opens a normal contribution flow.

## Quality and GitHub Actions

CI runs automatically on pushes to `main` and pull requests, and remains manually dispatchable. It verifies formatting, ESLint, TypeScript, unit tests, build, and the real Fastify Playwright harness across Chromium, Firefox, WebKit and mobile browser emulations. The Security workflow runs on pushes to `main`, pull requests, a weekly schedule and manual dispatch, including `pnpm audit --audit-level=high` against the frozen lockfile.

When a required executable environment is unavailable, keep the task OPEN/REVIEW and record the limitation. Static inspection must not be reported as a passed database/native/integration test.

## Security

Do not use public issues for exploitable vulnerability details. Follow [`SECURITY.md`](SECURITY.md) and [`docs/security-disclosure.md`](docs/security-disclosure.md).

Never place real student/school data, production secrets, credentials, session/reset tokens, private keys or production backups in source, tests, screenshots, issues or commits.

## License

The project is declared **GNU AGPL-3.0-only**. The repository's release-hardening task `M6-091` remains open until the root `LICENSE` is replaced with and byte-verified against the complete canonical AGPL-3.0-only text. Do not interpret the current abbreviated artifact as the final 1.0 packaging state.

## Community

Community behavior expectations are defined in [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md).
