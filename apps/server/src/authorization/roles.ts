import type { PermissionId } from './permissions.js';
import type { GrantScope, PermissionGrant } from './types.js';

export type DefaultRoleKey =
  | 'super-administrator'
  | 'school-administrator'
  | 'principal'
  | 'teacher'
  | 'accountant'
  | 'hr'
  | 'reception'
  | 'librarian'
  | 'transport-manager'
  | 'hostel-warden'
  | 'student'
  | 'guardian';

export type DefaultRoleScopeStrategy =
  | 'institution'
  | 'assigned'
  | 'own-record'
  | 'linked-children';

export interface DefaultRoleTemplate {
  readonly key: DefaultRoleKey;
  readonly name: string;
  readonly description: string;
  readonly scopeStrategy: DefaultRoleScopeStrategy;
  readonly permissions: readonly PermissionId[];
}

const superAdministratorPermissions: readonly PermissionId[] = [
  'system.users.read',
  'system.users.manage',
  'system.roles.read',
  'system.roles.manage',
  'system.settings.read',
  'system.settings.manage',
  'system.audit.read',
  'system.health.read',
  'student.read',
  'student.create',
  'student.update',
  'student.transfer',
  'student.documents.read',
  'student.documents.manage',
  'guardian.read',
  'guardian.manage',
  'staff.read',
  'staff.manage',
  'hr.manage',
  'academics.structure.read',
  'academics.structure.manage',
  'academics.timetable.read',
  'academics.timetable.manage',
  'attendance.student.read',
  'attendance.student.mark',
  'attendance.student.correct',
  'fees.invoice.read',
  'fees.invoice.manage',
  'fees.payment.read',
  'fees.payment.collect',
  'fees.payment.refund',
  'fees.discount.manage',
  'exam.read',
  'exam.manage',
  'exam.marks.update',
  'exam.result.publish',
  'library.read',
  'library.manage',
  'transport.read',
  'transport.manage',
  'hostel.read',
  'hostel.manage',
  'communications.read',
  'communications.send',
  'reports.read',
  'reports.export',
];

export const DEFAULT_ROLE_TEMPLATE_VERSION = 1 as const;

export const DEFAULT_ROLE_TEMPLATES: readonly DefaultRoleTemplate[] = [
  {
    key: 'super-administrator',
    name: 'Super Administrator',
    description:
      'Initial full-permission template. Runtime authorization still uses explicit grants, not the role name.',
    scopeStrategy: 'institution',
    permissions: superAdministratorPermissions,
  },
  {
    key: 'school-administrator',
    name: 'School Administrator',
    description: 'Institution administration without implicit protected audit/role bypasses.',
    scopeStrategy: 'institution',
    permissions: [
      'system.users.read',
      'system.users.manage',
      'system.roles.read',
      'system.settings.read',
      'system.settings.manage',
      'system.health.read',
      'student.read',
      'student.create',
      'student.update',
      'student.transfer',
      'student.documents.read',
      'student.documents.manage',
      'guardian.read',
      'guardian.manage',
      'staff.read',
      'staff.manage',
      'academics.structure.read',
      'academics.structure.manage',
      'academics.timetable.read',
      'academics.timetable.manage',
      'attendance.student.read',
      'attendance.student.mark',
      'fees.invoice.read',
      'fees.invoice.manage',
      'fees.payment.read',
      'communications.read',
      'communications.send',
      'reports.read',
      'reports.export',
    ],
  },
  {
    key: 'principal',
    name: 'Principal',
    description: 'Academic and operational oversight within the assigned institution/branches.',
    scopeStrategy: 'institution',
    permissions: [
      'student.read',
      'student.update',
      'guardian.read',
      'staff.read',
      'academics.structure.read',
      'academics.timetable.read',
      'academics.timetable.manage',
      'attendance.student.read',
      'attendance.student.mark',
      'attendance.student.correct',
      'fees.invoice.read',
      'fees.payment.read',
      'exam.read',
      'exam.manage',
      'exam.marks.update',
      'exam.result.publish',
      'communications.read',
      'communications.send',
      'reports.read',
      'reports.export',
    ],
  },
  {
    key: 'teacher',
    name: 'Teacher',
    description: 'Teaching workflows restricted to explicitly assigned academic scope.',
    scopeStrategy: 'assigned',
    permissions: [
      'student.read',
      'academics.structure.read',
      'academics.timetable.read',
      'attendance.student.read',
      'attendance.student.mark',
      'exam.read',
      'exam.marks.update',
      'communications.read',
      'reports.read',
    ],
  },
  {
    key: 'accountant',
    name: 'Accountant',
    description: 'Fee and finance operations within assigned institution/branch scope.',
    scopeStrategy: 'institution',
    permissions: [
      'student.read',
      'fees.invoice.read',
      'fees.invoice.manage',
      'fees.payment.read',
      'fees.payment.collect',
      'fees.payment.refund',
      'fees.discount.manage',
      'reports.read',
      'reports.export',
    ],
  },
  {
    key: 'hr',
    name: 'HR',
    description: 'Staff and HR operations within assigned scope.',
    scopeStrategy: 'institution',
    permissions: ['staff.read', 'staff.manage', 'hr.manage', 'reports.read', 'reports.export'],
  },
  {
    key: 'reception',
    name: 'Reception',
    description: 'Front-office student/guardian lookup and intake support.',
    scopeStrategy: 'institution',
    permissions: [
      'student.read',
      'student.create',
      'guardian.read',
      'guardian.manage',
      'communications.read',
    ],
  },
  {
    key: 'librarian',
    name: 'Librarian',
    description: 'Library operations with necessary student lookup.',
    scopeStrategy: 'institution',
    permissions: ['student.read', 'library.read', 'library.manage', 'reports.read'],
  },
  {
    key: 'transport-manager',
    name: 'Transport Manager',
    description: 'Transport operations with necessary student lookup.',
    scopeStrategy: 'institution',
    permissions: ['student.read', 'transport.read', 'transport.manage', 'reports.read'],
  },
  {
    key: 'hostel-warden',
    name: 'Hostel Warden',
    description: 'Hostel operations with necessary student lookup.',
    scopeStrategy: 'institution',
    permissions: ['student.read', 'hostel.read', 'hostel.manage', 'reports.read'],
  },
  {
    key: 'student',
    name: 'Student',
    description: 'Student-facing read access restricted to the actor\'s own student record.',
    scopeStrategy: 'own-record',
    permissions: [
      'student.read',
      'student.documents.read',
      'academics.timetable.read',
      'attendance.student.read',
      'fees.invoice.read',
      'fees.payment.read',
      'exam.read',
      'communications.read',
    ],
  },
  {
    key: 'guardian',
    name: 'Parent / Guardian',
    description: 'Parent-facing read access restricted to trusted linked-child relationships.',
    scopeStrategy: 'linked-children',
    permissions: [
      'student.read',
      'student.documents.read',
      'academics.timetable.read',
      'attendance.student.read',
      'fees.invoice.read',
      'fees.payment.read',
      'exam.read',
      'communications.read',
    ],
  },
] as const;

export function getDefaultRoleTemplate(key: DefaultRoleKey): DefaultRoleTemplate {
  const role = DEFAULT_ROLE_TEMPLATES.find((candidate) => candidate.key === key);
  if (role === undefined) {
    throw new Error(`Default role template not found: ${key}.`);
  }
  return role;
}

function isRoleScopeCompatible(role: DefaultRoleTemplate, scope: GrantScope): boolean {
  switch (role.scopeStrategy) {
    case 'institution':
      return scope.kind === 'dimensions' && scope.institutionId !== undefined;
    case 'assigned':
      return (
        scope.kind === 'dimensions' &&
        scope.institutionId !== undefined &&
        (scope.branchId !== undefined ||
          scope.academicSessionId !== undefined ||
          scope.classSectionId !== undefined ||
          scope.subjectId !== undefined)
      );
    case 'own-record':
      return scope.kind === 'own-record';
    case 'linked-children':
      return scope.kind === 'linked-children';
  }
}

export function grantsFromRoleTemplate(
  role: DefaultRoleTemplate,
  scope: GrantScope,
): readonly PermissionGrant<PermissionId>[] {
  if (!isRoleScopeCompatible(role, scope)) {
    throw new Error(`Scope is incompatible with default role template ${role.key}.`);
  }
  return role.permissions.map((permission) => ({ permission, scope }));
}
