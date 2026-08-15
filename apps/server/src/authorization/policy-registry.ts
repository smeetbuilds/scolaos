import { defineProtectedOperation, type ProtectedOperationPolicy } from './http-application.js';

export class AuthorizationPolicyRegistry {
  private readonly byId: ReadonlyMap<string, ProtectedOperationPolicy>;

  public constructor(policies: readonly ProtectedOperationPolicy[]) {
    const entries = new Map<string, ProtectedOperationPolicy>();
    for (const policy of policies) {
      const validated = defineProtectedOperation(policy);
      if (entries.has(validated.id)) throw new Error(`Duplicate authorization operation policy: ${validated.id}.`);
      entries.set(validated.id, validated);
    }
    this.byId = entries;
  }

  public get(operationId: string): ProtectedOperationPolicy {
    const policy = this.byId.get(operationId);
    if (policy === undefined) throw new Error(`Authorization operation policy is not registered: ${operationId}.`);
    return policy;
  }

  public has(operationId: string): boolean {
    return this.byId.has(operationId);
  }

  public list(): readonly ProtectedOperationPolicy[] {
    return [...this.byId.values()];
  }
}
