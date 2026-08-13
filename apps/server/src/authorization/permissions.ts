export const PERMISSION_CATALOG_VERSION = 1 as const;

export const PERMISSION_CATALOG = [
  {
    id: 'system.users.read',
    area: 'system',
    description: 'Read user accounts and memberships.',
  },
  {
    id: 'system.users.manage',
    area: 'system',
    description: 'Create, update, disable, and invite user accounts.',
  },
  {
    id: 'system.roles.read',
    area: 'system',
    description: 'Read roles, permissions, and assignments.',
  },
  {
    id: 'system.roles.manage',
    area: 'system',
    description: 'Manage roles, permission grants, and role assignments.',
  },
  {
    id: 'system.settings.read',
    area: 'system',
    description: 'Read institution/system settings.',
  },
  {
    id: 'system.settings.manage',
    area: 'system',
    description: 'Change protected institution/system settings.',
  },
  {
    id: 'system.audit.read',
    area: 'system',
    description: 'Read authorized audit events.',
  },
  {
    id: 'system.health.read',
    area: 'system',
    description: 'Read administrative health/diagnostic state.',
  },
  {
    id: 'student.read',
    area: 'student',
    description: 'Read student profiles within the granted scope.',
  },
  {
    id: 'student.create',
    area: 'student',
    description: 'Admit/create students within the granted scope.',
  },
  {
    id: 'student.update',
    area: 'student',
    description: 'Update student profiles within the granted scope.',
  },
  {
    id: 'student.transfer',
    area: 'student',
    description: 'Transfer or withdraw students within the granted scope.',
  },
  {
    id: 'student.documents.read',
    area: 'student',
    description: 'Read authorized private student documents.',
  },
  {
    id: 'student.documents.manage',
    area: 'student',
    description: 'Upload/remove authorized student documents.',
  },
  {
    id: 'guardian.read',
    area: 'guardian',
    description: 'Read guardian/person relationships within the granted scope.',
  },
  {
    id: 'guardian.manage',
    area: 'guardian',
    description: 'Create/update guardian relationships within the granted scope.',
  },
  {
    id: 'staff.read',
    area: 'staff',
    description: 'Read staff profiles within the granted scope.',
  },
  {
    id: 'staff.manage',
    area: 'staff',
    description: 'Create/update staff profiles within the granted scope.',
  },
  {
    id: 'hr.manage',
    area: 'staff',
    description: 'Manage HR workflows within the granted scope.',
  },
  {
    id: 'academics.structure.read',
    area: 'academics',
    description: 'Read classes, sections, subjects, and sessions.',
  },
  {
    id: 'academics.structure.manage',
    area: 'academics',
    description: 'Manage classes, sections, subjects, and sessions.',
  },
  {
    id: 'academics.timetable.read',
    area: 'academics',
    description: 'Read timetable data within the granted scope.',
  },
  {
    id: 'academics.timetable.manage',
    area: 'academics',
    description: 'Manage timetable data within the granted scope.',
  },
  {
    id: 'attendance.student.read',
    area: 'attendance',
    description: 'Read student attendance within the granted scope.',
  },
  {
    id: 'attendance.student.mark',
    area: 'attendance',
    description: 'Mark student attendance within the granted scope.',
  },
  {
    id: 'attendance.student.correct',
    area: 'attendance',
    description: 'Correct protected/locked attendance within the granted scope.',
  },
  {
    id: 'fees.invoice.read',
    area: 'fees',
    description: 'Read fee invoices within the granted scope.',
  },
  {
    id: 'fees.invoice.manage',
    area: 'fees',
    description: 'Create/update fee invoices within the granted scope.',
  },
  {
    id: 'fees.payment.read',
    area: 'fees',
    description: 'Read fee payments within the granted scope.',
  },
  {
    id: 'fees.payment.collect',
    area: 'fees',
    description: 'Record/collect fee payments within the granted scope.',
  },
  {
    id: 'fees.payment.refund',
    area: 'fees',
    description: 'Refund/reverse fee payments within the granted scope.',
  },
  {
    id: 'fees.discount.manage',
    area: 'fees',
    description: 'Manage fee discounts/overrides within the granted scope.',
  },
  {
    id: 'exam.read',
    area: 'exam',
    description: 'Read exams and results within the granted scope.',
  },
  {
    id: 'exam.manage',
    area: 'exam',
    description: 'Create/update exam structures within the granted scope.',
  },
  {
    id: 'exam.marks.update',
    area: 'exam',
    description: 'Enter/update marks within the granted scope.',
  },
  {
    id: 'exam.result.publish',
    area: 'exam',
    description: 'Publish results within the granted scope.',
  },
  {
    id: 'library.read',
    area: 'operations',
    description: 'Read library data.',
  },
  {
    id: 'library.manage',
    area: 'operations',
    description: 'Manage library circulation/catalog.',
  },
  {
    id: 'transport.read',
    area: 'operations',
    description: 'Read transport data.',
  },
  {
    id: 'transport.manage',
    area: 'operations',
    description: 'Manage transport data.',
  },
  {
    id: 'hostel.read',
    area: 'operations',
    description: 'Read hostel data.',
  },
  {
    id: 'hostel.manage',
    area: 'operations',
    description: 'Manage hostel data.',
  },
  {
    id: 'communications.read',
    area: 'communications',
    description: 'Read authorized announcements/messages.',
  },
  {
    id: 'communications.send',
    area: 'communications',
    description: 'Send announcements/messages within the granted scope.',
  },
  {
    id: 'reports.read',
    area: 'reports',
    description: 'Read reports within the granted scope.',
  },
  {
    id: 'reports.export',
    area: 'reports',
    description: 'Export authorized report/list data.',
  },
] as const;

export type PermissionId = (typeof PERMISSION_CATALOG)[number]['id'];
export type PermissionArea = (typeof PERMISSION_CATALOG)[number]['area'];

const permissionIds = new Set<string>(PERMISSION_CATALOG.map((permission) => permission.id));

export const ALL_PERMISSION_IDS = PERMISSION_CATALOG.map(
  (permission) => permission.id,
) as readonly PermissionId[];

export function isPermissionId(value: string): value is PermissionId {
  return permissionIds.has(value);
}

export function getPermissionDefinition(permissionId: PermissionId) {
  const definition = PERMISSION_CATALOG.find((permission) => permission.id === permissionId);
  if (definition === undefined) {
    throw new Error(`Permission catalog invariant failed for ${permissionId}.`);
  }
  return definition;
}
