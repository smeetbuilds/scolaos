const requestMetaSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['requestId'],
  properties: {
    requestId: { type: 'string', minLength: 1 },
  },
} as const;

export const errorEnvelopeSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['error'],
  properties: {
    error: {
      type: 'object',
      additionalProperties: false,
      required: ['code', 'message', 'requestId'],
      properties: {
        code: { type: 'string', minLength: 1 },
        message: { type: 'string', minLength: 1 },
        requestId: { type: 'string', minLength: 1 },
        details: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['path', 'keyword', 'message'],
            properties: {
              path: { type: 'string' },
              keyword: { type: 'string' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
  },
} as const;

export const healthResponseSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['status', 'service', 'version', 'meta'],
  properties: {
    status: { type: 'string', enum: ['ok'] },
    service: { type: 'string', enum: ['scolaos-server'] },
    version: { type: 'string' },
    meta: requestMetaSchema,
  },
} as const;

export const readinessResponseSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['data', 'meta'],
  properties: {
    data: {
      type: 'object',
      additionalProperties: false,
      required: ['status', 'observedAt'],
      properties: {
        status: { type: 'string', enum: ['ready', 'degraded', 'unavailable'] },
        observedAt: { type: 'string' },
      },
    },
    meta: requestMetaSchema,
  },
} as const;

export const echoBodySchema = {
  type: 'object',
  additionalProperties: false,
  required: ['message'],
  properties: {
    message: { type: 'string', minLength: 1, maxLength: 200 },
  },
} as const;

export const echoResponseSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['data', 'meta'],
  properties: {
    data: {
      type: 'object',
      additionalProperties: false,
      required: ['message'],
      properties: {
        message: { type: 'string' },
      },
    },
    meta: requestMetaSchema,
  },
} as const;

export const protectedResponseSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['data', 'meta'],
  properties: {
    data: {
      type: 'object',
      additionalProperties: false,
      required: ['actorId'],
      properties: {
        actorId: { type: 'string' },
      },
    },
    meta: requestMetaSchema,
  },
} as const;
