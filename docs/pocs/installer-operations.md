# Installer Operations & Recovery Foundation

**Status:** core executable evidence complete; database/provider integration remains pending  
**Date:** 14 August 2026

This tranche extends the installer from a three-state config/lock skeleton into an operationally safe, resumable backend foundation. It does not claim that PostgreSQL migrations, seeds, institution/admin creation, or the React installer UI are complete.

## Scope

Implemented:

- requirements diagnostics for Node/runtime compatibility, cryptographic randomness, writable data/storage/temp directories, available-disk warning, and HTTPS/base-URL classification;
- durable installer progress with ordered phases `CONFIG_WRITTEN -> DB_CONNECTED -> MIGRATING -> SEEDING -> VERIFYING -> INSTALLED`;
- atomic/private progress persistence and fail-closed validation;
- failure records with stable codes, bounded safe messages, retryability, timestamps and recovery guidance;
- safe pre-database configuration correction while preserving installation identity and generated security secrets;
- configuration edits permanently lock once database setup has advanced;
- provider-driven post-install verification covering database connectivity, migration state, permission seed and institution/admin bootstrap state;
- installed marker creation only after seed completion and successful mandatory verification;
- retry-safe verification failure behavior and idempotent marker retry after verification has already passed;
- installer API surfaces for requirements, real progress/status, recovery state and pre-DB config correction.

## Security invariants

1. Installer progress cannot skip phases or rewind after database setup advances.
2. Corrupt/mismatched progress metadata fails closed.
3. Progress files are written atomically and use mode `0600` on supported platforms.
4. Public requirement/recovery output does not expose filesystem paths or stored database credentials.
5. Failure records reject credential-bearing diagnostic text.
6. Database configuration may be corrected only while the completed phase is `CONFIG_WRITTEN`; changing it preserves `installationId`, session secret and installer secret.
7. A failed DB-connect attempt can be reset to the pre-DB checkpoint after configuration correction, even when the original failure is not automatically retryable.
8. Finalization is unavailable unless a verification provider is configured.
9. Finalization is rejected before the migration/seed pipeline reaches `SEEDING` complete.
10. Verification failure leaves boot state `configured`, records a retryable `VERIFYING` failure, and does not create the installed marker.
11. Verification provider exceptions are converted to generic failed checks instead of leaking raw exception/connection text.
12. Once the installed marker is valid, installer mutations remain disabled by the existing permanent lockout boundary.

## HTTP surface

Installer-safe endpoints now include:

- `GET /start/installation/status` — boot state plus durable real phase/progress;
- `GET /start/installation/requirements` — safe requirement classification;
- `GET /start/installation/recovery` — safe failure/recovery state;
- `GET /start/installation/session` — installer CSRF session;
- `POST /start/installation/config` — first atomic config write;
- `PUT /start/installation/config` — CSRF-protected correction before DB setup advances.

There is intentionally no public phase-advance/finalize endpoint yet. Migration/seed/finalization must be driven by the future trusted installer orchestrator, not directly by browser-supplied phase assertions.

## Local executable evidence

The dependency-free core was validated in the available container using global TypeScript 5.8.3 and Node 22.16.0. The repository targets Node 24, so the requirements harness injects a Node 24 version when validating the supported-runtime pass path and separately proves that Node 22 is classified as a blocking failure.

Executed checks:

- strict TypeScript compile of requirements/progress/recovery/verification/service core using temporary ambient Node shims;
- syntax transpilation of the changed installer routes/tests;
- real Node filesystem runtime harness covering writable-directory probes, disk/TLS/runtime classification, atomic progress persistence, failure/retry state, no phase skipping, pre-DB reset, config replacement identity/secret preservation, config lock after DB advance, verification success/failure sanitization, verifier-required finalization and completion through `VERIFYING`.

Result: `installer-operations-harness: PASS`.

## Task interpretation

- **M1-011 requirements check screen:** IN PROGRESS. Backend service/API are complete; React responsive screen remains.
- **M1-019 installation-progress UI:** IN PROGRESS. Durable real progress state/API are complete; UI remains.
- **M1-021 installation-failure recovery UI:** IN PROGRESS. Backend recovery/config-correction path is complete; UI remains.
- **M1-035 post-install verification:** DONE as the verification/finalization engine. The mandatory provider contract is implemented and tested. Actual PostgreSQL checks cannot pass in production until M1-031..034 provide migrations/seeds/bootstrap persistence and wire the provider.
- **M1-002/M1-038:** still REVIEW. Fastify/Vitest integration files were updated, but actual Fastify/Vitest execution is not claimed because dependencies are unavailable locally and GitHub Actions remain paused.

## Remaining blockers

- M0-031 real Drizzle/PostgreSQL POC;
- M1-013 DB connection/privilege/version endpoint;
- M1-031 migration runner;
- M1-032/M1-033 seed persistence;
- M1-034 transactional institution/branch/session/admin bootstrap;
- trusted production verification-provider wiring;
- React installer requirements/progress/recovery screens;
- real Fastify/Vitest and fresh-install E2E execution.
