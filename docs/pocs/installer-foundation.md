# Installer Foundation Evidence

**Tranche:** Early M1 installer backend/security foundation  
**Date:** 13 August 2026  
**Scope:** M1-001..005, M1-030, M1-036, M1-037, M1-038 preparation

## Purpose

Establish the fail-closed server boot/configuration boundary before the database migration and installer UI work is available.

This tranche deliberately does **not** implement or claim completion of PostgreSQL connection testing, migrations, seeding, institution/admin creation, post-install database verification, or the installer UI.

## Implemented core

### Boot states — M1-001

The server now models three externally relevant boot states:

- `unconfigured` / `UNCONFIGURED` — no valid config and no installed marker;
- `configured` / `CONFIG_WRITTEN` — valid config exists but installation is not verified/finalized;
- `installed` / `INSTALLED` — valid config plus matching installed marker.

A marker without valid matching config is an error, not an installed state.

### Restricted pre-install server — M1-002 implementation in REVIEW

`apps/server/src/app.ts` checks installation state before normal application routes. Before verified installation, only process health and `/start/installation...` paths are considered installer-safe. Application API routes and OpenAPI are rejected with the standard `INSTALLATION_REQUIRED` error envelope.

The Fastify injection regression suite is committed in `apps/server/src/installation/integration.test.ts`; the task remains REVIEW until that suite runs in a dependency-capable environment.

### Safe server config — M1-003

`InstallationConfigStore` validates and persists:

- base URL;
- PostgreSQL host/port/database/user/password;
- PostgreSQL SSL mode;
- installation ID/timestamp;
- generated security secrets.

Persistence uses a restrictive data directory, temporary file, exclusive create, fsync, atomic rename, and final `0600` file mode where POSIX permissions apply.

Database passwords and generated security secrets are server-side only and are excluded from public installer status/config responses.

### Generated secrets — M1-004

Initial config creation generates two independent 32-byte random secrets encoded with base64url. They are never accepted from installer input.

### Secret redaction — M1-005

The server now centralizes:

- recursive sensitive-key redaction;
- credential-bearing URL/text redaction;
- safe error objects without stack traces;
- structured logger redaction paths for authorization/cookies/passwords/secrets/tokens.

Unhandled API/startup logging uses the sanitized error representation.

### Concurrent installer lock — M1-030

Installer mutations use an exclusive `installer.lock` file created with `wx`. The lock stores an opaque token, PID, and acquisition timestamp. Release removes the lock only if the token still matches, preventing one operation from deleting a lock it does not own.

The implementation intentionally does not auto-break stale locks. A future recovery/reset path must make stale-lock removal explicit rather than guessing whether another installer is active.

### Permanent mutation lock — M1-036

After `markInstalledAfterVerification()` writes a marker matching the active installation ID:

- config mutation is rejected;
- installer CSRF sessions are no longer issued;
- the installed marker is idempotent when finalization is repeated;
- no public route can directly call finalization.

The method name and API boundary intentionally require future migration/seed/post-install verification code to call finalization only after those steps succeed.

### CSRF/request-origin strategy — M1-037

Installer mutations require:

- a server-issued random nonce in an HttpOnly host cookie scoped to `/start/installation`;
- `SameSite=Strict`;
- `Secure` when the request is HTTPS;
- a matching HMAC CSRF token in `x-installer-csrf`;
- rejection of cross-site `Sec-Fetch-Site` values;
- exact Origin/Host/protocol matching when an Origin header is present.

The CSRF signing secret is process-local, so restart invalidates outstanding installer sessions rather than persisting browser CSRF credentials.

## Regression tests

Committed tests cover:

- state transitions and invalid marker/config combinations;
- generated secret length/separation;
- public config non-disclosure;
- POSIX config permissions;
- unsafe config rejection;
- lock exclusivity;
- post-install mutation lockout;
- CSRF same-origin acceptance/cross-site rejection;
- nested credential/error redaction;
- pre-install route gating;
- secret-free installer HTTP responses;
- configured-vs-installed route behavior;
- preservation of the existing Fastify/OpenAPI/auth POC after explicit installed setup.

## Execution evidence in this tranche

The installer core source was locally transpiled and executed independently of Fastify. The runtime harness passed boot-state transitions, atomic config persistence, secret generation/non-disclosure, `0600` permissions, marker consistency, lock exclusivity, permanent lockout, CSRF verification, cross-site rejection, and redaction.

The core modules also passed a local strict TypeScript check. The full changed TypeScript surface, including Fastify integration/tests, was syntax-transpiled successfully.

## Validation limitation

The current execution environment does not have the repository's Fastify/Vitest packages installed and cannot reach the npm registry. GitHub Actions are intentionally paused by owner request.

Therefore:

- M1-001, M1-003, M1-004, M1-005, M1-030, M1-036 and M1-037 have executable core evidence and are DONE;
- M1-002 is IMPLEMENTED / REVIEW pending real Fastify injection execution;
- M1-038 test coverage is IMPLEMENTED / REVIEW pending real Vitest/Fastify execution;
- no fresh claim is made for full `pnpm check`, build, Playwright, or dependency audit on this changed runtime tree.

## Still blocked/next

Installer backend completion still requires the PostgreSQL-capable path:

1. M0-031 Drizzle/PostgreSQL proof;
2. M1-013 DB connection/privilege/version test;
3. M1-031 migrations;
4. M1-032/M1-033 seed system/permissions;
5. M1-034 institution/branch/session/admin transaction;
6. M1-035 post-install verification;
7. then the existing internal finalization method may write `INSTALLED`.
