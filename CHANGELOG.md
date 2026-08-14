# Changelog

All notable changes to the project currently stored in the `smeetbuilds/scolaos` repository will be documented in this file.

The project is currently pre-alpha and follows milestone-driven development.

## [Unreleased]

### Added

- Established M0 Fastify, platform-contract and design-definition foundations plus prepared PostgreSQL/Drizzle acceptance work.
- Added early M1 installer, authorization and identity foundations.
- Added the M1 audit helper/service under `apps/server/src/audit/` with bounded secret-rejecting metadata and required/best-effort persistence semantics.
- Added the M1 health-check service under `apps/server/src/health/` with provider probes, timeouts, safe aggregation and runtime/filesystem probes.
- Added the password-reset service/security foundation under `apps/server/src/identity/password-reset.ts` with opaque hashed challenges and an atomic persistence contract.
- Added permanent regression tests and `docs/pocs/operational-security-foundation.md`.

### Changed

- M1-081 audit helper/service and M1-083 health-check service are DONE with local executable core evidence.
- M1-057 forgot/reset password is IN PROGRESS rather than OPEN; PostgreSQL/outbox/Fastify/UI integration remains required.
- M1 task-state progress is approximately 28%.
- GitHub Actions remain manual-only at the owner's request.

### Security

- Durable audit metadata rejects password/token/credential/private-key/connection-string style secrets.
- Health provider exceptions are reduced to generic client-safe failure summaries.
- Password-reset raw tokens are never persistence keys, reset URLs use configured server base URL, and the persistence contract requires atomic challenge consumption/password replacement/reset invalidation/session revocation.

### Repository

- Direct-to-`main` bootstrap workflow remains unchanged.
- No new dependency, lockfile change, branch, PR or Actions workflow is introduced by this tranche.
- M6-091 canonical LICENSE remains open pending exact target-repository byte verification.
