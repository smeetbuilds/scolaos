import { describe, expect, it } from 'vitest';
import { assertAuthorizationAttackMatrix, runAuthorizationAttackMatrix } from './security-matrix.js';
import type { AuthorizationActor } from './types.js';
import type { PermissionId } from './permissions.js';

const branchActor: AuthorizationActor<PermissionId> = {
  userId: 'staff-1', enabled: true,
  grants: [{ permission: 'student.read', scope: { kind: 'dimensions', institutionId: 'inst-1', branchId: 'branch-a' } }],
};
const guardian: AuthorizationActor<PermissionId> = {
  userId: 'guardian-1', enabled: true, linkedStudentIds: ['student-1'],
  grants: [{ permission: 'student.read', scope: { kind: 'linked-children' } }],
};

describe('authorization attack matrix', () => {
  const cases = [
    { id: 'allowed-branch', permission: 'student.read' as const, actor: branchActor, targets: [{ institutionId: 'inst-1', branchId: 'branch-a' }], expectedAllowed: true },
    { id: 'wrong-institution', permission: 'student.read' as const, actor: branchActor, targets: [{ institutionId: 'inst-2', branchId: 'branch-a' }], expectedAllowed: false },
    { id: 'wrong-branch', permission: 'student.read' as const, actor: branchActor, targets: [{ institutionId: 'inst-1', branchId: 'branch-b' }], expectedAllowed: false },
    { id: 'partial-bulk-escape', permission: 'student.read' as const, actor: branchActor, targets: [{ institutionId: 'inst-1', branchId: 'branch-a' }, { institutionId: 'inst-1', branchId: 'branch-b' }], expectedAllowed: false },
    { id: 'linked-child', permission: 'student.read' as const, actor: guardian, targets: [{ studentId: 'student-1' }], expectedAllowed: true },
    { id: 'wrong-linked-child', permission: 'student.read' as const, actor: guardian, targets: [{ studentId: 'student-2' }], expectedAllowed: false },
    { id: 'disabled-actor', permission: 'student.read' as const, actor: { ...branchActor, enabled: false }, targets: [{ institutionId: 'inst-1', branchId: 'branch-a' }], expectedAllowed: false },
  ];

  it('passes the maintained unauthorized access cases', () => {
    expect(() => assertAuthorizationAttackMatrix(cases)).not.toThrow();
    expect(runAuthorizationAttackMatrix(cases).every((result) => result.passed)).toBe(true);
  });

  it('rejects duplicate attack case IDs', () => {
    expect(() => runAuthorizationAttackMatrix([cases[0]!, cases[0]!])).toThrow(/duplicated/i);
  });
});
