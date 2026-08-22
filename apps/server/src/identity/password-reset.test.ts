import { describe, expect, it } from 'vitest';

import {
  PasswordResetService,
  buildPasswordResetUrl,
  generatePasswordResetToken,
  hashPasswordResetToken,
  type PasswordResetChallenge,
  type PasswordResetQueuedDelivery,
} from './password-reset.js';

const FAST_TIMING = { minimumResponseMs: 1, sleep: async () => undefined } as const;

describe('password reset foundation', () => {
  it('returns the same public request response and atomically queues delivery without persisting the raw token as the challenge', async () => {
    const queued: Array<{
      challenge: PasswordResetChallenge;
      delivery: PasswordResetQueuedDelivery;
    }> = [];
    const store = {
      findAccountByLogin: async (login: string) =>
        login === 'admin@school.test'
          ? { userId: 'user-1', normalizedLogin: login, deliveryAddress: login, enabled: true }
          : null,
      issueChallengeAndQueueDelivery: async (input: {
        challenge: PasswordResetChallenge;
        delivery: PasswordResetQueuedDelivery;
      }) => {
        queued.push(input);
      },
      isChallengeActive: async () => false,
      consumeAndReplacePassword: async () => null,
    };
    const service = new PasswordResetService(store, {
      now: () => new Date('2026-08-15T00:00:00.000Z'),
      ...FAST_TIMING,
    });

    const known = await service.requestReset(' Admin@School.TEST ');
    const unknown = await service.requestReset('missing@school.test');

    expect(known).toEqual(unknown);
    expect(queued).toHaveLength(1);
    const item = queued[0];
    expect(item).toBeDefined();
    expect(item?.delivery.token).not.toBe('');
    expect(item?.challenge.tokenHash).toBe(hashPasswordResetToken(item?.delivery.token ?? ''));
    expect(item?.challenge.tokenHash).not.toBe(item?.delivery.token);
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
        issueChallengeAndQueueDelivery: async () => undefined,
        isChallengeActive: async (candidate) => candidate === tokenHash,
        consumeAndReplacePassword: async (input) => {
          commitCalls += 1;
          committedHash = input.tokenHash;
          return input.tokenHash === tokenHash ? 'user-1' : null;
        },
      },
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
