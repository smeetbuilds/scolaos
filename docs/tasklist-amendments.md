# Tasklist Amendments — M0/M1/M6

`docs/project-tracker.md` is authoritative for current status. Stable task IDs remain unchanged; this file records corrected/expanded task evidence until the master backlog is normalized.

## M0 state carried forward

- [ ] **M0-003 [P1]** Replacement project name — IN PROGRESS.
- [x] **M0-004 [P0]** Initial supported server environments/minimum versions — DONE. Linux x86_64; Node 24.x LTS; PostgreSQL 16–18/current minor. Evidence: `docs/support-matrix.md`, `apps/server/src/platform-support.ts`.
- [x] **M0-005 [P0]** Initial threat model.
- [x] **M0-013..021** Repository/tooling quality foundation.
- [x] **M0-030 [P0]** Fastify API POC.
- [ ] **M0-031 [P0]** Drizzle/PostgreSQL POC — IN PROGRESS. The independent SQL-semantic harness now verifies server major/CREATE privilege and is wired to PostgreSQL 16/18 jobs in the existing CI workflow. This is not completion evidence: real `drizzle-orm`/`drizzle-kit` package resolution, generated migrations, migration-journal verification, typed queries and observed green PostgreSQL runs remain required.
- [x] **M0-050/M0-051/M0-060** visual/responsive/accessibility definition.
- [ ] **M0-052..059** UI primitives — specification complete; implementation dependency-blocked.
- [ ] **M0-061 [P1]** Interactive design-system catalog — IN PROGRESS.
- [x] **M0-070..078** Platform-contract module complete.

## M1 installer/security foundation

- [x] **M1-001 [P0]** Explicit boot states.
- [ ] **M1-002 [P0]** Installer-only pre-install route boundary — REVIEW pending observed Fastify/Vitest execution evidence.
- [x] **M1-003 [P0]** Safe server config persistence.
- [x] **M1-004 [P0]** Generated security secrets.
- [x] **M1-005 [P0]** Secret/error redaction.
- [ ] **M1-011 [P0]** Requirements screen — backend/API complete; responsive UI pending.
- [ ] **M1-013 [P0]** DB connection/privilege test endpoint — OPEN behind the accepted PostgreSQL driver/Drizzle gate; the POC harness now proves the low-level PostgreSQL CREATE-privilege check semantics only.
- [ ] **M1-019 [P0]** Real install-progress UI — durable backend state/API complete; UI pending.
- [ ] **M1-021 [P0]** Failure-recovery UI — backend retry/recovery/config correction complete; UI pending.
- [x] **M1-030 [P0]** Exclusive installer lock.
- [ ] **M1-031 [P0]** Migration runner — OPEN behind M0-031 generated-migration/driver acceptance.
- [x] **M1-035 [P0]** Post-install verification engine foundation.
- [x] **M1-036 [P0]** Permanent post-install installer lock.
- [x] **M1-037 [P0]** Installer CSRF/request-origin strategy.
- [ ] **M1-038 [P0]** Installer security integration tests — REVIEW pending observed real Fastify/Vitest execution evidence.

## M1 initial-school bootstrap foundation

- [ ] **M1-014 [P0]** Institution setup screen — IN PROGRESS. Normalized initial-institution input contract exists; responsive UI/runtime persistence binding remain.
- [ ] **M1-015 [P0]** Initial academic-session fields — IN PROGRESS. Initial active-session fields/invariants exist in the bootstrap contract; UI/persistence remain.
- [ ] **M1-016 [P0]** Administrator setup screen — IN PROGRESS. Full-name/email/login/password-confirmation contract and password-hasher port exist; production binding/UI remain.
- [ ] **M1-032 [P0]** Seed default system data — IN PROGRESS. Versioned deterministic installation seed plan + integrity fingerprint exist; PostgreSQL application/journal evidence remains.
- [ ] **M1-033 [P0]** Seed default permission catalog — IN PROGRESS. Seed plan consumes the canonical permission catalog/default roles, rejects drift/unknown permissions, and requires Super Administrator to explicitly grant every current permission; PostgreSQL application remains.
- [ ] **M1-034 [P0]** Create institution/branch/session/admin transactionally — IN PROGRESS. One transaction/idempotency port covers seed + institution + branch + active session + admin user + membership + super-admin assignment + completion receipt. Real PostgreSQL adapter/constraints/rollback proof remain.

Evidence: `packages/domain/src/bootstrap.ts`, `packages/domain/src/bootstrap.test.ts`, `apps/server/src/installation/seed-plan.ts`, `apps/server/src/installation/seed-plan.test.ts`, `docs/pocs/installer-bootstrap.md`.

## M1 institution/settings foundation

- [ ] **M1-070 [P0]** Institution settings CRUD — IN PROGRESS; domain validation exists, persistence/API/authorization/UI remain.
- [ ] **M1-071 [P0]** Branch management — IN PROGRESS; branch invariants exist, persistence/API/UI remain.
- [ ] **M1-072 [P0]** Academic session management — IN PROGRESS; lifecycle invariants exist, persistence/API/UI remain.
- [x] **M1-073 [P1]** Term/semester model — DONE. Evidence: `packages/domain/src/institution.ts`, tests, `docs/pocs/institution-domain.md`.
- [ ] **M1-074 [P1]** Branding/logo — IN PROGRESS; opaque storage-key metadata boundary exists.
- [ ] **M1-075 [P0]** Timezone/currency/locale settings — IN PROGRESS; domain validation exists, persistence remains.

## M1 authorization foundation

- [x] **M1-060 [P0]** Permission registry.
- [x] **M1-061 [P0]** Default role templates.
- [x] **M1-062 [P0]** Server authorization service.
- [x] **M1-063 [P0]** Scope-model POC.
- [ ] **M1-064..066** RLS/client navigation/attack-suite integration remain open or blocked on persistence/routes.

## M1 identity/authentication foundation

- [x] **M1-053 [P0]** Authentication session transport ADR — DONE.
- [x] **M1-054 [P0]** Password hashing implementation — DONE. Current production work factor is scrypt `N=2^16, r=8, p=2`; successful login has compare-and-set rehash upgrade semantics.
- [ ] **M1-055 [P0]** Login endpoint/UI — IN PROGRESS. Framework-neutral HTTP sign-in enforces HTTPS/proxy trust, browser-vs-native transport, origin policy, safe browser cookie/CSRF issuance and safe login audit events. Persistent repository, concrete Fastify route and UI remain.
- [ ] **M1-056 [P0]** Logout/session revocation — IN PROGRESS. Session lifecycle plus authenticated HTTP logout, transport matching, browser CSRF/origin protection, audit and cookie clearing exist. Persistence, Fastify route and UX remain.
- [ ] **M1-057 [P0]** Forgot/reset password — IN PROGRESS. Generic response, secure tokens, trusted reset URL, source/account abuse controls, bounded minimum timing, cheap active-challenge preflight before scrypt and atomic challenge+durable-outbox/consume contracts exist. PostgreSQL store, transactional race proof, worker/delivery, Fastify/UI remain.
- [ ] **M1-058 [P0]** Login rate limiting/brute-force controls — IN PROGRESS. Existing normalized-account throttle is complemented by an HMAC-keyed source spray limiter and reusable atomic counter-store contract. Persistent counter store and Fastify integration remain.
- [ ] **M1-059 [P0]** Current-user/permission context endpoint — IN PROGRESS. Framework-neutral current-user projection returns current actor/grants, force-reset state and safe session metadata, with browser CSRF issuance and no token hash. Persisted principal loader and concrete Fastify endpoint remain.

Identity HTTP acceptance details:

- cookie and Authorization credentials are mutually exclusive;
- duplicate/secure+local session cookies are rejected;
- forwarded protocol is trusted only when configuration enables proxies **and** the server adapter marks the immediate peer trusted;
- `sourceAddress` is a server-resolved effective client address, never raw `X-Forwarded-For` input;
- browser mutations require exact Origin + same-origin Fetch Metadata when present + session-bound CSRF;
- native bearer mutations do not use ambient-cookie CSRF;
- forced-reset sessions cannot enter normal application routes;
- browser JSON responses do not expose session credentials or stored token hashes;
- password/reset/login audit drafts never include passwords, session/reset tokens, submitted login identifiers or raw source addresses.

Evidence: `apps/server/src/identity/abuse.ts`, `http-boundary.ts`, `http-application.ts`, their tests, hardened `service.ts`/`password-reset.ts`, and `docs/pocs/identity-http-security.md`.

## M1 audit/health foundation

- [ ] **M1-080 [P0]** Audit-event persistence — OPEN / database blocked.
- [x] **M1-081 [P0]** Audit helper/service — DONE. Typed identity/reset/installer event builders still require the existing sanitizer/store at write time.
- [ ] **M1-082 [P1]** Admin audit-list UX — OPEN.
- [x] **M1-083 [P0]** Health-check service — DONE. Installation-security, runtime-support and disk-capacity probes exist and timeout cancellation is propagated through `AbortSignal`.
- [ ] **M1-084 [P0]** Health admin screen — OPEN. Concrete DB/migration/storage/mail/worker probes and authorized responsive UI remain.
- [x] **M1-085 [P1]** Request/log correlation IDs — DONE.

## M6 documentation/open-source readiness

- [x] **M6-015, M6-067, M6-090, M6-092, M6-093, M6-094, M6-098, M6-099, M6-100** — DONE.
- [ ] **M6-091 [P0]** LICENSE — OPEN unless the target repository blob exactly matches SPDX `0c97efd25b5974b974ed9a8a18207bc4f55bb338`. Reconstructed/reformatted license text is not accepted as completion evidence.
- [ ] **M6-095..097** Installation/Docker/upgrade-backup-restore docs — OPEN until runtime behavior is proven.

## Acceptance boundaries carried forward

- In-memory/transactional fake stores are evidence for core behavior only, never production persistence.
- A workflow definition is not itself a successful database/browser test run.
- Browser clients cannot assert installer phase completion/finalization.
- Database/native/browser tasks stay open until their required executable evidence exists.
- Institution/session/branch/term/bootstrap invariants must also be enforced by PostgreSQL constraints/transactions where appropriate.
- Authentication/recovery source counters need an atomic persistent production store before M1-058 can be DONE.
- Reset `isChallengeActive` is a cheap preflight only; `consumeAndReplacePassword` remains the race-safe authority.
- Raw session/reset/bootstrap password credentials must never become durable lookup/content/audit fields.
- Required audit writes must fail the protected transaction when persistence fails; best-effort security telemetry must surface write failures operationally.
- Health/provider errors must remain credential-safe.
- `pnpm-lock.yaml` must be generated by pnpm dependency resolution; it must not be fabricated to bypass a missing registry/runtime environment.

## Main-only / Actions policy

- direct-to-`main` only for the current owner workflow;
- no feature branches or pull requests unless the owner changes the policy;
- one coherent final commit per tranche;
- no new GitHub Actions workflow files; existing CI/Security workflows may run automatically and may be strengthened in place;
- no automated dependency branches/PRs or bot commits;
- do not hand-edit `pnpm-lock.yaml`.
