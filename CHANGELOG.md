# Changelog

All notable changes to the project currently stored in the `smeetbuilds/scolaos` repository will be documented in this file.

The project is currently pre-alpha and follows milestone-driven development.

## [Unreleased]

### Added

- Established M0 Fastify, platform-contract, support-matrix and design-definition foundations plus prepared PostgreSQL/Drizzle acceptance work.
- Added M1 installer, authorization, identity, audit, health and institution-domain foundations.
- Added installer requirements diagnostics, durable progress/recovery, safe pre-DB config correction and verifier-required finalization.
- Added first-school bootstrap domain normalization for institution, default branch, initial active academic session and administrator setup.
- Added retry-safe transactional bootstrap port covering seed + institution + branch + session + administrator user + membership + role assignment + completion receipt.
- Added deterministic installation seed plan validation against the permission catalog/default-role templates, including SHA-256 content fingerprinting.
- Added framework-neutral identity HTTP security/application layers for browser-cookie/native-bearer sign-in, current-user context, route guarding, logout and password recovery.
- Added HMAC-keyed authentication/recovery abuse-counter contracts with source-spray and account-reset policies plus bounded recovery response timing.
- Added typed identity/password-reset/installer audit-event builders that exclude submitted credentials, reset/session tokens and raw source addresses.
- Added concrete installation-security, runtime-support and disk-capacity health probes.
- Added permanent identity HTTP/security regression suites and `docs/pocs/identity-http-security.md`.
- Added contributor/open-source readiness documentation covering development, architecture, API, jobs and coordinated security disclosure.

### Changed

- M0-004 server support matrix remains DONE: Linux x86_64, Node 24.x LTS and PostgreSQL 16–18/current-minor policy.
- Authentication HTTP semantics now reject mixed/duplicate credentials, enforce stored-session transport matching and trust forwarded protocol only for adapter-verified trusted proxies.
- Browser authenticated mutations now require exact-origin verification, same-origin Fetch Metadata when present and the existing session-bound CSRF token; native bearer mutations remain non-cookie based.
- Forced-password-reset sessions are now confined to session-read, password-change and logout routes until the password requirement is satisfied.
- AuthenticationService now composes its normalized-account throttle with an optional independent source-level spray limiter.
- Password-reset requests now support source/account abuse gates and a uniform minimum response duration; repeated account requests suppress delivery without changing the public accepted response.
- Password-reset completion now performs a cheap active-challenge preflight before scrypt work while retaining the atomic consume-and-password/session-reset operation as the authority.
- M1-055/M1-056/M1-057/M1-058/M1-059 remain IN PROGRESS: backend HTTP/security contracts advanced substantially, but PostgreSQL persistence, concrete Fastify execution and applicable UI/outbox work remain.
- M1-081 and M1-083 remain DONE and are extended with typed identity audit builders and concrete security/runtime/disk probes respectively.
- M1-014/M1-015/M1-016 remain backend/domain-contract complete but UI/runtime persistence integration is still pending.
- M1-032/M1-033/M1-034 retain deterministic seed/transaction foundations and remain PostgreSQL-evidence pending.
- M1-073 term/semester model remains DONE; M1-070/071/072/074/075 remain domain-founded/persistence-pending.
- M0/M1/M6 task-state percentages remain approximately 59% / 32% / 14%; security depth is not converted into artificial checkbox progress.
- GitHub Actions remain manual-only at the owner's request.

### Security / Integrity

- Browser session responses do not disclose raw session credentials or stored token hashes; native sign-in returns the opaque bearer credential only to the native transport.
- A request containing both browser-cookie and bearer authentication is rejected rather than relying on middleware precedence.
- A direct client cannot become a secure request merely by sending forwarded-protocol metadata; the immediate peer must be independently marked trusted by the server adapter.
- Identity `sourceAddress` is defined as the server-resolved effective client address after trusted-proxy processing, never raw forwarded-address text.
- Recovery account buckets silently suppress repeat delivery to preserve account-existence ambiguity, while source floods receive generic throttling responses.
- Syntactically valid nonexistent/expired reset tokens are rejected before password hashing; atomic consumption still protects races and single-use semantics.
- Security counter lookup keys use HMAC-SHA-256 instead of raw login/source values.
- Identity/reset audit drafts omit passwords, submitted logins, session/reset tokens and raw source addresses.
- Installation-security health diagnostics report configuration booleans/length state rather than secret values.
- Existing bootstrap trusted-ID, password non-persistence, receipt idempotency and deterministic seed-fingerprint controls remain in force.

### Repository

- Direct-to-`main` workflow remains unchanged.
- No dependency, lockfile, package manifest, branch, PR or Actions workflow change is introduced by the identity HTTP/security tranche.
- M0-031 remains the main architecture blocker; no PostgreSQL/Drizzle success is claimed from contracts, fakes or local Node harnesses.
- M6-091 canonical LICENSE remains open until a target blob byte-identically matches the authoritative SPDX source.
