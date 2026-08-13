# Changelog

All notable changes to the project currently stored in the `smeetbuilds/scolaos` repository will be documented in this file.

The project is currently pre-alpha and follows milestone-driven development.

## [Unreleased]

### Added

- Established the M0 Fastify API proof of concept and prepared the M0-031 Drizzle/PostgreSQL execution contract.
- Completed the M0-070..078 platform-contract module and M0 design-definition foundation.
- Added the early M1 installer backend/security foundation with boot states, atomic private config, generated secrets, redaction, locking, CSRF/origin controls, and permanent post-install mutation lockout.
- Added the M1 authorization foundation under `apps/server/src/authorization/`: versioned permission catalog, guarded default-role templates, Role + Permission + Scope types, fail-closed scope matching, server authorization service, bulk authorization, and permanent regression tests.
- Added `docs/pocs/authorization-foundation.md` with trust-boundary rules, executed evidence, and explicit persistence/integration non-goals.

### Changed

- GitHub Actions remain manual-only at the owner's request; no automatic Actions were enabled.
- M1-002/M1-038 remain REVIEW pending actual Fastify/Vitest execution.
- Marked M1-060, M1-061, M1-062, and M1-063 DONE after a strict local TypeScript compile and executable authorization harness.
- Advanced M1 task-state progress to approximately 21% while DB persistence, authentication, protected-route integration, and client permission UX remain open.

### Security

- Default role names are never runtime authorization branches; templates expand to explicit grants.
- Role-template materialization rejects incompatible scope strategies rather than allowing accidental global escalation.
- Empty/incomplete dimension scopes fail closed; global scope is explicit.
- Student self-access and guardian linked-child access use trusted relationship context.
- Bulk authorization requires all targets to pass.
- Permission denial uses a stable generic 403 boundary without exposing grant/scope internals.

### Repository

- Direct-to-`main` bootstrap workflow remains unchanged: no feature branches, PRs, automated dependency PRs, or new Actions workflows.
- No dependency manifest or lockfile is changed by the authorization tranche.
