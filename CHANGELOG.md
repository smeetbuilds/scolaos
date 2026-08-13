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
- Added the M0-071 collection-query contract covering cursor pagination, deterministic sorting, typed filtering/search, totals and async-export boundaries.
- Added the M0-072 API compatibility/versioning contract covering `/api/v1`, additive/breaking changes, capabilities, deprecation and client/server negotiation.
- Added the M0-073 platform-bridge contract covering capability discovery, normalized platform errors and secure-storage/camera/files/notification/deep-link/connectivity/share seams.
- Added the M0-074 private storage-provider contract for local filesystem and optional S3-compatible implementations.
- Added the M0-075 semantic notification intent/channel contract with audience resolution, templating, delivery lifecycle, privacy and transactional-outbox rules.
- Added the M0-076 background-job contract with at-least-once execution, leases, retry classification, idempotency, payload versioning, cancellation and dead-job visibility.
- Added the M0-077 module-boundary contract documenting the default-deny dependency graph, modular-monolith ownership conventions and exception process.
- Added the M0-078 audit-event contract covering immutable actor/action/resource history, correlation, transaction rules, privacy, authorization and retention.
- Completed `docs/contracts/README.md` as the index/invariant set for all nine M0 platform contracts.

### Changed

- Added Fastify `5.10.0` and `@fastify/swagger` `9.8.1` to the server package and regenerated the committed pnpm lockfile.
- Restored the existing CI and Security definitions to read-only, frozen dependency installs with no self-committing steps.
- Paused automatic and scheduled GitHub Actions execution at the owner's request; both existing workflows are manual-only until explicitly re-enabled.
- Synchronized the live project tracker with the M0-031 preparation state without falsely marking the database POC complete.
- Reclassified ScolaOS as a temporary repository/engineering codename rather than the final public product brand; M0-003 now requires selection and screening of a replacement name.
- Corrected the README to reflect the committed frozen lockfile, manual-only GitHub Actions state, completed Fastify POC, active PostgreSQL POC and naming risk.
- Closed the full M0-070..078 platform-contract module while explicitly separating contract completion from future adapter/provider/database/native implementation evidence.
- Advanced the M0 execution board from approximately 37% to 51% based on task-state completion, with PostgreSQL, Tauri, design-system and naming gates still open.

### Repository

- Bootstrap workflow remains direct-to-`main` only: no feature branches, pull requests, or automated dependency-update PRs.
- GitHub Actions must not be re-enabled automatically while the current quota constraint is in effect.
- Database/ORM dependencies must not be added by hand-editing `pnpm-lock.yaml`; lockfile changes require normal package resolution in a registry-capable environment.
- Do not create final domains, package namespaces, app-store assets, signing identities, launch assets or permanent wordmark branding under the ScolaOS name while the replacement-name gate remains open.
- This platform-contract tranche changes documentation/architecture only: no runtime source, dependency manifest, lockfile or workflow definition is modified.