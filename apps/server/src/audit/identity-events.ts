import type { AuditEventDraft } from './types.js';

export type AuthenticationAuditTransport = 'browser-cookie' | 'native-bearer';

interface AuditRequestContext {
  readonly requestId?: string;
  readonly institutionId?: string;
  readonly branchId?: string;
}

interface LoginSuccessAuditInput extends AuditRequestContext {
  readonly userId: string;
  readonly sessionId: string;
  readonly transport: AuthenticationAuditTransport;
}

interface LoginRejectedAuditInput extends AuditRequestContext {
  readonly transport: AuthenticationAuditTransport;
  readonly reasonCode: 'invalid-credentials' | 'account-throttled' | 'source-throttled' | 'https-required' | 'request-rejected';
  readonly sourceFingerprint?: string;
}

interface LogoutAuditInput extends AuditRequestContext {
  readonly userId: string;
  readonly sessionId: string;
  readonly transport: AuthenticationAuditTransport;
}

interface PasswordResetRequestAuditInput {
  readonly requestId?: string;
  readonly sourceFingerprint?: string;
  readonly throttled?: boolean;
}

interface PasswordResetResultAuditInput extends AuditRequestContext {
  readonly userId?: string;
  readonly outcome: 'success' | 'failure' | 'denied';
  readonly reasonCode?: 'invalid-or-expired' | 'source-throttled' | 'completed';
  readonly sourceFingerprint?: string;
}

interface InstallerBootstrapAuditInput {
  readonly installationId: string;
  readonly institutionId?: string;
  readonly outcome: 'success' | 'failure';
  readonly requestId?: string;
  readonly reasonCode?: string;
}

function optionalScope(input: AuditRequestContext): Pick<AuditEventDraft, 'institutionId' | 'branchId' | 'requestId'> {
  return {
    ...(input.institutionId === undefined ? {} : { institutionId: input.institutionId }),
    ...(input.branchId === undefined ? {} : { branchId: input.branchId }),
    ...(input.requestId === undefined ? {} : { requestId: input.requestId }),
  };
}

export function loginSucceededAudit(input: LoginSuccessAuditInput): AuditEventDraft {
  return {
    ...optionalScope(input),
    actor: { type: 'user', userId: input.userId },
    action: 'auth.login.success',
    resource: { type: 'session', id: input.sessionId },
    outcome: 'success',
    source: 'api',
    metadata: { transport: input.transport },
  };
}

export function loginRejectedAudit(input: LoginRejectedAuditInput): AuditEventDraft {
  return {
    ...optionalScope(input),
    actor: { type: 'system', name: 'authentication' },
    action: input.reasonCode === 'account-throttled' || input.reasonCode === 'source-throttled'
      ? 'auth.login.denied'
      : 'auth.login.failure',
    outcome: input.reasonCode === 'account-throttled' || input.reasonCode === 'source-throttled' ? 'denied' : 'failure',
    source: 'api',
    reason: input.reasonCode,
    metadata: {
      transport: input.transport,
      ...(input.sourceFingerprint === undefined ? {} : { sourceFingerprint: input.sourceFingerprint }),
    },
  };
}

export function logoutSucceededAudit(input: LogoutAuditInput): AuditEventDraft {
  return {
    ...optionalScope(input),
    actor: { type: 'user', userId: input.userId },
    action: 'auth.logout.success',
    resource: { type: 'session', id: input.sessionId },
    outcome: 'success',
    source: 'api',
    metadata: { transport: input.transport },
  };
}

export function passwordResetRequestedAudit(input: PasswordResetRequestAuditInput): AuditEventDraft {
  return {
    ...(input.requestId === undefined ? {} : { requestId: input.requestId }),
    actor: { type: 'system', name: 'password-reset' },
    action: input.throttled === true ? 'auth.passwordreset.denied' : 'auth.passwordreset.request',
    outcome: input.throttled === true ? 'denied' : 'success',
    source: 'api',
    ...(input.throttled === true ? { reason: 'source-throttled' } : {}),
    metadata: {
      ...(input.sourceFingerprint === undefined ? {} : { sourceFingerprint: input.sourceFingerprint }),
    },
  };
}

export function passwordResetResultAudit(input: PasswordResetResultAuditInput): AuditEventDraft {
  return {
    ...optionalScope(input),
    actor: input.userId === undefined
      ? { type: 'system', name: 'password-reset' }
      : { type: 'user', userId: input.userId },
    action: input.outcome === 'success'
      ? 'auth.passwordreset.success'
      : input.outcome === 'denied'
        ? 'auth.passwordreset.denied'
        : 'auth.passwordreset.failure',
    outcome: input.outcome,
    source: 'api',
    ...(input.reasonCode === undefined ? {} : { reason: input.reasonCode }),
    metadata: {
      ...(input.sourceFingerprint === undefined ? {} : { sourceFingerprint: input.sourceFingerprint }),
    },
  };
}

export function installerBootstrapAudit(input: InstallerBootstrapAuditInput): AuditEventDraft {
  return {
    ...(input.institutionId === undefined ? {} : { institutionId: input.institutionId }),
    ...(input.requestId === undefined ? {} : { requestId: input.requestId }),
    actor: { type: 'installer', installationId: input.installationId },
    action: input.outcome === 'success' ? 'installer.bootstrap.success' : 'installer.bootstrap.failure',
    ...(input.institutionId === undefined ? {} : { resource: { type: 'institution', id: input.institutionId } }),
    outcome: input.outcome,
    source: 'installer',
    ...(input.reasonCode === undefined ? {} : { reason: input.reasonCode }),
  };
}
