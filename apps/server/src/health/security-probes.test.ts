import { describe, expect, it } from 'vitest';

import {
  createDiskCapacityHealthProbe,
  createInstallationSecurityHealthProbe,
  createRuntimeSupportHealthProbe,
} from './security-probes.js';

describe('operational security health probes', () => {
  it('validates installed configuration without exposing secret values', async () => {
    const healthy = await createInstallationSecurityHealthProbe(async () => ({
      bootState: 'installed', phase: 'INSTALLED', baseUrl: 'https://school.example',
      sessionSecretLength: 43, installerSecretLength: 43,
    })).check();
    expect(healthy.state).toBe('healthy');
    expect(JSON.stringify(healthy)).not.toContain('secret-value');

    const bad = await createInstallationSecurityHealthProbe(async () => ({
      bootState: 'installed', phase: 'INSTALLED', baseUrl: 'http://school.example',
      sessionSecretLength: 10, installerSecretLength: 43,
    })).check();
    expect(bad).toMatchObject({ state: 'unhealthy' });
    expect(bad.details).toMatchObject({ baseUrlSecure: false, sessionSecretConfigured: false });
  });

  it('reports runtime support against the locked production matrix', async () => {
    expect((await createRuntimeSupportHealthProbe(() => ({ nodeVersion: 'v24.1.0', platform: 'linux', arch: 'x64' })).check()).state).toBe('healthy');
    expect((await createRuntimeSupportHealthProbe(() => ({ nodeVersion: 'v22.16.0', platform: 'linux', arch: 'x64' })).check()).state).toBe('unhealthy');
    expect((await createRuntimeSupportHealthProbe(() => ({ nodeVersion: 'v24.1.0', platform: 'darwin', arch: 'arm64' })).check()).state).toBe('unhealthy');
  });

  it('uses explicit low-disk thresholds and only reports bounded available-byte metadata', async () => {
    const degraded = await createDiskCapacityHealthProbe('/data', {
      degradedBelowBytes: 2_000, unhealthyBelowBytes: 500,
      stat: async () => ({ bavail: 1_500, bsize: 1 }),
    }).check();
    expect(degraded).toMatchObject({ state: 'degraded', details: { availableBytes: 1_500 } });
  });
});
