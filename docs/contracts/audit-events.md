# Audit Event Contract

**Task:** M0-078  
**Status:** ACCEPTED  
**Effective:** 13 August 2026  
**Related:** M0-070, M0-076, M1-080, M1-081

## Purpose

Define an immutable, security-conscious audit record for sensitive school operations so later modules do not invent incompatible “activity log” formats.

Audit events answer: **who or what performed which protected action, against which subject, in what scope, with what outcome, and how can it be correlated to the originating request/job?**

## Canonical event semantics

Conceptual shape:

```ts
interface AuditEvent {
  id: string;
  occurredAt: string;
  institutionId?: string;
  branchId?: string;
  actor: AuditActor;
  action: string;
  resource?: { type: string; id: string };
  outcome: 'success' | 'failure' | 'denied';
  requestId?: string;
  jobId?: string;
  source: 'api' | 'installer' | 'job' | 'system';
  reason?: string;
  metadata?: Record<string, unknown>;
}
```

The persistence schema may add indexed/normalized columns, but the semantic fields above remain stable.

## Event identity and time

- event IDs are unique and immutable;
- `occurredAt` is a UTC timestamp assigned by the trusted server process/database path, not accepted blindly from clients;
- later ingestion/replication timestamps, if needed, are separate from occurrence time;
- audit ordering must not rely solely on wall-clock equality; the immutable ID provides a tie-breaker.

## Actor model

An actor is explicit rather than inferred from free-text messages.

Actor types include:

- authenticated user;
- system process;
- background job;
- API/integration identity when introduced;
- installer/bootstrap actor.

A user actor records a stable user ID and may include a role/context snapshot for investigation, but historical audit interpretation must not depend on the user's current display name or current roles.

If impersonation/support delegation is introduced, record both effective actor and impersonating/delegating identity.

## Action naming

Actions use stable lowercase dot-separated semantic names, for example:

- `student.created`
- `student.updated`
- `attendance.marked`
- `fees.payment.recorded`
- `auth.login.failed`
- `permissions.role.updated`
- `installer.completed`

Do not use UI button labels or HTTP route names as the durable audit vocabulary.

## Resource/subject

The primary affected entity is represented by stable type + ID. Additional related IDs may appear in structured metadata when necessary.

Avoid duplicating full records into the event merely to make the audit page easy to render.

## Outcome

Use explicit normalized outcomes:

- `success` — protected operation completed;
- `failure` — operation attempted but failed for a non-authorization reason;
- `denied` — security/permission/policy rejected the attempt.

Not every validation error needs a durable audit event. The threat model/module policy decides which failed/denied operations are security-relevant enough to retain.

## Correlation

Audit events link to request/job context when available:

- `requestId` follows M0-070 correlation semantics;
- `jobId` links delayed work to M0-076;
- a notification intent/delivery may be referenced in metadata when it matters to the protected action.

Correlation identifiers aid investigation but are not authorization credentials.

## Append-only behavior

Audit events are application-append-only.

- normal product APIs do not edit historical audit rows;
- normal product APIs do not hard-delete individual events;
- corrections create a new explanatory event rather than rewriting history;
- database privileges/migrations should eventually reinforce this rule;
- retention deletion, when legally/operationally required, happens through a controlled policy process and is itself auditable where feasible.

Tamper-evident hashing/chaining may be added later if threat/risk requirements justify it; this contract does not falsely claim cryptographic immutability today.

## Transaction boundary

For critical successful mutations, the audit record should be committed in the same database transaction as the protected state change when practical.

Examples include permission changes, financial writes, enrollment lifecycle changes and installer completion.

For these high-integrity actions, inability to persist the required audit event should fail the operation rather than silently commit an unaudited change.

Security-relevant failures such as denied logins occur outside a successful business transaction; they still need reliable best-effort/required persistence according to the auth threat model.

## Metadata

Metadata is structured, allow-listed context. Good examples:

- changed field names;
- old/new status codes;
- count of affected records;
- scope/branch/class IDs;
- reason code supplied for an administrative correction;
- provider correlation ID when relevant and safe.

Avoid dumping arbitrary request/response bodies.

## Sensitive data prohibition

Never store in audit metadata/messages:

- passwords or password hashes;
- session/access/refresh/reset tokens;
- payment card/bank credentials;
- private encryption keys;
- database connection strings;
- raw authentication headers/cookies;
- full private document contents;
- unnecessary medical/safeguarding/student sensitive text.

If an investigation needs sensitive field-change evidence, store minimal redacted/typed facts such as `field: "dateOfBirth", changed: true` rather than the old/new value by default.

## Network/device context

For security-sensitive requests, the server may persist normalized source IP and user-agent/device context subject to privacy/retention policy.

Proxy-derived client IP is trusted only according to explicit reverse-proxy configuration; do not blindly record arbitrary forwarded headers as authoritative client identity.

## Reason capture

Certain destructive/exceptional actions may require a human reason, for example fee adjustments, attendance corrections, permission overrides or deletion workflows.

A required reason is validated by the business operation and recorded in the audit event. It is not a substitute for structured action/resource fields.

## Authorization to read audit data

Audit data is sensitive operational/security data.

- read access requires explicit permissions/scopes;
- institution/branch boundaries apply;
- low-privilege users cannot browse other users' security history by default;
- exports use the same authorization and job/storage contracts as other sensitive reports;
- audit readers must not gain access to secrets that were correctly excluded at write time.

## Search/filtering

Audit list APIs follow M0-071 with stable cursor pagination and allow-listed filters such as time range, actor, action prefix, resource type/ID, branch and outcome.

Free-text search over arbitrary metadata is not required and should not be enabled if it undermines privacy/indexability.

## Retention

Retention is configurable/policy-driven and must account for school/legal requirements. The initial product should choose conservative defaults only after jurisdictions/product scope are better defined.

A retention policy must distinguish audit records from ephemeral application logs. Deleting ordinary logs must not accidentally delete required audit history.

## Audit vs logs vs notifications

- **audit events:** durable protected-action history;
- **application logs:** diagnostic/operational telemetry;
- **notifications:** messages/delivery to recipients.

They may reference the same request/business event but must remain distinct data models and access policies.

## Bulk operations

A bulk action records a parent operation event with query/selection scope and outcome. Per-record child events are required when individual entity histories need independently reviewable changes; large operations may use a correlation/batch ID to keep those records connected.

## Installer/system events

Installer transitions, backup/restore, upgrades, key configuration changes and administrator bootstrap are high-value audit events even when no normal authenticated user session exists.

## Acceptance

M0-078 is complete as a contract task because event identity, actor/action/resource semantics, append-only rules, transaction requirements, correlation, sensitive-data controls and access/retention boundaries are now explicit. Persistence/UI implementation remains M1-080/M1-081 and later module-specific audit work.