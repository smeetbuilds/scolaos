# Changelog

All notable changes to the project currently stored in the `smeetbuilds/scolaos` repository will be documented in this file.

The project is currently pre-alpha and follows milestone-driven development.

## [Unreleased]

### Added

- Established M0 Fastify, platform-contract and design-definition foundations plus prepared PostgreSQL/Drizzle acceptance work.
- Added early M1 installer, authorization and identity foundations.
- Added M1 audit and health service foundations plus password-reset security/service contracts and permanent tests.
- Added the contributor/open-source readiness documentation module: development environment, architecture/module contribution guide, API guide, background-job handler/idempotency guide and coordinated vulnerability-disclosure policy.

### Changed

- M1-081 audit helper/service and M1-083 health-check service are DONE with local executable core evidence.
- M1-057 forgot/reset password is IN PROGRESS; PostgreSQL/outbox/Fastify/UI integration remains required.
- Reworked README, CONTRIBUTING, SECURITY and CODE_OF_CONDUCT into maintained contributor-facing policies that reflect the actual pre-alpha architecture and security boundaries.
- Marked M6-015, M6-067, M6-090, M6-092, M6-093, M6-094, M6-098, M6-099 and M6-100 DONE as maintained living guidance/documentation tasks.
- M6 task-state progress is approximately 14% (9 of 66 numbered tasks, excluding the release gate); this is not a production-readiness effort estimate.
- GitHub Actions remain manual-only at the owner's request.

### Security

- Durable audit metadata rejects password/token/credential/private-key/connection-string style secrets.
- Health provider exceptions are reduced to generic client-safe failure summaries.
- Password-reset raw tokens are never persistence keys and reset completion requires an atomic persistence contract including session revocation.
- Security reporting now has explicit private-reporting, testing-safety and coordinated-disclosure guidance.
- Job-handler guidance explicitly assumes at-least-once delivery and requires idempotency/transaction/outbox/retry discipline.

### Repository

- Direct-to-`main` bootstrap workflow remains unchanged.
- No new dependency, lockfile change, branch, PR or Actions workflow is introduced by the documentation-readiness tranche.
- M6-091 canonical LICENSE remains open: the canonical SPDX blob is known, but the target repository has not yet landed and byte-verified the full text.
