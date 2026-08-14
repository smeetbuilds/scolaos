# Changelog

All notable changes to the project currently stored in the `smeetbuilds/scolaos` repository will be documented in this file.

The project is currently pre-alpha and follows milestone-driven development.

## [Unreleased]

### Added

- Established M0 Fastify, platform-contract and design-definition foundations plus prepared PostgreSQL/Drizzle acceptance work.
- Added M1 installer, authorization, identity, audit and health foundations plus password-reset security/service contracts.
- Added contributor/open-source readiness documentation covering development, architecture, API, jobs and coordinated security disclosure.
- Added installer requirements diagnostics, durable progress/recovery state, safe pre-DB configuration correction and verifier-required finalization.
- Added `docs/support-matrix.md` and executable centralized Node/PostgreSQL compatibility-policy helpers.
- Added institution/settings domain foundations for country-neutral settings, branches, academic sessions, terms and safe branding metadata.
- Added permanent regression suites plus `docs/pocs/institution-domain.md`.

### Changed

- M0-004 initial server support matrix is DONE: Linux x86_64 production baseline, Node 24.x LTS, PostgreSQL 16–18/current-minor policy.
- Installer Node compatibility now consumes the centralized support-policy helper rather than carrying a separate hard-coded rule.
- M1-073 term/semester model is DONE with session-bound ranges, sequence/uniqueness and no-overlap invariants.
- M1-070/071/072/074/075 are IN PROGRESS with domain invariants established but persistence/API/authorization/UI still required.
- M1-035 post-install verification remains DONE; M1-011/M1-019/M1-021 remain backend-complete/UI-pending.
- M1 task-state progress is approximately 32%; M0 task-state progress is approximately 59%.
- GitHub Actions remain manual-only at the owner's request.

### Security / Integrity

- Institution logo metadata accepts only opaque relative storage keys; absolute paths, traversal and remote URLs are rejected at the domain boundary.
- Branch catalogs require unique per-institution codes and exactly one active default branch when active branches exist.
- Academic-session catalogs allow at most one active session and prevent closed-session reactivation.
- Term ranges must stay inside their parent session and cannot overlap within the session.
- Existing installer, authorization, identity, audit, health and password-reset security boundaries remain in force.

### Repository

- Direct-to-`main` workflow remains unchanged.
- No dependency, lockfile, branch, PR or Actions workflow change is introduced by this tranche.
- M0-031 remains open; the support matrix does not substitute for real Drizzle/PostgreSQL execution.
- M6-091 canonical LICENSE remains open. The SPDX source blob is known, but attempted reconstructed target blobs did not match the canonical SHA and are intentionally left unreferenced.
