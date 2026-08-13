# PRD-002 — Identity, Authentication, Authorization & Audit

**Priority:** P0

## Goals

- Securely authenticate users across browser, desktop, and mobile clients.
- Represent school roles without hardcoded role branching.
- Scope access to relevant institution/branch/class/subject/session context.
- Make high-risk changes auditable.

## Core entities

- user;
- profile;
- institution membership;
- branch membership where needed;
- role;
- permission;
- role-permission mapping;
- role assignment;
- scope assignment;
- session/device;
- password reset token;
- audit event.

## Default roles

Seed configurable default roles such as:

- Super Administrator;
- School Administrator;
- Principal;
- Teacher;
- Accountant;
- HR;
- Reception;
- Librarian;
- Transport Manager;
- Hostel Warden;
- Student;
- Parent/Guardian.

Default roles are convenience templates, not authorization code paths.

## Permission naming

Use stable namespaced identifiers:

- `student.read`
- `student.create`
- `student.update`
- `attendance.student.read`
- `attendance.student.mark`
- `fees.invoice.read`
- `fees.payment.collect`
- `exam.marks.update`
- `exam.result.publish`
- `system.roles.manage`

## Scope model

A grant may be restricted by:

- institution;
- branch;
- academic session;
- class section;
- subject;
- own-record/own-children relationships;
- future custom dimensions only with explicit design.

## Authentication

V1:

- username/email + password;
- forgot/reset password;
- forced password reset by admin;
- session list/revocation;
- account disable;
- login throttling/lock strategy.

Later:

- TOTP MFA;
- OIDC;
- SAML/enterprise SSO;
- passkeys after explicit product decision.

## Native-client login

Self-hosted app must support:

1. Server URL entry or QR scan.
2. Fetch safe instance metadata.
3. Verify HTTPS/connection.
4. Authenticate.
5. Store native credentials/tokens only through approved secure-storage adapter.

## Authorization enforcement

- Every protected API use case performs server authorization.
- UI uses permission information only to shape UX.
- Never trust `institutionId`, `studentId`, or scope IDs from the client without authorization validation.
- Bulk operations evaluate permissions for their target scope.

## Audit events

P0 audit examples:

- user/role/permission changes;
- student sensitive-record changes;
- attendance corrections after lock period;
- marks/result publication changes;
- fee collection/refunds/discount overrides;
- system settings;
- backup/restore/update;
- login security events.

Audit event fields:

- event type;
- actor;
- institution;
- target type/id where safe;
- timestamp;
- source/request ID;
- before/after summary where appropriate;
- reason for controlled corrections where required.

## Acceptance criteria

- Teacher cannot read/update out-of-scope class data via direct API request.
- Parent can access only linked children.
- Student can access only own student-facing records unless explicitly granted otherwise.
- Permission changes take effect predictably without requiring arbitrary server restart.
- Revoked/disabled sessions stop accessing protected APIs.
- Sensitive role/payment/result actions create audit records.
