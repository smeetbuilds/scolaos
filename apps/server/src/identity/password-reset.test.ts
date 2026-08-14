import { describe, expect, it } from 'vitest';

import {
  PasswordResetService,
  buildPasswordResetUrl,
  generatePasswordResetToken,
  hashPasswordResetToken,
  type PasswordResetChallenge,
} from './password-reset.js';

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
      consumeAndReplacePassword: async () => null,
    };
    const service = new PasswordResetService(
      store,
      {
        enqueue: async (input) => {
          deliveredToken = input.token;
        },
      },
      { now: () => new Date('2026-08-14T10:00:00.000Z') },
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

  it('delegates reset consumption/password replacement/session revocation to one atomic store operation', async () => {
    const token = generatePasswordResetToken();
    const tokenHash = hashPasswordResetToken(token);
    let committedHash = '';
    const service = new PasswordResetService(
      {
        findAccountByLogin: async () => null,
        invalidateOutstandingForUser: async () => undefined,
        createChallenge: async () => undefined,
        consumeAndReplacePassword: async (input) => {
          committedHash = input.tokenHash;
          return input.tokenHash === tokenHash ? 'user-1' : null;
        },
      },
      { enqueue: async () => undefined },
      { now: () => new Date('2026-08-14T10:00:00.000Z') },
    );

    await expect(
      service.resetPassword(token, 'A sufficiently long replacement password'),
    ).resolves.toBeUndefined();
    expect(committedHash).toBe(tokenHash);
    await expect(
      service.resetPassword(
        generatePasswordResetToken(),
        'A sufficiently long replacement password',
      ),
    ).rejects.toMatchObject({ code: 'PASSWORD_RESET_INVALID', statusCode: 400 });
  });
});
