import { describe, expect, it } from 'vitest';

import type { AuditEvent } from '../audit/types.js';
import { OperationsAdminApplication } from './admin-application.js';

const REQUEST = { method: 'GET', directProtocol: 'https' as const, hostname: 'school.example' };
const EVENT: AuditEvent = {
  id: 'evt-1', occurredAt: '2026-08-15T10:00:00.000Z', actor: { type: 'user', userId: 'user-2' }, action: 'student.read', outcome: 'success', source: 'api', institutionId: 'inst-1', branchId: 'branch-1',
};

function app() {
  const authorizeCalls: unknown[] = [];
  const queryCalls: unknown[] = [];
  const auditDrafts: unknown[] = [];
  const instance = new OperationsAdminApplication(
    {
      authorizeSingle: async (input) => {
        authorizeCalls.push(input);
        return { principal: { actor: { userId: 'admin-1' } } } as never;
      },
    },
    {
      page: async (input) => { queryCalls.push(input); return { items: [EVENT] }; },
      export: async (input) => { queryCalls.push(input); return [EVENT]; },
    },
    { adminView: async () => ({ state: 'healthy', ready: true, observedAt: '2026-08-15T10:00:00.000Z', counts: { healthy: 1, degraded: 0, unhealthy: 0, unknown: 0 }, checks: [] }) },
    { recordBestEffort: async (draft) => { auditDrafts.push(draft); } },
  );
  return { instance, authorizeCalls, queryCalls, auditDrafts };
}

describe('operations admin application', () => {
  it('forces the authorized institution/branch into audit queries', async () => {
    const { instance, queryCalls } = app();
    await instance.listAudit({ request: REQUEST, target: { institutionId: 'inst-1', branchId: 'branch-1' }, query: { actionPrefix: 'student.' } });
    expect(queryCalls[0]).toMatchObject({ institutionId: 'inst-1', branchId: 'branch-1', actionPrefix: 'student.' });
  });

  it('rejects a filter that attempts to escape the authorized target', async () => {
    const { instance, queryCalls } = app();
    await expect(instance.listAudit({ request: REQUEST, target: { institutionId: 'inst-1' }, query: { institutionId: 'inst-2' } })).rejects.toMatchObject({ code: 'AUDIT_SCOPE_INVALID', statusCode: 403 });
    expect(queryCalls).toHaveLength(0);
  });

  it('records a safe success audit when an authorized CSV export completes', async () => {
    const { instance, auditDrafts } = app();
    const csv = await instance.exportAuditCsv({ request: REQUEST, target: { institutionId: 'inst-1' }, filters: {} });
    expect(csv).toContain('student.read');
    expect(auditDrafts).toEqual([
      expect.objectContaining({
        action: 'operations.audit.exported',
        actor: { type: 'user', userId: 'admin-1' },
        institutionId: 'inst-1',
        metadata: { exportedEventCount: 1 },
      }),
    ]);
  });

  it('requires the dedicated system health permission through authorization', async () => {
    const { instance, authorizeCalls } = app();
    await instance.healthView({ request: REQUEST, target: { institutionId: 'inst-1' } });
    expect(authorizeCalls[0]).toMatchObject({ policy: { id: 'operations.health.read', permission: 'system.health.read' } });
  });
});
