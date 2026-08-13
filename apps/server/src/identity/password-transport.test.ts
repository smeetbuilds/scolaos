import { describe, expect, it } from 'vitest';

import {
  generateSessionToken,
  hashPassword,
  hashSessionToken,
  isSessionToken,
  issueSessionCsrfToken,
  normalizeLoginIdentifier,
  parseNativeBearerCredential,
  passwordRecordNeedsUpgrade,
  serializeBrowserSessionCookie,
  serializeBrowserSessionCookieClear,
  validatePasswordPolicy,
  verifyPassword,
  verifySessionCsrfToken,
} from './index.js';

const SERVER_SECRET = 'test-only-secret-that-is-longer-than-thirty-two-characters';
const PASSWORD = 'Correct horse battery staple 2026';

describe('identity password and transport primitives', () => {
  it('hashes and verifies versioned passwords without composition rules', async () => {
    const record = await hashPassword(PASSWORD);
    expect(record.startsWith('scrypt$1$')).toBe(true);
    expect(await verifyPassword(PASSWORD, record)).toBe(true);
    expect(await verifyPassword('wrong password here!!!!', record)).toBe(false);
    expect(passwordRecordNeedsUpgrade(record)).toBe(false);
    expect(() => validatePasswordPolicy('too short')).toThrowError(
      expect.objectContaining({ code: 'PASSWORD_TOO_SHORT' }),
    );
    expect(validatePasswordPolicy('é'.repeat(15)).codePoints).toBe(15);
  });

  it('issues opaque random credentials and stores only token hashes', () => {
    const first = generateSessionToken();
    const second = generateSessionToken();
    expect(isSessionToken(first)).toBe(true);
    expect(first).not.toBe(second);
    expect(hashSessionToken(first)).not.toBe(first);
    expect(hashSessionToken(first)).not.toBe(hashSessionToken(second));
  });

  it('enforces secure browser-cookie and native-bearer transport primitives', () => {
    const token = generateSessionToken();
    const cookie = serializeBrowserSessionCookie(token, {
      secureContext: true,
      maxAgeSeconds: 3_600,
    });
    expect(cookie).toContain('__Host-school_session=');
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('Secure');
    expect(cookie).toContain('SameSite=Lax');
    expect(() =>
      serializeBrowserSessionCookie(token, { secureContext: false, maxAgeSeconds: 3_600 }),
    ).toThrowError('Browser session cookies require HTTPS outside explicit local development.');
    expect(
      serializeBrowserSessionCookieClear({ secureContext: true, maxAgeSeconds: 3_600 }),
    ).toContain('Max-Age=0');
    expect(parseNativeBearerCredential(`Bearer ${token}`)).toBe(token);
  });

  it('binds CSRF tokens to a specific cookie session', () => {
    const first = generateSessionToken();
    const second = generateSessionToken();
    const csrf = issueSessionCsrfToken('session-1', hashSessionToken(first), SERVER_SECRET);
    expect(verifySessionCsrfToken(csrf, 'session-1', hashSessionToken(first), SERVER_SECRET)).toBe(
      true,
    );
    expect(verifySessionCsrfToken(csrf, 'session-2', hashSessionToken(first), SERVER_SECRET)).toBe(
      false,
    );
    expect(verifySessionCsrfToken(csrf, 'session-1', hashSessionToken(second), SERVER_SECRET)).toBe(
      false,
    );
  });

  it('normalizes login identifiers consistently', () => {
    expect(normalizeLoginIdentifier('  Admin@School.TEST  ')).toBe('admin@school.test');
  });
});
