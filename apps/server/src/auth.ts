import type { FastifyRequest } from 'fastify';

import { ScolaApiError } from './errors.js';

const POC_ACTOR_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:@-]{0,127}$/;

export interface AuthContext {
  readonly actorId: string;
}

declare module 'fastify' {
  interface FastifyRequest {
    authContext?: AuthContext;
  }
}

export async function pocAuthorizationHook(request: FastifyRequest): Promise<void> {
  const rawActor = request.headers['x-scolaos-poc-actor'];
  const actorId = Array.isArray(rawActor) ? rawActor[0] : rawActor;

  if (actorId === undefined || !POC_ACTOR_PATTERN.test(actorId)) {
    throw new ScolaApiError(
      'AUTH_REQUIRED',
      'A valid proof-of-concept actor header is required.',
      401,
    );
  }

  request.authContext = { actorId };
}

export function requireAuthContext(request: FastifyRequest): AuthContext {
  if (request.authContext === undefined) {
    throw new ScolaApiError('AUTH_CONTEXT_MISSING', 'Authorization context is unavailable.', 500);
  }

  return request.authContext;
}
