import { mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { InstallationProgressStore } from './progress.js';
import { InstallerRequirementsService } from './requirements.js';
import { InstallationService } from './service.js';
import type { PostInstallVerificationProvider } from './verification.js';

const roots: string[] = [];

async function temporaryDirectory(prefix: string): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), prefix));
  roots.push(root);
  return root;
}

const validInput = {
  baseUrl: 'https://school.example',
  database: {
    host: 'db.internal',
    port: 5432,
    database: 'school',
    user: 'school_admin',
    password: 'db-secret-value',
    sslMode: 'verify-full' as const,
  },
};

const passingVerificationProvider: PostInstallVerificationProvider = {
  async checkDatabaseConnectivity() {
    return { ok: true, summary: 'Database is reachable.' };
  },
  async checkMigrationsCurrent() {
    return { ok: true, summary: 'Migrations are current.' };
  },
  async checkPermissionSeed() {
    return { ok: true, summary: 'Permission seed is present.' };
  },
  async checkBootstrapData() {
    return { ok: true, summary: 'Institution and administrator are present.' };
  },
};

async function advanceThroughSeed(service: InstallationService): Promise<void> {
  await service.beginPhase('DB_CONNECTED');
  await service.completePhase('DB_CONNECTED');
  await service.beginPhase('MIGRATING');
  await service.completePhase('MIGRATING');
  await service.beginPhase('SEEDING');
  await service.completePhase('SEEDING');
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe('installer requirements diagnostics', () => {
  it('classifies supported runtime/filesystem/TLS requirements without exposing paths', async () => {
    const root = await temporaryDirectory('scola-requirements-');
    const snapshot = await new InstallerRequirementsService({
      dataDirectory: join(root, 'data'),
      nodeVersion: '24.7.0',
      detectedBaseUrl: 'https://school.example',
      minimumFreeDiskBytes: 1,
      now: () => new Date('2026-08-14T00:00:00.000Z'),
    }).check();

    expect(snapshot.state).toBe('ready');
    expect(snapshot.checks.map((check) => check.id)).toEqual([
      'runtime-node',
      'runtime-crypto',
      'data-directory',
      'storage-directory',
      'temp-directory',
      'disk-space',
      'https-base-url',
    ]);
    expect(JSON.stringify(snapshot)).not.toContain(root);
  });

  it('blocks an unsupported Node major and a remote HTTP deployment URL', async () => {
    const snapshot = await new InstallerRequirementsService({
      dataDirectory: await temporaryDirectory('scola-requirements-blocked-'),
      nodeVersion: '22.16.0',
      detectedBaseUrl: 'http://school.example',
      minimumFreeDiskBytes: 1,
    }).check();

    expect(snapshot.state).toBe('blocked');
    expect(snapshot.checks.find((check) => check.id === 'runtime-node')).toMatchObject({
      state: 'fail',
      blocking: true,
    });
    expect(snapshot.checks.find((check) => check.id === 'https-base-url')).toMatchObject({
      state: 'fail',
      blocking: true,
    });
  });

  it('keeps localhost HTTP available for explicit local development only', async () => {
    const snapshot = await new InstallerRequirementsService({
      dataDirectory: await temporaryDirectory('scola-requirements-local-'),
      nodeVersion: '24.7.0',
      detectedBaseUrl: 'http://localhost:3000',
      minimumFreeDiskBytes: 1,
    }).check();
    expect(snapshot.checks.find((check) => check.id === 'https-base-url')).toMatchObject({
      state: 'warn',
      blocking: false,
    });
  });
});

describe('durable installer progress and recovery', () => {
  it('persists ordered phases, records safe failures, and allows a retry of the same phase', async () => {
    const root = await temporaryDirectory('scola-progress-');
    const store = new InstallationProgressStore(root, () => new Date('2026-08-14T01:00:00.000Z'));
    const installationId = 'installation-1';

    await store.initialize(installationId);
    await store.begin(installationId, 'DB_CONNECTED');
    const failed = await store.fail(installationId, 'DB_CONNECTED', {
      code: 'DB_CONNECTION_FAILED',
      message: 'Database connection failed safely.',
      retryable: true,
    });

    expect(failed.state).toBe('failed');
    expect(failed.failure).toMatchObject({ phase: 'DB_CONNECTED', retryable: true });

    const retry = await store.begin(installationId, 'DB_CONNECTED');
    expect(retry).toMatchObject({ state: 'running', activePhase: 'DB_CONNECTED', attempt: 2 });
    await store.complete(installationId, 'DB_CONNECTED');

    await expect(store.begin(installationId, 'SEEDING')).rejects.toMatchObject({
      code: 'INSTALLATION_PHASE_INVALID',
    });

    if (process.platform !== 'win32') {
      expect((await stat(store.progressPath)).mode & 0o777).toBe(0o600);
    }
  });

  it('fails closed for corrupt or mismatched progress metadata', async () => {
    const root = await temporaryDirectory('scola-progress-invalid-');
    const store = new InstallationProgressStore(root);
    await store.initialize('installation-a');
    await expect(store.read('installation-b')).rejects.toMatchObject({
      code: 'INSTALLATION_PROGRESS_INVALID',
    });
  });

  it('recovers an old installer lock only after its recorded process is no longer alive', async () => {
    const root = await temporaryDirectory('scola-stale-lock-');
    const service = new InstallationService(root);
    await writeFile(
      service.lock.path,
      `${JSON.stringify({
        token: 'stale-lock-token',
        pid: 2_147_483_647,
        acquiredAt: '2000-01-01T00:00:00.000Z',
      })}\n`,
      'utf8',
    );

    const handle = await service.lock.acquire();
    expect(handle.metadata.token).not.toBe('stale-lock-token');
    await handle.release();
  });
});

describe('safe configuration correction', () => {
  it('preserves installation identity/secrets before DB connection and locks edits afterwards', async () => {
    const root = await temporaryDirectory('scola-config-recovery-');
    const service = new InstallationService(root);
    const original = await service.writeInitialConfig(validInput);

    await service.beginPhase('DB_CONNECTED');
    await service.failPhase('DB_CONNECTED', {
      code: 'DB_CONNECTION_FAILED',
      message: 'Database connection failed safely.',
      retryable: false,
    });

    const replacement = await service.replacePendingConfig({
      ...validInput,
      baseUrl: 'https://school-new.example',
      database: { ...validInput.database, host: 'db-new.internal', password: 'replacement-secret' },
    });

    expect(replacement.installationId).toBe(original.installationId);
    expect(replacement.security).toEqual(original.security);
    expect(replacement.database.host).toBe('db-new.internal');
    expect(await readFile(service.store.configPath, 'utf8')).toContain('replacement-secret');

    await service.beginPhase('DB_CONNECTED');
    await service.completePhase('DB_CONNECTED');
    await expect(service.replacePendingConfig(validInput)).rejects.toMatchObject({
      code: 'INSTALLATION_CONFIG_LOCKED',
    });
  });
});

describe('post-install verification and finalization', () => {
  it('will not finalize until migration/seed phases are complete and a verifier is configured', async () => {
    const noVerifier = new InstallationService(await temporaryDirectory('scola-no-verifier-'));
    await noVerifier.writeInitialConfig(validInput);
    await advanceThroughSeed(noVerifier);
    await expect(noVerifier.finalizeInstallation()).rejects.toMatchObject({
      code: 'INSTALLATION_VERIFICATION_UNAVAILABLE',
    });
    await expect(noVerifier.getStatus()).resolves.toMatchObject({ bootState: 'configured' });
  });

  it('marks installed only after all mandatory post-install checks pass', async () => {
    const service = new InstallationService(await temporaryDirectory('scola-verified-'), {
      verificationProvider: passingVerificationProvider,
    });
    await service.writeInitialConfig(validInput);
    await advanceThroughSeed(service);

    const report = await service.finalizeInstallation();
    expect(report).toMatchObject({ ok: true });
    expect(report?.checks).toHaveLength(4);
    await expect(service.getStatus()).resolves.toMatchObject({
      bootState: 'installed',
      phase: 'INSTALLED',
    });
    await expect(service.replacePendingConfig(validInput)).rejects.toMatchObject({
      code: 'INSTALLER_DISABLED',
    });
  });

  it('records a retryable verification failure and leaves the server uninstalled', async () => {
    const service = new InstallationService(await temporaryDirectory('scola-verification-fail-'), {
      verificationProvider: {
        ...passingVerificationProvider,
        async checkMigrationsCurrent() {
          return { ok: false, summary: 'Migration journal is not current.' };
        },
      },
    });
    await service.writeInitialConfig(validInput);
    await advanceThroughSeed(service);

    await expect(service.finalizeInstallation()).rejects.toMatchObject({
      code: 'INSTALLATION_VERIFICATION_FAILED',
    });
    await expect(service.getStatus()).resolves.toMatchObject({
      bootState: 'configured',
      phase: 'VERIFYING',
      progress: {
        state: 'failed',
        activePhase: 'VERIFYING',
        failure: { code: 'POST_INSTALL_VERIFICATION_FAILED', retryable: true },
      },
    });
  });
});
