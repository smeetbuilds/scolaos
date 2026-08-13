import { describe, expect, it } from 'vitest';

import { ScolaApiError } from '../errors.js';
import {
  ALL_PERMISSION_IDS,
  DEFAULT_ROLE_TEMPLATES,
  PERMISSION_CATALOG,
  authorizeOrThrow,
  evaluateAuthorization,
  evaluateBulkAuthorization,
  getDefaultRoleTemplate,
  grantsFromRoleTemplate,
  type AuthorizationActor,
  type PermissionId,
} from './index.js';

describe('authorization foundation', () => {
  it('keeps permission and role catalogs internally consistent', () => {
    expect(new Set(PERMISSION_CATALOG.map((permission) => permission.id)).size).toBe(
      PERMISSION_CATALOG.length,
    );
    expect(new Set(DEFAULT_ROLE_TEMPLATES.map((role) => role.key)).size).toBe(
      DEFAULT_ROLE_TEMPLATES.length,
    );
    for (const role of DEFAULT_ROLE_TEMPLATES) {
      expect(new Set(role.permissions).size).toBe(role.permissions.length);
      for (const permission of role.permissions) expect(ALL_PERMISSION_IDS).toContain(permission);
    }
    expect(new Set(getDefaultRoleTemplate('super-administrator').permissions)).toEqual(
      new Set(ALL_PERMISSION_IDS),
    );
  });

  it('rejects role-template scope escalation', () => {
    expect(() =>
      grantsFromRoleTemplate(getDefaultRoleTemplate('teacher'), { kind: 'global' }),
    ).toThrowError('Scope is incompatible with default role template teacher.');
    expect(() =>
      grantsFromRoleTemplate(getDefaultRoleTemplate('student'), {
        kind: 'dimensions',
        institutionId: 'inst-a',
      }),
    ).toThrowError('Scope is incompatible with default role template student.');
  });

  it('fails closed for empty or incomplete dimension scopes', () => {
    const actor: AuthorizationActor<PermissionId> = {
      userId: 'teacher-42',
      enabled: true,
      grants: [
        { permission: 'student.read', scope: { kind: 'dimensions' } },
        {
          permission: 'attendance.student.mark',
          scope: {
            kind: 'dimensions',
            institutionId: 'inst-a',
            classSectionId: 'class-8a',
            subjectId: 'math',
          },
        },
      ],
    };
    expect(evaluateAuthorization(actor, 'student.read', { institutionId: 'inst-a' })).toMatchObject({
      allowed: false,
      reason: 'scope-mismatch',
    });
    expect(
      evaluateAuthorization(actor, 'attendance.student.mark', {
        institutionId: 'inst-a',
        subjectId: 'math',
      }),
    ).toMatchObject({ allowed: false, reason: 'scope-mismatch' });
    expect(
      evaluateAuthorization(actor, 'attendance.student.mark', {
        institutionId: 'inst-a',
        classSectionId: 'class-8a',
        subjectId: 'math',
      }),
    ).toMatchObject({ allowed: true, reason: 'allowed' });
  });

  it('denies disabled actors, unknown permissions, and missing grants', () => {
    const actor: AuthorizationActor<PermissionId> = {
      userId: 'teacher-42',
      enabled: false,
      grants: [{ permission: 'student.read', scope: { kind: 'global' } }],
    };
    expect(evaluateAuthorization(actor, 'student.read')).toEqual({
      allowed: false,
      reason: 'actor-disabled',
    });
    const enabled = { ...actor, enabled: true } satisfies AuthorizationActor<PermissionId>;
    expect(evaluateAuthorization(enabled, 'not.real').reason).toBe('permission-unknown');
    expect(evaluateAuthorization(enabled, 'system.roles.manage').reason).toBe(
      'permission-not-granted',
    );
  });

  it('restricts student self-service and guardian access to trusted relationships', () => {
    const student: AuthorizationActor<PermissionId> = {
      userId: 'student-user-1',
      enabled: true,
      ownStudentId: 'student-1',
      grants: grantsFromRoleTemplate(getDefaultRoleTemplate('student'), { kind: 'own-record' }),
    };
    expect(evaluateAuthorization(student, 'student.read', { studentId: 'student-1' }).allowed).toBe(
      true,
    );
    expect(evaluateAuthorization(student, 'student.read', { studentId: 'student-2' }).allowed).toBe(
      false,
    );

    const guardian: AuthorizationActor<PermissionId> = {
      userId: 'guardian-1',
      enabled: true,
      linkedStudentIds: ['student-1', 'student-2'],
      grants: grantsFromRoleTemplate(getDefaultRoleTemplate('guardian'), {
        kind: 'linked-children',
      }),
    };
    expect(evaluateAuthorization(guardian, 'exam.read', { studentId: 'student-2' }).allowed).toBe(
      true,
    );
    expect(evaluateAuthorization(guardian, 'exam.read', { studentId: 'student-3' }).allowed).toBe(
      false,
    );
    expect(evaluateAuthorization(guardian, 'exam.read', {}).allowed).toBe(false);
  });

  it('requires every bulk target and throws a generic 403 at the boundary', () => {
    const guardian: AuthorizationActor<PermissionId> = {
      userId: 'guardian-1',
      enabled: true,
      linkedStudentIds: ['student-1'],
      grants: [{ permission: 'student.read', scope: { kind: 'linked-children' } }],
    };
    expect(
      evaluateBulkAuthorization(guardian, 'student.read', [
        { studentId: 'student-1' },
        { studentId: 'student-2' },
      ]).allowed,
    ).toBe(false);

    const actor: AuthorizationActor<PermissionId> = { userId: 'teacher-42', enabled: true, grants: [] };
    expect(() => authorizeOrThrow(actor, 'system.roles.manage')).toThrowError(
      expect.objectContaining<Partial<ScolaApiError>>({
        code: 'PERMISSION_DENIED',
        statusCode: 403,
        message: 'You do not have permission to perform this operation.',
      }),
    );
  });
});
