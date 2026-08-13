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
- Added the complete M0-070..078 platform-contract module covering API errors, collection queries, API compatibility, platform bridges, private storage, notifications, background jobs, module boundaries and audit events.
- Added `docs/design-system/visual-foundation.md` and completed M0-050 with semantic visual tokens, typography, spacing/density, restrained color/elevation, focus, motion and data/form hierarchy rules.
- Added `docs/design-system/responsive-layout.md` and completed M0-051 with explicit desktop/tablet/mobile composition, navigation, form/overlay, table, filter/search and text-zoom/localization strategies.
- Added `docs/design-system/accessibility.md` and completed M0-060 with the WCAG 2.2 AA-oriented component accessibility quality gate.
- Added `docs/design-system/component-specs.md` as the implementation contract for M0-052..059 shared UI primitives.
- Added `docs/design-system/README.md` as the design-system documentation workspace and M0-061 implementation/demo roadmap.

### Changed

- Added Fastify `5.10.0` and `@fastify/swagger` `9.8.1` to the server package and regenerated the committed pnpm lockfile.
- Restored the existing CI and Security definitions to read-only, frozen dependency installs with no self-committing steps.
- Paused automatic and scheduled GitHub Actions execution at the owner's request; both existing workflows are manual-only until explicitly re-enabled.
- Reclassified ScolaOS as a temporary repository/engineering codename rather than the final public product brand; M0-003 now requires selection and screening of a replacement name.
- Closed the full M0-070..078 platform-contract module while explicitly separating contract completion from future adapter/provider/database/native implementation evidence.
- Advanced the M0 execution board to approximately 57% task-state completion after finishing the design-system visual/responsive/accessibility definition tranche.
- Prepared detailed implementation specifications for M0-052..059 without falsely marking unbuilt UI components complete.
- Marked M0-061 IN PROGRESS: documentation architecture exists, but an executable interactive component catalog is still required.

### Repository

- Bootstrap workflow remains direct-to-`main` only: no feature branches, pull requests, or automated dependency-update PRs.
- GitHub Actions must not be re-enabled automatically while the current quota constraint is in effect.
- Database/ORM dependencies must not be added by hand-editing `pnpm-lock.yaml`; lockfile changes require normal package resolution in a registry-capable environment.
- Do not create final domains, package namespaces, app-store assets, signing identities, launch assets or permanent wordmark branding under the ScolaOS name while the replacement-name gate remains open.
- The design-definition tranche changes documentation/architecture only: no runtime source, dependency manifest, lockfile or workflow definition is modified.