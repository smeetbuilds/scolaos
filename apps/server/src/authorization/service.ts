import { ScolaApiError } from '../errors.js';
import { isPermissionId, type PermissionId } from './permissions.js';
import { matchesGrantScope } from './scope.js';
import type {
  AuthorizationActor,
  AuthorizationDecision,
  AuthorizationTarget,
  BulkAuthorizationDecision,
} from './types.js';

export function evaluateAuthorization(
  actor: AuthorizationActor<PermissionId>,
  permission: string,
  target: AuthorizationTarget = {},
): AuthorizationDecision {
  if (!actor.enabled) return { allowed: false, reason: 'actor-disabled' };
  if (!isPermissionId(permission)) return { allowed: false, reason: 'permission-unknown' };

  let hasPermissionGrant = false;
  for (const [index, grant] of actor.grants.entries()) {
    if (grant.permission !== permission) continue;
    hasPermissionGrant = true;
    if (matchesGrantScope(grant.scope, actor, target)) {
      return { allowed: true, reason: 'allowed', matchedGrantIndex: index };
    }
  }

  return {
    allowed: false,
    reason: hasPermissionGrant ? 'scope-mismatch' : 'permission-not-granted',
  };
}

export function evaluateBulkAuthorization(
  actor: AuthorizationActor<PermissionId>,
  permission: string,
  targets: readonly AuthorizationTarget[],
): BulkAuthorizationDecision {
  const decisions = targets.map((target) => evaluateAuthorization(actor, permission, target));
  return { allowed: decisions.every((decision) => decision.allowed), decisions };
}

export function authorizeOrThrow(
  actor: AuthorizationActor<PermissionId>,
  permission: string,
  target: AuthorizationTarget = {},
): void {
  if (!evaluateAuthorization(actor, permission, target).allowed) {
    throw new ScolaApiError(
      'PERMISSION_DENIED',
      'You do not have permission to perform this operation.',
      403,
    );
  }
}
