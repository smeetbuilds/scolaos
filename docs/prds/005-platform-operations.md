# PRD-005 — Platform Operations: Jobs, Storage, Email, Notifications, Health

**Priority:** P1

## Goal

Provide operational infrastructure required by school modules without turning every feature into a one-off integration.

## Background jobs

Common job contract:

- ID;
- type;
- payload schema/version;
- created time;
- scheduled time;
- attempts;
- max attempts;
- status;
- last error;
- idempotency/deduplication key where applicable.

Admin operational view:

- queued;
- running;
- failed;
- retry;
- dead/abandoned;
- filters by type/time.

## Scheduler

Single scheduler abstraction manages:

- fee reminders;
- daily attendance summaries;
- notification campaigns;
- report schedules;
- backup schedules;
- cleanup/retention jobs.

Timezone behavior is explicit per scheduled job.

## Storage

Providers:

- local filesystem — required;
- S3 compatible — optional.

File metadata is in PostgreSQL; binary content is in storage provider.

Private downloads require authorization and short-lived application-mediated access strategy.

Uploads:

- maximum size configuration;
- MIME/content checks;
- safe names/generated IDs;
- antivirus hook interface later;
- quotas later.

## Email

Default provider: SMTP.

Configuration:

- host;
- port;
- encryption;
- username/password;
- from address/name;
- test email.

Architecture supports future provider adapters without changing feature modules.

Feature code emits semantic notifications such as `fees.invoice.created`; rendering/delivery subsystem decides email/push/SMS channels according to rules.

## Notifications

Layers:

1. domain event;
2. recipient resolution;
3. template rendering;
4. channel dispatch;
5. delivery/log state.

Channels:

- in-app;
- email;
- push later;
- SMS/WhatsApp adapters later.

## Template system

- localized templates;
- preview;
- safe variable catalog;
- subject/body;
- channel-specific rendering;
- school branding tokens.

Do not permit arbitrary server-side code execution in templates.

## Health diagnostics

Health checks:

- database;
- migrations;
- worker heartbeat;
- scheduler heartbeat;
- storage read/write;
- mail optional test;
- disk space warning;
- app/client compatibility info.

## Acceptance criteria

- Feature modules enqueue notifications without knowing SMTP details.
- Failed jobs are visible and safely retryable.
- Private file cannot be retrieved without authorization.
- Local-storage deployment works without S3.
- SMTP test result is actionable.
- Health checks have timeout limits and do not hang admin dashboard.
