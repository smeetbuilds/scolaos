const REDACTED = '[REDACTED]';
const SENSITIVE_KEYS = /^(?:password|passwd|passphrase|secret|token|authorization|cookie|set-cookie|api[_-]?key|private[_-]?key|database[_-]?url|connection[_-]?string)$/i;

function redactString(value: string): string {
  return value
    .replace(/([a-z][a-z0-9+.-]*:\/\/)([^@\s/]+)@/gi, `$1${REDACTED}@`)
    .replace(/\b(password|passwd|passphrase|secret|token|authorization|api[_-]?key)\s*[:=]\s*([^\s,;]+)/gi, `$1=${REDACTED}`);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function redactSensitive(value: unknown): unknown {
  if (typeof value === 'string') {
    return redactString(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => redactSensitive(item));
  }

  if (!isRecord(value)) {
    return value;
  }

  const redacted: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value)) {
    redacted[key] = SENSITIVE_KEYS.test(key) ? REDACTED : redactSensitive(item);
  }

  return redacted;
}

export function safeErrorForLog(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    const candidate = error as Error & { code?: unknown; statusCode?: unknown };
    return {
      name: error.name,
      message: redactString(error.message),
      ...(typeof candidate.code === 'string' ? { code: candidate.code } : {}),
      ...(typeof candidate.statusCode === 'number' ? { statusCode: candidate.statusCode } : {}),
    };
  }

  return { value: redactSensitive(error) };
}

export const STRUCTURED_LOG_REDACTION_PATHS = [
  'req.headers.authorization',
  'req.headers.cookie',
  'req.headers["x-installer-bootstrap"]',
  'req.headers["x-installer-csrf"]',
  'res.headers["set-cookie"]',
  'password',
  '*.password',
  '*.*.password',
  '*.*.*.password',
  'secret',
  '*.secret',
  '*.*.secret',
  '*.*.*.secret',
  'token',
  '*.token',
  '*.*.token',
  '*.*.*.token',
] as const;
