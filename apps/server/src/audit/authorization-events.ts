import type { AuditEventDraft } from './types.js';
import type { AuthorizationDecisionReason } from '../authorization/types.js';
import type { PermissionId } from '../authorization/permissions.js';

export interface AuthorizationDeniedAuditInput {
  readonly userId: string;
  readonly operationId: string;
  readonly permission: PermissionId;
  readonly reasonCode: Exclude<AuthorizationDecisionReason, 'allowed'>;
  readonly targetCount: number;
  readonly requestId?: string;
  readonly institutionId?: string;
  readonly branchId?: string;
}

export function authorizationDeniedAudit(input: AuthorizationDeniedAuditInput): AuditEventDraft {
  if (!Number.isSafeInteger(input.targetCount) || input.targetCount < 1 || input.targetCount > 10_000) {
    throw new Error('Authorization denied audit targetCount is invalid.');
  }
  return {
    actor: { type: 'user', userId: input.userId },
    action: 'authorization.denied',
    outcome: 'denied',
    source: 'api',
    reason: input.reasonCode,
    ...(input.requestId === undefined ? {} : { requestId: input.requestId }),
    ...(input.institutionId === undefined ? {} : { institutionId: input.institutionId }),
    ...(input.branchId === undefined ? {} : { branchId: input.branchId }),
    metadata: {
      operationId: input.operationId,
      permission: input.permission,
      targetCount: input.targetCount,
      reasonCode: input.reasonCode,
    },
  };
}
