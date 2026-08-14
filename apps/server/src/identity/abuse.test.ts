import { describe, expect, it } from 'vitest';

import {
  AuthenticationAbuseService,
  PasswordResetAbuseService,
  equalizeMinimumResponseTime,
  securityCounterKey,
  type SecurityCounterSnapshot,
  type SecurityCounterStore,
} from './abuse.js';

class MemoryCounters implements SecurityCounterStore {
  private readonly values = new Map<string, SecurityCounterSnapshot>();
  public async get(key: string, now: string): Promise<SecurityCounterSnapshot | null> {
    const current = this.values.get(key);
    if (current === undefined || Date.parse(current.expiresAt) <= Date.parse(now)) return null;
    return current;
  }
  public async hit(key: string, now: string, windowMs: number): Promise<SecurityCounterSnapshot> {
    const current = await this.get(key, now);
    const next = {
      key,
      count: (current?.count ?? 0) + 1,
      windowStartedAt: current?.windowStartedAt ?? now,
      expiresAt: current?.expiresAt ?? new Date(Date.parse(now) + windowMs).toISOString(),
    };
    this.values.set(key, next);
    return next;
  }
  public async clear(key: string): Promise<void> { this.values.delete(key); }
}

const SECRET = 'test-abuse-secret-that-is-longer-than-32-characters';

describe('authentication and recovery abuse controls', () => {
  it('stores HMAC counter keys instead of raw login/source values', () => {
    const key = securityCounterKey('auth.source-failure', '203.0.113.7', SECRET);
    expect(key).not.toContain('203.0.113.7');
    expect(key).toHaveLength(43);
  });

  it('blocks source-level login spray independently of account throttling', async () => {
    const service = new AuthenticationAbuseService(new MemoryCounters(), SECRET, {
      sourceFailureLimit: 2, sourceWindowMs: 60_000,
    });
    const now = new Date('2026-08-15T00:00:00.000Z');
    await service.recordLoginFailure('203.0.113.7', now);
    await expect(service.recordLoginFailure('203.0.113.7', new Date(now.getTime() + 1_000)))
      .rejects.toMatchObject({ code: 'LOGIN_SOURCE_THROTTLED', statusCode: 429 });
    await expect(service.assertLoginAllowed('203.0.113.7', new Date(now.getTime() + 2_000)))
      .rejects.toMatchObject({ code: 'LOGIN_SOURCE_THROTTLED', statusCode: 429 });
  });

  it('silently suppresses repeated account reset delivery but explicitly limits source floods', async () => {
    const service = new PasswordResetAbuseService(new MemoryCounters(), SECRET, {
      sourceRequestLimit: 2, sourceRequestWindowMs: 60_000,
      accountRequestLimit: 1, accountRequestWindowMs: 60_000,
      sourceResetFailureLimit: 2, sourceResetFailureWindowMs: 60_000,
    });
    const now = new Date('2026-08-15T00:00:00.000Z');
    expect((await service.assessResetRequest('Admin@School.test', '203.0.113.8', now)).allowDelivery).toBe(true);
    expect((await service.assessResetRequest(' admin@school.TEST ', '203.0.113.8', new Date(now.getTime() + 1_000))).allowDelivery).toBe(false);
    await expect(service.assessResetRequest('other@school.test', '203.0.113.8', new Date(now.getTime() + 2_000)))
      .rejects.toMatchObject({ code: 'PASSWORD_RESET_THROTTLED', statusCode: 429 });
  });

  it('pads fast recovery responses to a bounded minimum duration', async () => {
    let clock = 1_000;
    let slept = 0;
    await equalizeMinimumResponseTime(900, {
      minimumMs: 350,
      nowMs: () => clock,
      sleep: async (milliseconds) => { slept = milliseconds; clock += milliseconds; },
    });
    expect(slept).toBe(250);
  });
});
