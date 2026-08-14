import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import type { FastifyInstance } from 'fastify';
import { afterEach, describe, expect, it } from 'vitest';

import { buildApp } from '../app.js';
import { InstallationService } from './service.js';
import type { PostInstallVerificationProvider } from './verification.js';

const roots: string[] = [];

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

async function unconfiguredApp(): Promise<{
  readonly app: FastifyInstance;
  readonly service: InstallationService;
}> {
  const root = await mkdtemp(join(tmpdir(), 'scola-installer-api-'));
  roots.push(root);
  const service = new InstallationService(root, {
    verificationProvider: passingVerificationProvider,
  });
  return { app: await buildApp({ installationService: service }), service };
}

async function completeInstallation(service: InstallationService): Promise<void> {
  await service.beginPhase('DB_CONNECTED');
  await service.completePhase('DB_CONNECTED');
  await service.beginPhase('MIGRATING');
  await service.completePhase('MIGRATING');
  await service.beginPhase('SEEDING');
  await service.completePhase('SEEDING');
  await service.finalizeInstallation();
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe('installer security boundary', () => {
  it('exposes only health and installer-safe routes before installation', async () => {
    const { app } = await unconfiguredApp();
    try {
      expect((await app.inject({ method: 'GET', url: '/health' })).statusCode).toBe(200);
      expect(
        (await app.inject({ method: 'GET', url: '/start/installation/status' })).json(),
      ).toMatchObject({ data: { bootState: 'unconfigured', phase: 'UNCONFIGURED' } });

      const requirements = await app.inject({
        method: 'GET',
        url: '/start/installation/requirements',
      });
      expect(requirements.statusCode).toBe(200);
      expect(requirements.json()).toHaveProperty('data.checks');

      const blocked = await app.inject({
        method: 'POST',
        url: '/api/v1/poc/echo',
        payload: { message: 'x' },
      });
      expect(blocked.statusCode).toBe(503);
      expect(blocked.json()).toMatchObject({ error: { code: 'INSTALLATION_REQUIRED' } });

      const openapi = await app.inject({ method: 'GET', url: '/openapi.json' });
      expect(openapi.statusCode).toBe(503);
    } finally {
      await app.close();
    }
  });

  it('requires CSRF verification, supports safe pending config correction, and never returns secrets', async () => {
    const { app } = await unconfiguredApp();
    try {
      const payload = {
        baseUrl: 'http://localhost:3000',
        database: {
          host: '127.0.0.1',
          port: 5432,
          database: 'school',
          user: 'school_admin',
          password: 'db-secret-value',
          sslMode: 'prefer',
        },
      };

      const noCsrf = await app.inject({
        method: 'POST',
        url: '/start/installation/config',
        payload,
      });
      expect(noCsrf.statusCode).toBe(403);
      expect(noCsrf.json()).toMatchObject({ error: { code: 'INSTALLER_CSRF_INVALID' } });

      const session = await app.inject({ method: 'GET', url: '/start/installation/session' });
      const sessionBody = session.json<{ data: { csrfToken: string } }>();
      const setCookie = session.headers['set-cookie'];
      expect(typeof setCookie).toBe('string');
      const cookie = String(setCookie).split(';', 1)[0] ?? '';
      const headers = {
        host: 'localhost:3000',
        origin: 'http://localhost:3000',
        'sec-fetch-site': 'same-origin',
        cookie,
        'x-installer-csrf': sessionBody.data.csrfToken,
      };

      const crossSite = await app.inject({
        method: 'POST',
        url: '/start/installation/config',
        headers: { ...headers, origin: 'https://evil.example', 'sec-fetch-site': 'cross-site' },
        payload,
      });
      expect(crossSite.statusCode).toBe(403);

      const saved = await app.inject({
        method: 'POST',
        url: '/start/installation/config',
        headers,
        payload,
      });
      expect(saved.statusCode).toBe(200);
      expect(JSON.stringify(saved.json())).not.toContain('db-secret-value');
      expect(JSON.stringify(saved.json())).not.toContain('sessionSecret');
      expect(JSON.stringify(saved.json())).not.toContain('installerSecret');

      const corrected = await app.inject({
        method: 'PUT',
        url: '/start/installation/config',
        headers,
        payload: {
          ...payload,
          database: { ...payload.database, host: 'db-corrected.internal', password: 'replacement-secret' },
        },
      });
      expect(corrected.statusCode).toBe(200);
      expect(corrected.json()).toMatchObject({ data: { database: { host: 'db-corrected.internal' } } });
      expect(JSON.stringify(corrected.json())).not.toContain('replacement-secret');

      const status = await app.inject({ method: 'GET', url: '/start/installation/status' });
      expect(status.json()).toMatchObject({
        data: {
          bootState: 'configured',
          phase: 'CONFIG_WRITTEN',
          progress: { state: 'ready', completedPhase: 'CONFIG_WRITTEN' },
        },
      });
    } finally {
      await app.close();
    }
  });

  it('keeps application routes blocked until verified finalization and then permanently disables installer mutations', async () => {
    const { app, service } = await unconfiguredApp();
    try {
      await service.writeInitialConfig({
        baseUrl: 'http://localhost:3000',
        database: {
          host: '127.0.0.1',
          port: 5432,
          database: 'school',
          user: 'school_admin',
          password: 'db-secret-value',
          sslMode: 'prefer',
        },
      });

      const configured = await app.inject({ method: 'GET', url: '/api/v1/poc/protected' });
      expect(configured.statusCode).toBe(503);

      await completeInstallation(service);
      const installed = await app.inject({
        method: 'GET',
        url: '/api/v1/poc/protected',
        headers: { 'x-scolaos-poc-actor': 'teacher:42' },
      });
      expect(installed.statusCode).toBe(200);

      const session = await app.inject({ method: 'GET', url: '/start/installation/session' });
      expect(session.statusCode).toBe(409);
      expect(session.json()).toMatchObject({ error: { code: 'INSTALLER_DISABLED' } });
    } finally {
      await app.close();
    }
  });
});
