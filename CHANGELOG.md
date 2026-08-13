# Changelog

All notable changes to the project currently stored in the `smeetbuilds/scolaos` repository will be documented in this file.

The project is currently pre-alpha and follows milestone-driven development.

## [Unreleased]

### Added

- Established the M0 Fastify API proof of concept with process health, schema validation/serialization, request correlation, a standard error envelope, an authorization-hook seam, generated OpenAPI, safe server configuration and graceful shutdown.
- Added HTTP-level Fastify injection tests and server configuration tests.
- Added `docs/pocs/fastify-api.md` as architecture evidence for ADR-008 and ADR-020.
- Prepared the M0-031 Drizzle/PostgreSQL execution contract with candidate stable package versions, a PostgreSQL 16/18 validation matrix, migration acceptance criteria and explicit non-pass conditions.
- Added `tooling/postgres-poc/` with a guarded disposable-database reference schema and verification harness for institution-scoped constraints, indexes and transaction rollback.
- Added preliminary product-name conflict screening and an ADR-023 amendment after identifying an active same-market school-software product using the exact ScolaOS name.
- Added the M0-070 API error contract covering the stable envelope, request correlation, machine codes, HTTP mapping, validation details and safe disclosure rules.
- Added the M0-077 module-boundary contract documenting the default-deny dependency graph, modular-monolith ownership conventions and exception process.
- Added `docs/contracts/README.md` as the index for completed and remaining M0 platform contracts.

### Changed

- Added Fastify `5.10.0` and `@fastify/swagger` `9.8.1` to the server package and regenerated the committed pnpm lockfile.
- Restored the existing CI and Security definitions to read-only, frozen dependency installs with no self-committing steps.
- Paused automatic and scheduled GitHub Actions execution at the owner's request; both existing workflows are manual-only until explicitly re-enabled.
- Synchronized the live project tracker with the M0-031 preparation state without falsely marking the database POC complete.
- Reclassified ScolaOS as a temporary repository/engineering codename rather than the final public product brand; M0-003 now requires selection and screening of a replacement name.
- Corrected the README to reflect the committed frozen lockfile, manual-only GitHub Actions state, completed Fastify POC, active PostgreSQL POC, and current naming risk.
- Closed M0-070 and M0-077 using previously validated Fastify/ESLint behavior without changing application runtime code while GitHub Actions are paused.
- Advanced the M0 execution board to approximately 37% while leaving PostgreSQL and naming gates explicitly open.

### Repository

- Bootstrap workflow remains direct-to-`main` only: no feature branches, pull requests, or automated dependency-update PRs.
- GitHub Actions must not be re-enabled automatically while the current quota constraint is in effect.
- Database/ORM dependencies must not be added by hand-editing `pnpm-lock.yaml`; lockfile changes require normal package resolution in a registry-capable environment.
- Do not create final domains, package namespaces, app-store assets, signing identities, launch assets or permanent wordmark branding under the ScolaOS name while the replacement-name gate remains open.
