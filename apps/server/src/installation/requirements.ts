import { randomBytes } from 'node:crypto';
import { mkdir, open, rm, statfs } from 'node:fs/promises';
import { join } from 'node:path';

import { classifyServerBaseUrl } from '../base-url.js';
import { isSupportedNodeVersion, parseNodeMajor, SUPPORTED_NODE_MAJORS } from '../platform-support.js';

export type RequirementState = 'pass' | 'warn' | 'fail';

export interface RequirementCheck {
  readonly id: string;
  readonly state: RequirementState;
  readonly blocking: boolean;
  readonly summary: string;
  readonly details?: Readonly<Record<string, string | number | boolean | null>>;
}

export interface RequirementsSnapshot {
  readonly state: 'ready' | 'warning' | 'blocked';
  readonly checkedAt: string;
  readonly checks: readonly RequirementCheck[];
}

export interface InstallerRequirementsOptions {
  readonly dataDirectory: string;
  readonly storageDirectory?: string;
  readonly tempDirectory?: string;
  readonly detectedBaseUrl?: string;
  readonly nodeVersion?: string;
  readonly minimumFreeDiskBytes?: number;
  readonly now?: () => Date;
}

const DEFAULT_MINIMUM_FREE_DISK_BYTES = 1024 * 1024 * 1024;

function runtimeCheck(version: string): RequirementCheck {
  const major = parseNodeMajor(version);
  if (!isSupportedNodeVersion(version)) {
    return {
      id: 'runtime-node',
      state: 'fail',
      blocking: true,
      summary: `Node.js ${SUPPORTED_NODE_MAJORS.join(', ')}.x is required by this release.`,
      details: { detectedMajor: major ?? -1 },
    };
  }
  return {
    id: 'runtime-node',
    state: 'pass',
    blocking: true,
    summary: 'Node.js runtime is supported.',
    details: { detectedMajor: major ?? -1 },
  };
}

function cryptoCheck(): RequirementCheck {
  try {
    if (randomBytes(32).length !== 32) throw new Error('entropy unavailable');
    return {
      id: 'runtime-crypto',
      state: 'pass',
      blocking: true,
      summary: 'Cryptographic random-byte generation is available.',
    };
  } catch {
    return {
      id: 'runtime-crypto',
      state: 'fail',
      blocking: true,
      summary: 'Required cryptographic random-byte generation is unavailable.',
    };
  }
}

async function writableDirectoryCheck(id: string, directory: string): Promise<RequirementCheck> {
  let probePath: string | undefined;
  try {
    await mkdir(directory, { recursive: true, mode: 0o700 });
    probePath = join(directory, `.installer-write-probe-${process.pid}-${Date.now()}`);
    const handle = await open(probePath, 'wx', 0o600);
    try {
      await handle.writeFile('ok\n', 'utf8');
      await handle.sync();
    } finally {
      await handle.close();
    }
    await rm(probePath, { force: true });
    return { id, state: 'pass', blocking: true, summary: 'Directory is writable.' };
  } catch {
    if (probePath !== undefined) await rm(probePath, { force: true }).catch(() => undefined);
    return { id, state: 'fail', blocking: true, summary: 'Directory is not safely writable.' };
  }
}

async function diskCheck(directory: string, minimumBytes: number): Promise<RequirementCheck> {
  try {
    await mkdir(directory, { recursive: true, mode: 0o700 });
    const fs = await statfs(directory);
    const availableBytes = Number(fs.bavail) * Number(fs.bsize);
    const availableMiB = Math.max(0, Math.floor(availableBytes / (1024 * 1024)));
    if (!Number.isFinite(availableBytes) || availableBytes < minimumBytes) {
      return {
        id: 'disk-space',
        state: 'warn',
        blocking: false,
        summary: 'Available disk space is below the recommended installer threshold.',
        details: { availableMiB },
      };
    }
    return {
      id: 'disk-space',
      state: 'pass',
      blocking: false,
      summary: 'Available disk space meets the installer recommendation.',
      details: { availableMiB },
    };
  } catch {
    return {
      id: 'disk-space',
      state: 'warn',
      blocking: false,
      summary: 'Available disk space could not be determined.',
    };
  }
}

function baseUrlCheck(value: string | undefined): RequirementCheck {
  if (value === undefined || value.trim() === '') {
    return {
      id: 'https-base-url',
      state: 'warn',
      blocking: false,
      summary: 'Server base URL has not been detected yet.',
    };
  }

  const classification = classifyServerBaseUrl(value);
  if (classification === 'secure') {
    return {
      id: 'https-base-url',
      state: 'pass',
      blocking: false,
      summary: 'HTTPS is detected for the server base URL.',
    };
  }
  if (classification === 'local-http') {
    return {
      id: 'https-base-url',
      state: 'warn',
      blocking: false,
      summary: 'HTTP is acceptable for local installation; use HTTPS before remote access.',
    };
  }
  if (classification === 'insecure-http') {
    return {
      id: 'https-base-url',
      state: 'fail',
      blocking: true,
      summary: 'HTTPS is required before remote installation can continue.',
    };
  }
  return {
    id: 'https-base-url',
    state: 'warn',
    blocking: false,
    summary: 'Server base URL could not be safely classified.',
  };
}

export class InstallerRequirementsService {
  private readonly now: () => Date;
  private readonly nodeVersion: string;
  private readonly storageDirectory: string;
  private readonly tempDirectory: string;
  private readonly minimumFreeDiskBytes: number;

  public constructor(private readonly options: InstallerRequirementsOptions) {
    this.now = options.now ?? (() => new Date());
    this.nodeVersion = options.nodeVersion ?? process.versions.node;
    this.storageDirectory = options.storageDirectory ?? join(options.dataDirectory, 'storage');
    this.tempDirectory = options.tempDirectory ?? join(options.dataDirectory, 'tmp');
    this.minimumFreeDiskBytes = options.minimumFreeDiskBytes ?? DEFAULT_MINIMUM_FREE_DISK_BYTES;
  }

  public async check(): Promise<RequirementsSnapshot> {
    const checks = await Promise.all([
      Promise.resolve(runtimeCheck(this.nodeVersion)),
      Promise.resolve(cryptoCheck()),
      writableDirectoryCheck('data-directory', this.options.dataDirectory),
      writableDirectoryCheck('storage-directory', this.storageDirectory),
      writableDirectoryCheck('temp-directory', this.tempDirectory),
      diskCheck(this.options.dataDirectory, this.minimumFreeDiskBytes),
      Promise.resolve(baseUrlCheck(this.options.detectedBaseUrl)),
    ]);
    const blocked = checks.some((check) => check.blocking && check.state === 'fail');
    const warning = checks.some((check) => check.state === 'warn');
    return {
      state: blocked ? 'blocked' : warning ? 'warning' : 'ready',
      checkedAt: this.now().toISOString(),
      checks,
    };
  }
}
