import { randomUUID } from 'node:crypto';

import { ScolaApiError } from '../errors.js';
import type { AuthenticationAbuseService } from './abuse.js';
import { hashPassword, passwordRecordNeedsUpgrade, verifyPassword } from './password.js';
import {
  fingerprintSensitiveMetadata,
  generateSessionToken,
  hashSessionToken,
  isSessionToken,
} from './session-token.js';
import { LoginThrottleService, normalizeLoginIdentifier } from './throttle.js';
import type {
  AuthenticatedPrincipal,
  IdentityRepository,
  LoginRequest,
  LoginResult,
  SessionRecord,
  SessionRepository,
  SessionTransport,
} from './types.js';

const BROWSER_IDLE_MS = 30 * 60 * 1000;
const BROWSER_ABSOLUTE_MS = 24 * 60 * 60 * 1000;
const NATIVE_IDLE_MS = 7 * 24 * 60 * 60 * 1000;
const NATIVE_ABSOLUTE_MS = 30 * 24 * 60 * 60 * 1000;
const TOUCH_AFTER_MS = 5 * 60 * 1000;
const DUMMY_PASSWORD_RECORD =
  'scrypt$1$65536$8$2$64$AAECAwQFBgcICQoLDA0ODw$K7t-JnsaY8th0m5RBonP3EQ9Kr350Nl41viphsiuBTkaVKaWACIbzE_6AI7253zdHH2HNUBwnD0iJ61SoI0UYg';

function sessionPolicy(transport: SessionTransport): { idleMs: number; absoluteMs: number } {
  return transport === 'browser-cookie'
    ? { idleMs: BROWSER_IDLE_MS, absoluteMs: BROWSER_ABSOLUTE_MS }
    : { idleMs: NATIVE_IDLE_MS, absoluteMs: NATIVE_ABSOLUTE_MS };
}

function invalidCredentials(): ScolaApiError {
  return new ScolaApiError('INVALID_CREDENTIALS', 'The login or password is incorrect.', 401);
}

export class AuthenticationService {
  public constructor(
    private readonly identities: IdentityRepository,
    private readonly sessions: SessionRepository,
    private readonly throttle: LoginThrottleService,
    private readonly metadataSecret: string,
    private readonly abuse?: AuthenticationAbuseService,
  ) {
    if (metadataSecret.length < 32) {
      throw new Error('Session metadata secret must contain at least 32 characters.');
    }
  }

  public async signIn(request: LoginRequest, now = new Date()): Promise<LoginResult> {
    const normalizedLogin = normalizeLoginIdentifier(request.login);
    await this.throttle.assertAllowed(normalizedLogin, now);
    await this.abuse?.assertLoginAllowed(request.metadata?.sourceAddress, now);

    const account = await this.identities.findAccountByLogin(normalizedLogin);
    const passwordValid = await verifyPassword(
      request.password,
      account?.passwordHash ?? DUMMY_PASSWORD_RECORD,
    );

    if (account === null || !passwordValid || !account.enabled) {
      await this.throttle.recordFailure(normalizedLogin, now);
      await this.abuse?.recordLoginFailure(request.metadata?.sourceAddress, now);
      throw invalidCredentials();
    }

    if (passwordRecordNeedsUpgrade(account.passwordHash)) {
      const upgradedPasswordHash = await hashPassword(request.password);
      await this.identities.upgradePasswordHash(
        account.userId,
        account.passwordHash,
        upgradedPasswordHash,
      );
    }

    await this.throttle.recordSuccess(normalizedLogin);
    const token = generateSessionToken();
    const tokenHash = hashSessionToken(token);
    const policy = sessionPolicy(request.transport);
    const createdAt = now.toISOString();
    const userAgentHash = fingerprintSensitiveMetadata(
      request.metadata?.userAgent,
      this.metadataSecret,
    );
    const sourceAddressHash = fingerprintSensitiveMetadata(
      request.metadata?.sourceAddress,
      this.metadataSecret,
    );
    const record: SessionRecord = {
      id: randomUUID(),
      userId: account.userId,
      tokenHash,
      transport: request.transport,
      createdAt,
      lastSeenAt: createdAt,
      idleExpiresAt: new Date(now.getTime() + policy.idleMs).toISOString(),
      expiresAt: new Date(now.getTime() + policy.absoluteMs).toISOString(),
      ...(request.metadata?.clientLabel === undefined
        ? {}
        : { clientLabel: request.metadata.clientLabel.slice(0, 120) }),
      ...(userAgentHash === undefined ? {} : { userAgentHash }),
      ...(sourceAddressHash === undefined ? {} : { sourceAddressHash }),
    };
    await this.sessions.create(record);

    return { token, session: record, forcePasswordReset: account.forcePasswordReset };
  }

  public async authenticate(token: string, now = new Date()): Promise<AuthenticatedPrincipal> {
    if (!isSessionToken(token)) {
      throw new ScolaApiError('AUTH_REQUIRED', 'Authentication is required.', 401);
    }

    const record = await this.sessions.findByTokenHash(hashSessionToken(token));
    if (record === null || record.revokedAt !== undefined) {
      throw new ScolaApiError('AUTH_REQUIRED', 'Authentication is required.', 401);
    }

    if (
      new Date(record.expiresAt).getTime() <= now.getTime() ||
      new Date(record.idleExpiresAt).getTime() <= now.getTime()
    ) {
      await this.sessions.revoke(record.id, now.toISOString());
      throw new ScolaApiError('SESSION_EXPIRED', 'Your session has expired.', 401);
    }

    const principal = await this.identities.loadSessionPrincipal(record.userId);
    if (principal === null || !principal.actor.enabled) {
      await this.sessions.revoke(record.id, now.toISOString());
      throw new ScolaApiError('AUTH_REQUIRED', 'Authentication is required.', 401);
    }

    const lastSeen = new Date(record.lastSeenAt).getTime();
    let session = record;
    if (now.getTime() - lastSeen >= TOUCH_AFTER_MS) {
      const policy = sessionPolicy(record.transport);
      const newIdle = new Date(
        Math.min(now.getTime() + policy.idleMs, new Date(record.expiresAt).getTime()),
      ).toISOString();
      await this.sessions.touch(record.id, now.toISOString(), newIdle);
      session = { ...record, lastSeenAt: now.toISOString(), idleExpiresAt: newIdle };
    }

    return {
      session,
      actor: principal.actor,
      forcePasswordReset: principal.forcePasswordReset,
    };
  }

  public async signOut(token: string, now = new Date()): Promise<void> {
    if (!isSessionToken(token)) {
      return;
    }
    const record = await this.sessions.findByTokenHash(hashSessionToken(token));
    if (record !== null && record.revokedAt === undefined) {
      await this.sessions.revoke(record.id, now.toISOString());
    }
  }

  public async revokeOtherSessions(
    userId: string,
    currentSessionId: string,
    now = new Date(),
  ): Promise<number> {
    return this.sessions.revokeAllForUser(userId, now.toISOString(), currentSessionId);
  }

  public async revokeAllSessions(userId: string, now = new Date()): Promise<number> {
    return this.sessions.revokeAllForUser(userId, now.toISOString());
  }
}
