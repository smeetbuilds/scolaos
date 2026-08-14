import { randomUUID } from 'node:crypto';
import { chmod, open, rename, rm } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';

import { ScolaApiError } from '../errors.js';
import {
  InstallationConfigStore,
  normalizeInstallationConfigInput,
} from './config-store.js';
import type { InstallationConfig, InstallationProgress } from './types.js';

export interface InstallationRecoveryState {
  readonly state: 'not-needed' | 'running' | 'recoverable' | 'manual-intervention';
  readonly phase?: string;
  readonly failureCode?: string;
  readonly message: string;
  readonly canRetry: boolean;
  readonly canEditConfiguration: boolean;
}

function recoveryForFailure(progress: InstallationProgress): InstallationRecoveryState {
  const failure = progress.failure;
  if (failure === undefined || progress.activePhase === undefined) {
    throw new ScolaApiError(
      'INSTALLATION_PROGRESS_INVALID',
      'Failed installer progress is incomplete.',
      500,
    );
  }

  const canEditConfiguration =
    progress.completedPhase === 'CONFIG_WRITTEN' && progress.activePhase === 'DB_CONNECTED';
  return {
    state: failure.retryable || canEditConfiguration ? 'recoverable' : 'manual-intervention',
    phase: progress.activePhase,
    failureCode: failure.code,
    message: failure.message,
    canRetry: failure.retryable,
    canEditConfiguration,
  };
}

export function toInstallationRecoveryState(
  progress: InstallationProgress,
): InstallationRecoveryState {
  if (progress.state === 'failed') return recoveryForFailure(progress);
  if (progress.state === 'running') {
    return {
      state: 'running',
      ...(progress.activePhase === undefined ? {} : { phase: progress.activePhase }),
      message: 'Installation work is currently running.',
      canRetry: false,
      canEditConfiguration: false,
    };
  }
  return {
    state: 'not-needed',
    message: 'No installation recovery action is required.',
    canRetry: false,
    canEditConfiguration: progress.completedPhase === 'CONFIG_WRITTEN',
  };
}

async function writeReplacement(path: string, config: InstallationConfig): Promise<void> {
  const directory = dirname(path);
  const temporaryPath = join(
    directory,
    `.${basename(path)}.${process.pid}.${randomUUID()}.tmp`,
  );
  const handle = await open(temporaryPath, 'wx', 0o600);

  try {
    await handle.writeFile(`${JSON.stringify(config, null, 2)}\n`, 'utf8');
    await handle.sync();
  } catch (error) {
    await handle.close().catch(() => undefined);
    await rm(temporaryPath, { force: true }).catch(() => undefined);
    throw error;
  }

  await handle.close();
  try {
    await rename(temporaryPath, path);
    await chmod(path, 0o600);
  } catch (error) {
    await rm(temporaryPath, { force: true }).catch(() => undefined);
    throw error;
  }
}

export async function replacePendingInstallationConfig(
  store: InstallationConfigStore,
  progress: InstallationProgress,
  value: unknown,
): Promise<InstallationConfig> {
  if (
    progress.completedPhase !== 'CONFIG_WRITTEN' ||
    progress.state === 'running' ||
    (progress.state === 'failed' && progress.activePhase !== 'DB_CONNECTED')
  ) {
    throw new ScolaApiError(
      'INSTALLATION_CONFIG_LOCKED',
      'Installation configuration can no longer be changed after database setup has advanced.',
      409,
    );
  }

  const existing = await store.readConfig();
  if (existing === null || existing.installationId !== progress.installationId) {
    throw new ScolaApiError(
      'BOOT_STATE_INVALID',
      'Active installation configuration is unavailable.',
      500,
    );
  }

  const input = normalizeInstallationConfigInput(value);
  const replacement: InstallationConfig = {
    ...existing,
    ...input,
    database: input.database,
  };
  await writeReplacement(store.configPath, replacement);
  return replacement;
}
