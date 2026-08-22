import { randomUUID } from 'node:crypto';
import { mkdir, open, rm } from 'node:fs/promises';
import { join } from 'node:path';

import type { HealthProbe } from './types.js';

export function createRuntimeHealthProbe(): HealthProbe {
  return {
    id: 'runtime',
    critical: true,
    async check(signal) {
      signal.throwIfAborted();
      return {
        state: 'healthy',
        summary: 'Node.js runtime is operational.',
        details: {
          nodeVersion: process.versions.node,
          platform: process.platform,
          arch: process.arch,
          uptimeSeconds: Math.floor(process.uptime()),
        },
      };
    },
  };
}

export function createFilesystemWriteHealthProbe(directory: string): HealthProbe {
  return {
    id: 'filesystem-write',
    critical: true,
    async check(signal) {
      signal.throwIfAborted();
      await mkdir(directory, { recursive: true, mode: 0o700 });
      signal.throwIfAborted();
      const path = join(directory, `.health-${randomUUID()}`);
      const handle = await open(path, 'wx', 0o600);
      try {
        signal.throwIfAborted();
        await handle.writeFile('ok\n', 'utf8');
        await handle.sync();
      } finally {
        await handle.close();
        await rm(path, { force: true });
      }
      signal.throwIfAborted();
      return { state: 'healthy', summary: 'Application data directory is writable.' };
    },
  };
}

export function createProviderHealthProbe(
  id: string,
  critical: boolean,
  check: HealthProbe['check'],
  timeoutMs?: number,
): HealthProbe {
  return { id, critical, check, ...(timeoutMs === undefined ? {} : { timeoutMs }) };
}
