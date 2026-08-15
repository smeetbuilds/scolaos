import { describe, expect, it } from 'vitest';

import { HealthAdminService, projectHealthAdminView, projectPublicReadiness } from './admin.js';
import type { HealthSnapshot } from './types.js';

const snapshot: HealthSnapshot = {
  state: 'degraded',
  observedAt: '2026-08-15T10:00:00.000Z',
  checks: [
    { id: 'mail', critical: false, state: 'degraded', summary: 'Mail delayed.', observedAt: '2026-08-15T10:00:00.000Z', latencyMs: 3 },
    { id: 'database', critical: true, state: 'healthy', summary: 'Database ready.', observedAt: '2026-08-15T10:00:00.000Z', latencyMs: 2 },
  ],
};

describe('health admin projection', () => {
  it('sorts critical checks first and keeps degraded-but-ready semantics for noncritical failures', () => {
    const view = projectHealthAdminView(snapshot);
    expect(view.ready).toBe(true);
    expect(view.checks.map((check) => check.id)).toEqual(['database', 'mail']);
    expect(view.counts).toEqual({ healthy: 1, degraded: 1, unhealthy: 0, unknown: 0 });
    expect(projectPublicReadiness(snapshot)).toEqual({ status: 'degraded', observedAt: snapshot.observedAt });
  });

  it('marks a critical unhealthy/unknown dependency unavailable', () => {
    const criticalFailure: HealthSnapshot = {
      state: 'unhealthy',
      observedAt: snapshot.observedAt,
      checks: [{ id: 'database', critical: true, state: 'unknown', summary: 'No response.', observedAt: snapshot.observedAt, latencyMs: 100 }],
    };
    expect(projectHealthAdminView(criticalFailure).ready).toBe(false);
    expect(projectPublicReadiness(criticalFailure).status).toBe('unavailable');
  });

  it('loads a fresh snapshot for each admin/readiness request', async () => {
    let calls = 0;
    const service = new HealthAdminService({ snapshot: async () => { calls += 1; return snapshot; } });
    await service.adminView();
    await service.publicReadiness();
    expect(calls).toBe(2);
  });
});
