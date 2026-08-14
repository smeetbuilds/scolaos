import { ScolaApiError } from '../errors.js';
import { verifySessionCsrfToken } from './csrf.js';
import { isSessionToken } from './session-token.js';
import { BROWSER_SESSION_COOKIE_NAMES, parseNativeBearerCredential } from './transport.js';
import type { SessionRecord, SessionTransport } from './types.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);

export interface IdentityHttpRequestContext {
  readonly method: string;
  readonly directProtocol: 'http' | 'https';
  readonly hostname: string;
  readonly sourceAddress?: string;
  readonly authorization?: string;
  readonly cookie?: string;
  readonly origin?: string;
  readonly forwardedProto?: string;
  /** Set only by a server adapter after the immediate peer matches configured trusted proxies. */
  readonly trustedProxy?: boolean;
  readonly secFetchSite?: string;
  readonly csrfToken?: string;
  readonly userAgent?: string;
}

export interface IdentityHttpBoundaryOptions {
  readonly baseUrl: string;
  readonly trustProxy?: boolean;
  readonly allowInsecureLocalDevelopment?: boolean;
}

export interface ResolvedRequestSecurity {
  readonly secureContext: boolean;
  readonly localDevelopment: boolean;
  readonly expectedOrigin: string;
}

export interface ExtractedSessionCredential {
  readonly token: string;
  readonly transport: SessionTransport;
  readonly secureContext: boolean;
  readonly localDevelopment: boolean;
  readonly sourceAddress?: string;
  readonly userAgent?: string;
}

function failContext(code: string, message: string, statusCode = 400): never {
  throw new ScolaApiError(code, message, statusCode);
}

function normalizeHostname(value: string): string {
  const hostname = value.trim().toLowerCase();
  if (!hostname || hostname.length > 253 || /[\s/@\\]/.test(hostname)) {
    failContext('REQUEST_CONTEXT_INVALID', 'Request security context is invalid.');
  }
  return hostname.startsWith('[') && hostname.endsWith(']') ? hostname.slice(1, -1) : hostname;
}

function parseForwardedProto(value: string): 'http' | 'https' {
  const normalized = value.trim().toLowerCase();
  if (normalized.includes(',') || (normalized !== 'http' && normalized !== 'https')) {
    failContext('FORWARDED_PROTO_INVALID', 'Forwarded protocol metadata is invalid.');
  }
  return normalized;
}

function canonicalOrigin(value: string): string {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    failContext('ORIGIN_INVALID', 'Request origin is invalid.', 403);
  }
  if (parsed.username || parsed.password || parsed.pathname !== '/' || parsed.search || parsed.hash) {
    failContext('ORIGIN_INVALID', 'Request origin is invalid.', 403);
  }
  return parsed.origin;
}

export function resolveRequestSecurity(
  request: IdentityHttpRequestContext,
  options: IdentityHttpBoundaryOptions,
): ResolvedRequestSecurity {
  const hostname = normalizeHostname(request.hostname);
  const localDevelopment = LOCAL_HOSTS.has(hostname);
  let effectiveProtocol = request.directProtocol;
  if (
    options.trustProxy === true &&
    request.trustedProxy === true &&
    request.forwardedProto !== undefined
  ) {
    effectiveProtocol = parseForwardedProto(request.forwardedProto);
  }
  const secureContext = effectiveProtocol === 'https';
  if (!secureContext && !(localDevelopment && options.allowInsecureLocalDevelopment === true)) {
    failContext('HTTPS_REQUIRED', 'Authentication requires HTTPS.', 400);
  }
  const expected = canonicalOrigin(new URL(options.baseUrl).origin);
  return { secureContext, localDevelopment: !secureContext && localDevelopment, expectedOrigin: expected };
}

function parseSessionCookies(cookieHeader: string | undefined): ReadonlyMap<string, readonly string[]> {
  const values = new Map<string, string[]>();
  if (cookieHeader === undefined || cookieHeader.trim() === '') return values;
  for (const part of cookieHeader.split(';')) {
    const index = part.indexOf('=');
    if (index <= 0) continue;
    const name = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    if (name !== BROWSER_SESSION_COOKIE_NAMES.secure && name !== BROWSER_SESSION_COOKIE_NAMES.localDevelopment) continue;
    const existing = values.get(name) ?? [];
    existing.push(value);
    values.set(name, existing);
  }
  return values;
}

function browserCredential(
  request: IdentityHttpRequestContext,
  security: ResolvedRequestSecurity,
): string | undefined {
  const cookies = parseSessionCookies(request.cookie);
  const secureValues = cookies.get(BROWSER_SESSION_COOKIE_NAMES.secure) ?? [];
  const localValues = cookies.get(BROWSER_SESSION_COOKIE_NAMES.localDevelopment) ?? [];
  if (secureValues.length > 1 || localValues.length > 1 || (secureValues.length > 0 && localValues.length > 0)) {
    failContext('AUTH_CREDENTIAL_AMBIGUOUS', 'Authentication credentials are ambiguous.');
  }
  if (security.secureContext && localValues.length > 0) {
    failContext('AUTH_COOKIE_INVALID', 'Authentication cookie is invalid.');
  }
  if (!security.secureContext && secureValues.length > 0) {
    failContext('AUTH_COOKIE_INVALID', 'Authentication cookie is invalid.');
  }
  const value = security.secureContext ? secureValues[0] : localValues[0];
  if (value === undefined) return undefined;
  if (!isSessionToken(value)) throw new ScolaApiError('AUTH_REQUIRED', 'Authentication is required.', 401);
  return value;
}

export function extractSessionCredential(
  request: IdentityHttpRequestContext,
  options: IdentityHttpBoundaryOptions,
): ExtractedSessionCredential {
  const security = resolveRequestSecurity(request, options);
  const cookieToken = browserCredential(request, security);
  const hasAuthorization = request.authorization !== undefined && request.authorization.trim() !== '';
  if (cookieToken !== undefined && hasAuthorization) {
    failContext('AUTH_CREDENTIAL_AMBIGUOUS', 'Authentication credentials are ambiguous.');
  }
  const token = cookieToken ?? (hasAuthorization ? parseNativeBearerCredential(request.authorization) : undefined);
  if (token === undefined) throw new ScolaApiError('AUTH_REQUIRED', 'Authentication is required.', 401);
  const transport: SessionTransport = cookieToken === undefined ? 'native-bearer' : 'browser-cookie';
  return {
    token,
    transport,
    secureContext: security.secureContext,
    localDevelopment: security.localDevelopment,
    ...(request.sourceAddress === undefined ? {} : { sourceAddress: request.sourceAddress }),
    ...(request.userAgent === undefined ? {} : { userAgent: request.userAgent }),
  };
}


export function assertPublicBrowserMutationOrigin(
  request: IdentityHttpRequestContext,
  expectedOrigin: string,
  requireOrigin: boolean,
): void {
  if (SAFE_METHODS.has(request.method.trim().toUpperCase())) return;
  if (request.secFetchSite !== undefined && request.secFetchSite.trim().toLowerCase() === 'cross-site') {
    throw new ScolaApiError('REQUEST_ORIGIN_INVALID', 'Cross-site authentication request was rejected.', 403);
  }
  if (request.origin === undefined) {
    if (requireOrigin) {
      throw new ScolaApiError('REQUEST_ORIGIN_INVALID', 'Request origin verification failed.', 403);
    }
    return;
  }
  if (canonicalOrigin(request.origin) !== canonicalOrigin(expectedOrigin)) {
    throw new ScolaApiError('REQUEST_ORIGIN_INVALID', 'Request origin verification failed.', 403);
  }
}

export function assertSessionTransportMatches(
  credential: ExtractedSessionCredential,
  session: SessionRecord,
): void {
  if (credential.transport !== session.transport) {
    throw new ScolaApiError('AUTH_REQUIRED', 'Authentication is required.', 401);
  }
}

export function assertAuthenticatedMutationSafety(
  request: IdentityHttpRequestContext,
  credential: ExtractedSessionCredential,
  session: SessionRecord,
  csrfSecret: string,
  expectedOrigin: string,
): void {
  if (SAFE_METHODS.has(request.method.trim().toUpperCase())) return;
  assertSessionTransportMatches(credential, session);
  if (credential.transport === 'native-bearer') return;
  if (request.origin === undefined || canonicalOrigin(request.origin) !== canonicalOrigin(expectedOrigin)) {
    throw new ScolaApiError('CSRF_ORIGIN_INVALID', 'Request origin verification failed.', 403);
  }
  if (request.secFetchSite !== undefined && request.secFetchSite.trim().toLowerCase() !== 'same-origin') {
    throw new ScolaApiError('CSRF_SITE_INVALID', 'Cross-site authenticated mutation was rejected.', 403);
  }
  if (
    request.csrfToken === undefined ||
    !verifySessionCsrfToken(request.csrfToken, session.id, session.tokenHash, csrfSecret)
  ) {
    throw new ScolaApiError('CSRF_INVALID', 'Request verification failed.', 403);
  }
}

export type AuthenticatedRouteIntent = 'normal' | 'session-read' | 'password-change' | 'logout';

export function assertForcedPasswordResetRouteAllowed(
  forcePasswordReset: boolean,
  intent: AuthenticatedRouteIntent,
): void {
  if (forcePasswordReset && intent === 'normal') {
    throw new ScolaApiError(
      'PASSWORD_RESET_REQUIRED',
      'A password change is required before continuing.',
      403,
    );
  }
}
