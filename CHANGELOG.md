# Changelog

All notable changes to the project currently stored in the `smeetbuilds/scolaos` repository will be documented in this file.

The project is currently pre-alpha and follows milestone-driven development.

## [Unreleased]

### Added

- Established M0 Fastify, platform-contract and design-definition foundations plus prepared PostgreSQL/Drizzle acceptance work.
- Added M1 installer, authorization, identity, audit and health foundations plus password-reset security/service contracts.
- Added the contributor/open-source readiness documentation module: development environment, architecture/module contribution guide, API guide, background-job handler/idempotency guide and coordinated vulnerability-disclosure policy.
- Added installer requirements diagnostics for runtime, crypto, writable data/storage/temp directories, disk-space warning and HTTPS/base-URL classification.
- Added durable installer progress/failure persistence, recovery guidance, safe pre-DB configuration correction and provider-driven post-install verification.
- Added permanent installer operations regression coverage and `docs/pocs/installer-operations.md`.

### Changed

- Installer status now exposes real configured-phase progress instead of collapsing every pre-install state to `CONFIG_WRITTEN`.
- Added installer-safe requirements and recovery reads plus a CSRF-protected pending-config correction endpoint.
- Removed the old semantic shortcut where a method named `markInstalledAfterVerification()` could create the installed marker without running a verifier; finalization now requires seed completion and all mandatory verification checks.
- M1-035 post-install verification engine is DONE; M1-011, M1-019 and M1-021 are IN PROGRESS with backend contracts complete and responsive UI pending.
- M1 task-state progress is approximately 30%.
- M1-081 audit helper/service and M1-083 health-check service remain DONE with local executable core evidence.
- M1-057 forgot/reset password remains IN PROGRESS; PostgreSQL/outbox/Fastify/UI integration is still required.
- Marked M6-015, M6-067, M6-090, M6-092, M6-093, M6-094, M6-098, M6-099 and M6-100 DONE as maintained living guidance/documentation tasks.
- GitHub Actions remain manual-only at the owner's request.

### Security

- Installer progress is installation-ID-bound, atomically persisted, ordered and fail-closed against phase skipping/rewind.
- Pre-DB config correction preserves installation identity/generated secrets and locks permanently once DB setup advances.
- Installer failure/verification diagnostics reject or suppress credential-bearing content.
- Installed marker creation now fails closed without a configured verifier and a passing database/migration/permission-seed/bootstrap report.
- Existing durable-audit, health, password-reset, security-disclosure and at-least-once job-handler safeguards remain in force.

### Repository

- Direct-to-`main` workflow remains unchanged.
- No new dependency, lockfile change, branch, PR or Actions workflow is introduced by the installer-operations tranche.
- M6-091 canonical LICENSE remains open: the canonical SPDX blob is known, but the target repository has not yet landed and byte-verified the full text.
