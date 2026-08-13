# ScolaOS

**The open-source operating system for schools.**

ScolaOS is an open-source, self-hostable school management platform being built for excellent UX, simple installation, strong performance, and a coherent experience across web, desktop, Android, and iOS.

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
- Fastify + TypeScript API *(provisional until representative API POC passes)*
- PostgreSQL
- Drizzle + committed SQL migrations *(provisional until migration POC passes)*
- Local filesystem storage by default, optional S3-compatible adapters
- PostgreSQL-backed jobs initially
- REST/OpenAPI boundary
- Guided web installer at `/start/installation`

Material architecture changes are recorded in [`docs/decision.md`](docs/decision.md).

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
docs/           PRD, architecture, ADRs, task tracker, module PRDs
```

## Project documentation

Start here:

- [Master PRD](docs/prd.md)
- [Architecture / design](docs/design.md)
- [Architecture decisions](docs/decision.md)
- [Master execution tasklist](docs/tasklist.md)
- [Live project tracker](docs/project-tracker.md)
- [Installer & self-hosting PRD](docs/prds/001-installer-self-hosting.md)
- [Identity & access PRD](docs/prds/002-identity-access.md)
- [School core PRD](docs/prds/003-school-core.md)
- [Cross-platform client PRD](docs/prds/004-cross-platform-client.md)
- [Platform operations PRD](docs/prds/005-platform-operations.md)
- [Module roadmap](docs/prds/006-module-roadmap.md)

The tracker contains the exact resume pointer for implementation.

## Development baseline

Current contributor baseline:

- Node.js 24 LTS for development
- pnpm 10+
- PostgreSQL support will be pinned after the database POC (`M0-031`)

```bash
git clone https://github.com/smeetbuilds/scolaos.git
cd scolaos
pnpm install
```

Application packages are scaffolds at this stage; runnable development commands will land as their M0 tasks are completed.

## License

ScolaOS is licensed under **GNU AGPL-3.0-only**. See [`LICENSE`](LICENSE).

## Contributing & security

- Read [CONTRIBUTING.md](CONTRIBUTING.md) before proposing implementation changes.
- Security issues must follow [SECURITY.md](SECURITY.md) and must not be disclosed in public issues before coordinated remediation.
- Community behavior expectations are in [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
