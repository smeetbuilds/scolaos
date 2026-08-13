import type { AuthorizationActor, PermissionId } from '../authorization/index.js';

export type SessionTransport = 'browser-cookie' | 'native-bearer';

export interface PasswordAccount {
  readonly userId: string;
  readonly normalizedLogin: string;
  readonly passwordHash: string;
  readonly enabled: boolean;
  readonly forcePasswordReset: boolean;
}

export interface SessionRecord {
  readonly id: string;
  readonly userId: string;
  readonly tokenHash: string;
  readonly transport: SessionTransport;
  readonly createdAt: string;
  readonly lastSeenAt: string;
  readonly idleExpiresAt: string;
  readonly expiresAt: string;
  readonly revokedAt?: string;
  readonly clientLabel?: string;
  readonly userAgentHash?: string;
  readonly sourceAddressHash?: string;
}

export interface SessionIssueMetadata {
  readonly clientLabel?: string;
  readonly userAgent?: string;
  readonly sourceAddress?: string;
}

export interface AuthenticatedPrincipal {
  readonly session: SessionRecord;
  readonly actor: AuthorizationActor<PermissionId>;
  readonly forcePasswordReset: boolean;
}

export interface LoginRequest {
  readonly login: string;
  readonly password: string;
  readonly transport: SessionTransport;
  readonly metadata?: SessionIssueMetadata;
}

export interface LoginResult {
  readonly token: string;
  readonly session: SessionRecord;
  readonly forcePasswordReset: boolean;
}

export interface SessionPrincipal {
  readonly actor: AuthorizationActor<PermissionId>;
  readonly forcePasswordReset: boolean;
}

export interface IdentityRepository {
  findAccountByLogin(normalizedLogin: string): Promise<PasswordAccount | null>;
  loadSessionPrincipal(userId: string): Promise<SessionPrincipal | null>;
}

export interface SessionRepository {
  create(record: SessionRecord): Promise<void>;
  findByTokenHash(tokenHash: string): Promise<SessionRecord | null>;
  touch(sessionId: string, lastSeenAt: string, idleExpiresAt: string): Promise<void>;
  revoke(sessionId: string, revokedAt: string): Promise<void>;
  revokeAllForUser(userId: string, revokedAt: string, exceptSessionId?: string): Promise<number>;
}

export interface LoginThrottleState {
  readonly key: string;
  readonly failures: number;
  readonly firstFailedAt: string;
  readonly lastFailedAt: string;
  readonly blockedUntil?: string;
}

export interface LoginThrottleStore {
  get(key: string): Promise<LoginThrottleState | null>;
  put(state: LoginThrottleState): Promise<void>;
  clear(key: string): Promise<void>;
}
