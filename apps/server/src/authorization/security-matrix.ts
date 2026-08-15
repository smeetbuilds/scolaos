import type { PermissionId } from './permissions.js';
import { evaluateAuthorization, evaluateBulkAuthorization } from './service.js';
import type { AuthorizationActor, AuthorizationTarget } from './types.js';

export interface AuthorizationAttackCase {
  readonly id: string;
  readonly permission: PermissionId;
  readonly actor: AuthorizationActor<PermissionId>;
  readonly targets: readonly AuthorizationTarget[];
  readonly expectedAllowed: boolean;
}

export interface AuthorizationAttackResult {
  readonly id: string;
  readonly passed: boolean;
  readonly actualAllowed: boolean;
}

export function runAuthorizationAttackMatrix(cases: readonly AuthorizationAttackCase[]): readonly AuthorizationAttackResult[] {
  const ids = new Set<string>();
  return cases.map((testCase) => {
    if (!/^[a-z][a-z0-9-]{2,95}$/.test(testCase.id) || ids.has(testCase.id)) {
      throw new Error(`Authorization attack case ${testCase.id} is invalid or duplicated.`);
    }
    ids.add(testCase.id);
    if (testCase.targets.length === 0) throw new Error(`Authorization attack case ${testCase.id} has no targets.`);
    const actualAllowed = testCase.targets.length === 1
      ? evaluateAuthorization(testCase.actor, testCase.permission, testCase.targets[0]).allowed
      : evaluateBulkAuthorization(testCase.actor, testCase.permission, testCase.targets).allowed;
    return { id: testCase.id, actualAllowed, passed: actualAllowed === testCase.expectedAllowed };
  });
}

export function assertAuthorizationAttackMatrix(cases: readonly AuthorizationAttackCase[]): void {
  const failed = runAuthorizationAttackMatrix(cases).filter((result) => !result.passed);
  if (failed.length > 0) {
    throw new Error(`Authorization attack matrix failed: ${failed.map((result) => result.id).join(', ')}.`);
  }
}
