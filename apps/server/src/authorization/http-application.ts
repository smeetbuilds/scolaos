import type { AuditEventDraft } from '../audit/types.js';
import { authorizationDeniedAudit } from '../audit/authorization-events.js';
import { ScolaApiError } from '../errors.js';
import type { AuthorizedHttpRequest, IdentityHttpApplication } from '../identity/http-application.js';
import type { IdentityHttpRequestContext } from '../identity/http-boundary.js';
import { isPermissionId, type PermissionId } from './permissions.js';
import { evaluateAuthorization, evaluateBulkAuthorization } from './service.js';
import type { AuthorizationDecision, AuthorizationTarget } from './types.js';

const OPERATION_ID_PATTERN = /^[a-z][a-z0-9]*(?:[.-][a-z0-9]+){1,7}$/;

export interface ProtectedOperationPolicy {
  readonly id: string;
  readonly permission: PermissionId;
  readonly targetMode: 'single' | 'bulk';
}

export interface AuthorizationAuditPort {
  recordBestEffort(draft: AuditEventDraft): Promise<unknown>;
}

export interface AuthorizationRequestInput {
  readonly request: IdentityHttpRequestContext;
  readonly policy: ProtectedOperationPolicy;
  readonly target: AuthorizationTarget;
  readonly requestId?: string;
}

export interface BulkAuthorizationRequestInput {
  readonly request: IdentityHttpRequestContext;
  readonly policy: ProtectedOperationPolicy;
  readonly targets: readonly AuthorizationTarget[];
  readonly requestId?: string;
}

export interface AuthorizedOperationRequest extends AuthorizedHttpRequest {
  readonly policy: ProtectedOperationPolicy;
}

function deniedError(): ScolaApiError {
  return new ScolaApiError('PERMISSION_DENIED', 'You do not have permission to perform this operation.', 403);
}

function validatePolicy(policy: ProtectedOperationPolicy, expectedMode?: ProtectedOperationPolicy['targetMode']): void {
  if (!OPERATION_ID_PATTERN.test(policy.id)) throw new Error(`Authorization operation ID ${policy.id} is invalid.`);
  if (!isPermissionId(policy.permission)) throw new Error(`Authorization operation ${policy.id} references an unknown permission.`);
  if (expectedMode !== undefined && policy.targetMode !== expectedMode) {
    throw new Error(`Authorization operation ${policy.id} must use ${expectedMode} target mode.`);
  }
}

function auditScope(targets: readonly AuthorizationTarget[]): { institutionId?: string; branchId?: string } {
  const institutionIds = new Set(targets.map((target) => target.institutionId).filter((value): value is string => value !== undefined));
  const branchIds = new Set(targets.map((target) => target.branchId).filter((value): value is string => value !== undefined));
  return {
    ...(institutionIds.size === 1 ? { institutionId: [...institutionIds][0]! } : {}),
    ...(branchIds.size === 1 ? { branchId: [...branchIds][0]! } : {}),
  };
}

function firstDenied(decisions: readonly AuthorizationDecision[]): AuthorizationDecision | undefined {
  return decisions.find((decision) => !decision.allowed);
}

export class AuthorizationHttpApplication {
  public constructor(
    private readonly identity: Pick<IdentityHttpApplication, 'authorize'>,
    private readonly audit: AuthorizationAuditPort,
  ) {}

  private async recordDenied(
    authenticated: AuthorizedHttpRequest,
    policy: ProtectedOperationPolicy,
    reason: AuthorizationDecision['reason'],
    targets: readonly AuthorizationTarget[],
    requestId: string | undefined,
  ): Promise<void> {
    if (reason === 'allowed') throw new Error('Allowed authorization decisions cannot be recorded as denied.');
    const scope = auditScope(targets);
    await this.audit.recordBestEffort(authorizationDeniedAudit({
      userId: authenticated.principal.actor.userId,
      operationId: policy.id,
      permission: policy.permission,
      reasonCode: reason,
      targetCount: targets.length,
      ...(requestId === undefined ? {} : { requestId }),
      ...scope,
    }));
  }

  public async authorizeSingle(input: AuthorizationRequestInput, now = new Date()): Promise<AuthorizedOperationRequest> {
    validatePolicy(input.policy, 'single');
    const authenticated = await this.identity.authorize(input.request, 'normal', now);
    const decision = evaluateAuthorization(authenticated.principal.actor, input.policy.permission, input.target);
    if (!decision.allowed) {
      await this.recordDenied(authenticated, input.policy, decision.reason, [input.target], input.requestId);
      throw deniedError();
    }
    return { ...authenticated, policy: input.policy };
  }

  public async authorizeBulk(input: BulkAuthorizationRequestInput, now = new Date()): Promise<AuthorizedOperationRequest> {
    validatePolicy(input.policy, 'bulk');
    if (input.targets.length === 0 || input.targets.length > 10_000) {
      throw new ScolaApiError('AUTHORIZATION_TARGETS_INVALID', 'Authorization targets are invalid.', 400);
    }
    const authenticated = await this.identity.authorize(input.request, 'normal', now);
    const decision = evaluateBulkAuthorization(authenticated.principal.actor, input.policy.permission, input.targets);
    const denied = firstDenied(decision.decisions);
    if (!decision.allowed) {
      if (denied === undefined || denied.reason === 'allowed') throw new Error('Bulk authorization invariant failed.');
      await this.recordDenied(authenticated, input.policy, denied.reason, input.targets, input.requestId);
      throw deniedError();
    }
    return { ...authenticated, policy: input.policy };
  }
}

export function defineProtectedOperation(policy: ProtectedOperationPolicy): ProtectedOperationPolicy {
  validatePolicy(policy);
  return Object.freeze({ ...policy });
}
