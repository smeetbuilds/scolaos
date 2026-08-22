import { describe, expect, it } from 'vitest';

import { LoginThrottleService, loginThrottleKey } from './throttle.js';
import type { LoginThrottleFailureInput, LoginThrottleState, LoginThrottleStore } from './types.js';

const SECRET = 'test-throttle-secret-that-is-longer-than-thirty-two-characters';

function storeWithCapture(captured: LoginThrottleFailureInput[]): LoginThrottleStore {
  return {
    get: async () => null,
    recordFailure: async (input) => {
      captured.push(input);
      return {
        key: input.key,
        failures: 1,
        firstFailedAt: input.occurredAt,
        lastFailedAt: input.occurredAt,
      } satisfies LoginThrottleState;
    },
    clear: async () => undefined,
  };
}

describe('login throttle service', () => {
  it('delegates each failed login to one atomic store operation', async () => {
    const captured: LoginThrottleFailureInput[] = [];
    const service = new LoginThrottleService(storeWithCapture(captured), SECRET);
    const now = new Date('2026-08-22T00:00:00.000Z');

    await service.recordFailure(' Admin@School.TEST ', now);

    expect(captured).toEqual([
      {
        key: loginThrottleKey('admin@school.test', SECRET),
        occurredAt: now.toISOString(),
        windowMs: 15 * 60 * 1000,
        failureLimit: 10,
        blockMs: 15 * 60 * 1000,
      },
    ]);
  });
});
