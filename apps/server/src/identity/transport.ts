import { ScolaApiError } from '../errors.js';
import { isSessionToken } from './session-token.js';

const SECURE_BROWSER_COOKIE = '__Host-school_session';
const DEVELOPMENT_BROWSER_COOKIE = 'school_session';

export interface BrowserCookieOptions {
  readonly secureContext: boolean;
  readonly allowInsecureLocalDevelopment?: boolean;
  readonly maxAgeSeconds: number;
}

function browserCookieName(options: BrowserCookieOptions): string {
  if (options.secureContext) {
    return SECURE_BROWSER_COOKIE;
  }
  if (options.allowInsecureLocalDevelopment === true) {
    return DEVELOPMENT_BROWSER_COOKIE;
  }
  throw new Error('Browser session cookies require HTTPS outside explicit local development.');
}

export function serializeBrowserSessionCookie(
  token: string,
  options: BrowserCookieOptions,
): string {
  if (!isSessionToken(token)) {
    throw new Error('Cannot serialize an invalid session token.');
  }
  if (!Number.isInteger(options.maxAgeSeconds) || options.maxAgeSeconds < 1) {
    throw new Error('Browser session cookie maxAgeSeconds must be a positive integer.');
  }
  const name = browserCookieName(options);
  const secure = options.secureContext ? '; Secure' : '';
  return `${name}=${token}; Path=/; HttpOnly; SameSite=Lax${secure}; Max-Age=${options.maxAgeSeconds}`;
}

export function serializeBrowserSessionCookieClear(options: BrowserCookieOptions): string {
  const name = browserCookieName(options);
  const secure = options.secureContext ? '; Secure' : '';
  return `${name}=; Path=/; HttpOnly; SameSite=Lax${secure}; Max-Age=0`;
}

export function parseNativeBearerCredential(authorization: string | undefined): string {
  if (authorization === undefined) {
    throw new ScolaApiError('AUTH_REQUIRED', 'Authentication is required.', 401);
  }
  const match = /^Bearer\s+([^\s]+)$/i.exec(authorization.trim());
  const token = match?.[1];
  if (token === undefined || !isSessionToken(token)) {
    throw new ScolaApiError('AUTH_REQUIRED', 'Authentication is required.', 401);
  }
  return token;
}

export const BROWSER_SESSION_COOKIE_NAMES = {
  secure: SECURE_BROWSER_COOKIE,
  localDevelopment: DEVELOPMENT_BROWSER_COOKIE,
} as const;
