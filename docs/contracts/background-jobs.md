# Background Job Contract

**Task:** M0-076  
**Status:** ACCEPTED  
**Effective:** 13 August 2026  
**Related:** ADR-011, ADR-012, M0-075, M0-078

## Purpose

Define one durable asynchronous-work contract for reports, imports, notification delivery, exports, maintenance and other tasks without making Redis/RabbitMQ mandatory for default self-hosting.

ADR-012 currently proposes PostgreSQL-backed execution, but this contract is intentionally queue-implementation independent.

## Job record semantics

Conceptual shape:

```ts
interface BackgroundJob<TPayload = unknown> {
  id: string;
  type: string;
  payloadVersion: number;
  payload: TPayload;
  institutionId?: string;
  actorId?: string;
  requestId?: string;
  dedupeKey?: string;
  priority: number;
  state: JobState;
  attempts: number;
  maxAttempts: number;
  availableAt: string;
  createdAt: string;
}
```

The persistence model may differ, but these semantics must remain observable.

## Job types

Job type identifiers use stable lowercase dot-separated names, for example:

- `notifications.deliver`
- `students.import`
- `reports.generate`
- `storage.cleanup`

A type identifies business/technical work, not a worker process name.

## State model

Baseline states:

- `queued`
- `running`
- `succeeded`
- `failed` — retryable or awaiting retry according to failure classification;
- `dead` — terminal after retry/policy exhaustion;
- `cancelled`

Implementation-specific lock/lease columns are internal and must not create ambiguous user-facing states.

## Delivery guarantee

Assume **at-least-once execution**.

Workers may crash after performing a side effect but before acknowledging completion. Every job handler must therefore be idempotent or use an idempotency mechanism around externally visible effects.

Do not design handlers that are only correct under exactly-once delivery.

## Dedupe and idempotency

- `dedupeKey` is optional because not all jobs represent the same idempotency scope.
- When used, its scope must include enough context (job type/institution/business occurrence) to avoid suppressing unrelated work.
- External provider calls use provider idempotency keys where available.
- Database mutations should use unique constraints/state transitions/transactional guards where appropriate.
- A retry must not duplicate payments, notifications, enrollment changes or exported artifacts unintentionally.

## Claiming and leases

A worker claims work for a bounded lease. Other workers must not concurrently execute the same live lease.

If a worker dies, expired work becomes eligible for safe retry.

The PostgreSQL implementation may use row locking/skip-locked patterns, but the contract is about observable lease semantics, not a mandated SQL statement.

Long-running jobs should renew/heartbeat their lease if they can exceed the normal claim window.

## Retry policy

Failures are classified:

- transient — retry with bounded backoff/jitter;
- permanent/input — do not retry automatically;
- authorization/policy — normally terminal until explicitly re-enqueued after policy change;
- dependency unavailable — retry according to dependency-specific limits;
- unknown — bounded retry, then dead-letter visibility.

Retry count and next availability are observable to operations tooling.

No infinite automatic retries.

## Transaction boundaries and outbox

When a business transaction requires follow-up work, enqueue the job/outbox entry in the same durable transaction whenever possible.

This prevents:

- committed business change with missing follow-up job;
- job execution for a business change that later rolled back.

Workers should keep database transactions short and must not hold a transaction open while waiting on slow external networks unless explicitly justified.

## Payload discipline

Job payloads contain stable IDs and minimal immutable execution parameters.

Do not persist:

- plaintext passwords;
- access/refresh tokens unless an explicitly encrypted credential design requires it;
- raw payment credentials;
- giant binary documents;
- whole database entities merely for convenience.

Large inputs belong in authorized storage and are referenced by object/document IDs.

## Payload versioning

Every durable job type has a `payloadVersion` once its payload can survive deploys/restarts.

Workers must either:

- handle all queued supported payload versions; or
- migrate/transform queued payloads safely during an upgrade.

A deployment must not strand old queued jobs because code only understands the newest payload shape.

## Authorization context

A user-triggered job records the initiating actor and relevant institution/scope for auditability, but a stored `actorId` is not a permanent authorization grant.

For delayed privileged effects, the handler must follow the operation's policy: either re-check current authorization at execution time or execute an immutable already-authorized transaction intent whose semantics were finalized at enqueue time.

That choice must be explicit per job type.

## Scheduling

Recurring schedules create normal job occurrences with unique IDs. Schedule definitions and executions are separate records/concepts.

Time-based jobs use UTC instants internally and resolve institution timezone rules at scheduling boundaries.

Missed schedules after downtime must have explicit catch-up policy rather than accidentally flooding the queue.

## Cancellation

Cancellation is cooperative:

- queued jobs can usually transition directly to `cancelled`;
- running handlers check cancellation at safe interruption points when work is interruptible;
- cancellation does not magically roll back already committed external side effects.

## Progress

Long user-visible jobs may expose normalized progress (`current`, `total`, phase/message) but progress is advisory and must not become the integrity source of truth.

## Concurrency

Job types may define concurrency keys, for example institution/export/student-import scope, to prevent conflicting simultaneous work.

Global serialization should be avoided unless required for correctness.

## Observability

Operations tooling must be able to inspect:

- job ID/type/state;
- institution/actor reference when applicable;
- created/available/start/finish timestamps;
- attempts/max attempts;
- normalized last-error code/message;
- request/trace correlation;
- worker/lease diagnostics when safe.

Secrets and full provider payloads are excluded from logs.

## Dead jobs

Terminal failures remain visible until an explicit retention policy removes them. Admin retry creates a controlled retry/requeue action and must not silently erase failure history.

## Shutdown

Workers stop claiming new jobs during graceful shutdown, finish or safely release current claims, and avoid extending leases beyond their ability to continue processing.

## Default infrastructure constraint

The initial implementation must work with the default app + PostgreSQL deployment. Adding a mandatory Redis/RabbitMQ/Kafka dependency requires a new architecture decision backed by measured need.

## Acceptance

M0-076 is complete as a contract task because job identity, states, at-least-once semantics, leases, retries, idempotency, payload versioning, authorization context and observability are now fixed. M0-031/M0-039 and later implementation tasks still need to prove the actual PostgreSQL-backed queue.