import { mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { InstallationConfigStore, toPublicInstallationConfig } from './config-store.js';
import { InstallerCsrf } from './csrf.js';
import { InstallerLock } from './lock.js';
import { redactSensitive, safeErrorForLog } from './redaction.js';
import { InstallationService } from './service.js';

const roots: string[] = [];

async function temporaryDirectory(prefix: string): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), prefix));
  roots.push(root);
  return root;
}

const validInput = {
  baseUrl: 'http://localhost:3000/',
  database: {
    host: '127.0.0.1',
    port: 5432,
    database: 'school',
    user: 'school_admin',
    password: 'db-secret-value',
    sslMode: 'prefer' as const,
  },
};

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe('installation configuration and boot state', () => {
  it('moves from unconfigured to configured to installed without exposing stored secrets', async () => {
    const store = new InstallationConfigStore(await temporaryDirectory('scola-config-'));

    await expect(store.readSnapshot()).resolves.toEqual({
      bootState: 'unconfigured',
      phase: 'UNCONFIGURED',
    });

    const config = await store.writeInitialConfig(validInput);
    expect(config.baseUrl).toBe('http://localhost:3000');
    expect(config.security.sessionSecret.length).toBeGreaterThanOrEqual(32);
    expect(config.security.installerSecret.length).toBeGreaterThanOrEqual(32);
    expect(config.security.sessionSecret).not.toBe(config.security.installerSecret);
    expect(toPublicInstallationConfig(config)).not.toHaveProperty('security');
    expect(toPublicInstallationConfig(config).database).not.toHaveProperty('password');

    if (process.platform !== 'win32') {
      expect((await stat(store.configPath)).mode & 0o777).toBe(0o600);
    }

    await expect(store.readSnapshot()).resolves.toMatchObject({
      bootState: 'configured',
      phase: 'CONFIG_WRITTEN',
    });

    await store.markInstalled(config.installationId);
    await expect(store.readSnapshot()).resolves.toMatchObject({
      bootState: 'installed',
      phase: 'INSTALLED',
    });
  });

  it('fails closed when installed metadata exists without matching configuration', async () => {
    const store = new InstallationConfigStore(await temporaryDirectory('scola-invalid-'));
    await writeFile(
      store.installedMarkerPath,
      JSON.stringify({
        schemaVersion: 1,
        installationId: 'ghost',
        installedAt: new Date().toISOString(),
      }),
      'utf8',
    );

    await expect(store.readSnapshot()).rejects.toMatchObject({ code: 'BOOT_STATE_INVALID' });
  });

  it('rejects unsafe configuration input', async () => {
    const store = new InstallationConfigStore(await temporaryDirectory('scola-invalid-input-'));
    await expect(
      store.writeInitialConfig({
        ...validInput,
        baseUrl: 'file:///tmp/school',
      }),
    ).rejects.toMatchObject({ code: 'INSTALLATION_CONFIG_INVALID' });
  });
});

describe('installer concurrency and permanent lockout', () => {
  it('allows only one installer lock holder', async () => {
    const lock = new InstallerLock(await temporaryDirectory('scola-lock-'));
    const first = await lock.acquire();

    await expect(lock.acquire()).rejects.toMatchObject({ code: 'INSTALLER_LOCKED' });
    await first.release();

    const second = await lock.acquire();
    await second.release();
  });

  it('disables further configuration mutations after verified installation', async () => {
    const service = new InstallationService(await temporaryDirectory('scola-service-'));
    await service.writeInitialConfig(validInput);
    await service.markInstalledAfterVerification();

    await expect(service.writeInitialConfig(validInput)).rejects.toMatchObject({
      code: 'INSTALLER_DISABLED',
    });
  });
});

describe('installer request verification and redaction', () => {
  it('accepts a same-origin CSRF session and rejects a cross-site request', () => {
    const csrf = new InstallerCsrf();
    const session = csrf.issue(false);
    const cookie = session.setCookie.split(';', 1)[0];
    expect(cookie).toBeDefined();
    if (cookie === undefined) {
      throw new Error('Expected installer CSRF cookie.');
    }

    expect(
      csrf.verify({
        cookieHeader: cookie,
        token: session.token,
        origin: 'http://localhost:3000',
        host: 'localhost:3000',
        protocol: 'http',
        secFetchSite: 'same-origin',
      }),
    ).toBe(true);

    expect(
      csrf.verify({
        cookieHeader: cookie,
        token: session.token,
        origin: 'https://evil.example',
        host: 'localhost:3000',
        protocol: 'http',
        secFetchSite: 'cross-site',
      }),
    ).toBe(false);
  });

  it('redacts nested credentials and credential-bearing error messages', () => {
    expect(
      redactSensitive({
        password: 'one',
        nested: {
          token: 'two',
          note: 'postgres://user:secret@db.internal/school',
        },
      }),
    ).toEqual({
      password: '[REDACTED]',
      nested: {
        token: '[REDACTED]',
        note: 'postgres://[REDACTED]@db.internal/school',
      },
    });

    expect(safeErrorForLog(new Error('password=supersecret'))).toMatchObject({
      message: 'password=[REDACTED]',
    });
  });

  it('persists the database credential server-side but never through the public config shape', async () => {
    const store = new InstallationConfigStore(await temporaryDirectory('scola-secret-'));
    const config = await store.writeInitialConfig(validInput);
    expect(await readFile(store.configPath, 'utf8')).toContain('db-secret-value');
    expect(JSON.stringify(toPublicInstallationConfig(config))).not.toContain('db-secret-value');
  });
});
