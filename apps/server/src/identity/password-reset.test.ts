import { describe, expect, it } from 'vitest';

import {
  PasswordResetService,
  buildPasswordResetUrl,
  generatePasswordResetToken,
  hashPasswordResetToken,
  type PasswordResetChallenge,
} from './password-reset.js';

const FAST_TIMING = { minimumResponseMs: 1, sleep: async () => undefined } as const;

describe('password reset foundation', () => {
  it('returns the same public request response and never persists the raw token', async () => {
    const challenges: PasswordResetChallenge[] = [];
    let deliveredToken = '';
    const store = {
      findAccountByLogin: async (login: string) =>
        login === 'admin@school.test'
          ? { userId: 'user-1', normalizedLogin: login, deliveryAddress: login, enabled: true }
          : null,
      invalidateOutstandingForUser: async () => undefined,
      createChallenge: async (challenge: PasswordResetChallenge) => {
        challenges.push(challenge);
      },
      isChallengeActive: async () => false,
      consumeAndReplacePassword: async () => null,
    };
    const service = new PasswordResetService(
      store,
      {
        enqueue: async (input) => {
          deliveredToken = input.token;
        },
      },
      { now: () => new Date('2026-08-15T00:00:00.000Z'), ...FAST_TIMING },
    );

    const known = await service.requestReset(' Admin@School.TEST ');
    const unknown = await service.requestReset('missing@school.test');

    expect(known).toEqual(unknown);
    expect(challenges).toHaveLength(1);
    expect(deliveredToken).not.toBe('');
    expect(challenges[0]?.tokenHash).toBe(hashPasswordResetToken(deliveredToken));
    expect(challenges[0]?.tokenHash).not.toBe(deliveredToken);
  });

  it('uses a trusted configured base URL rather than request Host data', () => {
    const token = generatePasswordResetToken();
    expect(buildPasswordResetUrl('https://school.example/app', token)).toBe(
      `https://school.example/reset-password?token=${token}`,
    );
    expect(() => buildPasswordResetUrl('http://school.example', token)).toThrow(
      'Password reset URLs require HTTPS outside localhost development.',
    );
  });

  it('preflights challenge validity before password hashing and keeps atomic consume authoritative', async () => {
    const token = generatePasswordResetToken();
    const tokenHash = hashPasswordResetToken(token);
    let committedHash = '';
    let commitCalls = 0;
    const service = new PasswordResetService(
      {
        findAccountByLogin: async () => null,
        invalidateOutstandingForUser: async () => undefined,
        createChallenge: async () => undefined,
        isChallengeActive: async (candidate) => candidate === tokenHash,
        consumeAndReplacePassword: async (input) => {
          commitCalls += 1;
          committedHash = input.tokenHash;
          return input.tokenHash === tokenHash ? 'user-1' : null;
        },
      },
      { enqueue: async () => undefined },
      { now: () => new Date('2026-08-15T00:00:00.000Z'), ...FAST_TIMING },
    );

    await expect(
      service.resetPassword(token, 'A sufficiently long replacement password'),
    ).resolves.toBeUndefined();
    expect(committedHash).toBe(tokenHash);
    expect(commitCalls).toBe(1);

    await expect(
      service.resetPassword(generatePasswordResetToken(), 'short'),
    ).rejects.toMatchObject({ code: 'PASSWORD_RESET_INVALID', statusCode: 400 });
    expect(commitCalls).toBe(1);
  });
});
