import { createHmac } from 'node:crypto';

import { ScolaApiError } from '../errors.js';
import { normalizeLoginIdentifier } from './throttle.js';

export interface SecurityCounterSnapshot {
  readonly key: string;
  readonly count: number;
  readonly windowStartedAt: string;
  readonly expiresAt: string;
}

export interface SecurityCounterStore {
  /** Return the current unexpired counter, or null when absent/expired. */
  get(key: string, now: string): Promise<SecurityCounterSnapshot | null>;
  /** Atomically increment an unexpired fixed-window counter, resetting it when expired. */
  hit(key: string, now: string, windowMs: number): Promise<SecurityCounterSnapshot>;
  clear(key: string): Promise<void>;
}

export interface AuthenticationAbusePolicy {
  readonly sourceFailureLimit: number;
  readonly sourceWindowMs: number;
}

export interface PasswordResetAbusePolicy {
  readonly sourceRequestLimit: number;
  readonly sourceRequestWindowMs: number;
  readonly accountRequestLimit: number;
  readonly accountRequestWindowMs: number;
  readonly sourceResetFailureLimit: number;
  readonly sourceResetFailureWindowMs: number;
}

const DEFAULT_AUTH_POLICY: AuthenticationAbusePolicy = {
  sourceFailureLimit: 50,
  sourceWindowMs: 15 * 60 * 1000,
};

const DEFAULT_RESET_POLICY: PasswordResetAbusePolicy = {
  sourceRequestLimit: 20,
  sourceRequestWindowMs: 15 * 60 * 1000,
  accountRequestLimit: 5,
  accountRequestWindowMs: 60 * 60 * 1000,
  sourceResetFailureLimit: 20,
  sourceResetFailureWindowMs: 15 * 60 * 1000,
};

function requireSecret(secret: string): void {
  if (secret.length < 32) throw new Error('Security abuse-counter secret must contain at least 32 characters.');
}

function requirePositiveInteger(value: number, field: string): void {
  if (!Number.isSafeInteger(value) || value < 1) throw new Error(`${field} must be a positive integer.`);
}

function normalizeSourceAddress(value: string | undefined): string | undefined {
  const normalized = value?.trim();
  if (!normalized) return undefined;
  if (normalized.length > 128 || /[\r\n\0]/.test(normalized)) {
    throw new ScolaApiError('REQUEST_CONTEXT_INVALID', 'Request security context is invalid.', 400);
  }
  return normalized.toLowerCase();
}

export function securityCounterKey(namespace: string, value: string, secret: string): string {
  requireSecret(secret);
  if (!/^[a-z][a-z0-9.-]{2,63}$/.test(namespace)) throw new Error('Security counter namespace is invalid.');
  return createHmac('sha256', secret)
    .update(`security-counter:v1:${namespace}:${value}`, 'utf8')
    .digest('base64url');
}

export class AuthenticationAbuseService {
  private readonly policy: AuthenticationAbusePolicy;

  public constructor(
    private readonly store: SecurityCounterStore,
    private readonly keySecret: string,
    policy: Partial<AuthenticationAbusePolicy> = {},
  ) {
    requireSecret(keySecret);
    this.policy = { ...DEFAULT_AUTH_POLICY, ...policy };
    requirePositiveInteger(this.policy.sourceFailureLimit, 'sourceFailureLimit');
    requirePositiveInteger(this.policy.sourceWindowMs, 'sourceWindowMs');
  }

  private sourceKey(sourceAddress: string | undefined): string | undefined {
    const source = normalizeSourceAddress(sourceAddress);
    return source === undefined ? undefined : securityCounterKey('auth.source-failure', source, this.keySecret);
  }

  public async assertLoginAllowed(sourceAddress: string | undefined, now = new Date()): Promise<void> {
    const key = this.sourceKey(sourceAddress);
    if (key === undefined) return;
    const snapshot = await this.store.get(key, now.toISOString());
    if (snapshot !== null && snapshot.count >= this.policy.sourceFailureLimit) {
      throw new ScolaApiError(
        'LOGIN_SOURCE_THROTTLED',
        'Too many unsuccessful sign-in attempts. Try again later.',
        429,
      );
    }
  }

  public async recordLoginFailure(sourceAddress: string | undefined, now = new Date()): Promise<void> {
    const key = this.sourceKey(sourceAddress);
    if (key === undefined) return;
    const snapshot = await this.store.hit(key, now.toISOString(), this.policy.sourceWindowMs);
    if (snapshot.count >= this.policy.sourceFailureLimit) {
      throw new ScolaApiError(
        'LOGIN_SOURCE_THROTTLED',
        'Too many unsuccessful sign-in attempts. Try again later.',
        429,
      );
    }
  }
}

export interface PasswordResetRequestAbuseDecision {
  readonly allowDelivery: boolean;
}

export class PasswordResetAbuseService {
  private readonly policy: PasswordResetAbusePolicy;

  public constructor(
    private readonly store: SecurityCounterStore,
    private readonly keySecret: string,
    policy: Partial<PasswordResetAbusePolicy> = {},
  ) {
    requireSecret(keySecret);
    this.policy = { ...DEFAULT_RESET_POLICY, ...policy };
    requirePositiveInteger(this.policy.sourceRequestLimit, 'sourceRequestLimit');
    requirePositiveInteger(this.policy.sourceRequestWindowMs, 'sourceRequestWindowMs');
    requirePositiveInteger(this.policy.accountRequestLimit, 'accountRequestLimit');
    requirePositiveInteger(this.policy.accountRequestWindowMs, 'accountRequestWindowMs');
    requirePositiveInteger(this.policy.sourceResetFailureLimit, 'sourceResetFailureLimit');
    requirePositiveInteger(this.policy.sourceResetFailureWindowMs, 'sourceResetFailureWindowMs');
  }

  private key(namespace: string, value: string): string {
    return securityCounterKey(namespace, value, this.keySecret);
  }

  public async assessResetRequest(
    login: string,
    sourceAddress: string | undefined,
    now = new Date(),
  ): Promise<PasswordResetRequestAbuseDecision> {
    const normalizedLogin = normalizeLoginIdentifier(login);
    const nowIso = now.toISOString();
    const source = normalizeSourceAddress(sourceAddress);
    if (source !== undefined) {
      const sourceHit = await this.store.hit(
        this.key('reset.request-source', source),
        nowIso,
        this.policy.sourceRequestWindowMs,
      );
      if (sourceHit.count > this.policy.sourceRequestLimit) {
        throw new ScolaApiError(
          'PASSWORD_RESET_THROTTLED',
          'Too many password reset requests. Try again later.',
          429,
        );
      }
    }

    const accountHit = await this.store.hit(
      this.key('reset.request-account', normalizedLogin),
      nowIso,
      this.policy.accountRequestWindowMs,
    );
    return { allowDelivery: accountHit.count <= this.policy.accountRequestLimit };
  }

  public async assertResetAttemptAllowed(
    sourceAddress: string | undefined,
    now = new Date(),
  ): Promise<void> {
    const source = normalizeSourceAddress(sourceAddress);
    if (source === undefined) return;
    const snapshot = await this.store.get(
      this.key('reset.invalid-source', source),
      now.toISOString(),
    );
    if (snapshot !== null && snapshot.count >= this.policy.sourceResetFailureLimit) {
      throw new ScolaApiError(
        'PASSWORD_RESET_THROTTLED',
        'Too many password reset attempts. Try again later.',
        429,
      );
    }
  }

  public async recordInvalidResetAttempt(
    sourceAddress: string | undefined,
    now = new Date(),
  ): Promise<void> {
    const source = normalizeSourceAddress(sourceAddress);
    if (source === undefined) return;
    const hit = await this.store.hit(
      this.key('reset.invalid-source', source),
      now.toISOString(),
      this.policy.sourceResetFailureWindowMs,
    );
    if (hit.count >= this.policy.sourceResetFailureLimit) {
      throw new ScolaApiError(
        'PASSWORD_RESET_THROTTLED',
        'Too many password reset attempts. Try again later.',
        429,
      );
    }
  }

  public async clearInvalidResetAttempts(sourceAddress: string | undefined): Promise<void> {
    const source = normalizeSourceAddress(sourceAddress);
    if (source === undefined) return;
    await this.store.clear(this.key('reset.invalid-source', source));
  }
}

export interface MinimumResponseTimingOptions {
  readonly minimumMs?: number;
  readonly nowMs?: () => number;
  readonly sleep?: (milliseconds: number) => Promise<void>;
}

export async function equalizeMinimumResponseTime(
  startedAtMs: number,
  options: MinimumResponseTimingOptions = {},
): Promise<void> {
  const minimumMs = options.minimumMs ?? 350;
  requirePositiveInteger(minimumMs, 'minimumMs');
  if (minimumMs > 2_000) throw new Error('minimumMs must not exceed 2000 milliseconds.');
  const nowMs = options.nowMs ?? Date.now;
  const sleep = options.sleep ?? ((milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds)));
  const remaining = minimumMs - Math.max(0, nowMs() - startedAtMs);
  if (remaining > 0) await sleep(remaining);
}
