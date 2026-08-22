import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  HealthCheckService,
  createFilesystemWriteHealthProbe,
  createProviderHealthProbe,
  createRuntimeHealthProbe,
} from './index.js';

describe('health-check service', () => {
  it('aggregates critical and optional provider state without exposing arbitrary errors', async () => {
    const root = await mkdtemp(join(tmpdir(), 'school-health-'));
    try {
      const service = new HealthCheckService([
        createRuntimeHealthProbe(),
        createFilesystemWriteHealthProbe(root),
        createProviderHealthProbe('database', true, async () => ({
          state: 'healthy',
          summary: 'Database provider is reachable.',
          details: { latencyMs: 4 },
        })),
        createProviderHealthProbe('mail', false, async () => ({
          state: 'unknown',
          summary: 'Mail is not configured.',
        })),
      ]);

      const snapshot = await service.snapshot();
      expect(snapshot.state).toBe('degraded');
      expect(snapshot.checks).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: 'runtime', state: 'healthy' }),
          expect.objectContaining({ id: 'filesystem-write', state: 'healthy' }),
        ]),
      );
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('fails overall health when a critical provider fails', async () => {
    const service = new HealthCheckService([
      createProviderHealthProbe('database', true, async () => {
        throw new Error('contains internal connection detail');
      }),
    ]);

    const snapshot = await service.snapshot();
    expect(snapshot.state).toBe('unhealthy');
    expect(snapshot.checks[0]).toMatchObject({
      id: 'database',
      state: 'unhealthy',
      summary: 'Health probe failed.',
    });
  });

  it('aborts timed-out provider work instead of only abandoning the response', async () => {
    let aborted = false;
    const service = new HealthCheckService(
      [
        createProviderHealthProbe('database', true, async (signal) => {
          await new Promise<void>((resolve) => {
            signal.addEventListener(
              'abort',
              () => {
                aborted = true;
                resolve();
              },
              { once: true },
            );
          });
          return { state: 'healthy', summary: 'Provider stopped after cancellation.' };
        }),
      ],
      { defaultTimeoutMs: 5 },
    );

    const snapshot = await service.snapshot();
    expect(aborted).toBe(true);
    expect(snapshot.checks[0]).toMatchObject({
      state: 'unhealthy',
      summary: 'Health probe timed out.',
    });
  });

  it('rejects duplicate probe identities', () => {
    expect(() =>
      new HealthCheckService([createRuntimeHealthProbe(), createRuntimeHealthProbe()]),
    ).toThrow('Duplicate health probe ID: runtime');
  });
});
