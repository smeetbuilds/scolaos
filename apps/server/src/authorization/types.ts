export const SCOPE_DIMENSIONS = [
  'institution',
  'branch',
  'academicSession',
  'classSection',
  'subject',
] as const;

export type ScopeDimension = (typeof SCOPE_DIMENSIONS)[number];

export interface DimensionScope {
  readonly kind: 'dimensions';
  readonly institutionId?: string;
  readonly branchId?: string;
  readonly academicSessionId?: string;
  readonly classSectionId?: string;
  readonly subjectId?: string;
}

export interface GlobalScope {
  readonly kind: 'global';
}

export interface OwnRecordScope {
  readonly kind: 'own-record';
}

export interface LinkedChildrenScope {
  readonly kind: 'linked-children';
}

export type GrantScope = GlobalScope | DimensionScope | OwnRecordScope | LinkedChildrenScope;

export interface PermissionGrant<PermissionId extends string = string> {
  readonly permission: PermissionId;
  readonly scope: GrantScope;
}

export interface AuthorizationActor<PermissionId extends string = string> {
  readonly userId: string;
  readonly enabled: boolean;
  readonly grants: readonly PermissionGrant<PermissionId>[];
  /** Trusted student profile owned by this user, if the user is a student. */
  readonly ownStudentId?: string;
  /** Trusted student IDs linked to this user as a guardian. */
  readonly linkedStudentIds?: readonly string[];
}

export interface AuthorizationTarget {
  readonly institutionId?: string;
  readonly branchId?: string;
  readonly academicSessionId?: string;
  readonly classSectionId?: string;
  readonly subjectId?: string;
  readonly studentId?: string;
  /** Stable owning user for user-owned resources that are not represented by studentId. */
  readonly resourceOwnerUserId?: string;
}

export type AuthorizationDecisionReason =
  | 'allowed'
  | 'actor-disabled'
  | 'permission-unknown'
  | 'permission-not-granted'
  | 'scope-mismatch';

export interface AuthorizationDecision {
  readonly allowed: boolean;
  readonly reason: AuthorizationDecisionReason;
  readonly matchedGrantIndex?: number;
}

export interface BulkAuthorizationDecision {
  readonly allowed: boolean;
  readonly decisions: readonly AuthorizationDecision[];
}
