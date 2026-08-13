import { ScolaApiError } from '../errors.js';
import { InstallerCsrf, type InstallerMutationContext } from './csrf.js';
import {
  InstallationConfigStore,
  toPublicInstallationConfig,
} from './config-store.js';
import { InstallerLock } from './lock.js';
import type {
  InstallationConfig,
  PublicInstallationStatus,
} from './types.js';

export class InstallationService {
  public readonly store: InstallationConfigStore;
  public readonly lock: InstallerLock;
  public readonly csrf = new InstallerCsrf();

  public constructor(dataDirectory: string) {
    this.store = new InstallationConfigStore(dataDirectory);
    this.lock = new InstallerLock(dataDirectory);
  }

  public async getStatus(): Promise<PublicInstallationStatus> {
    const snapshot = await this.store.readSnapshot();
    return {
      bootState: snapshot.bootState,
      phase: snapshot.phase,
      ...(snapshot.config === undefined
        ? {}
        : { config: toPublicInstallationConfig(snapshot.config) }),
    };
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
      return await this.store.writeInitialConfig(value);
    } finally {
      await handle.release();
    }
  }

  public async markInstalledAfterVerification(): Promise<void> {
    const handle = await this.lock.acquire();
    try {
      const snapshot = await this.store.readSnapshot();
      if (snapshot.bootState === 'installed') {
        return;
      }
      if (snapshot.config === undefined || snapshot.bootState !== 'configured') {
        throw new ScolaApiError(
          'INSTALLATION_NOT_READY',
          'Installation cannot be finalized before configuration is written and verified.',
          409,
        );
      }

      await this.store.markInstalled(snapshot.config.installationId);
    } finally {
      await handle.release();
    }
  }
}
