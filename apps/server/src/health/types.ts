export type HealthState = 'healthy' | 'degraded' | 'unhealthy' | 'unknown';

export interface HealthProbeObservation {
  readonly state: HealthState;
  readonly summary: string;
  readonly details?: Readonly<Record<string, string | number | boolean | null>>;
}

export interface HealthProbe {
  readonly id: string;
  readonly critical: boolean;
  readonly timeoutMs?: number;
  check(): Promise<HealthProbeObservation>;
}

export interface HealthProbeResult extends HealthProbeObservation {
  readonly id: string;
  readonly critical: boolean;
  readonly observedAt: string;
  readonly latencyMs: number;
}

export interface HealthSnapshot {
  readonly state: HealthState;
  readonly observedAt: string;
  readonly checks: readonly HealthProbeResult[];
}
