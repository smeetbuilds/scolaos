import { createHash, randomBytes, randomUUID } from 'node:crypto';

import { ScolaApiError } from '../errors.js';
import {
  equalizeMinimumResponseTime,
  type MinimumResponseTimingOptions,
  type PasswordResetAbuseService,
} from './abuse.js';
import { hashPassword } from './password.js';
import { normalizeLoginIdentifier } from './throttle.js';

const RESET_TOKEN_PREFIX = 'rst1_';
const RESET_TOKEN_PATTERN = /^rst1_[A-Za-z0-9_-]{43}$/;
const RESET_TOKEN_TTL_MS = 30 * 60 * 1000;
const GENERIC_ACCEPTED_MESSAGE =
  'If an eligible account matches that sign-in identifier, password reset instructions will be sent.';

export interface PasswordResetAccount {
  readonly userId: string;
  readonly normalizedLogin: string;
  readonly deliveryAddress: string;
  readonly enabled: boolean;
}

export interface PasswordResetChallenge {
  readonly id: string;
  readonly userId: string;
  readonly tokenHash: string;
  readonly createdAt: string;
  readonly expiresAt: string;
}

export interface PasswordResetCommitInput {
  readonly tokenHash: string;
  readonly passwordHash: string;
  readonly consumedAt: string;
}

export interface PasswordResetStore {
  findAccountByLogin(normalizedLogin: string): Promise<PasswordResetAccount | null>;
  invalidateOutstandingForUser(userId: string, invalidatedAt: string): Promise<void>;
  createChallenge(challenge: PasswordResetChallenge): Promise<void>;
  /** Cheap non-consuming preflight used to avoid password-hash CPU work for invalid tokens. */
  isChallengeActive(tokenHash: string, at: string): Promise<boolean>;
  /**
   * Must atomically verify an unused/unexpired challenge, consume it, replace the password,
   * invalidate outstanding reset challenges for the account, and revoke all active sessions.
   * Returns the affected userId or null when the challenge is invalid/expired/already consumed.
   */
  consumeAndReplacePassword(input: PasswordResetCommitInput): Promise<string | null>;
}

export interface PasswordResetDelivery {
  enqueue(input: {
    readonly userId: string;
    readonly destination: string;
    readonly token: string;
    readonly expiresAt: string;
  }): Promise<void>;
}

export interface PasswordResetServiceOptions {
  readonly now?: () => Date;
  readonly nowMs?: () => number;
  readonly abuse?: PasswordResetAbuseService;
  readonly minimumResponseMs?: number;
  readonly sleep?: MinimumResponseTimingOptions['sleep'];
  readonly onDeliveryFailure?: (error: unknown, userId: string) => void;
}

export interface PasswordResetRequestContext {
  readonly sourceAddress?: string;
}

export interface PasswordResetRequestResult {
  readonly accepted: true;
  readonly message: string;
}

export function generatePasswordResetToken(): string {
  return `${RESET_TOKEN_PREFIX}${randomBytes(32).toString('base64url')}`;
}

export function isPasswordResetToken(value: string): boolean {
  return RESET_TOKEN_PATTERN.test(value);
}

export function hashPasswordResetToken(token: string): string {
  return createHash('sha256').update(`password-reset:v1:${token}`, 'utf8').digest('base64url');
}

export function buildPasswordResetUrl(baseUrl: string, token: string): string {
  if (!isPasswordResetToken(token)) throw new Error('Password reset token is invalid.');
  const parsed = new URL(baseUrl);
  const isLocalhost = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1' || parsed.hostname === '::1';
  if (parsed.protocol !== 'https:' && !(parsed.protocol === 'http:' && isLocalhost)) {
    throw new Error('Password reset URLs require HTTPS outside localhost development.');
  }
  parsed.pathname = '/reset-password';
  parsed.search = '';
  parsed.hash = '';
  parsed.searchParams.set('token', token);
  return parsed.toString();
}

export class PasswordResetService {
  private readonly now: () => Date;
  private readonly nowMs: () => number;
  private readonly abuse: PasswordResetAbuseService | undefined;
  private readonly minimumResponseMs: number;
  private readonly sleep: MinimumResponseTimingOptions['sleep'] | undefined;
  private readonly onDeliveryFailure: (error: unknown, userId: string) => void;

  public constructor(
    private readonly store: PasswordResetStore,
    private readonly delivery: PasswordResetDelivery,
    options: PasswordResetServiceOptions = {},
  ) {
    this.now = options.now ?? (() => new Date());
    this.nowMs = options.nowMs ?? Date.now;
    this.abuse = options.abuse;
    this.minimumResponseMs = options.minimumResponseMs ?? 350;
    this.sleep = options.sleep;
    this.onDeliveryFailure = options.onDeliveryFailure ?? (() => undefined);
  }

  private async equalize(startedAtMs: number): Promise<void> {
    await equalizeMinimumResponseTime(startedAtMs, {
      minimumMs: this.minimumResponseMs,
      nowMs: this.nowMs,
      ...(this.sleep === undefined ? {} : { sleep: this.sleep }),
    });
  }

  public async requestReset(
    login: string,
    context: PasswordResetRequestContext = {},
  ): Promise<PasswordResetRequestResult> {
    const startedAtMs = this.nowMs();
    try {
      const normalizedLogin = normalizeLoginIdentifier(login);
      const now = this.now();
      const abuseDecision = this.abuse === undefined
        ? { allowDelivery: true }
        : await this.abuse.assessResetRequest(normalizedLogin, context.sourceAddress, now);
      const token = generatePasswordResetToken();
      const tokenHash = hashPasswordResetToken(token);
      const account = await this.store.findAccountByLogin(normalizedLogin);

      if (account !== null && account.enabled && abuseDecision.allowDelivery) {
        const createdAt = now.toISOString();
        const expiresAt = new Date(now.getTime() + RESET_TOKEN_TTL_MS).toISOString();
        await this.store.invalidateOutstandingForUser(account.userId, createdAt);
        await this.store.createChallenge({ id: randomUUID(), userId: account.userId, tokenHash, createdAt, expiresAt });
        try {
          await this.delivery.enqueue({ userId: account.userId, destination: account.deliveryAddress, token, expiresAt });
        } catch (error) {
          this.onDeliveryFailure(error, account.userId);
        }
      }

      return { accepted: true, message: GENERIC_ACCEPTED_MESSAGE };
    } finally {
      await this.equalize(startedAtMs);
    }
  }

  public async resetPassword(
    token: string,
    newPassword: string,
    context: PasswordResetRequestContext = {},
  ): Promise<void> {
    const startedAtMs = this.nowMs();
    const now = this.now();
    try {
      await this.abuse?.assertResetAttemptAllowed(context.sourceAddress, now);
      if (!isPasswordResetToken(token)) {
        await this.abuse?.recordInvalidResetAttempt(context.sourceAddress, now);
        throw new ScolaApiError('PASSWORD_RESET_INVALID', 'Password reset link is invalid or expired.', 400);
      }
      const tokenHash = hashPasswordResetToken(token);
      const active = await this.store.isChallengeActive(tokenHash, now.toISOString());
      if (!active) {
        await this.abuse?.recordInvalidResetAttempt(context.sourceAddress, now);
        throw new ScolaApiError('PASSWORD_RESET_INVALID', 'Password reset link is invalid or expired.', 400);
      }
      const passwordHash = await hashPassword(newPassword);
      const userId = await this.store.consumeAndReplacePassword({
        tokenHash,
        passwordHash,
        consumedAt: now.toISOString(),
      });
      if (userId === null) {
        await this.abuse?.recordInvalidResetAttempt(context.sourceAddress, now);
        throw new ScolaApiError('PASSWORD_RESET_INVALID', 'Password reset link is invalid or expired.', 400);
      }
      await this.abuse?.clearInvalidResetAttempts(context.sourceAddress);
    } finally {
      await this.equalize(startedAtMs);
    }
  }
}