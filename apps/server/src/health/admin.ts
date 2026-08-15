import type { HealthSnapshot, HealthState } from './types.js';

export interface HealthAdminCheck {
  readonly id: string;
  readonly state: HealthState;
  readonly critical: boolean;
  readonly summary: string;
  readonly observedAt: string;
  readonly latencyMs: number;
  readonly details?: Readonly<Record<string, string | number | boolean | null>>;
}

export interface HealthAdminView {
  readonly state: HealthState;
  readonly ready: boolean;
  readonly observedAt: string;
  readonly counts: Readonly<Record<HealthState, number>>;
  readonly checks: readonly HealthAdminCheck[];
}

export interface PublicReadinessView {
  readonly status: 'ready' | 'degraded' | 'unavailable';
  readonly observedAt: string;
}

export interface HealthSnapshotProvider {
  snapshot(): Promise<HealthSnapshot>;
}

function countStates(checks: HealthSnapshot['checks']): Readonly<Record<HealthState, number>> {
  const counts: Record<HealthState, number> = { healthy: 0, degraded: 0, unhealthy: 0, unknown: 0 };
  for (const check of checks) counts[check.state] += 1;
  return Object.freeze(counts);
}

function readiness(snapshot: HealthSnapshot): boolean {
  return snapshot.checks.every(
    (check) => !check.critical || (check.state !== 'unhealthy' && check.state !== 'unknown'),
  );
}

export function projectHealthAdminView(snapshot: HealthSnapshot): HealthAdminView {
  const checks = [...snapshot.checks]
    .sort((a, b) => Number(b.critical) - Number(a.critical) || a.id.localeCompare(b.id))
    .map((check) => Object.freeze({ ...check }));
  return Object.freeze({
    state: snapshot.state,
    ready: readiness(snapshot),
    observedAt: snapshot.observedAt,
    counts: countStates(snapshot.checks),
    checks: Object.freeze(checks),
  });
}

export function projectPublicReadiness(snapshot: HealthSnapshot): PublicReadinessView {
  const ready = readiness(snapshot);
  const status = !ready ? 'unavailable' : snapshot.state === 'healthy' ? 'ready' : 'degraded';
  return Object.freeze({ status, observedAt: snapshot.observedAt });
}

export class HealthAdminService {
  public constructor(private readonly provider: HealthSnapshotProvider) {}

  public async adminView(): Promise<HealthAdminView> {
    return projectHealthAdminView(await this.provider.snapshot());
  }

  public async publicReadiness(): Promise<PublicReadinessView> {
    return projectPublicReadiness(await this.provider.snapshot());
  }
}
