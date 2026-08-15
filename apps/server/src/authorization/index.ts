export {
  ALL_PERMISSION_IDS,
  PERMISSION_CATALOG,
  PERMISSION_CATALOG_VERSION,
  getPermissionDefinition,
  isPermissionId,
  type PermissionArea,
  type PermissionId,
} from './permissions.js';
export {
  DEFAULT_ROLE_TEMPLATES,
  DEFAULT_ROLE_TEMPLATE_VERSION,
  getDefaultRoleTemplate,
  grantsFromRoleTemplate,
  type DefaultRoleKey,
  type DefaultRoleScopeStrategy,
  type DefaultRoleTemplate,
} from './roles.js';
export { matchesDimensionScope, matchesGrantScope } from './scope.js';
export { authorizeOrThrow, evaluateAuthorization, evaluateBulkAuthorization } from './service.js';
export {
  actorHasPotentialPermission,
  DEFAULT_NAVIGATION_CATALOG,
  projectNavigation,
  validateNavigationCatalog,
  type NavigationItemDefinition,
  type NavigationSectionDefinition,
  type ProjectedNavigationItem,
  type ProjectedNavigationSection,
} from './navigation.js';
export {
  AuthorizationHttpApplication,
  defineProtectedOperation,
  type AuthorizationAuditPort,
  type AuthorizationRequestInput,
  type AuthorizedOperationRequest,
  type BulkAuthorizationRequestInput,
  type ProtectedOperationPolicy,
} from './http-application.js';
export { AuthorizationPolicyRegistry } from './policy-registry.js';
export {
  assertAuthorizationAttackMatrix,
  runAuthorizationAttackMatrix,
  type AuthorizationAttackCase,
  type AuthorizationAttackResult,
} from './security-matrix.js';
export type {
  AuthorizationActor,
  AuthorizationDecision,
  AuthorizationDecisionReason,
  AuthorizationTarget,
  BulkAuthorizationDecision,
  DimensionScope,
  GlobalScope,
  GrantScope,
  LinkedChildrenScope,
  OwnRecordScope,
  PermissionGrant,
  ScopeDimension,
} from './types.js';
