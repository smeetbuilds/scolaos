import type { InstallationConfig } from './types.js';

export type VerificationCheckId =
  | 'database-connectivity'
  | 'migrations-current'
  | 'permission-seed'
  | 'bootstrap-data';

export interface VerificationObservation {
  readonly ok: boolean;
  readonly summary: string;
}

export interface VerificationCheckResult extends VerificationObservation {
  readonly id: VerificationCheckId;
}

export interface PostInstallVerificationReport {
  readonly ok: boolean;
  readonly installationId: string;
  readonly checkedAt: string;
  readonly checks: readonly VerificationCheckResult[];
}

export interface PostInstallVerificationProvider {
  checkDatabaseConnectivity(config: InstallationConfig): Promise<VerificationObservation>;
  checkMigrationsCurrent(config: InstallationConfig): Promise<VerificationObservation>;
  checkPermissionSeed(config: InstallationConfig): Promise<VerificationObservation>;
  checkBootstrapData(config: InstallationConfig): Promise<VerificationObservation>;
}

function normalizeObservation(value: VerificationObservation): VerificationObservation {
  const summary = value.summary.trim();
  if (summary === '' || summary.length > 240) {
    return { ok: false, summary: 'Verification check returned an invalid result.' };
  }
  if (/password|secret|token|authorization|cookie|postgres(?:ql)?:\/\/[^\s@]+@/i.test(summary)) {
    return { ok: false, summary: 'Verification check returned unsafe diagnostic content.' };
  }
  return { ok: value.ok, summary };
}

export class PostInstallVerificationService {
  public constructor(
    private readonly provider: PostInstallVerificationProvider,
    private readonly now: () => Date = () => new Date(),
  ) {}

  private async run(
    id: VerificationCheckId,
    check: () => Promise<VerificationObservation>,
  ): Promise<VerificationCheckResult> {
    try {
      return { id, ...normalizeObservation(await check()) };
    } catch {
      return { id, ok: false, summary: 'Verification check failed.' };
    }
  }

  public async verify(config: InstallationConfig): Promise<PostInstallVerificationReport> {
    const checks: VerificationCheckResult[] = [];
    checks.push(
      await this.run('database-connectivity', () =>
        this.provider.checkDatabaseConnectivity(config),
      ),
    );
    checks.push(
      await this.run('migrations-current', () => this.provider.checkMigrationsCurrent(config)),
    );
    checks.push(
      await this.run('permission-seed', () => this.provider.checkPermissionSeed(config)),
    );
    checks.push(await this.run('bootstrap-data', () => this.provider.checkBootstrapData(config)));
    return {
      ok: checks.every((check) => check.ok),
      installationId: config.installationId,
      checkedAt: this.now().toISOString(),
      checks,
    };
  }
}
