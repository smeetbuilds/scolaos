import { ScolaApiError } from '../errors.js';
import { InstallerCsrf, type InstallerMutationContext } from './csrf.js';
import { InstallationConfigStore, toPublicInstallationConfig } from './config-store.js';
import { InstallerLock } from './lock.js';
import {
  currentInstallationPhase,
  InstallationProgressStore,
  toPublicInstallationProgress,
} from './progress.js';
import {
  replacePendingInstallationConfig,
  toInstallationRecoveryState,
} from './recovery.js';
import { InstallerRequirementsService } from './requirements.js';
import type {
  InstallationConfig,
  InstallationExecutionPhase,
  PublicInstallationStatus,
} from './types.js';
import {
  PostInstallVerificationService,
  type PostInstallVerificationProvider,
  type PostInstallVerificationReport,
} from './verification.js';

export interface InstallationServiceOptions {
  readonly verificationProvider?: PostInstallVerificationProvider;
}

export class InstallationService {
  public readonly store: InstallationConfigStore;
  public readonly lock: InstallerLock;
  public readonly csrf = new InstallerCsrf();
  private readonly progress: InstallationProgressStore;
  private readonly verifier?: PostInstallVerificationService;

  public constructor(
    public readonly dataDirectory: string,
    options: InstallationServiceOptions = {},
  ) {
    this.store = new InstallationConfigStore(dataDirectory);
    this.lock = new InstallerLock(dataDirectory);
    this.progress = new InstallationProgressStore(dataDirectory);
    this.verifier =
      options.verificationProvider === undefined
        ? undefined
        : new PostInstallVerificationService(options.verificationProvider);
  }

  public async getStatus(): Promise<PublicInstallationStatus> {
    const snapshot = await this.store.readSnapshot();
    if (snapshot.bootState !== 'configured' || snapshot.config === undefined) {
      return {
        bootState: snapshot.bootState,
        phase: snapshot.phase,
        ...(snapshot.config === undefined
          ? {}
          : { config: toPublicInstallationConfig(snapshot.config) }),
      };
    }

    const progress = await this.progress.read(snapshot.config.installationId);
    return {
      bootState: 'configured',
      phase: currentInstallationPhase(progress),
      config: toPublicInstallationConfig(snapshot.config),
      progress: toPublicInstallationProgress(progress),
    };
  }

  public async checkRequirements(detectedBaseUrl?: string) {
    return new InstallerRequirementsService({
      dataDirectory: this.dataDirectory,
      ...(detectedBaseUrl === undefined ? {} : { detectedBaseUrl }),
    }).check();
  }

  public async getRecoveryState() {
    const snapshot = await this.store.readSnapshot();
    if (snapshot.bootState !== 'configured' || snapshot.config === undefined) {
      return {
        state: 'not-needed' as const,
        message:
          snapshot.bootState === 'installed'
            ? 'Installation has already completed.'
            : 'No recoverable installation work exists yet.',
        canRetry: false,
        canEditConfiguration: false,
      };
    }
    return toInstallationRecoveryState(
      await this.progress.read(snapshot.config.installationId),
    );
  }

  public async getStoredConfig(): Promise<InstallationConfig | null> {
    return this.store.readConfig();
  }

  public issueCsrfSession(secure: boolean) {
    return this.csrf.issue(secure);
  }

  public async assertInstallerMutable(): Promise<void> {
    const status = await this.getStatus();
    if (status.bootState === 'installed') {
      throw new ScolaApiError(
        'INSTALLER_DISABLED',
        'Installation has already completed and installer mutations are disabled.',
        409,
      );
    }
  }

  public verifyMutation(context: InstallerMutationContext): void {
    if (!this.csrf.verify(context)) {
      throw new ScolaApiError(
        'INSTALLER_CSRF_INVALID',
        'Installer request verification failed. Refresh the installer and try again.',
        403,
      );
    }
  }

  public async writeInitialConfig(value: unknown): Promise<InstallationConfig> {
    const handle = await this.lock.acquire();
    try {
      await this.assertInstallerMutable();
      const status = await this.getStatus();
      if (status.bootState !== 'unconfigured') {
        throw new ScolaApiError(
          'INSTALLATION_CONFIG_EXISTS',
          'Installation configuration has already been written.',
          409,
        );
      }
      const config = await this.store.writeInitialConfig(value);
      await this.progress.initialize(config.installationId);
      return config;
    } finally {
      await handle.release();
    }
  }

  public async replacePendingConfig(value: unknown): Promise<InstallationConfig> {
    const handle = await this.lock.acquire();
    try {
      await this.assertInstallerMutable();
      const config = await this.store.readConfig();
      if (config === null) {
        throw new ScolaApiError(
          'INSTALLATION_NOT_READY',
          'Installation configuration has not been written.',
          409,
        );
      }
      const progress = await this.progress.read(config.installationId);
      const replacement = await replacePendingInstallationConfig(this.store, progress, value);
      await this.progress.resetBeforeDatabase(config.installationId);
      return replacement;
    } finally {
      await handle.release();
    }
  }

  public async beginPhase(phase: InstallationExecutionPhase) {
    const handle = await this.lock.acquire();
    try {
      await this.assertInstallerMutable();
      const config = await this.store.readConfig();
      if (config === null) {
        throw new ScolaApiError(
          'INSTALLATION_NOT_READY',
          'Installation configuration has not been written.',
          409,
        );
      }
      return await this.progress.begin(config.installationId, phase);
    } finally {
      await handle.release();
    }
  }

  public async completePhase(phase: InstallationExecutionPhase) {
    const handle = await this.lock.acquire();
    try {
      await this.assertInstallerMutable();
      const config = await this.store.readConfig();
      if (config === null) {
        throw new ScolaApiError(
          'INSTALLATION_NOT_READY',
          'Installation configuration has not been written.',
          409,
        );
      }
      return await this.progress.complete(config.installationId, phase);
    } finally {
      await handle.release();
    }
  }

  public async failPhase(
    phase: InstallationExecutionPhase,
    failure: { readonly code: string; readonly message: string; readonly retryable: boolean },
  ) {
    const handle = await this.lock.acquire();
    try {
      await this.assertInstallerMutable();
      const config = await this.store.readConfig();
      if (config === null) {
        throw new ScolaApiError(
          'INSTALLATION_NOT_READY',
          'Installation configuration has not been written.',
          409,
        );
      }
      return await this.progress.fail(config.installationId, phase, failure);
    } finally {
      await handle.release();
    }
  }

  public async finalizeInstallation(): Promise<PostInstallVerificationReport | null> {
    const handle = await this.lock.acquire();
    try {
      const snapshot = await this.store.readSnapshot();
      if (snapshot.bootState === 'installed') return null;
      if (snapshot.config === undefined || snapshot.bootState !== 'configured') {
        throw new ScolaApiError(
          'INSTALLATION_NOT_READY',
          'Installation cannot be finalized before configuration is written.',
          409,
        );
      }

      const progress = await this.progress.read(snapshot.config.installationId);
      if (progress.completedPhase === 'VERIFYING' && progress.state === 'ready') {
        await this.store.markInstalled(snapshot.config.installationId);
        return null;
      }
      if (progress.completedPhase !== 'SEEDING') {
        throw new ScolaApiError(
          'INSTALLATION_NOT_READY',
          'Database migration and seed phases must complete before verification.',
          409,
        );
      }
      if (this.verifier === undefined) {
        throw new ScolaApiError(
          'INSTALLATION_VERIFICATION_UNAVAILABLE',
          'Post-install verification is not configured.',
          503,
        );
      }

      await this.progress.begin(snapshot.config.installationId, 'VERIFYING');
      const report = await this.verifier.verify(snapshot.config);
      if (!report.ok) {
        await this.progress.fail(snapshot.config.installationId, 'VERIFYING', {
          code: 'POST_INSTALL_VERIFICATION_FAILED',
          message:
            'Post-install verification did not pass. Review the failed checks and retry safely.',
          retryable: true,
        });
        throw new ScolaApiError(
          'INSTALLATION_VERIFICATION_FAILED',
          'Post-install verification did not pass.',
          409,
        );
      }

      await this.progress.complete(snapshot.config.installationId, 'VERIFYING');
      await this.store.markInstalled(snapshot.config.installationId);
      return report;
    } finally {
      await handle.release();
    }
  }
}
