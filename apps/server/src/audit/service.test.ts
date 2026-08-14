import { describe, expect, it } from 'vitest';

import { AuditService } from './index.js';

describe('audit service', () => {
  it('assigns trusted event identity/time and appends required events', async () => {
    const events: unknown[] = [];
    const service = new AuditService(
      {
        append: async (event) => {
          events.push(event);
        },
      },
      { now: () => new Date('2026-08-14T10:00:00.000Z'), newId: () => 'event-1' },
    );

    const event = await service.recordRequired({
      actor: { type: 'user', userId: 'user-1' },
      action: 'auth.password.reset',
      outcome: 'success',
      source: 'api',
      requestId: 'request-1',
      metadata: { method: 'email', sessionsRevoked: 3 },
    });

    expect(event.id).toBe('event-1');
    expect(event.occurredAt).toBe('2026-08-14T10:00:00.000Z');
    expect(events).toHaveLength(1);
  });

  it('rejects durable secret-like metadata and invalid action names', () => {
    const service = new AuditService({ append: async () => undefined });

    expect(() =>
      service.build({
        actor: { type: 'system', name: 'auth' },
        action: 'auth.login.failed',
        outcome: 'failure',
        source: 'system',
        metadata: { accessToken: 'must-not-be-stored' },
      }),
    ).toThrow('Audit metadata key accessToken is prohibited.');

    expect(() =>
      service.build({
        actor: { type: 'system', name: 'auth' },
        action: 'invalid action',
        outcome: 'failure',
        source: 'system',
      }),
    ).toThrow('Audit action must be lowercase dot-separated semantics.');
  });

  it('surfaces required persistence failures but isolates best-effort failures', async () => {
    let bestEffortObserved = false;
    const service = new AuditService(
      {
        append: async () => {
          throw new Error('audit store unavailable');
        },
      },
      { onBestEffortFailure: () => { bestEffortObserved = true; } },
    );
    const draft = {
      actor: { type: 'system' as const, name: 'auth' },
      action: 'auth.login.failed',
      outcome: 'failure' as const,
      source: 'system' as const,
    };

    await expect(service.recordRequired(draft)).rejects.toThrow('audit store unavailable');
    await expect(service.recordBestEffort(draft)).resolves.toMatchObject({ action: 'auth.login.failed' });
    expect(bestEffortObserved).toBe(true);
  });
});
