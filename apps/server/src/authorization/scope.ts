import type {
  AuthorizationActor,
  AuthorizationTarget,
  DimensionScope,
  GrantScope,
} from './types.js';

function matchesOptionalDimension(
  granted: string | undefined,
  actual: string | undefined,
): boolean {
  if (granted === undefined) {
    return true;
  }
  return actual !== undefined && actual === granted;
}

export function matchesDimensionScope(scope: DimensionScope, target: AuthorizationTarget): boolean {
  const hasConstraint =
    scope.institutionId !== undefined ||
    scope.branchId !== undefined ||
    scope.academicSessionId !== undefined ||
    scope.classSectionId !== undefined ||
    scope.subjectId !== undefined;

  if (!hasConstraint) {
    return false;
  }

  return (
    matchesOptionalDimension(scope.institutionId, target.institutionId) &&
    matchesOptionalDimension(scope.branchId, target.branchId) &&
    matchesOptionalDimension(scope.academicSessionId, target.academicSessionId) &&
    matchesOptionalDimension(scope.classSectionId, target.classSectionId) &&
    matchesOptionalDimension(scope.subjectId, target.subjectId)
  );
}

export function matchesGrantScope(
  scope: GrantScope,
  actor: AuthorizationActor,
  target: AuthorizationTarget,
): boolean {
  switch (scope.kind) {
    case 'global':
      return true;
    case 'dimensions':
      return matchesDimensionScope(scope, target);
    case 'own-record':
      if (target.resourceOwnerUserId !== undefined) {
        return target.resourceOwnerUserId === actor.userId;
      }
      return actor.ownStudentId !== undefined && target.studentId === actor.ownStudentId;
    case 'linked-children':
      return (
        target.studentId !== undefined &&
        actor.linkedStudentIds !== undefined &&
        actor.linkedStudentIds.includes(target.studentId)
      );
  }
}
