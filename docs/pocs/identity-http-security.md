# Identity HTTP & Recovery Security Foundation

**Status:** implemented as a dependency-independent application/security boundary; PostgreSQL persistence, concrete Fastify routes, delivery outbox and UI remain pending.

This tranche turns the existing authentication/password-reset primitives into a framework-neutral HTTP application layer so route adapters do not need to invent credential, CSRF, proxy, throttling or audit semantics.

## Scope

The implementation advances M1-055 through M1-059 together and extends the completed M1-081 audit and M1-083 health foundations.

Implemented source:

- `apps/server/src/identity/http-boundary.ts`
- `apps/server/src/identity/http-application.ts`
- `apps/server/src/identity/abuse.ts`
- hardened `apps/server/src/identity/service.ts`
- hardened `apps/server/src/identity/password-reset.ts`
- `apps/server/src/audit/identity-events.ts`
- `apps/server/src/health/security-probes.ts`

Permanent regression coverage is colocated with those modules.

## Authentication HTTP boundary

The boundary accepts server-resolved request context rather than framework-specific request objects.

### Browser sessions

Browser authentication uses the existing opaque session token in an HttpOnly cookie. Production uses `__Host-school_session`; the non-Secure development cookie remains restricted to explicit localhost development.

Authenticated browser mutations require:

1. exactly one valid browser session cookie;
2. no simultaneous Authorization credential;
3. exact Origin equality with the configured application base URL;
4. `Sec-Fetch-Site: same-origin` when the header is present;
5. a CSRF token cryptographically bound to the current session ID and stored session-token hash.

The HTTP application never returns the browser session token or stored token hash in its JSON result. It returns a `Set-Cookie` value and a session-bound CSRF token for the adapter to place in the response.

### Native sessions

Native clients use the same opaque server-side session model over a Bearer credential. A native login response returns the bearer token explicitly and does not return a browser cookie or CSRF token. CSRF is not required for a correctly authenticated native bearer mutation because the credential is not ambiently attached by a browser.

A stored session's transport must match the credential transport used for the request.

### Credential ambiguity

Requests are rejected when they contain:

- browser session cookie plus Authorization;
- both secure and local-development session cookies;
- repeated authentication cookies;
- a local-development cookie in a secure production context;
- a secure production cookie in the explicit insecure-local context.

This prevents precedence bugs where different middleware layers could authenticate different credentials from one request.

## HTTPS and trusted proxies

Authentication requires HTTPS outside explicit localhost development.

`X-Forwarded-Proto`-style metadata is only honored when both conditions are true:

- proxy trust is enabled in server configuration; and
- the framework/server adapter has independently marked the immediate peer as a configured trusted proxy.

A direct client cannot make an HTTP request appear secure merely by sending `X-Forwarded-Proto: https`.

Likewise, `sourceAddress` in the identity request context means the **server-resolved effective client address after configured trusted-proxy processing**. The identity layer must never receive raw `X-Forwarded-For` text as a trusted client address.

## Forced password reset confinement

A principal carrying `forcePasswordReset=true` cannot enter ordinary authenticated application routes. Only these intents remain available:

- session/current-user read;
- password change/reset completion;
- logout.

This prevents a bootstrap/administratively-reset credential from being used as a normal long-lived authenticated session before the password requirement is satisfied.

## Brute-force and recovery abuse controls

The existing normalized-login throttle remains in place. A second independent source-level limiter now protects password verification from broad credential-spray attacks.

Default source login policy:

- 50 failed sign-ins;
- fixed 15-minute window.

Recovery additionally uses independent HMAC-keyed counters:

- 20 reset requests per source / 15 minutes;
- 5 reset requests per normalized account identifier / 60 minutes;
- 20 invalid reset attempts per source / 15 minutes.

Counter keys are HMAC-SHA-256 values. Raw source addresses and submitted login identifiers are not required as durable counter keys.

Repeated account-level reset requests silently suppress additional delivery while retaining the same public accepted response. Source floods receive a generic 429 response.

The counter store contract requires atomic fixed-window increment/reset behavior; the production PostgreSQL implementation remains pending.

## Recovery timing and token CPU protection

Password-reset requests and reset attempts are padded to a bounded minimum response duration. The default is 350 ms, with an implementation maximum of 2 seconds. Tests inject the clock/sleeper so they do not actually pause.

The reset store now exposes a cheap, non-consuming `isChallengeActive(tokenHash, at)` preflight. A syntactically valid but nonexistent/expired token is rejected before scrypt password hashing is performed.

That preflight is only a CPU/abuse optimization. It is **not** authoritative for token consumption. `consumeAndReplacePassword()` must still atomically:

1. verify the challenge is unused and unexpired;
2. consume it;
3. replace the password;
4. invalidate remaining reset challenges for the user;
5. revoke all active user sessions.

The atomic operation's result remains authoritative under races.

## HTTP application layer

`IdentityHttpApplication` provides framework-neutral orchestration for:

- sign in;
- current-user context;
- authenticated route guarding;
- logout;
- forgot-password request;
- reset-password completion.

It composes the existing authentication/session service, password-reset service and audit service instead of duplicating security behavior inside routes.

Current-user output exposes the current authorization actor/grants, force-reset state and bounded session metadata. It does not expose the raw session credential or stored token hash.

## Audit events

Typed audit builders now cover:

- `auth.login.success`
- `auth.login.failure`
- `auth.login.denied`
- `auth.logout.success`
- `auth.passwordreset.request`
- `auth.passwordreset.success`
- `auth.passwordreset.failure`
- `auth.passwordreset.denied`
- installer bootstrap success/failure

Rejected-login and reset-request events intentionally do not require the submitted login identifier or account existence. Source metadata, when needed, is an HMAC fingerprint rather than a raw address. Passwords, session/reset tokens and token hashes are never audit fields.

The builders reuse the existing audit sanitizer/service. PostgreSQL audit persistence remains M1-080 and is not completed by this tranche.

## Concrete health diagnostics

The operational health module now includes concrete probes for:

- installed-state security configuration: safe base URL + presence/length of security secrets;
- locked production runtime support: Node 24 on Linux x86_64;
- filesystem capacity using bounded available-byte metadata and explicit degraded/unhealthy thresholds.

Health details reveal booleans, counts, versions and available-byte values only. Secret values are never returned.

Database, migration, storage-provider, mail and worker probes remain future concrete adapters. M1-084 admin health UI also remains open.

## Executed evidence

The current constrained environment has Node 22.16.0 and global TypeScript 5.8.3 but no pnpm, PostgreSQL, container runtime or working npm registry resolution.

Dependency-independent source was strict-typechecked with the local harness configuration and executed with Node:

- `identity-security-harness: PASS`
- `identity-http-application-harness: PASS`

The harnesses exercised credential ambiguity, trusted-proxy protocol handling, cookie/native separation, session-bound CSRF, source/account recovery controls, browser sign-in/current-user/logout orchestration, token non-disclosure and safe audit drafts.

A final aggregate scratch-index compile reported missing exports from the deliberately reduced local `password.ts` shim; those exports exist in the real repository and were already exported by the repository identity index before this tranche. This is not reported as a repository compile failure or success.

## Evidence not claimed

This tranche does **not** claim:

- PostgreSQL persistence or concurrency proof;
- a persistent rate-limit counter store;
- Fastify route execution;
- repository Vitest execution;
- React/browser UI execution;
- native/Tauri execution;
- reset delivery/outbox execution.

M1-055 through M1-059 therefore remain IN PROGRESS until their persistence, framework and UI acceptance boundaries are met.
