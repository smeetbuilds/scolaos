# Identity & Authentication Foundation POC

**Status:** CORE PASS / persistence and HTTP integration pending  
**Date:** 13 August 2026  
**Tasks:** M1-053, M1-054; foundation evidence for M1-055, M1-056, M1-058, M1-059

## Scope

This tranche establishes the dependency-independent authentication core without pretending that PostgreSQL persistence, Fastify auth routes, password-reset flows, or client UI already exist.

Implemented under `apps/server/src/identity/`:

- versioned password hashing and verification;
- opaque session credential generation/hashing;
- browser-cookie and native-bearer transport helpers;
- session-bound CSRF tokens;
- session creation/authentication/touch/revocation service;
- account/session repository interfaces;
- login identifier normalization;
- login throttling policy/store interface;
- HMAC fingerprints for sensitive metadata such as source address/user-agent;
- current-principal loading into the existing authorization actor model.

## ADR-025 transport decision

ADR-025 is accepted by amendment:

- browser uses an opaque server-side session credential in an HttpOnly cookie;
- HTTPS production uses a `__Host-` cookie with `Secure`, `Path=/`, no Domain, and `SameSite=Lax`;
- insecure browser cookies require explicit local-development opt-in;
- unsafe browser mutations must use the session-bound CSRF strategy plus origin/fetch-site controls at the HTTP layer;
- desktop/mobile use the same opaque credential class as a bearer credential stored only through the approved native secure-storage bridge;
- the server stores a SHA-256 hash of the session credential, never the raw credential;
- sessions are per-device, revocable, and have both idle and absolute expiries;
- authorization grants/relationships are reloaded from authoritative server-side state during authentication rather than embedded in long-lived self-contained JWT claims.

This preserves immediate revocation/disable/permission-change behavior and avoids making token claims another authorization database.

## Password storage

Password records are versioned:

```text
scrypt$1$N$r$p$keyLength$salt$hash
```

Current parameters:

- algorithm: asynchronous Node `scrypt`;
- N: 65536;
- r: 8;
- p: 1;
- derived key: 64 bytes;
- salt: random 16 bytes;
- max memory during verification: 128 MiB;
- comparison: constant-time `timingSafeEqual`;
- Unicode normalization: NFC;
- minimum length: 15 Unicode code points;
- maximum accepted length: 256 code points;
- no arbitrary upper/lower/digit/symbol composition rule.

The record stores its parameters so a later release can recognize old records and rehash after successful authentication.

Malformed or unsupported records fail authentication instead of becoming unbounded crypto work.

A compromised/common-password blocklist is still required at password creation/change boundaries; it is intentionally not conflated with hash verification.

## Session lifecycle

Browser session policy:

- idle expiry: 30 minutes;
- absolute expiry: 24 hours.

Native session policy:

- idle expiry: 7 days;
- absolute expiry: 30 days.

A session touched after five minutes updates its idle deadline without extending past absolute expiry.

Expired, revoked, disabled-user, or missing-principal sessions fail closed.

`signOut()` is idempotent. `revokeOtherSessions()` and `revokeAllSessions()` provide the core for device/session management.

## Credential handling

Raw session tokens:

- are generated from 32 random bytes;
- have a versioned `sess1_` prefix;
- are returned only at issuance time;
- are never persistence lookup keys;
- are converted to SHA-256 token hashes before repository lookup/storage.

Login throttle identifiers and optional source-address/user-agent fingerprints are HMACed with a server-side secret so database leakage does not expose common usernames/IP addresses as trivially reversible plain hashes.

The sign-in path performs the same expensive password-verification operation for missing accounts using a fixed dummy scrypt record, reducing a simple username-enumeration timing distinction.

## Login throttling

Current account-bucket policy:

- 10 failed attempts within 15 minutes;
- then block for 15 minutes;
- successful authentication clears the account bucket.

The policy is implemented behind `LoginThrottleStore`; production persistence still needs the PostgreSQL schema/adapter. Additional source/network abuse controls can be layered without changing the account-bucket contract.

## Executed evidence

This tranche used no GitHub Actions and introduced no dependency.

Locally executed in the available Node runtime:

- strict TypeScript check for the identity core: PASS;
- executable identity/authentication harness: PASS;
- password hash/verify and policy behavior;
- opaque token generation/hashing;
- browser/native transport helpers;
- session-bound CSRF verification;
- session create/authenticate/touch/revoke;
- no raw session token stored;
- no raw source address stored;
- login throttling and success reset;
- other-device revocation while keeping the selected current session.

A permanent Vitest suite is committed for password/session-transport primitives. The full repository Vitest/Fastify suite is not claimed as executed because repository dependencies are unavailable in the current runtime and GitHub Actions are intentionally owner-paused.

The local runtime is Node 22.x while the project target is Node 24, so this evidence does not close M0-004 or replace target-runtime validation.

## Task state

### DONE

- **M1-053** authentication session transport ADR.
- **M1-054** password hashing implementation.

### IN PROGRESS / core implemented

- **M1-055** login endpoint/UI — sign-in core exists; PostgreSQL repository, Fastify endpoint, audit event and UI remain.
- **M1-056** logout/session revocation — lifecycle core exists; persistent session repository, endpoints and session-list UX remain.
- **M1-058** brute-force/rate limiting — account-bucket service exists; persistent store and HTTP/source-level integration remain.
- **M1-059** current-user/permission context — authenticated principal loads the existing `AuthorizationActor`; persistence and endpoint remain.

### Still open

- M1-050 user schema;
- M1-051 membership schema;
- M1-052 role/permission/assignment persistence schemas;
- M1-057 forgot/reset-password flow;
- protected Fastify integration and M1-066 attack suite;
- security-event audit persistence;
- password blocklist integration at create/change boundaries.

## Acceptance boundary

Do not mark login/logout/current-user/throttling tasks DONE until they use authoritative persisted users/sessions/grants, run through real protected HTTP routes, and pass integration/security tests. In-memory repositories are test fixtures only, not a production fallback.
