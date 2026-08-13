const DEFAULT_HOST = '127.0.0.1';
const DEFAULT_PORT = 3000;

export interface ServerConfig {
  readonly host: string;
  readonly port: number;
}

function parsePort(value: string | undefined): number {
  if (value === undefined || value.trim() === '') {
    return DEFAULT_PORT;
  }

  if (!/^\d{1,5}$/.test(value)) {
    throw new Error('PORT must be an integer between 1 and 65535.');
  }

  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error('PORT must be an integer between 1 and 65535.');
  }

  return port;
}

export function loadServerConfig(env: NodeJS.ProcessEnv = process.env): ServerConfig {
  const host = env.HOST?.trim() || DEFAULT_HOST;

  return {
    host,
    port: parsePort(env.PORT),
  };
}
