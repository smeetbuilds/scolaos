const DEFAULT_HOST = '127.0.0.1';
const DEFAULT_PORT = 3000;
const DEFAULT_DATA_DIRECTORY = './data';

export interface ServerConfig {
  readonly host: string;
  readonly port: number;
  readonly dataDirectory: string;
  readonly trustedProxyCidrs: readonly string[];
  readonly installerBootstrapToken?: string;
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

function parseTrustedProxyCidrs(value: string | undefined): readonly string[] {
  if (value === undefined || value.trim() === '') {
    return Object.freeze([]);
  }

  const entries = value
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry !== '');
  if (
    entries.length === 0 ||
    entries.some((entry) => entry.length > 128 || /[\s\r\n\0]/.test(entry))
  ) {
    throw new Error('SCOLA_TRUST_PROXY must be a comma-separated list of trusted proxy addresses or CIDRs.');
  }
  return Object.freeze(entries);
}

function parseInstallerBootstrapToken(value: string | undefined): string | undefined {
  const token = value?.trim();
  if (token === undefined || token === '') {
    return undefined;
  }
  if (token.length < 32 || token.length > 512 || /[\r\n\0]/.test(token)) {
    throw new Error('SCOLA_INSTALLER_BOOTSTRAP_TOKEN must contain between 32 and 512 safe characters.');
  }
  return token;
}

export function loadServerConfig(env: NodeJS.ProcessEnv = process.env): ServerConfig {
  const host = env.HOST?.trim() || DEFAULT_HOST;
  const dataDirectory = env.SCOLA_DATA_DIR?.trim() || DEFAULT_DATA_DIRECTORY;
  const installerBootstrapToken = parseInstallerBootstrapToken(env.SCOLA_INSTALLER_BOOTSTRAP_TOKEN);

  return {
    host,
    port: parsePort(env.PORT),
    dataDirectory,
    trustedProxyCidrs: parseTrustedProxyCidrs(env.SCOLA_TRUST_PROXY),
    ...(installerBootstrapToken === undefined ? {} : { installerBootstrapToken }),
  };
}
