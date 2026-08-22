# PRD-001 — Installer, Self-Hosting, Upgrades, Backup & Recovery

**Priority:** P0  
**Target:** Milestones 0–1, production hardening by 1.0

## Problem

Open-source school-management systems often make installation and upgrades the operator's problem. For this product, deployment operations are part of the UX.

## User outcome

A self-hoster can provision a fresh instance without manually importing SQL or editing source files.

## Primary installation flows

### Managed Node hosting / VPS

1. Deploy release package.
2. Create PostgreSQL DB and credentials.
3. Start app process.
4. For a remotely reachable fresh instance, set a strong one-time `SCOLA_INSTALLER_BOOTSTRAP_TOKEN` before opening the installer. Loopback-only installation does not require this token.
5. If TLS is terminated by a reverse proxy, set `SCOLA_TRUST_PROXY` to the explicit proxy address/CIDR list; never trust forwarded headers from arbitrary peers.
6. Open `/start/installation`.
7. Requirements check.
8. Database test.
9. Institution setup.
10. Administrator setup.
11. Optional mail/storage setup.
12. Install.
13. Redirect to login/onboarding.

Remote installer clients must present the configured operator bootstrap value in `x-installer-bootstrap` when obtaining the installer session. The credential is bootstrap authorization, not a replacement for CSRF; the resulting installer session continues to require the existing origin/fetch-site and CSRF checks for mutations. Remove the bootstrap environment value after successful installation.

### Docker

1. Configure minimum environment variables, including the installer bootstrap credential when the fresh instance is remotely reachable.
2. `docker compose up -d`.
3. Open installer.
4. Complete same wizard.

## Installer screens

### Welcome

- product/version;
- installation explanation;
- documentation link;
- language selection if localization foundation is ready.

### Requirements

Check and clearly classify:

- Node/runtime compatibility;
- writable configuration/data directories;
- writable storage/temp directories;
- available disk-space warning;
- HTTPS detection: remote HTTP is blocking; localhost HTTP may remain an explicit development warning;
- server base URL detection;
- required cryptographic/runtime capabilities.

### Database

Inputs:

- host;
- port;
- database;
- username;
- password;
- SSL mode.

Actions:

- test connection;
- test required privileges;
- report PostgreSQL version;
- reject unsupported configuration with actionable message.

### Institution

- institution name;
- short code;
- default branch/campus;
- country;
- timezone;
- currency;
- locale;
- academic session;
- logo optional.

### Administrator

- full name;
- email/username;
- password + confirmation;
- password strength/error feedback.

### Services (optional)

- configure SMTP now/later;
- storage provider local/S3 if advanced setup is chosen;
- do not make third-party integrations installation blockers.

### Install progress

Show named steps and real states, not fake progress animation.

## Atomicity and failure recovery

- Acquire installer lock.
- Treat an old installer lock as recoverable only when its recorded process is no longer alive; never expire an active lock solely by age.
- Write config safely using temp + atomic rename where supported.
- Run versioned DB migrations.
- Seed default permissions/roles/settings.
- Create institution/admin in transaction where possible.
- Mark installed only after post-install verification.
- On failure, provide exact step and safe retry/reset path.
- Never silently rerun destructive setup.

## Post-install hardening

After success:

- privileged installer mutation endpoints disabled;
- install marker tied to valid server config/database metadata;
- installer URL can show only "already installed" + documentation;
- no database password rendered back to client;
- generated secrets, CSRF credentials, and installer bootstrap credentials not logged;
- proof-of-concept routes are not registered by the production server;
- remove the one-time remote installer bootstrap environment value.

## Upgrades

Minimum 1.0 upgrade capability:

- app knows current application + DB schema version;
- detects pending migrations;
- migration command documented;
- admin can see compatibility status;
- release notes link;
- pre-upgrade backup workflow.

One-click binary self-update is optional for 1.0; safe migration compatibility is mandatory.

## Backup

Backup contains:

- PostgreSQL dump;
- local uploaded files if local provider is active;
- sanitized configuration required to restore;
- manifest with versions/checksums.

Features:

- manual backup;
- scheduled backup later;
- retention settings later;
- optional encryption;
- local download and/or configured remote target.

## Restore

- upload/select backup;
- verify archive and checksums;
- display source app/schema version;
- compatibility preflight;
- explicit destructive confirmation;
- maintenance mode;
- restore DB/files;
- post-restore health check.

## Health page

Expose safe operational status:

- app version;
- DB connected;
- DB latency;
- DB version;
- migration status;
- filesystem/storage writable;
- worker state;
- scheduler state;
- mail test/status;
- disk warning;
- backup status;
- HTTPS/base URL.

The unauthenticated `/health` endpoint is process liveness only. Safe dependency readiness is exposed separately through `/health/ready` and must fail closed when a mandatory dependency probe is unavailable or unhealthy. Detailed diagnostics remain an authenticated admin concern.

## Acceptance criteria

- Fresh supported environment can install with zero manual SQL.
- A remote unauthenticated client cannot obtain installer mutation state without the operator bootstrap credential.
- Reopening installer after successful install cannot mutate configuration.
- Remote deployments cannot persist an HTTP base URL; localhost development remains explicitly supported.
- Wrong DB credentials produce field/actionable error without secrets in logs.
- Interrupted migration cannot falsely mark installation complete.
- Backup generated by supported version passes restore test in CI/integration environment.
- Health page never exposes secrets.
