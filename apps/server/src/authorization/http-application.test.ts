import { describe, expect, it } from 'vitest';
import { AuthorizationHttpApplication, defineProtectedOperation } from './http-application.js';
import type { AuthorizationActor } from './types.js';
import type { PermissionId } from './permissions.js';

const actor: AuthorizationActor<PermissionId> = {
  userId: 'user-1', enabled: true,
  grants: [{ permission: 'student.read', scope: { kind: 'dimensions', institutionId: 'inst-1', branchId: 'branch-a' } }],
};
const identity = { authorize: async () => ({ principal: { actor }, credential: { token: 'opaque' } }) };

describe('authorization HTTP application', () => {
  it('allows a scoped request and returns authenticated context', async () => {
    const app = new AuthorizationHttpApplication(identity as never, { recordBestEffort: async () => undefined });
    const policy = defineProtectedOperation({ id: 'students.profile.read', permission: 'student.read', targetMode: 'single' });
    await expect(app.authorizeSingle({ request: { method: 'GET' } as never, policy, target: { institutionId: 'inst-1', branchId: 'branch-a' } })).resolves.toMatchObject({ policy });
  });

  it('returns the same generic denial while preserving the scope reason only in audit metadata', async () => {
    const drafts: any[] = [];
    const app = new AuthorizationHttpApplication(identity as never, { recordBestEffort: async (draft) => { drafts.push(draft); } });
    const policy = defineProtectedOperation({ id: 'students.profile.read', permission: 'student.read', targetMode: 'single' });
    await expect(app.authorizeSingle({ request: { method: 'GET' } as never, policy, target: { institutionId: 'inst-1', branchId: 'branch-b' }, requestId: 'req-1' })).rejects.toMatchObject({ code: 'PERMISSION_DENIED', statusCode: 403, message: 'You do not have permission to perform this operation.' });
    expect(drafts[0]?.metadata).toMatchObject({ operationId: 'students.profile.read', permission: 'student.read', reasonCode: 'scope-mismatch', targetCount: 1 });
  });

  it('fails the entire bulk operation when one target is outside scope', async () => {
    const app = new AuthorizationHttpApplication(identity as never, { recordBestEffort: async () => undefined });
    const policy = defineProtectedOperation({ id: 'students.bulk.read', permission: 'student.read', targetMode: 'bulk' });
    await expect(app.authorizeBulk({ request: { method: 'POST' } as never, policy, targets: [
      { institutionId: 'inst-1', branchId: 'branch-a' },
      { institutionId: 'inst-1', branchId: 'branch-b' },
    ] })).rejects.toMatchObject({ code: 'PERMISSION_DENIED', statusCode: 403 });
  });

  it('rejects empty bulk targets and target-mode misuse', async () => {
    const app = new AuthorizationHttpApplication(identity as never, { recordBestEffort: async () => undefined });
    const bulk = defineProtectedOperation({ id: 'students.bulk.read', permission: 'student.read', targetMode: 'bulk' });
    await expect(app.authorizeBulk({ request: { method: 'POST' } as never, policy: bulk, targets: [] })).rejects.toMatchObject({ code: 'AUTHORIZATION_TARGETS_INVALID', statusCode: 400 });
    await expect(app.authorizeSingle({ request: { method: 'GET' } as never, policy: bulk, target: {} })).rejects.toThrow(/single target mode/i);
  });
});
