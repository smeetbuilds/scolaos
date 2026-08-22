import { randomUUID } from 'node:crypto';

import swagger from '@fastify/swagger';
import Fastify, { type FastifyError, type FastifyInstance } from 'fastify';

import { pocAuthorizationHook, requireAuthContext } from './auth.js';
import { createErrorEnvelope, ScolaApiError } from './errors.js';
import {
  HealthAdminService,
  HealthCheckService,
  createFilesystemWriteHealthProbe,
  createInstallationSecurityHealthProbe,
  createProviderHealthProbe,
  createRuntimeHealthProbe,
} from './health/index.js';
import { safeErrorForLog, STRUCTURED_LOG_REDACTION_PATHS } from './installation/redaction.js';
import { isInstallerSafePath, registerInstallerRoutes } from './installation/routes.js';
import { InstallationService } from './installation/service.js';
import {
  echoBodySchema,
  echoResponseSchema,
  errorEnvelopeSchema,
  healthResponseSchema,
  protectedResponseSchema,
  readinessResponseSchema,
} from './schemas.js';

interface EchoBody {
  readonly message: string;
}

export interface BuildAppOptions {
  readonly logger?: boolean;
  readonly installationService?: InstallationService;
  readonly healthService?: HealthCheckService;
  readonly trustProxy?: string[];
  readonly installerBootstrapToken?: string;
  readonly enablePocRoutes?: boolean;
}

function normalizeValidationIssues(
  validation: readonly {
    readonly instancePath?: string;
    readonly keyword: string;
    readonly message?: string;
  }[],
) {
  return validation.map((issue) => ({
    path: issue.instancePath || '/',
    keyword: issue.keyword,
    message: issue.message ?? 'Invalid value.',
  }));
}

function defaultHealthService(installationService: InstallationService): HealthCheckService {
  return new HealthCheckService([
    createRuntimeHealthProbe(),
    createFilesystemWriteHealthProbe(installationService.dataDirectory),
    createInstallationSecurityHealthProbe(async () => {
      const status = await installationService.getStatus();
      const config = await installationService.getStoredConfig();
      return {
        bootState: status.bootState,
        phase: status.phase,
        ...(config === null
          ? {}
          : {
              baseUrl: config.baseUrl,
              sessionSecretLength: config.security.sessionSecret.length,
              installerSecretLength: config.security.installerSecret.length,
            }),
      };
    }),
    createProviderHealthProbe('database', true, async (signal) => {
      signal.throwIfAborted();
      return {
        state: 'unknown',
        summary: 'Database readiness probe is not configured.',
      };
    }),
  ]);
}

export async function buildApp(options: BuildAppOptions = {}): Promise<FastifyInstance> {
  const installationService =
    options.installationService ??
    new InstallationService(process.env.SCOLA_DATA_DIR?.trim() || './data');
  const healthService = options.healthService ?? defaultHealthService(installationService);
  const healthAdmin = new HealthAdminService(healthService);
  const enablePocRoutes = options.enablePocRoutes === true;

  const app = Fastify({
    logger: options.logger
      ? {
          redact: {
            paths: [...STRUCTURED_LOG_REDACTION_PATHS],
            censor: '[REDACTED]',
          },
        }
      : false,
    genReqId: () => randomUUID(),
    ...(options.trustProxy === undefined || options.trustProxy.length === 0
      ? {}
      : { trustProxy: options.trustProxy }),
  });

  await app.register(swagger, {
    openapi: {
      openapi: '3.0.3',
      info: {
        title: 'ScolaOS API',
        description: 'Self-hosted school operating system API contract.',
        version: '0.0.0',
      },
      tags: [
        { name: 'system' },
        { name: 'installer' },
        ...(enablePocRoutes ? [{ name: 'poc' }] : []),
      ],
    },
  });

  app.addHook('onSend', async (request, reply, payload) => {
    reply.header('x-request-id', request.id);
    return payload;
  });

  app.setErrorHandler((error: FastifyError, request, reply) => {
    if (error.validation !== undefined) {
      return reply
        .code(400)
        .send(
          createErrorEnvelope(
            request.id,
            'VALIDATION_ERROR',
            'Request validation failed.',
            normalizeValidationIssues(error.validation),
          ),
        );
    }

    if (error instanceof ScolaApiError) {
      return reply
        .code(error.statusCode)
        .send(createErrorEnvelope(request.id, error.code, error.message));
    }

    const statusCode =
      error.statusCode !== undefined && error.statusCode < 500 ? error.statusCode : 500;
    const isServerError = statusCode >= 500;

    if (isServerError) {
      request.log.error(
        { error: safeErrorForLog(error), requestId: request.id },
        'Unhandled API error',
      );
    }

    return reply
      .code(statusCode)
      .send(
        createErrorEnvelope(
          request.id,
          isServerError ? 'INTERNAL_ERROR' : error.code,
          isServerError ? 'An unexpected server error occurred.' : error.message,
        ),
      );
  });

  app.setNotFoundHandler((request, reply) =>
    reply.code(404).send(createErrorEnvelope(request.id, 'NOT_FOUND', 'Route not found.')),
  );

  app.addHook('onRequest', async (request) => {
    if (isInstallerSafePath(request.url)) {
      return;
    }

    const status = await installationService.getStatus();
    if (status.bootState !== 'installed') {
      throw new ScolaApiError(
        'INSTALLATION_REQUIRED',
        'This server must be installed before application routes are available.',
        503,
      );
    }
  });

  app.get(
    '/health',
    {
      schema: {
        tags: ['system'],
        summary: 'Process liveness probe',
        response: { 200: healthResponseSchema },
      },
    },
    async (request) => ({
      status: 'ok',
      service: 'scolaos-server',
      version: '0.0.0',
      meta: { requestId: request.id },
    }),
  );

  app.get(
    '/health/ready',
    {
      schema: {
        tags: ['system'],
        summary: 'Dependency readiness probe',
        response: { 200: readinessResponseSchema, 503: readinessResponseSchema },
      },
    },
    async (request, reply) => {
      const data = await healthAdmin.publicReadiness();
      return reply
        .code(data.status === 'unavailable' ? 503 : 200)
        .send({ data, meta: { requestId: request.id } });
    },
  );

  await registerInstallerRoutes(app, installationService, {
    ...(options.installerBootstrapToken === undefined
      ? {}
      : { bootstrapToken: options.installerBootstrapToken }),
  });

  if (enablePocRoutes) {
    app.post<{ Body: EchoBody }>(
      '/api/v1/poc/echo',
      {
        schema: {
          tags: ['poc'],
          summary: 'Schema validation proof',
          body: echoBodySchema,
          response: {
            200: echoResponseSchema,
            400: errorEnvelopeSchema,
            503: errorEnvelopeSchema,
          },
        },
      },
      async (request) => ({
        data: { message: request.body.message },
        meta: { requestId: request.id },
      }),
    );

    app.get(
      '/api/v1/poc/protected',
      {
        preHandler: pocAuthorizationHook,
        schema: {
          tags: ['poc'],
          summary: 'Authorization hook proof',
          response: {
            200: protectedResponseSchema,
            401: errorEnvelopeSchema,
            503: errorEnvelopeSchema,
          },
        },
      },
      async (request) => ({
        data: { actorId: requireAuthContext(request).actorId },
        meta: { requestId: request.id },
      }),
    );
  }

  app.get('/openapi.json', async () => app.swagger());

  await app.ready();
  return app;
}
