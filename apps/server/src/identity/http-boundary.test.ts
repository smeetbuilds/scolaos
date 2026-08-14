import { describe, expect, it } from 'vitest';

import { issueSessionCsrfToken } from './csrf.js';
import {
  assertAuthenticatedMutationSafety,
  assertForcedPasswordResetRouteAllowed,
  extractSessionCredential,
  resolveRequestSecurity,
} from './http-boundary.js';
import { generateSessionToken, hashSessionToken } from './session-token.js';
import type { SessionRecord } from './types.js';

const BASE_URL = 'https://school.example';
const CSRF_SECRET = 'test-csrf-secret-that-is-longer-than-32-characters';

describe('identity HTTP boundary', () => {
  it('extracts exactly one secure cookie or bearer credential and rejects ambiguity', () => {
    const token = generateSessionToken();
    const request = {
      method: 'GET', directProtocol: 'https' as const, hostname: 'school.example',
      cookie: `__Host-school_session=${token}`,
    };
    expect(extractSessionCredential(request, { baseUrl: BASE_URL })).toMatchObject({
      token, transport: 'browser-cookie', secureContext: true,
    });
    expect(() => extractSessionCredential({ ...request, authorization: `Bearer ${token}` }, { baseUrl: BASE_URL }))
      .toThrowError(expect.objectContaining({ code: 'AUTH_CREDENTIAL_AMBIGUOUS' }));
    expect(() => extractSessionCredential({ ...request, cookie: `${request.cookie}; __Host-school_session=${token}` }, { baseUrl: BASE_URL }))
      .toThrowError(expect.objectContaining({ code: 'AUTH_CREDENTIAL_AMBIGUOUS' }));
  });

  it('honors forwarded protocol only for a peer explicitly marked trusted by the server adapter', () => {
    const forwarded = { method: 'GET', directProtocol: 'http' as const, hostname: 'school.example', forwardedProto: 'https' };
    expect(() => resolveRequestSecurity(forwarded, { baseUrl: BASE_URL, trustProxy: true }))
      .toThrowError(expect.objectContaining({ code: 'HTTPS_REQUIRED' }));
    expect(resolveRequestSecurity({ ...forwarded, trustedProxy: true }, { baseUrl: BASE_URL, trustProxy: true }).secureContext)
      .toBe(true);
    expect(() => resolveRequestSecurity({ ...forwarded, trustedProxy: true, forwardedProto: 'https,http' }, { baseUrl: BASE_URL, trustProxy: true }))
      .toThrowError(expect.objectContaining({ code: 'FORWARDED_PROTO_INVALID' }));
  });

  it('requires exact-origin session-bound CSRF for browser mutations but not native bearer requests', () => {
    const token = generateSessionToken();
    const tokenHash = hashSessionToken(token);
    const session: SessionRecord = {
      id: 'session-1', userId: 'user-1', tokenHash, transport: 'browser-cookie',
      createdAt: '2026-08-15T00:00:00.000Z', lastSeenAt: '2026-08-15T00:00:00.000Z',
      idleExpiresAt: '2026-08-15T00:30:00.000Z', expiresAt: '2026-08-16T00:00:00.000Z',
    };
    const request = {
      method: 'POST', directProtocol: 'https' as const, hostname: 'school.example',
      cookie: `__Host-school_session=${token}`, origin: BASE_URL, secFetchSite: 'same-origin',
      csrfToken: issueSessionCsrfToken(session.id, tokenHash, CSRF_SECRET),
    };
    const credential = extractSessionCredential(request, { baseUrl: BASE_URL });
    expect(() => assertAuthenticatedMutationSafety(request, credential, session, CSRF_SECRET, BASE_URL)).not.toThrow();
    expect(() => assertAuthenticatedMutationSafety({ ...request, origin: 'https://evil.example' }, credential, session, CSRF_SECRET, BASE_URL))
      .toThrowError(expect.objectContaining({ code: 'CSRF_ORIGIN_INVALID' }));
    expect(() => assertAuthenticatedMutationSafety({ ...request, csrfToken: 'csrf1_bad' }, credential, session, CSRF_SECRET, BASE_URL))
      .toThrowError(expect.objectContaining({ code: 'CSRF_INVALID' }));
  });

  it('confines forced-password-reset sessions to recovery/session routes', () => {
    expect(() => assertForcedPasswordResetRouteAllowed(true, 'normal'))
      .toThrowError(expect.objectContaining({ code: 'PASSWORD_RESET_REQUIRED' }));
    expect(() => assertForcedPasswordResetRouteAllowed(true, 'password-change')).not.toThrow();
    expect(() => assertForcedPasswordResetRouteAllowed(true, 'logout')).not.toThrow();
    expect(() => assertForcedPasswordResetRouteAllowed(true, 'session-read')).not.toThrow();
  });
});
