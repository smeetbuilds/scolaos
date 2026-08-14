import {
  DomainValidationError,
  normalizeAcademicSession,
  normalizeBranch,
  normalizeInstitutionSettings,
  validateAcademicSessionCatalog,
  validateBranchCatalog,
  type AcademicSession,
  type Branch,
  type InstitutionSettings,
  type InstitutionSettingsInput,
} from './institution.js';

export interface InstallerBranchSetupInput {
  readonly code: string;
  readonly name: string;
  readonly timezone?: string | null;
}

export interface InstallerAcademicSessionSetupInput {
  readonly code: string;
  readonly name: string;
  readonly startsOn: string;
  readonly endsOn: string;
}

export interface InstallerAdministratorSetupInput {
  readonly fullName: string;
  readonly email: string;
  readonly password: string;
  readonly passwordConfirmation: string;
}

export interface InstallerBootstrapInput {
  readonly institution: InstitutionSettingsInput;
  readonly branch: InstallerBranchSetupInput;
  readonly academicSession: InstallerAcademicSessionSetupInput;
  readonly administrator: InstallerAdministratorSetupInput;
}

export interface InstallerBootstrapIds {
  readonly institutionId: string;
  readonly branchId: string;
  readonly academicSessionId: string;
  readonly administratorUserId: string;
  readonly administratorMembershipId: string;
  readonly administratorRoleAssignmentId: string;
}

export interface NormalizedInstallerAdministrator {
  readonly fullName: string;
  readonly email: string;
  readonly normalizedLogin: string;
  readonly password: string;
}

export interface NormalizedInstallerBootstrap {
  readonly institutionId: string;
  readonly institution: InstitutionSettings;
  readonly branch: Branch;
  readonly academicSession: AcademicSession;
  readonly administrator: NormalizedInstallerAdministrator & {
    readonly userId: string;
    readonly membershipId: string;
    readonly roleAssignmentId: string;
  };
}

export interface BootstrapSeedDescriptor {
  readonly systemSeedVersion: number;
  readonly permissionCatalogVersion: number;
  readonly roleTemplateVersion: number;
  readonly fingerprint: string;
}

export interface BootstrapInstitutionRecord {
  readonly id: string;
  readonly settings: InstitutionSettings;
}

export interface BootstrapUserRecord {
  readonly id: string;
  readonly fullName: string;
  readonly email: string;
  readonly normalizedLogin: string;
  readonly passwordHash: string;
  readonly enabled: true;
  readonly forcePasswordReset: false;
}

export interface BootstrapMembershipRecord {
  readonly id: string;
  readonly userId: string;
  readonly institutionId: string;
  readonly branchId: string;
  readonly active: true;
}

export interface BootstrapRoleAssignmentRecord {
  readonly id: string;
  readonly membershipId: string;
  readonly roleKey: 'super-administrator';
  readonly institutionId: string;
}

export interface BootstrapReceipt {
  readonly installationId: string;
  readonly institutionId: string;
  readonly branchId: string;
  readonly academicSessionId: string;
  readonly administratorUserId: string;
  readonly administratorMembershipId: string;
  readonly administratorRoleAssignmentId: string;
  readonly seed: BootstrapSeedDescriptor;
  readonly completedAt: string;
}

export interface InstallerBootstrapTransaction {
  findReceipt(installationId: string): Promise<BootstrapReceipt | null>;
  applySeedPlan(seed: BootstrapSeedDescriptor): Promise<void>;
  createInstitution(record: BootstrapInstitutionRecord): Promise<void>;
  createBranch(record: Branch): Promise<void>;
  createAcademicSession(record: AcademicSession): Promise<void>;
  createUser(record: BootstrapUserRecord): Promise<void>;
  createMembership(record: BootstrapMembershipRecord): Promise<void>;
  assignRole(record: BootstrapRoleAssignmentRecord): Promise<void>;
  recordReceipt(receipt: BootstrapReceipt): Promise<void>;
}

export interface InstallerBootstrapRepository {
  findReceipt(installationId: string): Promise<BootstrapReceipt | null>;
  transaction<T>(work: (tx: InstallerBootstrapTransaction) => Promise<T>): Promise<T>;
}

export interface InstallerBootstrapDependencies {
  readonly repository: InstallerBootstrapRepository;
  readonly hashPassword: (password: string) => Promise<string>;
  readonly createId: () => string;
  readonly seed: BootstrapSeedDescriptor;
  readonly now?: () => Date;
}

function requiredText(value: string, field: string, maxLength: number): string {
  const normalized = value.trim().replace(/\s+/g, ' ');
  if (normalized.length === 0) {
    throw new DomainValidationError('REQUIRED', `${field} is required.`);
  }
  if (normalized.length > maxLength) {
    throw new DomainValidationError('TOO_LONG', `${field} is too long.`);
  }
  return normalized;
}

export function normalizeInstallerAdminEmail(value: string): {
  readonly email: string;
  readonly normalizedLogin: string;
} {
  const email = requiredText(value, 'administrator.email', 254);
  if (/\s|[\u0000-\u001f\u007f]/u.test(email)) {
    throw new DomainValidationError('ADMIN_EMAIL_INVALID', 'Administrator email is invalid.');
  }
  const at = email.lastIndexOf('@');
  if (at <= 0 || at !== email.indexOf('@') || at === email.length - 1) {
    throw new DomainValidationError('ADMIN_EMAIL_INVALID', 'Administrator email is invalid.');
  }
  const local = email.slice(0, at);
  const domain = email.slice(at + 1).toLowerCase();
  if (local.length > 64 || domain.length > 253 || domain.startsWith('.') || domain.endsWith('.') || domain.includes('..')) {
    throw new DomainValidationError('ADMIN_EMAIL_INVALID', 'Administrator email is invalid.');
  }
  const canonical = `${local}@${domain}`;
  return { email: canonical, normalizedLogin: canonical.normalize('NFKC').toLowerCase() };
}

export function normalizeInstallerBootstrapInput(
  input: InstallerBootstrapInput,
  ids: InstallerBootstrapIds,
): NormalizedInstallerBootstrap {
  const institutionId = requiredText(ids.institutionId, 'institutionId', 128);
  const branch = normalizeBranch({
    id: requiredText(ids.branchId, 'branchId', 128),
    institutionId,
    code: input.branch.code,
    name: input.branch.name,
    timezone: input.branch.timezone ?? null,
    isDefault: true,
    active: true,
  });
  validateBranchCatalog([branch]);

  const academicSession = normalizeAcademicSession({
    id: requiredText(ids.academicSessionId, 'academicSessionId', 128),
    institutionId,
    code: input.academicSession.code,
    name: input.academicSession.name,
    startsOn: input.academicSession.startsOn,
    endsOn: input.academicSession.endsOn,
    state: 'active',
  });
  validateAcademicSessionCatalog([academicSession]);

  const password = input.administrator.password.normalize('NFC');
  if (password !== input.administrator.passwordConfirmation.normalize('NFC')) {
    throw new DomainValidationError('ADMIN_PASSWORD_MISMATCH', 'Administrator password confirmation does not match.');
  }
  if (password.length === 0) {
    throw new DomainValidationError('REQUIRED', 'administrator.password is required.');
  }
  const email = normalizeInstallerAdminEmail(input.administrator.email);

  return {
    institutionId,
    institution: normalizeInstitutionSettings(input.institution),
    branch,
    academicSession,
    administrator: {
      userId: requiredText(ids.administratorUserId, 'administratorUserId', 128),
      membershipId: requiredText(ids.administratorMembershipId, 'administratorMembershipId', 128),
      roleAssignmentId: requiredText(ids.administratorRoleAssignmentId, 'administratorRoleAssignmentId', 128),
      fullName: requiredText(input.administrator.fullName, 'administrator.fullName', 160),
      email: email.email,
      normalizedLogin: email.normalizedLogin,
      password,
    },
  };
}

function assertSeedDescriptor(seed: BootstrapSeedDescriptor): void {
  for (const [name, value] of Object.entries({
    systemSeedVersion: seed.systemSeedVersion,
    permissionCatalogVersion: seed.permissionCatalogVersion,
    roleTemplateVersion: seed.roleTemplateVersion,
  })) {
    if (!Number.isSafeInteger(value) || value < 1) {
      throw new DomainValidationError('SEED_VERSION_INVALID', `${name} must be a positive integer.`);
    }
  }
  if (!/^[a-f0-9]{64}$/.test(seed.fingerprint)) {
    throw new DomainValidationError('SEED_FINGERPRINT_INVALID', 'Seed fingerprint must be a lowercase SHA-256 digest.');
  }
}

function createIds(createId: () => string): InstallerBootstrapIds {
  const ids: InstallerBootstrapIds = {
    institutionId: createId(),
    branchId: createId(),
    academicSessionId: createId(),
    administratorUserId: createId(),
    administratorMembershipId: createId(),
    administratorRoleAssignmentId: createId(),
  };
  const values = Object.values(ids);
  if (new Set(values).size !== values.length) {
    throw new DomainValidationError('GENERATED_ID_COLLISION', 'Bootstrap ID generator returned duplicate identifiers.');
  }
  return ids;
}

export class InstallerBootstrapCoordinator {
  private readonly now: () => Date;

  public constructor(private readonly dependencies: InstallerBootstrapDependencies) {
    assertSeedDescriptor(dependencies.seed);
    this.now = dependencies.now ?? (() => new Date());
  }

  public async execute(installationId: string, input: InstallerBootstrapInput): Promise<BootstrapReceipt> {
    const normalizedInstallationId = requiredText(installationId, 'installationId', 128);
    const preexisting = await this.dependencies.repository.findReceipt(normalizedInstallationId);
    if (preexisting !== null) return preexisting;

    const normalized = normalizeInstallerBootstrapInput(input, createIds(this.dependencies.createId));
    const passwordHash = await this.dependencies.hashPassword(normalized.administrator.password);
    if (passwordHash.trim() === '' || passwordHash.length > 4096) {
      throw new Error('Password hasher returned an invalid record.');
    }
    if (passwordHash === normalized.administrator.password) {
      throw new Error('Password hasher returned the raw administrator password.');
    }

    return this.dependencies.repository.transaction(async (tx) => {
      const existing = await tx.findReceipt(normalizedInstallationId);
      if (existing !== null) return existing;

      await tx.applySeedPlan(this.dependencies.seed);
      await tx.createInstitution({ id: normalized.institutionId, settings: normalized.institution });
      await tx.createBranch(normalized.branch);
      await tx.createAcademicSession(normalized.academicSession);
      await tx.createUser({
        id: normalized.administrator.userId,
        fullName: normalized.administrator.fullName,
        email: normalized.administrator.email,
        normalizedLogin: normalized.administrator.normalizedLogin,
        passwordHash,
        enabled: true,
        forcePasswordReset: false,
      });
      await tx.createMembership({
        id: normalized.administrator.membershipId,
        userId: normalized.administrator.userId,
        institutionId: normalized.institutionId,
        branchId: normalized.branch.id,
        active: true,
      });
      await tx.assignRole({
        id: normalized.administrator.roleAssignmentId,
        membershipId: normalized.administrator.membershipId,
        roleKey: 'super-administrator',
        institutionId: normalized.institutionId,
      });

      const receipt: BootstrapReceipt = {
        installationId: normalizedInstallationId,
        institutionId: normalized.institutionId,
        branchId: normalized.branch.id,
        academicSessionId: normalized.academicSession.id,
        administratorUserId: normalized.administrator.userId,
        administratorMembershipId: normalized.administrator.membershipId,
        administratorRoleAssignmentId: normalized.administrator.roleAssignmentId,
        seed: this.dependencies.seed,
        completedAt: this.now().toISOString(),
      };
      await tx.recordReceipt(receipt);
      return receipt;
    });
  }
}
