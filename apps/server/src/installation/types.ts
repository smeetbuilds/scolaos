export type BootState = 'unconfigured' | 'configured' | 'installed';
export type InstallationPhase = 'UNCONFIGURED' | 'CONFIG_WRITTEN' | 'INSTALLED';
export type DatabaseSslMode = 'disable' | 'prefer' | 'require' | 'verify-full';

export interface InstallationConfigInput {
  readonly baseUrl: string;
  readonly database: {
    readonly host: string;
    readonly port: number;
    readonly database: string;
    readonly user: string;
    readonly password: string;
    readonly sslMode: DatabaseSslMode;
  };
}

export interface InstallationConfig extends InstallationConfigInput {
  readonly schemaVersion: 1;
  readonly installationId: string;
  readonly createdAt: string;
  readonly security: {
    readonly sessionSecret: string;
    readonly installerSecret: string;
  };
}

export interface PublicInstallationConfig {
  readonly installationId: string;
  readonly baseUrl: string;
  readonly database: {
    readonly host: string;
    readonly port: number;
    readonly database: string;
    readonly user: string;
    readonly sslMode: DatabaseSslMode;
  };
}

export interface InstallationSnapshot {
  readonly bootState: BootState;
  readonly phase: InstallationPhase;
  readonly config?: InstallationConfig;
}

export interface PublicInstallationStatus {
  readonly bootState: BootState;
  readonly phase: InstallationPhase;
  readonly config?: PublicInstallationConfig;
}
