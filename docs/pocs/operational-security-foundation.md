# Operational Security Foundation POC

**Effective:** 14 August 2026  
**Scope:** M1-057 partial, M1-081 complete, M1-083 complete  
**Execution mode:** local TypeScript/Node core only; no GitHub Actions

## Purpose

Advance dependency-independent backend work while PostgreSQL/Drizzle and the full installed workspace remain unavailable in the execution environment.

This tranche adds three related foundations:

1. a password-reset service contract under `apps/server/src/identity/`;
2. an audit helper/service under `apps/server/src/audit/`;
3. a provider-oriented health-check service under `apps/server/src/health/`.

## Password-reset foundation — M1-057 remains IN PROGRESS

Implemented core behavior:

- generic public response for known and unknown login identifiers;
- 256-bit cryptographically random opaque reset tokens;
- only a SHA-256 domain-separated token hash is persisted;
- 30-minute challenge lifetime in the service contract;
- a newer request invalidates outstanding challenges for the account;
- reset links are built from configured server base URL, never request `Host` data;
- HTTPS is mandatory except localhost development;
- the normal password policy/hash implementation is reused;
- invalid/expired/already-used tokens return the same public reset error;
- the persistence boundary requires one atomic operation that consumes the challenge, replaces the password, invalidates outstanding reset challenges, and revokes active sessions;
- the service does not auto-login the account after reset.

Security references:

- OWASP Forgot Password Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html
- OWASP ASVS 5 authentication requirements: https://github.com/OWASP/ASVS/blob/master/5.0/en/0x15-V6-Authentication.md

Still required before M1-057 is DONE:

- PostgreSQL reset-challenge schema/repository;
- atomic reset transaction implementation;
- notification/outbox integration;
- real Fastify request/consume endpoints;
- request-rate abuse controls;
- timing/equalization behavior at the HTTP/queue boundary;
- reset-complete notification;
- reset page `Referrer-Policy: no-referrer` and client flow;
- integration tests proving single use, expiration, concurrent consumption safety and session revocation.

## Audit helper/service — M1-081 DONE

`AuditService` implements the accepted M0-078 audit-event contract without pretending persistence already exists.

Properties:

- event ID and occurrence time come from the trusted service path;
- action names are stable lowercase dot-separated semantics;
- actor/resource/request/job identifiers are structurally validated;
- metadata is bounded by depth, key count, array size and string length;
- password/token/credential/connection/private-key/payment-secret keys are rejected;
- bearer credentials, credential-bearing database URLs and private-key blocks are rejected from string metadata/reasons;
- `recordRequired()` propagates persistence failure for transaction-critical protected operations;
- `recordBestEffort()` isolates persistence failure and invokes an operational failure callback for events whose business operation must not be rolled back.

`AuditEventStore` is deliberately injected. A PostgreSQL transaction can therefore provide a transaction-bound store so a critical state mutation and its audit event commit together.

M1-080 audit persistence remains open.

## Health-check service — M1-083 DONE

`HealthCheckService` provides the reusable operational health engine required by later installer/admin diagnostics.

Properties:

- unique allow-listed probe IDs;
- per-probe criticality and timeout;
- parallel probe execution;
- normalized `healthy`, `degraded`, `unhealthy`, `unknown` states;
- a critical unhealthy/unknown probe makes overall state unhealthy;
- optional degraded/unknown probes degrade overall state;
- arbitrary thrown provider errors are converted to a generic probe-failed result rather than returned to clients;
- health-detail keys reject credential/secret fields;
- built-in Node runtime probe;
- built-in application-data-directory write/fsync/remove probe;
- provider adapter helper for database, migrations, storage, worker, scheduler, mail, backup and HTTPS/base-URL checks.

Concrete database/migration/mail/worker probes remain provider integration work and do not block completion of the reusable M1-083 service itself.

M1-084 remains open until a protected admin health UI exists.

## Executed evidence

The tranche was compiled with strict TypeScript settings in the available local runtime and an executable Node harness passed:

- required audit append and trusted identity/time assignment;
- secret-like audit metadata rejection;
- best-effort audit failure callback;
- runtime/filesystem/provider health aggregation;
- critical health-provider failure behavior;
- duplicate health-probe rejection;
- reset request known/unknown generic response parity;
- reset raw-token non-persistence;
- trusted-base reset URL construction;
- password reset consume contract and invalid-token rejection.

Permanent Vitest suites are committed for all three modules.

## Validation limits

- local runtime is Node 22, while the project support matrix still targets Node 24 and remains gated by M0-004;
- the installed repository dependency graph is unavailable locally, so full workspace Vitest/Fastify execution is not claimed;
- no PostgreSQL persistence evidence is claimed;
- no GitHub Actions were run;
- no dependency manifest, lockfile or workflow changes are part of this tranche.
