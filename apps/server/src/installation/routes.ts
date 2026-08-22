import { timingSafeEqual } from 'node:crypto';

import type { FastifyInstance, FastifyRequest } from 'fastify';

import { isLoopbackHostname } from '../base-url.js';
import { ScolaApiError } from '../errors.js';
import { errorEnvelopeSchema } from '../schemas.js';
import { InstallationService } from './service.js';
import type { InstallationConfigInput } from './types.js';

const databaseSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['host', 'port', 'database', 'user', 'password', 'sslMode'],
  properties: {
    host: { type: 'string', minLength: 1, maxLength: 255 },
    port: { type: 'integer', minimum: 1, maximum: 65_535 },
    database: { type: 'string', minLength: 1, maxLength: 128 },
    user: { type: 'string', minLength: 1, maxLength: 128 },
    password: { type: 'string', minLength: 1, maxLength: 4096, writeOnly: true },
    sslMode: { type: 'string', enum: ['disable', 'prefer', 'require', 'verify-full'] },
  },
} as const;

const configBodySchema = {
  type: 'object',
  additionalProperties: false,
  required: ['baseUrl', 'database'],
  properties: {
    baseUrl: { type: 'string', minLength: 1, maxLength: 2048 },
    database: databaseSchema,
  },
} as const;

const publicDatabaseSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['host', 'port', 'database', 'user', 'sslMode'],
  properties: {
    host: { type: 'string' },
    port: { type: 'integer' },
    database: { type: 'string' },
    user: { type: 'string' },
    sslMode: { type: 'string' },
  },
} as const;

const publicConfigSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['installationId', 'baseUrl', 'database'],
  properties: {
    installationId: { type: 'string' },
    baseUrl: { type: 'string' },
    database: publicDatabaseSchema,
  },
} as const;

const failureSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['phase', 'code', 'message', 'retryable', 'occurredAt'],
  properties: {
    phase: { type: 'string', enum: ['DB_CONNECTED', 'MIGRATING', 'SEEDING', 'VERIFYING'] },
    code: { type: 'string' },
    message: { type: 'string' },
    retryable: { type: 'boolean' },
    occurredAt: { type: 'string' },
  },
} as const;

const progressSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['completedPhase', 'state', 'attempt', 'updatedAt'],
  properties: {
    completedPhase: {
      type: 'string',
      enum: ['CONFIG_WRITTEN', 'DB_CONNECTED', 'MIGRATING', 'SEEDING', 'VERIFYING'],
    },
    state: { type: 'string', enum: ['ready', 'running', 'failed'] },
    activePhase: { type: 'string', enum: ['DB_CONNECTED', 'MIGRATING', 'SEEDING', 'VERIFYING'] },
    attempt: { type: 'integer' },
    updatedAt: { type: 'string' },
    failure: failureSchema,
  },
} as const;

const statusResponseSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['data', 'meta'],
  properties: {
    data: {
      type: 'object',
      additionalProperties: false,
      required: ['bootState', 'phase'],
      properties: {
        bootState: { type: 'string', enum: ['unconfigured', 'configured', 'installed'] },
        phase: {
          type: 'string',
          enum: [
            'UNCONFIGURED',
            'CONFIG_WRITTEN',
            'DB_CONNECTED',
            'MIGRATING',
            'SEEDING',
            'VERIFYING',
            'INSTALLED',
          ],
        },
        config: publicConfigSchema,
        progress: progressSchema,
      },
    },
    meta: {
      type: 'object',
      additionalProperties: false,
      required: ['requestId'],
      properties: { requestId: { type: 'string' } },
    },
  },
} as const;

const requirementsResponseSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['data', 'meta'],
  properties: {
    data: {
      type: 'object',
      additionalProperties: false,
      required: ['state', 'checkedAt', 'checks'],
      properties: {
        state: { type: 'string', enum: ['ready', 'warning', 'blocked'] },
        checkedAt: { type: 'string' },
        checks: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['id', 'state', 'blocking', 'summary'],
            properties: {
              id: { type: 'string' },
              state: { type: 'string', enum: ['pass', 'warn', 'fail'] },
              blocking: { type: 'boolean' },
              summary: { type: 'string' },
              details: { type: 'object', additionalProperties: true },
            },
          },
        },
      },
    },
    meta: {
      type: 'object',
      additionalProperties: false,
      required: ['requestId'],
      properties: { requestId: { type: 'string' } },
    },
  },
} as const;

const recoveryResponseSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['data', 'meta'],
  properties: {
    data: {
      type: 'object',
      additionalProperties: false,
      required: ['state', 'message', 'canRetry', 'canEditConfiguration'],
      properties: {
        state: {
          type: 'string',
          enum: ['not-needed', 'running', 'recoverable', 'manual-intervention'],
        },
        phase: { type: 'string' },
        failureCode: { type: 'string' },
        message: { type: 'string' },
        canRetry: { type: 'boolean' },
        canEditConfiguration: { type: 'boolean' },
      },
    },
    meta: {
      type: 'object',
      additionalProperties: false,
      required: ['requestId'],
      properties: { requestId: { type: 'string' } },
    },
  },
} as const;

const sessionResponseSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['data', 'meta'],
  properties: {
    data: {
      type: 'object',
      additionalProperties: false,
      required: ['csrfToken', 'expiresInSeconds'],
      properties: {
        csrfToken: { type: 'string' },
        expiresInSeconds: { type: 'integer' },
      },
    },
    meta: {
      type: 'object',
      additionalProperties: false,
      required: ['requestId'],
      properties: { requestId: { type: 'string' } },
    },
  },
} as const;

const configResponseSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['data', 'meta'],
  properties: {
    data: publicConfigSchema,
    meta: {
      type: 'object',
      additionalProperties: false,
      required: ['requestId'],
      properties: { requestId: { type: 'string' } },
    },
  },
} as const;

export interface InstallerRouteOptions {
  readonly bootstrapToken?: string;
}

function headerString(value: string | readonly string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function equalSecret(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function isLoopbackAddress(value: string): boolean {
  const address = value.trim().toLowerCase();
  return address === '127.0.0.1' || address === '::1' || address.startsWith('::ffff:127.');
}

function verifyInstallerBootstrap(request: FastifyRequest, bootstrapToken: string | undefined): void {
  if (isLoopbackAddress(request.ip) && isLoopbackHostname(request.hostname)) {
    return;
  }

  const provided = headerString(request.headers['x-installer-bootstrap']);
  if (
    bootstrapToken === undefined ||
    provided === undefined ||
    !equalSecret(provided, bootstrapToken)
  ) {
    throw new ScolaApiError(
      'INSTALLER_BOOTSTRAP_REQUIRED',
      'Remote installation requires the operator bootstrap credential.',
      403,
    );
  }
}

function detectedBaseUrl(request: FastifyRequest): string | undefined {
  const host = request.host;
  if (host.trim() === '') return undefined;
  return `${request.protocol}://${host}`;
}

async function verifyInstallerMutation(
  request: FastifyRequest,
  service: InstallationService,
): Promise<void> {
  await service.assertInstallerMutable();
  const token = headerString(request.headers['x-installer-csrf']);
  const secFetchSite = headerString(request.headers['sec-fetch-site']);
  service.verifyMutation({
    ...(request.headers.cookie === undefined ? {} : { cookieHeader: request.headers.cookie }),
    ...(token === undefined ? {} : { token }),
    ...(request.headers.origin === undefined ? {} : { origin: request.headers.origin }),
    host: request.host,
    protocol: request.protocol,
    ...(secFetchSite === undefined ? {} : { secFetchSite }),
  });
}

function publicConfig(config: Awaited<ReturnType<InstallationService['writeInitialConfig']>>) {
  return {
    installationId: config.installationId,
    baseUrl: config.baseUrl,
    database: {
      host: config.database.host,
      port: config.database.port,
      database: config.database.database,
      user: config.database.user,
      sslMode: config.database.sslMode,
    },
  };
}

export function isInstallerSafePath(rawUrl: string): boolean {
  const path = rawUrl.split('?', 1)[0] ?? rawUrl;
  return (
    path === '/health' ||
    path === '/health/ready' ||
    path === '/start/installation' ||
    path.startsWith('/start/installation/')
  );
}

export async function registerInstallerRoutes(
  app: FastifyInstance,
  service: InstallationService,
  options: InstallerRouteOptions = {},
): Promise<void> {
  if (options.bootstrapToken !== undefined && options.bootstrapToken.length < 32) {
    throw new Error('Installer bootstrap token must contain at least 32 characters.');
  }

  app.get(
    '/start/installation/status',
    {
      schema: {
        tags: ['installer'],
        summary: 'Read safe installation state and real progress',
        response: { 200: statusResponseSchema, 500: errorEnvelopeSchema },
      },
    },
    async (request) => ({ data: await service.getStatus(), meta: { requestId: request.id } }),
  );

  app.get(
    '/start/installation/requirements',
    {
      schema: {
        tags: ['installer'],
        summary: 'Check runtime and filesystem installation requirements',
        response: { 200: requirementsResponseSchema },
      },
    },
    async (request) => ({
      data: await service.checkRequirements(detectedBaseUrl(request)),
      meta: { requestId: request.id },
    }),
  );

  app.get(
    '/start/installation/recovery',
    {
      schema: {
        tags: ['installer'],
        summary: 'Read safe installation failure and recovery state',
        response: { 200: recoveryResponseSchema, 500: errorEnvelopeSchema },
      },
    },
    async (request) => ({
      data: await service.getRecoveryState(),
      meta: { requestId: request.id },
    }),
  );

  app.get(
    '/start/installation/session',
    {
      schema: {
        tags: ['installer'],
        summary: 'Issue installer CSRF session',
        response: {
          200: sessionResponseSchema,
          403: errorEnvelopeSchema,
          409: errorEnvelopeSchema,
        },
      },
    },
    async (request, reply) => {
      const status = await service.getStatus();
      if (status.bootState === 'installed') {
        throw new ScolaApiError('INSTALLER_DISABLED', 'Installation has already completed.', 409);
      }
      verifyInstallerBootstrap(request, options.bootstrapToken);
      const session = service.issueCsrfSession(request.protocol === 'https');
      reply.header('set-cookie', session.setCookie);
      return {
        data: { csrfToken: session.token, expiresInSeconds: session.expiresInSeconds },
        meta: { requestId: request.id },
      };
    },
  );

  app.post<{ Body: InstallationConfigInput }>(
    '/start/installation/config',
    {
      preHandler: async (request) => verifyInstallerMutation(request, service),
      schema: {
        tags: ['installer'],
        summary: 'Write initial server configuration',
        body: configBodySchema,
        response: {
          200: configResponseSchema,
          400: errorEnvelopeSchema,
          403: errorEnvelopeSchema,
          409: errorEnvelopeSchema,
        },
      },
    },
    async (request) => ({
      data: publicConfig(await service.writeInitialConfig(request.body)),
      meta: { requestId: request.id },
    }),
  );

  app.put<{ Body: InstallationConfigInput }>(
    '/start/installation/config',
    {
      preHandler: async (request) => verifyInstallerMutation(request, service),
      schema: {
        tags: ['installer'],
        summary: 'Correct pending configuration before database setup advances',
        body: configBodySchema,
        response: {
          200: configResponseSchema,
          400: errorEnvelopeSchema,
          403: errorEnvelopeSchema,
          409: errorEnvelopeSchema,
        },
      },
    },
    async (request) => ({
      data: publicConfig(await service.replacePendingConfig(request.body)),
      meta: { requestId: request.id },
    }),
  );
}
