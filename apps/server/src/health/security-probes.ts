import { statfs } from 'node:fs/promises';

import { isSupportedNodeVersion, SUPPORTED_NODE_MAJORS } from '../platform-support.js';
import type { HealthProbe, HealthProbeObservation } from './types.js';

export interface InstallationSecuritySnapshot {
  readonly bootState: 'unconfigured' | 'configured' | 'installed' | 'invalid';
  readonly phase: string;
  readonly baseUrl?: string;
  readonly sessionSecretLength?: number;
  readonly installerSecretLength?: number;
}

export interface RuntimeSupportSnapshot {
  readonly nodeVersion: string;
  readonly platform: string;
  readonly arch: string;
}

function localhost(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
}

function isSecureBaseUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || (url.protocol === 'http:' && localhost(url.hostname));
  } catch {
    return false;
  }
}

export function createInstallationSecurityHealthProbe(
  load: () => Promise<InstallationSecuritySnapshot>,
): HealthProbe {
  return {
    id: 'installation-security',
    critical: true,
    async check(): Promise<HealthProbeObservation> {
      const snapshot = await load();
      if (snapshot.bootState === 'invalid') {
        return { state: 'unhealthy', summary: 'Installation state is invalid.', details: { phase: snapshot.phase } };
      }
      if (snapshot.bootState !== 'installed') {
        return {
          state: 'degraded',
          summary: 'Installation is not complete.',
          details: { bootState: snapshot.bootState, phase: snapshot.phase },
        };
      }
      if (
        snapshot.baseUrl === undefined ||
        !isSecureBaseUrl(snapshot.baseUrl) ||
        (snapshot.sessionSecretLength ?? 0) < 32 ||
        (snapshot.installerSecretLength ?? 0) < 32
      ) {
        return {
          state: 'unhealthy',
          summary: 'Installed security configuration failed validation.',
          details: {
            baseUrlSecure: snapshot.baseUrl !== undefined && isSecureBaseUrl(snapshot.baseUrl),
            sessionSecretConfigured: (snapshot.sessionSecretLength ?? 0) >= 32,
            installerSecretConfigured: (snapshot.installerSecretLength ?? 0) >= 32,
          },
        };
      }
      return {
        state: 'healthy',
        summary: 'Installation security configuration is valid.',
        details: { phase: snapshot.phase, baseUrlSecure: true },
      };
    },
  };
}

export function createRuntimeSupportHealthProbe(
  load: () => RuntimeSupportSnapshot = () => ({
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
  }),
): HealthProbe {
  return {
    id: 'runtime-support',
    critical: true,
    async check(): Promise<HealthProbeObservation> {
      const runtime = load();
      const nodeSupported = isSupportedNodeVersion(runtime.nodeVersion);
      const platformSupported = runtime.platform === 'linux' && runtime.arch === 'x64';
      if (!nodeSupported || !platformSupported) {
        return {
          state: 'unhealthy',
          summary: 'Server runtime is outside the supported production matrix.',
          details: {
            nodeVersion: runtime.nodeVersion,
            nodeSupported,
            platform: runtime.platform,
            arch: runtime.arch,
            platformSupported,
            requiredNodeMajor: SUPPORTED_NODE_MAJORS[0],
          },
        };
      }
      return {
        state: 'healthy',
        summary: 'Server runtime matches the supported production matrix.',
        details: { nodeVersion: runtime.nodeVersion, platform: runtime.platform, arch: runtime.arch },
      };
    },
  };
}

export interface DiskCapacityHealthOptions {
  readonly degradedBelowBytes?: number;
  readonly unhealthyBelowBytes?: number;
  readonly stat?: (path: string) => Promise<{ readonly bavail: number | bigint; readonly bsize: number | bigint }>;
}

function positiveThreshold(value: number, field: string): number {
  if (!Number.isSafeInteger(value) || value < 1) throw new Error(`${field} must be a positive safe integer.`);
  return value;
}

export function createDiskCapacityHealthProbe(
  path: string,
  options: DiskCapacityHealthOptions = {},
): HealthProbe {
  const degradedBelowBytes = positiveThreshold(options.degradedBelowBytes ?? 2 * 1024 * 1024 * 1024, 'degradedBelowBytes');
  const unhealthyBelowBytes = positiveThreshold(options.unhealthyBelowBytes ?? 512 * 1024 * 1024, 'unhealthyBelowBytes');
  if (unhealthyBelowBytes >= degradedBelowBytes) throw new Error('unhealthyBelowBytes must be less than degradedBelowBytes.');
  const stat = options.stat ?? (async (target) => {
    const result = await statfs(target, { bigint: true });
    return { bavail: result.bavail, bsize: result.bsize };
  });

  return {
    id: 'disk-capacity',
    critical: true,
    async check(): Promise<HealthProbeObservation> {
      const result = await stat(path);
      const availableBigInt = BigInt(result.bavail) * BigInt(result.bsize);
      const capped = availableBigInt > BigInt(Number.MAX_SAFE_INTEGER) ? Number.MAX_SAFE_INTEGER : Number(availableBigInt);
      if (availableBigInt < BigInt(unhealthyBelowBytes)) {
        return { state: 'unhealthy', summary: 'Available disk capacity is critically low.', details: { availableBytes: capped } };
      }
      if (availableBigInt < BigInt(degradedBelowBytes)) {
        return { state: 'degraded', summary: 'Available disk capacity is low.', details: { availableBytes: capped } };
      }
      return { state: 'healthy', summary: 'Available disk capacity is sufficient.', details: { availableBytes: capped } };
    },
  };
}
