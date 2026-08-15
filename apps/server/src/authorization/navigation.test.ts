import { describe, expect, it } from 'vitest';
import { actorHasPotentialPermission, projectNavigation, validateNavigationCatalog } from './navigation.js';
import type { AuthorizationActor } from './types.js';
import type { PermissionId } from './permissions.js';

const actor: AuthorizationActor<PermissionId> = {
  userId: 'teacher-1', enabled: true,
  grants: [
    { permission: 'student.read', scope: { kind: 'dimensions', institutionId: 'inst-1', branchId: 'branch-a' } },
    { permission: 'system.health.read', scope: { kind: 'global' } },
  ],
};

describe('permission-aware navigation projection', () => {
  it('projects only items backed by potentially usable permission grants', () => {
    const navigation = projectNavigation(actor);
    const ids = navigation.flatMap((section) => section.items.map((item) => item.id));
    expect(ids).toContain('students');
    expect(ids).toContain('health');
    expect(ids).not.toContain('roles');
    expect(ids).not.toContain('fees');
  });

  it('does not expose empty dimension grants or linked-child navigation without linked children', () => {
    expect(actorHasPotentialPermission({ ...actor, grants: [{ permission: 'student.read', scope: { kind: 'dimensions' } }] }, 'student.read')).toBe(false);
    expect(projectNavigation({ userId: 'guardian-1', enabled: true, linkedStudentIds: [], grants: [{ permission: 'student.read', scope: { kind: 'linked-children' } }] })).toEqual([]);
  });

  it('does not use role names and hides everything for a disabled actor', () => {
    expect(projectNavigation({ ...actor, enabled: false })).toEqual([]);
  });

  it('rejects duplicate navigation IDs and unsafe hrefs', () => {
    expect(() => validateNavigationCatalog([{ id: 'admin', label: 'Admin', items: [{ id: 'users', label: 'Users', href: '//evil.example', permissions: ['system.users.read'] }] }])).toThrow(/href/i);
    expect(() => validateNavigationCatalog([
      { id: 'one', label: 'One', items: [{ id: 'same', label: 'A', href: '/a', permissions: ['system.users.read'] }] },
      { id: 'two', label: 'Two', items: [{ id: 'same', label: 'B', href: '/b', permissions: ['system.roles.read'] }] },
    ])).toThrow(/duplicated/i);
  });
});
