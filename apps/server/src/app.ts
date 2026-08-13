import { randomUUID } from 'node:crypto';

import swagger from '@fastify/swagger';
import Fastify, { type FastifyError, type FastifyInstance } from 'fastify';

import { pocAuthorizationHook, requireAuthContext } from './auth.js';
import { createErrorEnvelope, ScolaApiError } from './errors.js';
import {
  echoBodySchema,
  echoResponseSchema,
  errorEnvelopeSchema,
  healthResponseSchema,
  protectedResponseSchema,
} from './schemas.js';

interface EchoBody {
  readonly message: string;
}

export interface BuildAppOptions {
  readonly logger?: boolean;
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

export async function buildApp(options: BuildAppOptions = {}): Promise<FastifyInstance> {
  const app = Fastify({
    logger: options.logger ?? false,
    genReqId: () => randomUUID(),
  });

  await app.register(swagger, {
    openapi: {
      openapi: '3.0.3',
      info: {
        title: 'ScolaOS API',
        description: 'Self-hosted ScolaOS API contract.',
        version: '0.0.0',
      },
      tags: [{ name: 'system' }, { name: 'poc' }],
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
      request.log.error({ err: error, requestId: request.id }, 'Unhandled API error');
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

  app.get(
    '/health',
    {
      schema: {
        tags: ['system'],
        summary: 'Process health probe',
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
        },
      },
    },
    async (request) => ({
      data: { actorId: requireAuthContext(request).actorId },
      meta: { requestId: request.id },
    }),
  );

  app.get('/openapi.json', async () => app.swagger());

  await app.ready();
  return app;
}
