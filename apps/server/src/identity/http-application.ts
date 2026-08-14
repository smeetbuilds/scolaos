import type { AuditEventDraft } from '../audit/types.js';
import {
  loginRejectedAudit,
  loginSucceededAudit,
  logoutSucceededAudit,
  passwordResetRequestedAudit,
  passwordResetResultAudit,
} from '../audit/identity-events.js';
import { ScolaApiError } from '../errors.js';
import { issueSessionCsrfToken } from './csrf.js';
import {
  assertAuthenticatedMutationSafety,
  assertForcedPasswordResetRouteAllowed,
  assertPublicBrowserMutationOrigin,
  assertSessionTransportMatches,
  extractSessionCredential,
  resolveRequestSecurity,
  type AuthenticatedRouteIntent,
  type ExtractedSessionCredential,
  type IdentityHttpBoundaryOptions,
  type IdentityHttpRequestContext,
} from './http-boundary.js';
import { fingerprintSensitiveMetadata } from './session-token.js';
import {
  serializeBrowserSessionCookie,
  serializeBrowserSessionCookieClear,
} from './transport.js';
import type {
  AuthenticatedPrincipal,
  LoginRequest,
  LoginResult,
  SessionTransport,
} from './types.js';
import type { PasswordResetService } from './password-reset.js';

export interface IdentityAuthenticationPort {
  signIn(request: LoginRequest, now?: Date): Promise<LoginResult>;
  authenticate(token: string, now?: Date): Promise<AuthenticatedPrincipal>;
  signOut(token: string, now?: Date): Promise<void>;
}

export interface IdentityAuditPort {
  recordBestEffort(draft: AuditEventDraft): Promise<unknown>;
}

export interface IdentityHttpApplicationOptions extends IdentityHttpBoundaryOptions {
  readonly csrfSecret: string;
  readonly auditFingerprintSecret: string;
}

export interface SignInHttpInput {
  readonly request: IdentityHttpRequestContext;
  readonly login: string;
  readonly password: string;
  readonly transport: SessionTransport;
  readonly clientLabel?: string;
}

export interface SignInHttpResult {
  readonly authenticated: true;
  readonly transport: SessionTransport;
  readonly session: {
    readonly id: string;
    readonly expiresAt: string;
    readonly idleExpiresAt: string;
  };
  readonly forcePasswordReset: boolean;
  readonly setCookie?: string;
  readonly csrfToken?: string;
  readonly bearerToken?: string;
}

export interface CurrentUserHttpResult {
  readonly actor: AuthenticatedPrincipal['actor'];
  readonly forcePasswordReset: boolean;
  readonly session: {
    readonly id: string;
    readonly transport: SessionTransport;
    readonly expiresAt: string;
    readonly idleExpiresAt: string;
  };
  readonly csrfToken?: string;
}

export interface SignOutHttpResult {
  readonly signedOut: true;
  readonly clearCookie?: string;
}

export interface AuthorizedHttpRequest {
  readonly principal: AuthenticatedPrincipal;
  readonly credential: ExtractedSessionCredential;
}

function sessionMaxAgeSeconds(result: LoginResult): number {
  const created = Date.parse(result.session.createdAt);
  const expires = Date.parse(result.session.expiresAt);
  const seconds = Math.floor((expires - created) / 1000);
  if (!Number.isSafeInteger(seconds) || seconds < 1) throw new Error('Issued session lifetime is invalid.');
  return seconds;
}

function rejectedReason(error: unknown): 'invalid-credentials' | 'account-throttled' | 'source-throttled' | 'https-required' | 'request-rejected' {
  if (!(error instanceof ScolaApiError)) return 'request-rejected';
  switch (error.code) {
    case 'INVALID_CREDENTIALS': return 'invalid-credentials';
    case 'LOGIN_THROTTLED': return 'account-throttled';
    case 'LOGIN_SOURCE_THROTTLED': return 'source-throttled';
    case 'HTTPS_REQUIRED': return 'https-required';
    default: return 'request-rejected';
  }
}

export class IdentityHttpApplication {
  public constructor(
    private readonly authentication: IdentityAuthenticationPort,
    private readonly passwordReset: PasswordResetService,
    private readonly audit: IdentityAuditPort,
    private readonly options: IdentityHttpApplicationOptions,
  ) {
    if (options.csrfSecret.length < 32) throw new Error('Identity HTTP CSRF secret must contain at least 32 characters.');
    if (options.auditFingerprintSecret.length < 32) throw new Error('Identity audit fingerprint secret must contain at least 32 characters.');
  }

  private sourceFingerprint(request: IdentityHttpRequestContext): string | undefined {
    return fingerprintSensitiveMetadata(request.sourceAddress, this.options.auditFingerprintSecret);
  }

  public async signIn(input: SignInHttpInput, now = new Date()): Promise<SignInHttpResult> {
    try {
      const security = resolveRequestSecurity(input.request, this.options);
      assertPublicBrowserMutationOrigin(
        input.request,
        security.expectedOrigin,
        input.transport === 'browser-cookie',
      );
      const result = await this.authentication.signIn({
        login: input.login,
        password: input.password,
        transport: input.transport,
        metadata: {
          ...(input.clientLabel === undefined ? {} : { clientLabel: input.clientLabel }),
          ...(input.request.userAgent === undefined ? {} : { userAgent: input.request.userAgent }),
          ...(input.request.sourceAddress === undefined ? {} : { sourceAddress: input.request.sourceAddress }),
        },
      }, now);
      await this.audit.recordBestEffort(loginSucceededAudit({
        userId: result.session.userId,
        sessionId: result.session.id,
        transport: result.session.transport,
      }));

      const base = {
        authenticated: true as const,
        transport: result.session.transport,
        session: {
          id: result.session.id,
          expiresAt: result.session.expiresAt,
          idleExpiresAt: result.session.idleExpiresAt,
        },
        forcePasswordReset: result.forcePasswordReset,
      };
      if (result.session.transport === 'native-bearer') {
        return { ...base, bearerToken: result.token };
      }
      return {
        ...base,
        setCookie: serializeBrowserSessionCookie(result.token, {
          secureContext: security.secureContext,
          allowInsecureLocalDevelopment: security.localDevelopment,
          maxAgeSeconds: sessionMaxAgeSeconds(result),
        }),
        csrfToken: issueSessionCsrfToken(result.session.id, result.session.tokenHash, this.options.csrfSecret),
      };
    } catch (error) {
      const sourceFingerprint = this.sourceFingerprint(input.request);
      await this.audit.recordBestEffort(loginRejectedAudit({
        transport: input.transport,
        reasonCode: rejectedReason(error),
        ...(sourceFingerprint === undefined ? {} : { sourceFingerprint }),
      }));
      throw error;
    }
  }

  public async authorize(
    request: IdentityHttpRequestContext,
    intent: AuthenticatedRouteIntent,
    now = new Date(),
  ): Promise<AuthorizedHttpRequest> {
    const security = resolveRequestSecurity(request, this.options);
    const credential = extractSessionCredential(request, this.options);
    const principal = await this.authentication.authenticate(credential.token, now);
    assertSessionTransportMatches(credential, principal.session);
    assertForcedPasswordResetRouteAllowed(principal.forcePasswordReset, intent);
    assertAuthenticatedMutationSafety(
      request,
      credential,
      principal.session,
      this.options.csrfSecret,
      security.expectedOrigin,
    );
    return { principal, credential };
  }

  public async currentUser(
    request: IdentityHttpRequestContext,
    now = new Date(),
  ): Promise<CurrentUserHttpResult> {
    const { principal, credential } = await this.authorize(request, 'session-read', now);
    return {
      actor: principal.actor,
      forcePasswordReset: principal.forcePasswordReset,
      session: {
        id: principal.session.id,
        transport: principal.session.transport,
        expiresAt: principal.session.expiresAt,
        idleExpiresAt: principal.session.idleExpiresAt,
      },
      ...(credential.transport === 'browser-cookie'
        ? { csrfToken: issueSessionCsrfToken(principal.session.id, principal.session.tokenHash, this.options.csrfSecret) }
        : {}),
    };
  }

  public async signOut(
    request: IdentityHttpRequestContext,
    now = new Date(),
  ): Promise<SignOutHttpResult> {
    const security = resolveRequestSecurity(request, this.options);
    const { principal, credential } = await this.authorize(request, 'logout', now);
    await this.authentication.signOut(credential.token, now);
    await this.audit.recordBestEffort(logoutSucceededAudit({
      userId: principal.actor.userId,
      sessionId: principal.session.id,
      transport: credential.transport,
    }));
    if (credential.transport === 'native-bearer') return { signedOut: true };
    return {
      signedOut: true,
      clearCookie: serializeBrowserSessionCookieClear({
        secureContext: security.secureContext,
        allowInsecureLocalDevelopment: security.localDevelopment,
        maxAgeSeconds: 1,
      }),
    };
  }

  public async requestPasswordReset(
    request: IdentityHttpRequestContext,
    login: string,
  ) {
    const security = resolveRequestSecurity(request, this.options);
    assertPublicBrowserMutationOrigin(request, security.expectedOrigin, false);
    try {
      const result = await this.passwordReset.requestReset(login, {
        ...(request.sourceAddress === undefined ? {} : { sourceAddress: request.sourceAddress }),
      });
      const sourceFingerprint = this.sourceFingerprint(request);
      await this.audit.recordBestEffort(passwordResetRequestedAudit({
        ...(sourceFingerprint === undefined ? {} : { sourceFingerprint }),
      }));
      return result;
    } catch (error) {
      const sourceFingerprint = this.sourceFingerprint(request);
      await this.audit.recordBestEffort(passwordResetRequestedAudit({
        throttled: error instanceof ScolaApiError && error.code === 'PASSWORD_RESET_THROTTLED',
        ...(sourceFingerprint === undefined ? {} : { sourceFingerprint }),
      }));
      throw error;
    }
  }

  public async resetPassword(
    request: IdentityHttpRequestContext,
    token: string,
    newPassword: string,
  ): Promise<void> {
    const security = resolveRequestSecurity(request, this.options);
    assertPublicBrowserMutationOrigin(request, security.expectedOrigin, false);
    try {
      await this.passwordReset.resetPassword(token, newPassword, {
        ...(request.sourceAddress === undefined ? {} : { sourceAddress: request.sourceAddress }),
      });
      const sourceFingerprint = this.sourceFingerprint(request);
      await this.audit.recordBestEffort(passwordResetResultAudit({
        outcome: 'success', reasonCode: 'completed',
        ...(sourceFingerprint === undefined ? {} : { sourceFingerprint }),
      }));
    } catch (error) {
      const throttled = error instanceof ScolaApiError && error.code === 'PASSWORD_RESET_THROTTLED';
      const sourceFingerprint = this.sourceFingerprint(request);
      await this.audit.recordBestEffort(passwordResetResultAudit({
        outcome: throttled ? 'denied' : 'failure',
        reasonCode: throttled ? 'source-throttled' : 'invalid-or-expired',
        ...(sourceFingerprint === undefined ? {} : { sourceFingerprint }),
      }));
      throw error;
    }
  }
}
