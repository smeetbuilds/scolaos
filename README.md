# ScolaOS — temporary repository codename

**The open-source operating system for schools.**

> **Naming warning:** a preliminary conflict screen on 13 August 2026 found an unrelated, active school-software product using the exact **ScolaOS** name at `scolaos.com`. The current name is therefore rejected as the final public product brand. The repository slug is retained temporarily to avoid a disruptive engineering rename before a replacement name passes screening. Do not register new domains, publish packages, create app-store assets, or launch public branding under the ScolaOS name.

This repository contains an open-source, self-hostable school management platform being built for excellent UX, simple installation, strong performance, and a coherent experience across web, desktop, Android, and iOS.

> **Project status: pre-alpha / M0 foundation.** There is no production release yet. The repository is being built milestone-by-milestone against the committed PRD and engineering task tracker.

## Product principles

- **Self-hosting first:** no mandatory proprietary cloud backend.
- **Easy installation:** target setup is app + PostgreSQL with a guided `/start/installation` flow.
- **One product across devices:** shared React/TypeScript client architecture with platform shells where native capabilities are needed.
- **Role-aware UX:** administrators, teachers, students, parents, finance staff, and operations users get purpose-built workflows rather than one overloaded admin UI.
- **Security by architecture:** authorization, auditing, installer hardening, private file access, and safe upgrades are core requirements.
- **Quality over checkbox features:** modules are not complete until responsive UX, validation, authorization, tests, accessibility, performance, and docs are complete.

## Working architecture

The current architecture baseline is intentionally evidence-driven:

- React + TypeScript shared client
- Vite web/PWA client *(provisional until M0 POC gate)*
- Tauri 2 desktop/mobile shells *(provisional until platform POCs pass)*
- Fastify + TypeScript API *(M0-030 framework POC passed; final architecture lock remains M0-039)*
- PostgreSQL
- Drizzle + committed SQL migrations *(provisional; M0-031 executable PostgreSQL proof is still open)*
- Local filesystem storage by default, optional S3-compatible adapters
- PostgreSQL-backed jobs initially
- REST/OpenAPI boundary
- Guided web installer at `/start/installation`

Material architecture changes are recorded in [`docs/decision.md`](docs/decision.md). Active decision corrections discovered after the baseline log are recorded in [`docs/decision-amendments.md`](docs/decision-amendments.md) until normalization.

## Repository layout

```text
apps/
  web/          shared web/PWA client
  server/       API, installer, business logic, jobs
  shell/        Tauri desktop/mobile shell
packages/
  ui/           shared design system
  domain/       shared domain contracts
  api-client/   typed API client
  config/       shared configuration primitives
tooling/        repository tooling and test infrastructure
tests/e2e/      browser E2E suite
docs/           PRD, architecture, threat model, ADRs, task tracker, module PRDs
```

## Project documentation

Start here:

- [Master PRD](docs/prd.md)
- [Architecture / design](docs/design.md)
- [Architecture decisions](docs/decision.md)
- [Decision amendments](docs/decision-amendments.md)
- [Brand/name screening](docs/brand-screening.md)
- [Threat model](docs/threat-model.md)
- [Master execution tasklist](docs/tasklist.md)
- [Live project tracker](docs/project-tracker.md)
- [Dependency policy](docs/dependency-policy.md)
- [Release/change process](docs/releasing.md)
- [Installer & self-hosting PRD](docs/prds/001-installer-self-hosting.md)
- [Identity & access PRD](docs/prds/002-identity-access.md)
- [School core PRD](docs/prds/003-school-core.md)
- [Cross-platform client PRD](docs/prds/004-cross-platform-client.md)
- [Platform operations PRD](docs/prds/005-platform-operations.md)
- [Module roadmap](docs/prds/006-module-roadmap.md)

`docs/project-tracker.md` is the authoritative execution status and contains the exact resume pointer.

## Development baseline

Current contributor baseline:

- Node.js 24
- pnpm 11
- PostgreSQL support will be pinned after the database POC (`M0-031`)
- TypeScript 6.0.x is deliberately pinned until the selected lint stack supports TypeScript 7

```bash
git clone https://github.com/smeetbuilds/scolaos.git
cd scolaos
pnpm install --frozen-lockfile
pnpm check
```

Useful commands:

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test:unit
pnpm test:e2e
pnpm build
```

The generated `pnpm-lock.yaml` is committed. Dependency manifest changes must regenerate the lockfile normally in a registry-capable environment; do not hand-edit dependency resolution.

## Repository workflow

During the bootstrap phase, project changes are committed **directly to `main`**. Do not create feature branches, pull requests, or automated dependency-update PRs. Work is batched into one coherent final commit per implementation batch.

## Continuous quality

The existing `CI` and `Security` GitHub Actions workflows are retained as **manual-only** quality recipes because automatic Actions execution is currently paused by owner request. They use `workflow_dispatch`, read-only repository permissions, and frozen dependency installs. Do not restore push, pull-request, schedule, bot-commit, or additional workflow triggers unless the owner explicitly requests it.

When Actions are paused, new executable or database POCs must be validated in another real execution environment before being marked complete. Previous green workflow evidence may only be reused for code that has not changed since that validation.

## License

The project is declared under **GNU AGPL-3.0-only**. See [`LICENSE`](LICENSE). Production-release packaging still tracks inclusion and verification of the complete canonical license text; do not treat an abbreviated notice as the final release artifact.

## Contributing & security

- Read [CONTRIBUTING.md](CONTRIBUTING.md) before proposing implementation changes.
- Security issues must follow [SECURITY.md](SECURITY.md) and must not be disclosed in public issues before coordinated remediation.
- Community behavior expectations are in [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
