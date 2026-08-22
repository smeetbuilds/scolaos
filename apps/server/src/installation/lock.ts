import { randomUUID } from 'node:crypto';
import { mkdir, open, readFile, unlink } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import { ScolaApiError } from '../errors.js';

const STALE_LOCK_AGE_MS = 30 * 60 * 1000;

export interface InstallerLockMetadata {
  readonly token: string;
  readonly pid: number;
  readonly acquiredAt: string;
}

export interface InstallerLockHandle {
  readonly metadata: InstallerLockMetadata;
  release(): Promise<void>;
}

function processIsAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return (error as NodeJS.ErrnoException).code === 'EPERM';
  }
}

function parseLockMetadata(value: unknown): InstallerLockMetadata | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return null;
  }
  const record = value as Record<string, unknown>;
  if (
    typeof record.token !== 'string' ||
    record.token === '' ||
    !Number.isSafeInteger(record.pid) ||
    Number(record.pid) < 1 ||
    typeof record.acquiredAt !== 'string' ||
    Number.isNaN(Date.parse(record.acquiredAt))
  ) {
    return null;
  }
  return {
    token: record.token,
    pid: Number(record.pid),
    acquiredAt: record.acquiredAt,
  };
}

export class InstallerLock {
  public readonly path: string;

  public constructor(dataDirectory: string) {
    this.path = join(dataDirectory, 'installer.lock');
  }

  private async removeStaleLock(): Promise<boolean> {
    let current: InstallerLockMetadata | null;
    try {
      current = parseLockMetadata(JSON.parse(await readFile(this.path, 'utf8')) as unknown);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return true;
      }
      return false;
    }

    if (current === null) {
      return false;
    }
    const ageMs = Date.now() - Date.parse(current.acquiredAt);
    if (ageMs < STALE_LOCK_AGE_MS || processIsAlive(current.pid)) {
      return false;
    }

    try {
      const latest = parseLockMetadata(JSON.parse(await readFile(this.path, 'utf8')) as unknown);
      if (latest?.token !== current.token) {
        return false;
      }
      await unlink(this.path);
      return true;
    } catch (error) {
      return (error as NodeJS.ErrnoException).code === 'ENOENT';
    }
  }

  public async acquire(): Promise<InstallerLockHandle> {
    await mkdir(dirname(this.path), { recursive: true, mode: 0o700 });
    const metadata: InstallerLockMetadata = {
      token: randomUUID(),
      pid: process.pid,
      acquiredAt: new Date().toISOString(),
    };

    let handle: Awaited<ReturnType<typeof open>> | undefined;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        handle = await open(this.path, 'wx', 0o600);
        break;
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
          throw error;
        }
        if (attempt === 0 && (await this.removeStaleLock())) {
          continue;
        }
        throw new ScolaApiError(
          'INSTALLER_LOCKED',
          'Another installation operation is already in progress.',
          409,
        );
      }
    }

    if (handle === undefined) {
      throw new ScolaApiError(
        'INSTALLER_LOCKED',
        'Another installation operation is already in progress.',
        409,
      );
    }

    try {
      await handle.writeFile(`${JSON.stringify(metadata)}\n`, 'utf8');
      await handle.sync();
      await handle.close();
    } catch (error) {
      await handle.close().catch(() => undefined);
      await unlink(this.path).catch(() => undefined);
      throw error;
    }

    let released = false;
    return {
      metadata,
      release: async () => {
        if (released) {
          return;
        }
        released = true;

        try {
          const current = JSON.parse(
            await readFile(this.path, 'utf8'),
          ) as Partial<InstallerLockMetadata>;
          if (current.token === metadata.token) {
            await unlink(this.path);
          }
        } catch (error) {
          if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
            throw error;
          }
        }
      },
    };
  }
}
