import { createHmac, timingSafeEqual } from 'node:crypto';

const CSRF_PREFIX = 'csrf1_';
const CSRF_PATTERN = /^csrf1_[A-Za-z0-9_-]{43}$/;

function csrfMac(sessionId: string, tokenHash: string, secret: string): string {
  return createHmac('sha256', secret)
    .update(`session-csrf:v1:${sessionId}:${tokenHash}`, 'utf8')
    .digest('base64url');
}

export function issueSessionCsrfToken(
  sessionId: string,
  tokenHash: string,
  secret: string,
): string {
  if (secret.length < 32) {
    throw new Error('Session CSRF secret must contain at least 32 characters.');
  }
  return `${CSRF_PREFIX}${csrfMac(sessionId, tokenHash, secret)}`;
}

export function verifySessionCsrfToken(
  token: string,
  sessionId: string,
  tokenHash: string,
  secret: string,
): boolean {
  if (!CSRF_PATTERN.test(token) || secret.length < 32) {
    return false;
  }
  const expected = issueSessionCsrfToken(sessionId, tokenHash, secret);
  const receivedBytes = Buffer.from(token, 'utf8');
  const expectedBytes = Buffer.from(expected, 'utf8');
  return (
    receivedBytes.length === expectedBytes.length && timingSafeEqual(receivedBytes, expectedBytes)
  );
}
