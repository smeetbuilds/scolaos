# Changelog

All notable changes to ScolaOS will be documented in this file.

The project is currently pre-alpha and follows milestone-driven development.

## [Unreleased]

### Added

- Established the M0 Fastify API proof of concept with process health, schema validation/serialization, request correlation, a standard error envelope, an authorization-hook seam, generated OpenAPI, safe server configuration and graceful shutdown.
- Added HTTP-level Fastify injection tests and server configuration tests.
- Added `docs/pocs/fastify-api.md` as architecture evidence for ADR-008 and ADR-020.
- Prepared the M0-031 Drizzle/PostgreSQL execution contract with candidate stable package versions, a PostgreSQL 16/18 validation matrix, migration acceptance criteria and explicit non-pass conditions.
- Added `tooling/postgres-poc/` with a guarded disposable-database reference schema and verification harness for institution-scoped constraints, indexes and transaction rollback.

### Changed

- Added Fastify `5.10.0` and `@fastify/swagger` `9.8.1` to the server package and regenerated the committed pnpm lockfile.
- Restored the existing CI and Security definitions to read-only, frozen dependency installs with no self-committing steps.
- Paused automatic and scheduled GitHub Actions execution at the owner's request; both existing workflows are manual-only until explicitly re-enabled.
- Synchronized the live project tracker with the M0-031 preparation state without falsely marking the database POC complete.

### Repository

- Bootstrap workflow remains direct-to-`main` only: no feature branches, pull requests, or automated dependency-update PRs.
- GitHub Actions must not be re-enabled automatically while the current quota constraint is in effect.
- Database/ORM dependencies must not be added by hand-editing `pnpm-lock.yaml`; lockfile changes require normal package resolution in a registry-capable environment.
