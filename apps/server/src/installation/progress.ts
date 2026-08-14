import { randomUUID } from 'node:crypto';
import { chmod, mkdir, open, readFile, rename, rm } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';

import { ScolaApiError } from '../errors.js';
import type {
  InstallationExecutionPhase,
  InstallationFailure,
  InstallationProgress,
  PublicInstallationProgress,
} from './types.js';

const PROGRESS_SCHEMA_VERSION = 1;
const PROGRESS_FILE = 'installation-progress.json';
const EXECUTION_ORDER: readonly InstallationExecutionPhase[] = [
  'DB_CONNECTED',
  'MIGRATING',
  'SEEDING',
  'VERIFYING',
];
const FAILURE_CODE_PATTERN = /^[A-Z][A-Z0-9_]{2,63}$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function nextPhase(
  completed: InstallationProgress['completedPhase'],
): InstallationExecutionPhase | null {
  if (completed === 'CONFIG_WRITTEN') return 'DB_CONNECTED';
  if (completed === 'DB_CONNECTED') return 'MIGRATING';
  if (completed === 'MIGRATING') return 'SEEDING';
  if (completed === 'SEEDING') return 'VERIFYING';
  return null;
}

function safeMessage(message: string): string {
  const normalized = message.trim();
  if (normalized === '' || normalized.length > 240) {
    throw new ScolaApiError(
      'INSTALLATION_FAILURE_INVALID',
      'Installer failure message is invalid.',
      500,
    );
  }
  if (
    /password|secret|token|authorization|cookie|postgres(?:ql)?:\/\/[^\s@]+@/i.test(
      normalized,
    )
  ) {
    throw new ScolaApiError(
      'INSTALLATION_FAILURE_INVALID',
      'Installer failure details must not contain credentials.',
      500,
    );
  }
  return normalized;
}

function invalidProgress(message = 'Stored installer progress is invalid.'): ScolaApiError {
  return new ScolaApiError('INSTALLATION_PROGRESS_INVALID', message, 500);
}

function parseFailure(value: unknown): InstallationFailure | undefined {
  if (value === undefined) return undefined;
  if (!isRecord(value)) throw invalidProgress();
  if (!EXECUTION_ORDER.includes(value.phase as InstallationExecutionPhase)) {
    throw invalidProgress();
  }
  if (typeof value.code !== 'string' || !FAILURE_CODE_PATTERN.test(value.code)) {
    throw invalidProgress();
  }
  if (
    typeof value.message !== 'string' ||
    typeof value.retryable !== 'boolean' ||
    typeof value.occurredAt !== 'string' ||
    Number.isNaN(Date.parse(value.occurredAt))
  ) {
    throw invalidProgress();
  }
  return {
    phase: value.phase as InstallationExecutionPhase,
    code: value.code,
    message: safeMessage(value.message),
    retryable: value.retryable,
    occurredAt: value.occurredAt,
  };
}

function parseProgress(value: unknown, installationId: string): InstallationProgress {
  if (
    !isRecord(value) ||
    value.schemaVersion !== PROGRESS_SCHEMA_VERSION ||
    value.installationId !== installationId
  ) {
    throw invalidProgress('Stored installer progress does not match the active installation.');
  }

  const completed = value.completedPhase;
  if (
    !['CONFIG_WRITTEN', 'DB_CONNECTED', 'MIGRATING', 'SEEDING', 'VERIFYING'].includes(
      String(completed),
    )
  ) {
    throw invalidProgress();
  }
  if (!['ready', 'running', 'failed'].includes(String(value.state))) {
    throw invalidProgress();
  }
  if (
    typeof value.attempt !== 'number' ||
    !Number.isInteger(value.attempt) ||
    value.attempt < 0 ||
    value.attempt > 10_000
  ) {
    throw invalidProgress();
  }
  if (typeof value.updatedAt !== 'string' || Number.isNaN(Date.parse(value.updatedAt))) {
    throw invalidProgress();
  }

  const active = value.activePhase;
  if (active !== undefined && !EXECUTION_ORDER.includes(active as InstallationExecutionPhase)) {
    throw invalidProgress();
  }
  const failure = parseFailure(value.failure);
  if (value.state === 'ready' && (active !== undefined || failure !== undefined)) {
    throw invalidProgress();
  }
  if (value.state === 'running' && (active === undefined || failure !== undefined)) {
    throw invalidProgress();
  }
  if (
    value.state === 'failed' &&
    (active === undefined || failure === undefined || failure.phase !== active)
  ) {
    throw invalidProgress();
  }

  return {
    schemaVersion: PROGRESS_SCHEMA_VERSION,
    installationId,
    completedPhase: completed as InstallationProgress['completedPhase'],
    state: value.state as InstallationProgress['state'],
    ...(active === undefined ? {} : { activePhase: active as InstallationExecutionPhase }),
    attempt: value.attempt,
    updatedAt: value.updatedAt,
    ...(failure === undefined ? {} : { failure }),
  };
}

async function writeAtomic(path: string, value: InstallationProgress): Promise<void> {
  const directory = dirname(path);
  await mkdir(directory, { recursive: true, mode: 0o700 });
  const temporaryPath = join(
    directory,
    `.${basename(path)}.${process.pid}.${randomUUID()}.tmp`,
  );
  const handle = await open(temporaryPath, 'wx', 0o600);

  try {
    await handle.writeFile(`${JSON.stringify(value, null, 2)}\n`, 'utf8');
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

function initialProgress(installationId: string, now: Date): InstallationProgress {
  return {
    schemaVersion: PROGRESS_SCHEMA_VERSION,
    installationId,
    completedPhase: 'CONFIG_WRITTEN',
    state: 'ready',
    attempt: 0,
    updatedAt: now.toISOString(),
  };
}

export function toPublicInstallationProgress(
  progress: InstallationProgress,
): PublicInstallationProgress {
  return {
    completedPhase: progress.completedPhase,
    state: progress.state,
    ...(progress.activePhase === undefined ? {} : { activePhase: progress.activePhase }),
    attempt: progress.attempt,
    updatedAt: progress.updatedAt,
    ...(progress.failure === undefined ? {} : { failure: progress.failure }),
  };
}

export class InstallationProgressStore {
  public readonly progressPath: string;

  public constructor(
    dataDirectory: string,
    private readonly now: () => Date = () => new Date(),
  ) {
    this.progressPath = join(dataDirectory, PROGRESS_FILE);
  }

  public async read(installationId: string): Promise<InstallationProgress> {
    let raw: string;
    try {
      raw = await readFile(this.progressPath, 'utf8');
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return initialProgress(installationId, this.now());
      }
      throw error;
    }

    try {
      return parseProgress(JSON.parse(raw) as unknown, installationId);
    } catch (error) {
      if (error instanceof SyntaxError) throw invalidProgress();
      throw error;
    }
  }

  public async initialize(installationId: string): Promise<InstallationProgress> {
    const current = await this.read(installationId);
    await writeAtomic(this.progressPath, current);
    return current;
  }

  public async begin(
    installationId: string,
    phase: InstallationExecutionPhase,
  ): Promise<InstallationProgress> {
    const current = await this.read(installationId);
    if (current.state === 'running') {
      throw new ScolaApiError(
        'INSTALLATION_PHASE_RUNNING',
        'Another installation phase is already running.',
        409,
      );
    }
    if (current.state === 'failed') {
      if (current.activePhase !== phase || current.failure?.retryable !== true) {
        throw new ScolaApiError(
          'INSTALLATION_RETRY_NOT_ALLOWED',
          'This failed installation phase cannot be retried automatically.',
          409,
        );
      }
    } else if (nextPhase(current.completedPhase) !== phase) {
      throw new ScolaApiError(
        'INSTALLATION_PHASE_INVALID',
        'Installation phases must run in order.',
        409,
      );
    }

    const next: InstallationProgress = {
      schemaVersion: PROGRESS_SCHEMA_VERSION,
      installationId,
      completedPhase: current.completedPhase,
      state: 'running',
      activePhase: phase,
      attempt: current.attempt + 1,
      updatedAt: this.now().toISOString(),
    };
    await writeAtomic(this.progressPath, next);
    return next;
  }

  public async complete(
    installationId: string,
    phase: InstallationExecutionPhase,
  ): Promise<InstallationProgress> {
    const current = await this.read(installationId);
    if (current.state !== 'running' || current.activePhase !== phase) {
      throw new ScolaApiError(
        'INSTALLATION_PHASE_INVALID',
        'Only the active installation phase can be completed.',
        409,
      );
    }
    const next: InstallationProgress = {
      schemaVersion: PROGRESS_SCHEMA_VERSION,
      installationId,
      completedPhase: phase,
      state: 'ready',
      attempt: current.attempt,
      updatedAt: this.now().toISOString(),
    };
    await writeAtomic(this.progressPath, next);
    return next;
  }

  public async resetBeforeDatabase(installationId: string): Promise<InstallationProgress> {
    const current = await this.read(installationId);
    if (
      current.completedPhase !== 'CONFIG_WRITTEN' ||
      current.state === 'running' ||
      (current.activePhase !== undefined && current.activePhase !== 'DB_CONNECTED')
    ) {
      throw new ScolaApiError(
        'INSTALLATION_RESET_NOT_ALLOWED',
        'Installer progress cannot be reset after database setup has advanced.',
        409,
      );
    }
    const next: InstallationProgress = {
      schemaVersion: PROGRESS_SCHEMA_VERSION,
      installationId,
      completedPhase: 'CONFIG_WRITTEN',
      state: 'ready',
      attempt: current.attempt,
      updatedAt: this.now().toISOString(),
    };
    await writeAtomic(this.progressPath, next);
    return next;
  }

  public async fail(
    installationId: string,
    phase: InstallationExecutionPhase,
    input: { readonly code: string; readonly message: string; readonly retryable: boolean },
  ): Promise<InstallationProgress> {
    const current = await this.read(installationId);
    if (current.state !== 'running' || current.activePhase !== phase) {
      throw new ScolaApiError(
        'INSTALLATION_PHASE_INVALID',
        'Only the active installation phase can fail.',
        409,
      );
    }
    if (!FAILURE_CODE_PATTERN.test(input.code)) {
      throw new ScolaApiError(
        'INSTALLATION_FAILURE_INVALID',
        'Installer failure code is invalid.',
        500,
      );
    }

    const failure: InstallationFailure = {
      phase,
      code: input.code,
      message: safeMessage(input.message),
      retryable: input.retryable,
      occurredAt: this.now().toISOString(),
    };
    const next: InstallationProgress = {
      schemaVersion: PROGRESS_SCHEMA_VERSION,
      installationId,
      completedPhase: current.completedPhase,
      state: 'failed',
      activePhase: phase,
      attempt: current.attempt,
      updatedAt: this.now().toISOString(),
      failure,
    };
    await writeAtomic(this.progressPath, next);
    return next;
  }
}

export function currentInstallationPhase(progress: InstallationProgress) {
  return progress.activePhase ?? progress.completedPhase;
}
