# Notification Event and Channel Contract

**Task:** M0-075  
**Status:** ACCEPTED  
**Effective:** 13 August 2026  
**Related:** M0-073, M0-076, M0-078

## Purpose

Separate business events, recipient resolution, message rendering and delivery providers so email/push/SMS/in-app behavior can evolve without school modules calling providers directly.

## Pipeline

```text
domain/application event
        |
        v
notification intent
        |
        v
recipient resolution + policy
        |
        v
channel rendering
        |
        v
delivery job/provider
```

A module emits semantic intent; it does not construct provider-specific payloads or loop through email addresses itself.

## Notification intent

Conceptual shape:

```ts
interface NotificationIntent {
  id: string;
  type: string;
  occurredAt: string;
  institutionId: string;
  actorId?: string;
  subject: { type: string; id: string };
  audience: AudienceSelector;
  templateKey: string;
  variables: Record<string, unknown>;
  channels: NotificationChannel[];
  priority: 'low' | 'normal' | 'high' | 'urgent';
  dedupeKey?: string;
  expiresAt?: string;
}
```

The durable form may differ, but these semantics must be preserved.

## Stable identifiers

- `type` names the business reason, for example `attendance.absence.recorded` or `fees.payment.received`.
- `templateKey` selects channel-specific rendering owned by the notification system.
- `subject` provides the primary business entity for traceability/deep links.
- `dedupeKey` prevents duplicate delivery for an idempotent business occurrence.

Event/type names use lowercase dot-separated namespaces and must describe meaning, not provider action such as `send_email`.

## Audience resolution

Audience selectors express intent such as:

- explicit user IDs;
- guardian(s) of student;
- staff with a permission/scope;
- members of class/section/branch;
- actor themselves.

The server resolves actual recipients using current authorized relationships. Privileged broadcast endpoints must not trust a browser-supplied list of arbitrary email/phone addresses as proof of membership.

Recipient resolution must deduplicate the same person/device/channel where appropriate.

## Channels

Core channel identifiers:

- `in_app`
- `email`
- `push`

Optional adapters may later add `sms`, `whatsapp` or other channels without making them mandatory infrastructure.

A business event may target more than one channel, but each channel has an independent delivery state.

## Templates

Business modules provide structured variables, not arbitrary HTML/provider templates.

Rendering rules:

- templates are channel-specific;
- variables are validated before rendering;
- HTML/email escaping is context-correct;
- push/SMS length constraints are handled by their renderer;
- sensitive information is minimized per channel;
- a notification may deep-link to an authorized app route but the link itself grants no access.

## Preferences and mandatory messages

Users may configure optional communication preferences where product requirements permit it.

Some classes may be mandatory despite preferences, such as security events, critical account changes or legally/operationally required school notices. Mandatory status must be defined by event policy, not chosen ad hoc by a provider adapter.

Quiet-hours behavior, if introduced, is policy-driven and must never silently delay an explicitly urgent safety/security event.

## Delivery lifecycle

Channel delivery states use explicit semantics such as:

- `queued`
- `processing`
- `accepted` — provider accepted responsibility;
- `delivered` — only when the provider/channel gives credible delivery evidence;
- `failed`
- `suppressed`
- `cancelled`

Do not label an email/push as `delivered` merely because an API call returned success.

## Reliability

Notification delivery is at-least-once unless a future provider proves stronger semantics. Therefore:

- intent creation and delivery processing must be idempotent;
- provider calls use stable dedupe/idempotency keys where supported;
- retries classify transient vs permanent failures;
- duplicate jobs must not create duplicate in-app rows or repeated provider sends when the system can detect the same business intent;
- terminal failures remain inspectable/retryable according to policy.

M0-076 defines the common job semantics used for asynchronous delivery.

## Transaction boundary

For notifications caused by a committed business change, do not send the provider message before the business transaction is durable.

Preferred pattern: transactionally persist the business change plus an outbox/intent record, then process delivery asynchronously. A rollback must not leave a “successful” notification for an operation that never committed.

## In-app notifications

In-app notifications are durable application records with read/unread state. They are not reconstructed from email logs.

The user can only read notifications addressed to an authorized identity. Read state changes are idempotent.

## Push registration

Device push-token lifecycle is platform plumbing owned through M0-073 plus the notification module.

- tokens are sensitive device identifiers;
- invalid/rotated tokens are deactivated;
- logout/session changes follow the auth/device policy;
- one user may have multiple devices;
- provider-specific token formats do not leak into business modules.

## Privacy and security

Never place passwords, reset secrets, access tokens, full sensitive student records, payment credentials or private document bodies in notification logs/event metadata.

Provider payloads contain only what is necessary for the chosen channel. Lock-screen push content should be more conservative than an authenticated in-app view.

## Observability

Record intent ID, delivery ID, channel, recipient identity reference, state, attempt count, provider correlation ID where safe, timestamps and normalized failure category.

Provider response bodies are not dumped wholesale into normal logs.

## Audit separation

Notifications answer “what message was attempted/sent to whom.” Audit events answer “who performed/caused what protected action.” Important operations may generate both, but neither substitutes for the other.

## Acceptance

M0-075 is complete as an interface/policy task because semantic events, audience resolution, templates, channel lifecycle, idempotency, transaction boundaries and privacy rules are now locked. Concrete email/push/SMS provider implementations remain later tasks.