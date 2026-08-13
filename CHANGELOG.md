# Changelog

All notable changes to the project currently stored in the `smeetbuilds/scolaos` repository will be documented in this file.

The project is currently pre-alpha and follows milestone-driven development.

## [Unreleased]

### Added

- Established the M0 Fastify POC and prepared the M0 PostgreSQL/Drizzle acceptance work.
- Completed the M0 platform-contract and design-definition foundations.
- Added early M1 installer and authorization foundations.
- Added the M1 identity foundation under `apps/server/src/identity/` with password, session, transport, CSRF, throttling and principal-loading primitives.
- Added `docs/pocs/identity-auth-foundation.md` and permanent primitive regression coverage.

### Changed

- ADR-025 authentication transport is accepted by amendment.
- M1-053 and M1-054 are DONE with local executable core evidence.
- M1-055, M1-056, M1-058 and M1-059 are IN PROGRESS pending persisted repositories and HTTP integration.
- M1 task-state progress is approximately 24%.
- GitHub Actions remain manual-only at the owner's request.

### Repository

- Direct-to-`main` bootstrap workflow remains unchanged.
- No new dependency, lockfile change, branch, PR or Actions workflow is introduced by this tranche.
