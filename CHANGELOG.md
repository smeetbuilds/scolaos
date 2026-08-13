# Changelog

All notable changes to ScolaOS will be documented in this file.

The project is currently pre-alpha and follows milestone-driven development.

## [Unreleased]

### Added

- Established the M0 Fastify API proof of concept with process health, schema validation/serialization, request correlation, a standard error envelope, an authorization-hook seam, generated OpenAPI, safe server configuration and graceful shutdown.
- Added HTTP-level Fastify injection tests and server configuration tests.
- Added `docs/pocs/fastify-api.md` as architecture evidence for ADR-008 and ADR-020.

### Changed

- Added Fastify `5.10.0` and `@fastify/swagger` `9.8.1` to the server package and regenerated the committed pnpm lockfile.
- Restored the existing CI and Security definitions to read-only, frozen dependency installs with no self-committing steps.
- Paused automatic and scheduled GitHub Actions execution at the owner's request; both existing workflows are manual-only until explicitly re-enabled.
- Synchronized the live project tracker with the already-validated M0-030 Fastify POC and advanced the resume point to M0-031.

### Repository

- Bootstrap workflow remains direct-to-`main` only: no feature branches, pull requests, or automated dependency-update PRs.
- GitHub Actions must not be re-enabled automatically while the current quota constraint is in effect.
