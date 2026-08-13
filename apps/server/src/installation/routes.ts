import type { FastifyInstance, FastifyRequest } from 'fastify';

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
        phase: { type: 'string', enum: ['UNCONFIGURED', 'CONFIG_WRITTEN', 'INSTALLED'] },
        config: publicConfigSchema,
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

function headerString(value: string | readonly string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
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
    ...(request.headers.host === undefined ? {} : { host: request.headers.host }),
    protocol: request.protocol,
    ...(secFetchSite === undefined ? {} : { secFetchSite }),
  });
}

export function isInstallerSafePath(rawUrl: string): boolean {
  const path = rawUrl.split('?', 1)[0] ?? rawUrl;
  return (
    path === '/health' ||
    path === '/start/installation' ||
    path.startsWith('/start/installation/')
  );
}

export async function registerInstallerRoutes(
  app: FastifyInstance,
  service: InstallationService,
): Promise<void> {
  app.get(
    '/start/installation/status',
    {
      schema: {
        tags: ['installer'],
        summary: 'Read safe installation state',
        response: { 200: statusResponseSchema, 500: errorEnvelopeSchema },
      },
    },
    async (request) => ({
      data: await service.getStatus(),
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
          409: errorEnvelopeSchema,
        },
      },
    },
    async (request, reply) => {
      const status = await service.getStatus();
      if (status.bootState === 'installed') {
        throw new ScolaApiError(
          'INSTALLER_DISABLED',
          'Installation has already completed.',
          409,
        );
      }

      const session = service.issueCsrfSession(request.protocol === 'https');
      reply.header('set-cookie', session.setCookie);
      return {
        data: {
          csrfToken: session.token,
          expiresInSeconds: session.expiresInSeconds,
        },
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
    async (request) => {
      const config = await service.writeInitialConfig(request.body);
      return {
        data: {
          installationId: config.installationId,
          baseUrl: config.baseUrl,
          database: {
            host: config.database.host,
            port: config.database.port,
            database: config.database.database,
            user: config.database.user,
            sslMode: config.database.sslMode,
          },
        },
        meta: { requestId: request.id },
      };
    },
  );
}
