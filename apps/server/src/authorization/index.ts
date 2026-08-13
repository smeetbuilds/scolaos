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
