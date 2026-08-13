import { randomUUID } from 'node:crypto';
import { mkdir, open, readFile, unlink } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import { ScolaApiError } from '../errors.js';

export interface InstallerLockMetadata {
  readonly token: string;
  readonly pid: number;
  readonly acquiredAt: string;
}

export interface InstallerLockHandle {
  readonly metadata: InstallerLockMetadata;
  release(): Promise<void>;
}

export class InstallerLock {
  public readonly path: string;

  public constructor(dataDirectory: string) {
    this.path = join(dataDirectory, 'installer.lock');
  }

  public async acquire(): Promise<InstallerLockHandle> {
    await mkdir(dirname(this.path), { recursive: true, mode: 0o700 });
    const metadata: InstallerLockMetadata = {
      token: randomUUID(),
      pid: process.pid,
      acquiredAt: new Date().toISOString(),
    };

    let handle;
    try {
      handle = await open(this.path, 'wx', 0o600);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'EEXIST') {
        throw new ScolaApiError(
          'INSTALLER_LOCKED',
          'Another installation operation is already in progress.',
          409,
        );
      }
      throw error;
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
