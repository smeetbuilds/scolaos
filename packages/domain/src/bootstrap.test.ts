import { describe, expect, it, vi } from 'vitest';

import {
  InstallerBootstrapCoordinator,
  normalizeInstallerAdminEmail,
  normalizeInstallerBootstrapInput,
  type BootstrapReceipt,
  type InstallerBootstrapInput,
  type InstallerBootstrapRepository,
  type InstallerBootstrapTransaction,
} from './bootstrap.js';

const input: InstallerBootstrapInput = {
  institution: {
    name: ' Example School ',
    shortCode: ' ex ',
    countryCode: 'in',
    timezone: 'Asia/Kolkata',
    currency: 'inr',
    locale: 'en-IN',
  },
  branch: { code: 'main', name: 'Main Campus' },
  academicSession: {
    code: '2026-27',
    name: '2026 / 2027',
    startsOn: '2026-06-01',
    endsOn: '2027-05-31',
  },
  administrator: {
    fullName: ' Admin User ',
    email: 'Admin@Example.COM',
    password: 'a sufficiently long installer password',
    passwordConfirmation: 'a sufficiently long installer password',
  },
};

function ids() {
  return {
    institutionId: 'institution-1',
    branchId: 'branch-1',
    academicSessionId: 'session-1',
    administratorUserId: 'user-1',
    administratorMembershipId: 'membership-1',
    administratorRoleAssignmentId: 'assignment-1',
  };
}

class TransactionalMemoryRepository implements InstallerBootstrapRepository {
  public receipt: BootstrapReceipt | null = null;
  public committedKinds: string[] = [];
  public userRecord: Record<string, unknown> | null = null;
  public failAt: string | null = null;

  public async findReceipt(): Promise<BootstrapReceipt | null> {
    return this.receipt;
  }

  public async transaction<T>(work: (tx: InstallerBootstrapTransaction) => Promise<T>): Promise<T> {
    const stagedKinds: string[] = [];
    let stagedReceipt: BootstrapReceipt | null = null;
    let stagedUser: Record<string, unknown> | null = null;
    const tx: InstallerBootstrapTransaction = {
      findReceipt: async () => this.receipt,
      applySeedPlan: async () => {
        stagedKinds.push('seed');
        if (this.failAt === 'seed') throw new Error('seed failure');
      },
      createInstitution: async () => {
        stagedKinds.push('institution');
        if (this.failAt === 'institution') throw new Error('institution failure');
      },
      createBranch: async () => {
        stagedKinds.push('branch');
      },
      createAcademicSession: async () => {
        stagedKinds.push('session');
      },
      createUser: async (record) => {
        stagedKinds.push('user');
        stagedUser = { ...record };
      },
      createMembership: async () => {
        stagedKinds.push('membership');
      },
      assignRole: async () => {
        stagedKinds.push('role');
      },
      recordReceipt: async (receipt) => {
        stagedKinds.push('receipt');
        stagedReceipt = receipt;
      },
    };

    const result = await work(tx);
    if (this.receipt === null) {
      this.committedKinds.push(...stagedKinds);
      this.receipt = stagedReceipt;
      this.userRecord = stagedUser;
    }
    return result;
  }
}

describe('installer bootstrap normalization', () => {
  it('normalizes the first institution, default branch, active session, and administrator login', () => {
    const normalized = normalizeInstallerBootstrapInput(input, ids());
    expect(normalized.institution).toMatchObject({
      name: 'Example School',
      shortCode: 'EX',
      countryCode: 'IN',
      currency: 'INR',
      locale: 'en-IN',
    });
    expect(normalized.branch).toMatchObject({ isDefault: true, active: true });
    expect(normalized.academicSession.state).toBe('active');
    expect(normalized.administrator).toMatchObject({
      fullName: 'Admin User',
      email: 'Admin@example.com',
      normalizedLogin: 'admin@example.com',
    });
  });

  it('keeps the email local part for delivery but normalizes the login identifier', () => {
    expect(normalizeInstallerAdminEmail('Owner@School.EXAMPLE')).toEqual({
      email: 'Owner@school.example',
      normalizedLogin: 'owner@school.example',
    });
  });

  it('rejects malformed administrator email and password confirmation mismatch', () => {
    expect(() => normalizeInstallerAdminEmail('not-an-email')).toThrowError(
      expect.objectContaining({ code: 'ADMIN_EMAIL_INVALID' }),
    );
    expect(() =>
      normalizeInstallerBootstrapInput(
        {
          ...input,
          administrator: { ...input.administrator, passwordConfirmation: 'different' },
        },
        ids(),
      ),
    ).toThrowError(expect.objectContaining({ code: 'ADMIN_PASSWORD_MISMATCH' }));
  });
});

describe('installer bootstrap transaction', () => {
  it('writes the complete bootstrap in one transaction and persists only the password hash', async () => {
    const repository = new TransactionalMemoryRepository();
    const hashPassword = vi.fn(async (password: string) => `hash:${password}`);
    let counter = 0;
    const coordinator = new InstallerBootstrapCoordinator({
      repository,
      hashPassword,
      createId: () => `generated-${++counter}`,
      seed: {
        systemSeedVersion: 1,
        permissionCatalogVersion: 1,
        roleTemplateVersion: 1,
        fingerprint: 'a'.repeat(64),
      },
      now: () => new Date('2026-08-14T12:00:00Z'),
    });

    const receipt = await coordinator.execute('installation-1', input);
    expect(repository.committedKinds).toEqual([
      'seed',
      'institution',
      'branch',
      'session',
      'user',
      'membership',
      'role',
      'receipt',
    ]);
    expect(repository.userRecord).toMatchObject({
      passwordHash: 'hash:a sufficiently long installer password',
      normalizedLogin: 'admin@example.com',
      enabled: true,
      forcePasswordReset: false,
    });
    expect(JSON.stringify(repository.userRecord)).not.toContain('passwordConfirmation');
    expect(repository.userRecord).not.toHaveProperty('password');
    expect(receipt.completedAt).toBe('2026-08-14T12:00:00.000Z');
    expect(hashPassword).toHaveBeenCalledOnce();
  });

  it('returns the existing receipt on a completed replay without creating duplicate records', async () => {
    const repository = new TransactionalMemoryRepository();
    let counter = 0;
    const hashPassword = vi.fn(async (password: string) => `hash:${password}`);
    const coordinator = new InstallerBootstrapCoordinator({
      repository,
      hashPassword,
      createId: () => `generated-${++counter}`,
      seed: {
        systemSeedVersion: 1,
        permissionCatalogVersion: 1,
        roleTemplateVersion: 1,
        fingerprint: 'a'.repeat(64),
      },
      now: () => new Date('2026-08-14T12:00:00Z'),
    });
    const first = await coordinator.execute('installation-1', input);
    const committed = [...repository.committedKinds];
    const replay = await coordinator.execute('installation-1', {
      ...input,
      institution: { ...input.institution, name: 'Ignored replay payload' },
    });
    expect(replay).toEqual(first);
    expect(repository.committedKinds).toEqual(committed);
    expect(hashPassword).toHaveBeenCalledOnce();
    expect(counter).toBe(6);
  });

  it('rejects a broken ID generator and a hasher that returns the raw password', async () => {
    const repository = new TransactionalMemoryRepository();
    const duplicateIds = new InstallerBootstrapCoordinator({
      repository,
      hashPassword: async (password) => `hash:${password}`,
      createId: () => 'duplicate-id',
      seed: {
        systemSeedVersion: 1,
        permissionCatalogVersion: 1,
        roleTemplateVersion: 1,
        fingerprint: 'a'.repeat(64),
      },
    });
    await expect(duplicateIds.execute('installation-3', input)).rejects.toMatchObject({
      code: 'GENERATED_ID_COLLISION',
    });

    let counter = 0;
    const rawHasher = new InstallerBootstrapCoordinator({
      repository,
      hashPassword: async (password) => password,
      createId: () => `raw-${++counter}`,
      seed: {
        systemSeedVersion: 1,
        permissionCatalogVersion: 1,
        roleTemplateVersion: 1,
        fingerprint: 'b'.repeat(64),
      },
    });
    await expect(rawHasher.execute('installation-4', input)).rejects.toThrow(/raw administrator password/i);
  });

  it('does not commit a partial school when the transaction throws', async () => {
    const repository = new TransactionalMemoryRepository();
    repository.failAt = 'institution';
    const coordinator = new InstallerBootstrapCoordinator({
      repository,
      hashPassword: async (password) => `hash:${password}`,
      createId: () => crypto.randomUUID(),
      seed: {
        systemSeedVersion: 1,
        permissionCatalogVersion: 1,
        roleTemplateVersion: 1,
        fingerprint: 'a'.repeat(64),
      },
    });

    await expect(coordinator.execute('installation-2', input)).rejects.toThrow('institution failure');
    expect(repository.receipt).toBeNull();
    expect(repository.committedKinds).toEqual([]);
  });
});
