import { isPermissionId, type PermissionId } from './permissions.js';
import type { AuthorizationActor, GrantScope } from './types.js';

export interface NavigationItemDefinition {
  readonly id: string;
  readonly label: string;
  readonly href: string;
  readonly permissions: readonly PermissionId[];
}

export interface NavigationSectionDefinition {
  readonly id: string;
  readonly label: string;
  readonly items: readonly NavigationItemDefinition[];
}

export interface ProjectedNavigationItem {
  readonly id: string;
  readonly label: string;
  readonly href: string;
}

export interface ProjectedNavigationSection {
  readonly id: string;
  readonly label: string;
  readonly items: readonly ProjectedNavigationItem[];
}

const NAV_ID_PATTERN = /^[a-z][a-z0-9-]{1,63}$/;

export const DEFAULT_NAVIGATION_CATALOG: readonly NavigationSectionDefinition[] = [
  {
    id: 'administration',
    label: 'Administration',
    items: [
      { id: 'users', label: 'Users', href: '/admin/users', permissions: ['system.users.read'] },
      { id: 'roles', label: 'Roles & permissions', href: '/admin/roles', permissions: ['system.roles.read'] },
      { id: 'settings', label: 'Settings', href: '/admin/settings', permissions: ['system.settings.read'] },
      { id: 'audit', label: 'Audit log', href: '/admin/audit', permissions: ['system.audit.read'] },
      { id: 'health', label: 'System health', href: '/admin/health', permissions: ['system.health.read'] },
    ],
  },
  {
    id: 'people',
    label: 'People',
    items: [
      { id: 'students', label: 'Students', href: '/students', permissions: ['student.read'] },
      { id: 'guardians', label: 'Guardians', href: '/guardians', permissions: ['guardian.read'] },
      { id: 'staff', label: 'Staff', href: '/staff', permissions: ['staff.read'] },
    ],
  },
  {
    id: 'academics',
    label: 'Academics',
    items: [
      { id: 'academic-structure', label: 'Academic structure', href: '/academics/structure', permissions: ['academics.structure.read'] },
      { id: 'timetable', label: 'Timetable', href: '/academics/timetable', permissions: ['academics.timetable.read'] },
      { id: 'attendance', label: 'Attendance', href: '/attendance', permissions: ['attendance.student.read'] },
      { id: 'exams', label: 'Examinations', href: '/exams', permissions: ['exam.read'] },
    ],
  },
  {
    id: 'finance',
    label: 'Finance',
    items: [
      { id: 'fees', label: 'Fees', href: '/fees', permissions: ['fees.invoice.read', 'fees.payment.read'] },
      { id: 'reports', label: 'Reports', href: '/reports', permissions: ['reports.read'] },
    ],
  },
  {
    id: 'operations',
    label: 'Operations',
    items: [
      { id: 'library', label: 'Library', href: '/library', permissions: ['library.read'] },
      { id: 'transport', label: 'Transport', href: '/transport', permissions: ['transport.read'] },
      { id: 'hostel', label: 'Hostel', href: '/hostel', permissions: ['hostel.read'] },
      { id: 'communications', label: 'Communications', href: '/communications', permissions: ['communications.read'] },
    ],
  },
] as const;

function scopeCanAddressSomething(scope: GrantScope, actor: AuthorizationActor<PermissionId>): boolean {
  switch (scope.kind) {
    case 'global':
      return true;
    case 'dimensions':
      return (
        scope.institutionId !== undefined ||
        scope.branchId !== undefined ||
        scope.academicSessionId !== undefined ||
        scope.classSectionId !== undefined ||
        scope.subjectId !== undefined
      );
    case 'own-record':
      return true;
    case 'linked-children':
      return (actor.linkedStudentIds?.length ?? 0) > 0;
  }
}

export function actorHasPotentialPermission(
  actor: AuthorizationActor<PermissionId>,
  permission: PermissionId,
): boolean {
  if (!actor.enabled) return false;
  return actor.grants.some(
    (grant) => grant.permission === permission && scopeCanAddressSomething(grant.scope, actor),
  );
}

export function validateNavigationCatalog(
  catalog: readonly NavigationSectionDefinition[] = DEFAULT_NAVIGATION_CATALOG,
): void {
  const sectionIds = new Set<string>();
  const itemIds = new Set<string>();
  const hrefs = new Set<string>();

  for (const section of catalog) {
    if (!NAV_ID_PATTERN.test(section.id) || section.label.trim() === '' || sectionIds.has(section.id)) {
      throw new Error(`Navigation section ${section.id} is invalid or duplicated.`);
    }
    sectionIds.add(section.id);
    if (section.items.length === 0) throw new Error(`Navigation section ${section.id} must contain items.`);

    for (const item of section.items) {
      if (!NAV_ID_PATTERN.test(item.id) || item.label.trim() === '' || itemIds.has(item.id)) {
        throw new Error(`Navigation item ${item.id} is invalid or duplicated.`);
      }
      if (!item.href.startsWith('/') || item.href.startsWith('//') || item.href.includes('://') || hrefs.has(item.href)) {
        throw new Error(`Navigation href ${item.href} is invalid or duplicated.`);
      }
      if (item.permissions.length === 0 || item.permissions.some((permission) => !isPermissionId(permission))) {
        throw new Error(`Navigation item ${item.id} references an invalid permission.`);
      }
      itemIds.add(item.id);
      hrefs.add(item.href);
    }
  }
}

export function projectNavigation(
  actor: AuthorizationActor<PermissionId>,
  catalog: readonly NavigationSectionDefinition[] = DEFAULT_NAVIGATION_CATALOG,
): readonly ProjectedNavigationSection[] {
  validateNavigationCatalog(catalog);
  if (!actor.enabled) return [];

  return catalog.flatMap((section) => {
    const items = section.items
      .filter((item) => item.permissions.some((permission) => actorHasPotentialPermission(actor, permission)))
      .map(({ id, label, href }) => ({ id, label, href }));
    return items.length === 0 ? [] : [{ id: section.id, label: section.label, items }];
  });
}

validateNavigationCatalog();
