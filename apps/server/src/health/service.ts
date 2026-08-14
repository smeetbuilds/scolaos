import type {
  HealthProbe,
  HealthProbeObservation,
  HealthProbeResult,
  HealthSnapshot,
  HealthState,
} from './types.js';

const PROBE_ID_PATTERN = /^[a-z][a-z0-9-]{0,63}$/;
const DEFAULT_TIMEOUT_MS = 3_000;
const SENSITIVE_DETAIL_KEYS = new Set([
  'password',
  'passwordhash',
  'token',
  'accesstoken',
  'refreshtoken',
  'resettoken',
  'authorization',
  'cookie',
  'secret',
  'clientsecret',
  'credential',
  'credentials',
  'connectionstring',
  'databaseurl',
  'privatekey',
  'apikey',
]);

function normalizedKey(key: string): string {
  return key.replace(/[^a-z0-9]/gi, '').toLowerCase();
}

function normalizeObservation(observation: HealthProbeObservation): HealthProbeObservation {
  const summary = observation.summary.trim();
  if (summary === '' || summary.length > 240) {
    throw new Error('Health probe summary is invalid.');
  }
  if (observation.details !== undefined) {
    for (const [key, value] of Object.entries(observation.details)) {
      if (!/^[A-Za-z][A-Za-z0-9_.-]{0,63}$/.test(key)) {
        throw new Error('Health detail key is invalid.');
      }
      if (SENSITIVE_DETAIL_KEYS.has(normalizedKey(key))) {
        throw new Error('Health detail key is prohibited.');
      }
      if (typeof value === 'string' && value.length > 240) {
        throw new Error('Health detail value is too long.');
      }
      if (typeof value === 'number' && !Number.isFinite(value)) {
        throw new Error('Health detail number must be finite.');
      }
    }
  }
  return { ...observation, summary };
}

function overallState(results: readonly HealthProbeResult[]): HealthState {
  if (
    results.some(
      (result) => result.critical && (result.state === 'unhealthy' || result.state === 'unknown'),
    )
  ) {
    return 'unhealthy';
  }
  if (results.some((result) => result.state !== 'healthy')) {
    return 'degraded';
  }
  return 'healthy';
}

export interface HealthCheckServiceOptions {
  readonly now?: () => Date;
  readonly defaultTimeoutMs?: number;
}

export class HealthCheckService {
  private readonly now: () => Date;
  private readonly defaultTimeoutMs: number;

  public constructor(
    private readonly probes: readonly HealthProbe[],
    options: HealthCheckServiceOptions = {},
  ) {
    const ids = new Set<string>();
    for (const probe of probes) {
      if (!PROBE_ID_PATTERN.test(probe.id)) {
        throw new Error(`Invalid health probe ID: ${probe.id}`);
      }
      if (ids.has(probe.id)) {
        throw new Error(`Duplicate health probe ID: ${probe.id}`);
      }
      ids.add(probe.id);
    }
    this.now = options.now ?? (() => new Date());
    this.defaultTimeoutMs = options.defaultTimeoutMs ?? DEFAULT_TIMEOUT_MS;
  }

  private async runProbe(probe: HealthProbe): Promise<HealthProbeResult> {
    const started = Date.now();
    const timeoutMs = probe.timeoutMs ?? this.defaultTimeoutMs;
    let timer: ReturnType<typeof setTimeout> | undefined;

    try {
      const observation = await Promise.race([
        probe.check(),
        new Promise<HealthProbeObservation>((resolve) => {
          timer = setTimeout(
            () => resolve({ state: 'unhealthy', summary: 'Health probe timed out.' }),
            timeoutMs,
          );
        }),
      ]);
      const normalized = normalizeObservation(observation);
      return {
        ...normalized,
        id: probe.id,
        critical: probe.critical,
        observedAt: this.now().toISOString(),
        latencyMs: Math.max(0, Date.now() - started),
      };
    } catch {
      return {
        id: probe.id,
        critical: probe.critical,
        state: 'unhealthy',
        summary: 'Health probe failed.',
        observedAt: this.now().toISOString(),
        latencyMs: Math.max(0, Date.now() - started),
      };
    } finally {
      if (timer !== undefined) {
        clearTimeout(timer);
      }
    }
  }

  public async snapshot(): Promise<HealthSnapshot> {
    const observedAt = this.now().toISOString();
    const checks = await Promise.all(this.probes.map((probe) => this.runProbe(probe)));
    return { state: overallState(checks), observedAt, checks };
  }
}
