import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import type { FastifyInstance } from 'fastify';
import { describe, expect, it } from 'vitest';

import { buildApp } from './app.js';
import { InstallationService } from './installation/service.js';
import type { PostInstallVerificationProvider } from './installation/verification.js';

const validConfig = {
  baseUrl: 'http://localhost:3000',
  database: {
    host: '127.0.0.1',
    port: 5432,
    database: 'school',
    user: 'school_admin',
    password: 'test-only-secret',
    sslMode: 'prefer' as const,
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

async function completeInstallation(service: InstallationService): Promise<void> {
  await service.beginPhase('DB_CONNECTED');
  await service.completePhase('DB_CONNECTED');
  await service.beginPhase('MIGRATING');
  await service.completePhase('MIGRATING');
  await service.beginPhase('SEEDING');
  await service.completePhase('SEEDING');
  await service.finalizeInstallation();
}

async function withApp(run: (app: FastifyInstance) => Promise<void>): Promise<void> {
  const root = await mkdtemp(join(tmpdir(), 'scola-poc-installed-'));
  const installationService = new InstallationService(root, {
    verificationProvider: passingVerificationProvider,
  });
  await installationService.writeInitialConfig(validConfig);
  await completeInstallation(installationService);
  const app = await buildApp({ installationService });

  try {
    await run(app);
  } finally {
    await app.close();
    await rm(root, { recursive: true, force: true });
  }
}

describe('ScolaOS Fastify POC', () => {
  it('serves a health response with a correlated request ID', async () => {
    await withApp(async (app) => {
      const response = await app.inject({ method: 'GET', url: '/health' });
      const body = response.json<{
        status: string;
        meta: { requestId: string };
      }>();

      expect(response.statusCode).toBe(200);
      expect(body.status).toBe('ok');
      expect(response.headers['x-request-id']).toBe(body.meta.requestId);
      expect(body.meta.requestId).toMatch(/^[0-9a-f-]{36}$/i);
    });
  });

  it('validates request bodies and returns the standard error envelope', async () => {
    await withApp(async (app) => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/poc/echo',
        payload: { message: '' },
      });
      const body = response.json<{
        error: { code: string; requestId: string; details: unknown[] };
      }>();

      expect(response.statusCode).toBe(400);
      expect(body.error.code).toBe('VALIDATION_ERROR');
      expect(body.error.details.length).toBeGreaterThan(0);
      expect(response.headers['x-request-id']).toBe(body.error.requestId);
    });
  });

  it('accepts valid schema input', async () => {
    await withApp(async (app) => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/poc/echo',
        payload: { message: 'hello-school' },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({ data: { message: 'hello-school' } });
    });
  });

  it('enforces the authorization hook stub', async () => {
    await withApp(async (app) => {
      const denied = await app.inject({ method: 'GET', url: '/api/v1/poc/protected' });
      expect(denied.statusCode).toBe(401);
      expect(denied.json()).toMatchObject({ error: { code: 'AUTH_REQUIRED' } });

      const allowed = await app.inject({
        method: 'GET',
        url: '/api/v1/poc/protected',
        headers: { 'x-scolaos-poc-actor': 'teacher:42' },
      });
      expect(allowed.statusCode).toBe(200);
      expect(allowed.json()).toMatchObject({ data: { actorId: 'teacher:42' } });
    });
  });

  it('generates an OpenAPI document from route schemas after installation', async () => {
    await withApp(async (app) => {
      const response = await app.inject({ method: 'GET', url: '/openapi.json' });
      const document = response.json<{
        openapi: string;
        paths: Record<string, unknown>;
      }>();

      expect(response.statusCode).toBe(200);
      expect(document.openapi).toBe('3.0.3');
      expect(document.paths['/health']).toBeDefined();
      expect(document.paths['/start/installation/status']).toBeDefined();
      expect(document.paths['/start/installation/requirements']).toBeDefined();
      expect(document.paths['/start/installation/recovery']).toBeDefined();
      expect(document.paths['/api/v1/poc/echo']).toBeDefined();
      expect(document.paths['/api/v1/poc/protected']).toBeDefined();
    });
  });

  it('uses the same error contract for unknown routes', async () => {
    await withApp(async (app) => {
      const response = await app.inject({ method: 'GET', url: '/missing' });

      expect(response.statusCode).toBe(404);
      expect(response.json()).toMatchObject({ error: { code: 'NOT_FOUND' } });
    });
  });
});
