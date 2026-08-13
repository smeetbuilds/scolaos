import { createHash, createHmac, randomBytes } from 'node:crypto';

const TOKEN_PREFIX = 'sess1_';
const TOKEN_BYTES = 32;
const TOKEN_PATTERN = /^sess1_[A-Za-z0-9_-]{43}$/;

export function generateSessionToken(): string {
  return `${TOKEN_PREFIX}${randomBytes(TOKEN_BYTES).toString('base64url')}`;
}

export function isSessionToken(value: string): boolean {
  return TOKEN_PATTERN.test(value);
}

export function hashSessionToken(token: string): string {
  return createHash('sha256').update(token, 'utf8').digest('base64url');
}

export function fingerprintSensitiveMetadata(
  value: string | undefined,
  secret: string,
): string | undefined {
  const normalized = value?.trim();
  if (!normalized) {
    return undefined;
  }
  return createHmac('sha256', secret).update(normalized, 'utf8').digest('base64url');
}
