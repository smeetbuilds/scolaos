import { randomBytes, randomUUID } from 'node:crypto';
import { chmod, mkdir, open, readFile, rename, rm } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';

import { ScolaApiError } from '../errors.js';
import type {
  DatabaseSslMode,
  InstallationConfig,
  InstallationConfigInput,
  InstallationSnapshot,
  PublicInstallationConfig,
} from './types.js';

const CONFIG_SCHEMA_VERSION = 1;
const CONFIG_FILE = 'config.json';
const INSTALLED_MARKER_FILE = 'installed.json';
const SSL_MODES = new Set<DatabaseSslMode>(['disable', 'prefer', 'require', 'verify-full']);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function requireString(value: unknown, field: string, maxLength: number): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new ScolaApiError('INSTALLATION_CONFIG_INVALID', `${field} is required.`, 400);
  }

  const normalized = value.trim();
  if (normalized.length > maxLength) {
    throw new ScolaApiError(
      'INSTALLATION_CONFIG_INVALID',
      `${field} exceeds the maximum supported length.`,
      400,
    );
  }

  return normalized;
}

function requirePort(value: unknown): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1 || value > 65_535) {
    throw new ScolaApiError(
      'INSTALLATION_CONFIG_INVALID',
      'database.port must be an integer between 1 and 65535.',
      400,
    );
  }

  return value;
}

function requireSslMode(value: unknown): DatabaseSslMode {
  if (typeof value !== 'string' || !SSL_MODES.has(value as DatabaseSslMode)) {
    throw new ScolaApiError('INSTALLATION_CONFIG_INVALID', 'database.sslMode is invalid.', 400);
  }

  return value as DatabaseSslMode;
}

function normalizeBaseUrl(value: unknown): string {
  const raw = requireString(value, 'baseUrl', 2048);
  let parsed: URL;

  try {
    parsed = new URL(raw);
  } catch {
    throw new ScolaApiError('INSTALLATION_CONFIG_INVALID', 'baseUrl must be a valid URL.', 400);
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new ScolaApiError(
      'INSTALLATION_CONFIG_INVALID',
      'baseUrl must use http or https.',
      400,
    );
  }

  if (parsed.username !== '' || parsed.password !== '' || parsed.search !== '' || parsed.hash !== '') {
    throw new ScolaApiError(
      'INSTALLATION_CONFIG_INVALID',
      'baseUrl must not contain credentials, query parameters, or a fragment.',
      400,
    );
  }

  return parsed.toString().replace(/\/$/, '');
}

function normalizeDatabase(value: unknown): InstallationConfigInput['database'] {
  if (!isRecord(value)) {
    throw new ScolaApiError('INSTALLATION_CONFIG_INVALID', 'database configuration is required.', 400);
  }

  return {
    host: requireString(value.host, 'database.host', 255),
    port: requirePort(value.port),
    database: requireString(value.database, 'database.database', 128),
    user: requireString(value.user, 'database.user', 128),
    password: requireString(value.password, 'database.password', 4096),
    sslMode: requireSslMode(value.sslMode),
  };
}

export function normalizeInstallationConfigInput(value: unknown): InstallationConfigInput {
  if (!isRecord(value)) {
    throw new ScolaApiError('INSTALLATION_CONFIG_INVALID', 'Installation configuration is invalid.', 400);
  }

  return {
    baseUrl: normalizeBaseUrl(value.baseUrl),
    database: normalizeDatabase(value.database),
  };
}

function requireStoredSecret(value: unknown, field: string): string {
  const secret = requireString(value, field, 512);
  if (secret.length < 32) {
    throw new ScolaApiError('BOOT_STATE_INVALID', 'Stored security configuration is invalid.', 500);
  }
  return secret;
}

function parseStoredConfig(value: unknown): InstallationConfig {
  if (!isRecord(value) || value.schemaVersion !== CONFIG_SCHEMA_VERSION) {
    throw new ScolaApiError('BOOT_STATE_INVALID', 'Stored configuration schema is invalid.', 500);
  }

  const input = normalizeInstallationConfigInput(value);
  if (!isRecord(value.security)) {
    throw new ScolaApiError('BOOT_STATE_INVALID', 'Stored security configuration is invalid.', 500);
  }

  const installationId = requireString(value.installationId, 'installationId', 128);
  const createdAt = requireString(value.createdAt, 'createdAt', 128);
  if (Number.isNaN(Date.parse(createdAt))) {
    throw new ScolaApiError('BOOT_STATE_INVALID', 'Stored configuration timestamp is invalid.', 500);
  }

  return {
    schemaVersion: CONFIG_SCHEMA_VERSION,
    installationId,
    createdAt,
    ...input,
    security: {
      sessionSecret: requireStoredSecret(value.security.sessionSecret, 'security.sessionSecret'),
      installerSecret: requireStoredSecret(value.security.installerSecret, 'security.installerSecret'),
    },
  };
}

function generateSecret(): string {
  return randomBytes(32).toString('base64url');
}

async function readJsonFile(path: string): Promise<unknown | null> {
  try {
    return JSON.parse(await readFile(path, 'utf8')) as unknown;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === 'ENOENT') {
      return null;
    }
    if (error instanceof SyntaxError) {
      throw new ScolaApiError('BOOT_STATE_INVALID', 'Stored installation metadata is invalid.', 500);
    }
    throw error;
  }
}

async function writeAtomicJson(path: string, value: unknown): Promise<void> {
  const directory = dirname(path);
  await mkdir(directory, { recursive: true, mode: 0o700 });
  const temporaryPath = join(
    directory,
    `.${basename(path)}.${process.pid}.${randomUUID()}.tmp`,
  );
  const handle = await open(temporaryPath, 'wx', 0o600);

  try {
    await handle.writeFile(`${JSON.stringify(value, null, 2)}\n`, 'utf8');
    await handle.sync();
  } catch (error) {
    await handle.close().catch(() => undefined);
    await rm(temporaryPath, { force: true }).catch(() => undefined);
    throw error;
  }

  await handle.close();

  try {
    await rename(temporaryPath, path);
    await chmod(path, 0o600);
  } catch (error) {
    await rm(temporaryPath, { force: true }).catch(() => undefined);
    throw error;
  }
}

export function toPublicInstallationConfig(config: InstallationConfig): PublicInstallationConfig {
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

export class InstallationConfigStore {
  public readonly configPath: string;
  public readonly installedMarkerPath: string;

  public constructor(public readonly dataDirectory: string) {
    this.configPath = join(dataDirectory, CONFIG_FILE);
    this.installedMarkerPath = join(dataDirectory, INSTALLED_MARKER_FILE);
  }

  public async readConfig(): Promise<InstallationConfig | null> {
    const stored = await readJsonFile(this.configPath);
    if (stored === null) {
      return null;
    }

    try {
      return parseStoredConfig(stored);
    } catch (error) {
      if (error instanceof ScolaApiError && error.code === 'INSTALLATION_CONFIG_INVALID') {
        throw new ScolaApiError(
          'BOOT_STATE_INVALID',
          'Stored server configuration is invalid.',
          500,
        );
      }
      throw error;
    }
  }

  public async writeInitialConfig(value: unknown): Promise<InstallationConfig> {
    const existing = await this.readConfig();
    if (existing !== null) {
      throw new ScolaApiError(
        'INSTALLATION_CONFIG_EXISTS',
        'Installation configuration has already been written.',
        409,
      );
    }

    const input = normalizeInstallationConfigInput(value);
    const config: InstallationConfig = {
      schemaVersion: CONFIG_SCHEMA_VERSION,
      installationId: randomUUID(),
      createdAt: new Date().toISOString(),
      ...input,
      security: {
        sessionSecret: generateSecret(),
        installerSecret: generateSecret(),
      },
    };

    await writeAtomicJson(this.configPath, config);
    return config;
  }

  public async markInstalled(installationId: string): Promise<void> {
    const config = await this.readConfig();
    if (config === null || config.installationId !== installationId) {
      throw new ScolaApiError(
        'BOOT_STATE_INVALID',
        'Installation marker cannot be written for the current configuration.',
        500,
      );
    }

    await writeAtomicJson(this.installedMarkerPath, {
      schemaVersion: CONFIG_SCHEMA_VERSION,
      installationId,
      installedAt: new Date().toISOString(),
    });
  }

  public async readSnapshot(): Promise<InstallationSnapshot> {
    const [config, marker] = await Promise.all([
      this.readConfig(),
      readJsonFile(this.installedMarkerPath),
    ]);

    if (config === null && marker === null) {
      return { bootState: 'unconfigured', phase: 'UNCONFIGURED' };
    }

    if (config === null) {
      throw new ScolaApiError(
        'BOOT_STATE_INVALID',
        'Installed metadata exists without a valid server configuration.',
        500,
      );
    }

    if (marker === null) {
      return { bootState: 'configured', phase: 'CONFIG_WRITTEN', config };
    }

    if (
      !isRecord(marker) ||
      marker.schemaVersion !== CONFIG_SCHEMA_VERSION ||
      marker.installationId !== config.installationId ||
      typeof marker.installedAt !== 'string' ||
      Number.isNaN(Date.parse(marker.installedAt))
    ) {
      throw new ScolaApiError(
        'BOOT_STATE_INVALID',
        'Installed metadata does not match the active server configuration.',
        500,
      );
    }

    return { bootState: 'installed', phase: 'INSTALLED', config };
  }
}
