# Development Environment

**Task:** M6-098  
**Status:** MAINTAINED / current pre-alpha baseline  
**Last reviewed:** 22 August 2026

This guide describes the development environment that the repository actually supports today. It intentionally does not invent PostgreSQL, Docker, React/Vite, or Tauri setup steps that have not passed their corresponding architecture gates.

## Required tools

- Git 2.x
- Node.js 24.x (`package.json` currently allows `>=24 <25`)
- pnpm 11.x (`packageManager` is pinned to `pnpm@11.18.0`)

PostgreSQL is a mandatory product dependency, but the supported PostgreSQL version matrix is not yet locked. `M0-031` must finish the real Drizzle/PostgreSQL proof before contributors are told to install a particular production database version.

## Clone and install

```bash
git clone https://github.com/smeetbuilds/scolaos.git
cd scolaos
pnpm install --frozen-lockfile
```

The committed `pnpm-lock.yaml` is authoritative. Never hand-edit it. A dependency-manifest change must be resolved normally with pnpm in a registry-capable environment and committed together with the regenerated lockfile.

## Repository checks

The default aggregate quality command is:

```bash
pnpm check
```

It runs formatting verification, ESLint, the TypeScript workspace check, unit tests, and package builds.

Useful individual commands:

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test:unit
pnpm test:unit:coverage
pnpm test:e2e
pnpm build
```

Run only the relevant subset while iterating, but a task may be marked complete only with the executable evidence required by that task. Static review is not a substitute for a database/native/browser POC that explicitly requires runtime proof.

## Server package

The server package is `@scolaos/server`.

```bash
pnpm --filter @scolaos/server typecheck
pnpm --filter @scolaos/server build
pnpm --filter @scolaos/server start
```

The current process configuration is deliberately small:

| Variable | Default | Meaning |
|---|---|---|
| `HOST` | `127.0.0.1` | HTTP bind host |
| `PORT` | `3000` | HTTP port, 1–65535 |
| `SCOLA_DATA_DIR` | `./data` | Private installer/config state directory |
| `SCOLA_TRUST_PROXY` | unset | Comma-separated trusted reverse-proxy addresses/CIDRs; forwarded metadata is ignored when unset |
| `SCOLA_INSTALLER_BOOTSTRAP_TOKEN` | unset | 32–512 character operator bootstrap credential required to obtain an installer session remotely; loopback-only setup does not require it |

Do not bind an unreviewed development instance to a public interface merely to make it reachable from another device. Installer and authentication surfaces are security-sensitive. A remotely reachable fresh installation must configure the bootstrap credential, and a TLS-terminating proxy must be explicitly listed in `SCOLA_TRUST_PROXY` rather than enabling blanket forwarding trust.

## Current boot behavior

A fresh server boots unconfigured. Before verified installation, process liveness, safe readiness, and `/start/installation...` installer-safe routes are intended to be reachable. Normal application/OpenAPI routes are gated until the installed marker matches the active private configuration.

`/health` is process liveness only. `/health/ready` fails closed when a mandatory dependency probe is unavailable or unhealthy. The default database readiness probe remains unavailable until the production PostgreSQL adapter exists, so a pre-alpha server is not incorrectly advertised as production-ready.

The installer backend is still incomplete: database testing, migrations, seeds, transactional institution/admin creation, and post-install verification require the real PostgreSQL/Drizzle tranche.

## Data and secrets

Never commit:

- real student, guardian, staff, finance, safeguarding, medical, or school data;
- production database URLs or passwords;
- session/reset/API tokens;
- installer bootstrap or CSRF credentials;
- private keys;
- SMTP/provider credentials;
- production backups or exported documents.

Use synthetic fixtures. Test secrets must be obviously non-production and scoped to tests.

The server contains structured redaction and secret-rejecting audit/health boundaries, including redaction of installer bootstrap/CSRF headers, but those controls do not make it acceptable to place secrets in source, fixtures, screenshots, issue descriptions, or commit messages.

## Database development

Until `M0-031` passes:

- do not add Drizzle dependencies by reconstructing or hand-editing the lockfile;
- do not treat the reference SQL harness as the production schema;
- do not use an unrelated production database for a POC;
- do not mark migration/persistence tasks complete from static SQL inspection.

When the database stack is accepted, this guide must be expanded with the supported PostgreSQL matrix, disposable development database setup, migration generation/application, seed workflow, reset/rebuild procedure, and integration-test commands.

## Frontend and native development

`apps/web`, `apps/shell`, and `packages/ui` are architectural package shells. The design system is specified, but React/Vite/Tauri dependencies are not yet fully resolved in the executable repository baseline.

Do not create unresolvable TSX/native code merely to satisfy a task checkbox. Follow the M0 POC order in `docs/project-tracker.md`.

## GitHub Actions

CI now runs on pushes to `main`, pull requests, and manual dispatch. The Security workflow runs on pushes to `main`, pull requests, weekly schedule, and manual dispatch. CI covers formatting, lint, typecheck, unit tests, build, and the real Fastify Playwright harness across Chromium, Firefox, WebKit, and mobile browser emulations. The security workflow runs `pnpm audit --audit-level=high` with the frozen lockfile.

If Actions are unavailable because of account/platform limits, record which checks were executed locally and which could not run. Never describe an unexecuted check as passed.

## Where to read next

- `CONTRIBUTING.md`
- `docs/architecture-contributions.md`
- `docs/api.md`
- `docs/job-handler-guidelines.md`
- `docs/threat-model.md`
- `docs/project-tracker.md`
