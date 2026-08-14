# Background Job Handler Guidelines

**Task:** M6-015  
**Status:** ACCEPTED contributor guidance  
**Last reviewed:** 14 August 2026  
**Source contract:** `docs/contracts/background-jobs.md`

The background-job system assumes **at-least-once execution**. A worker may complete a side effect and crash before acknowledging it, or an expired lease may cause a retry. Therefore every durable handler must be safe when executed more than once.

This document is implementation guidance; it does not claim the PostgreSQL queue itself is built.

## Handler checklist

Before implementing a handler, define:

- stable job type;
- payload version;
- owning module;
- institution/actor/request context when relevant;
- idempotency scope;
- dedupe strategy if enqueue duplication is possible;
- retryable vs permanent failures;
- max attempts/backoff policy;
- transaction boundary;
- external side effects;
- audit requirements;
- cancellation behavior;
- observability fields;
- compatibility strategy for already-queued older payload versions.

## Database-only effects

Prefer database-enforced idempotency where possible:

- unique constraints for one-per-business-event records;
- state-transition guards (`pending` → `completed` once);
- compare/update predicates;
- a processed occurrence/idempotency table when the business model needs one;
- one transaction for the guard and protected mutation.

Do not implement `if not exists then insert` as two unprotected operations when concurrent workers can race.

## Business transaction + follow-up work

When a successful business transaction requires asynchronous work, persist the job/outbox intent in the same transaction whenever possible.

Bad sequence:

```text
commit payment
process crashes
enqueue receipt email never happens
```

Also bad:

```text
enqueue receipt email
payment transaction rolls back
email still executes
```

The durable intent and the business state should become visible atomically when they form one business operation.

## External providers

For email, storage, payment or other network providers:

- use a provider idempotency key when supported;
- persist the provider correlation/reference when safe;
- design the local state transition so a retry can determine whether the side effect already succeeded;
- never assume a network timeout means the provider did nothing;
- never retry permanent provider/input failures indefinitely.

A handler must not create duplicate payments, messages, documents or externally visible actions merely because delivery is at least once.

## Dedupe keys

A `dedupeKey` prevents duplicate queued occurrences only within a clearly defined scope. It is not a replacement for idempotent execution.

Include enough context to distinguish legitimate events, for example:

```text
notifications.deliver:<institutionId>:<notificationIntentId>
reports.generate:<institutionId>:<reportRequestId>
```

Do not use a broad key such as `send-email` that can suppress unrelated work.

## Retries

Classify failures explicitly:

- transient dependency failure → bounded retry with backoff/jitter;
- dependency unavailable → retry according to provider policy;
- invalid payload/permanent input → terminal;
- authorization/policy failure → normally terminal until explicitly requeued after policy change;
- unknown failure → bounded retry, then dead state.

No infinite retries.

A retry must start from durable state, not assumptions left in worker memory.

## Leases and heartbeats

Workers claim jobs for a bounded lease. Long handlers renew their lease/heartbeat before expiry. A worker that cannot complete safely must allow or explicitly release the lease according to the queue implementation.

Never keep a database transaction open just to preserve a worker lease while waiting on slow external I/O.

## Payloads

Durable payloads contain stable IDs and minimal immutable execution parameters.

Do not put plaintext credentials, passwords, raw auth/session/reset tokens, payment credentials, large binaries, or entire mutable database records into a job payload.

Large inputs belong in authorized storage and are referenced by ID.

## Payload versioning

A job type that can survive a deploy/restart has an explicit `payloadVersion`.

A release must either:

- continue to understand supported queued versions; or
- migrate them safely before old handlers are removed.

Never deploy code that silently strands durable queued work because only the newest payload shape can be decoded.

## Authorization

A stored `actorId` is audit context, not a permanent permission grant.

For each privileged delayed action, choose explicitly between:

- re-checking current authorization at execution time; or
- executing a durable immutable intent whose authorization/business semantics were finalized transactionally at enqueue time.

Do not accidentally mix these models.

## Audit and logs

Record durable audit events for protected effects according to the audit contract. Logs provide operational diagnostics; they do not replace audit history.

Never log job payload secrets or raw provider credentials/responses containing sensitive data.

## Cancellation

Cancellation is cooperative. A cancelled job cannot roll back an external side effect that already completed. Check cancellation only at safe interruption points and make partial-state behavior explicit.

## Testing requirements

Every critical handler should test at least:

1. normal execution;
2. the same occurrence executed twice;
3. concurrent/duplicate claim protection where relevant;
4. failure after the local mutation but before acknowledgement;
5. external timeout/ambiguous provider outcome;
6. retry exhaustion/dead state;
7. old supported payload version;
8. invalid/permanent payload;
9. authorization semantics if privileged;
10. absence of duplicate externally visible effects.

A handler that only passes a single happy-path test does not satisfy the at-least-once contract.
