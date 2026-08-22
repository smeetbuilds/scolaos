import { describe, expect, it } from 'vitest';

import { PasswordResetService } from './password-reset.js';
import { IdentityHttpApplication, type IdentityAuthenticationPort } from './http-application.js';
import { generateSessionToken, hashSessionToken } from './session-token.js';
import { issueSessionCsrfToken } from './csrf.js';
import type { AuthenticatedPrincipal, LoginResult, SessionRecord } from './types.js';
import type { AuditEventDraft } from '../audit/types.js';

const BASE_URL = 'https://school.example';
const CSRF_SECRET = 'http-app-csrf-secret-that-is-longer-than-32-chars';
const AUDIT_SECRET = 'http-app-audit-secret-that-is-longer-than-32-chars';

function makeSession(token: string, transport: 'browser-cookie' | 'native-bearer'): SessionRecord {
  return {
    id: 'session-1', userId: 'user-1', tokenHash: hashSessionToken(token), transport,
    createdAt: '2026-08-15T00:00:00.000Z', lastSeenAt: '2026-08-15T00:00:00.000Z',
    idleExpiresAt: '2026-08-15T00:30:00.000Z', expiresAt: '2026-08-16T00:00:00.000Z',
  };
}

function resetService(): PasswordResetService {
  return new PasswordResetService({
    findAccountByLogin: async () => null,
    issueChallengeAndQueueDelivery: async () => undefined,
    isChallengeActive: async () => false,
    consumeAndReplacePassword: async () => null,
  }, { minimumResponseMs: 1, sleep: async () => undefined });
}

describe('identity HTTP application orchestration', () => {
  it('issues browser cookies/CSRF without exposing the bearer token in the response body', async () => {
    const token = generateSessionToken();
    const session = makeSession(token, 'browser-cookie');
    const audit: AuditEventDraft[] = [];
    const authentication: IdentityAuthenticationPort = {
      signIn: async (): Promise<LoginResult> => ({ token, session, forcePasswordReset: false }),
      authenticate: async (): Promise<AuthenticatedPrincipal> => ({ session, actor: { userId: 'user-1', enabled: true, grants: [] }, forcePasswordReset: false }),
      signOut: async () => undefined,
    };
    const app = new IdentityHttpApplication(authentication, resetService(), { recordBestEffort: async draft => { audit.push(draft); } }, {
      baseUrl: BASE_URL, csrfSecret: CSRF_SECRET, auditFingerprintSecret: AUDIT_SECRET,
    });
    const result = await app.signIn({
      request: { method: 'POST', directProtocol: 'https', hostname: 'school.example', origin: BASE_URL, secFetchSite: 'same-origin' },
      login: 'admin', password: 'not-observable-in-audit', transport: 'browser-cookie',
    });
    expect(result.setCookie).toContain('__Host-school_session=');
    expect(result.csrfToken).toMatch(/^csrf1_/);
    expect(result.bearerToken).toBeUndefined();
    expect(JSON.stringify(result)).not.toContain(session.tokenHash);
    expect(JSON.stringify(audit)).not.toContain('not-observable-in-audit');
  });

  it('returns native bearer credentials without browser cookie/CSRF fields', async () => {
    const token = generateSessionToken();
    const session = makeSession(token, 'native-bearer');
    const app = new IdentityHttpApplication({
      signIn: async () => ({ token, session, forcePasswordReset: false }),
      authenticate: async () => ({ session, actor: { userId: 'user-1', enabled: true, grants: [] }, forcePasswordReset: false }),
      signOut: async () => undefined,
    }, resetService(), { recordBestEffort: async () => undefined }, {
      baseUrl: BASE_URL, csrfSecret: CSRF_SECRET, auditFingerprintSecret: AUDIT_SECRET,
    });
    const result = await app.signIn({ request: { method: 'POST', directProtocol: 'https', hostname: 'school.example' }, login: 'admin', password: 'password', transport: 'native-bearer' });
    expect(result.bearerToken).toBe(token);
    expect(result.setCookie).toBeUndefined();
    expect(result.csrfToken).toBeUndefined();
  });

  it('returns safe current-user permission context and enforces CSRF on logout', async () => {
    const token = generateSessionToken();
    const session = makeSession(token, 'browser-cookie');
    let signedOut = false;
    const principal: AuthenticatedPrincipal = { session, actor: { userId: 'user-1', enabled: true, grants: [] }, forcePasswordReset: false };
    const app = new IdentityHttpApplication({
      signIn: async () => ({ token, session, forcePasswordReset: false }), authenticate: async () => principal,
      signOut: async () => { signedOut = true; },
    }, resetService(), { recordBestEffort: async () => undefined }, {
      baseUrl: BASE_URL, csrfSecret: CSRF_SECRET, auditFingerprintSecret: AUDIT_SECRET,
    });
    const cookie = `__Host-school_session=${token}`;
    const current = await app.currentUser({ method: 'GET', directProtocol: 'https', hostname: 'school.example', cookie });
    expect(current.actor.userId).toBe('user-1');
    expect(JSON.stringify(current)).not.toContain(session.tokenHash);
    const csrfToken = issueSessionCsrfToken(session.id, session.tokenHash, CSRF_SECRET);
    const out = await app.signOut({ method: 'POST', directProtocol: 'https', hostname: 'school.example', cookie, origin: BASE_URL, secFetchSite: 'same-origin', csrfToken });
    expect(signedOut).toBe(true);
    expect(out.clearCookie).toContain('Max-Age=0');
  });
});
