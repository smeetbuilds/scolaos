const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);

export type ServerBaseUrlClassification = 'secure' | 'local-http' | 'insecure-http' | 'invalid';

export function isLoopbackHostname(hostname: string): boolean {
  const normalized = hostname.trim().toLowerCase();
  const unwrapped =
    normalized.startsWith('[') && normalized.endsWith(']')
      ? normalized.slice(1, -1)
      : normalized;
  return LOOPBACK_HOSTS.has(unwrapped);
}

export function classifyServerBaseUrl(value: string): ServerBaseUrlClassification {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return 'invalid';
  }

  if (
    !['http:', 'https:'].includes(parsed.protocol) ||
    parsed.username !== '' ||
    parsed.password !== '' ||
    parsed.search !== '' ||
    parsed.hash !== ''
  ) {
    return 'invalid';
  }

  if (parsed.protocol === 'https:') {
    return 'secure';
  }
  return isLoopbackHostname(parsed.hostname) ? 'local-http' : 'insecure-http';
}
