import { createHmac } from 'node:crypto';

import { ScolaApiError } from '../errors.js';
import type { LoginThrottleStore } from './types.js';

const WINDOW_MS = 15 * 60 * 1000;
const BLOCK_MS = 15 * 60 * 1000;
const FAILURE_LIMIT = 10;

function nowMs(value: string): number {
  return new Date(value).getTime();
}

export function normalizeLoginIdentifier(login: string): string {
  return login.trim().normalize('NFKC').toLowerCase();
}

export function loginThrottleKey(login: string, secret: string): string {
  return createHmac('sha256', secret)
    .update(normalizeLoginIdentifier(login), 'utf8')
    .digest('base64url');
}

export class LoginThrottleService {
  public constructor(
    private readonly store: LoginThrottleStore,
    private readonly keySecret: string,
  ) {
    if (keySecret.length < 32) {
      throw new Error('Login throttle key secret must contain at least 32 characters.');
    }
  }

  public async assertAllowed(login: string, now = new Date()): Promise<void> {
    const key = loginThrottleKey(login, this.keySecret);
    const state = await this.store.get(key);
    if (state?.blockedUntil !== undefined && nowMs(state.blockedUntil) > now.getTime()) {
      throw new ScolaApiError(
        'LOGIN_THROTTLED',
        'Too many unsuccessful sign-in attempts. Try again later.',
        429,
      );
    }
  }

  public async recordFailure(login: string, now = new Date()): Promise<void> {
    const key = loginThrottleKey(login, this.keySecret);
    const existing = await this.store.get(key);
    const nowIso = now.toISOString();
    const insideWindow =
      existing !== null && now.getTime() - nowMs(existing.firstFailedAt) <= WINDOW_MS;
    const failures = insideWindow ? existing.failures + 1 : 1;
    const firstFailedAt = insideWindow ? existing.firstFailedAt : nowIso;
    const blockedUntil =
      failures >= FAILURE_LIMIT ? new Date(now.getTime() + BLOCK_MS).toISOString() : undefined;

    await this.store.put({
      key,
      failures,
      firstFailedAt,
      lastFailedAt: nowIso,
      ...(blockedUntil === undefined ? {} : { blockedUntil }),
    });
  }

  public async recordSuccess(login: string): Promise<void> {
    await this.store.clear(loginThrottleKey(login, this.keySecret));
  }
}
