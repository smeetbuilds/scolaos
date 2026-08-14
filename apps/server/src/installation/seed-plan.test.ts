import { describe, expect, it } from 'vitest';

import { PERMISSION_CATALOG } from '../authorization/permissions.js';
import {
  INSTALLATION_SEED_FINGERPRINT,
  INSTALLATION_SEED_PLAN,
  fingerprintInstallationSeedPlan,
  validateInstallationSeedPlan,
} from './seed-plan.js';

describe('installation seed plan', () => {
  it('is internally consistent and grants the initial super administrator every catalog permission', () => {
    expect(() => validateInstallationSeedPlan()).not.toThrow();
    const superAdministrator = INSTALLATION_SEED_PLAN.roles.find(
      (role) => role.key === 'super-administrator',
    );
    expect(superAdministrator).toBeDefined();
    expect(new Set(superAdministrator?.permissions)).toEqual(
      new Set(PERMISSION_CATALOG.map((permission) => permission.id)),
    );
  });

  it('produces a stable SHA-256 fingerprint and changes it when seeded content changes', () => {
    expect(INSTALLATION_SEED_FINGERPRINT).toMatch(/^[a-f0-9]{64}$/);
    expect(fingerprintInstallationSeedPlan()).toBe(INSTALLATION_SEED_FINGERPRINT);
    expect(
      fingerprintInstallationSeedPlan({
        ...INSTALLATION_SEED_PLAN,
        permissions: INSTALLATION_SEED_PLAN.permissions.map((permission, index) =>
          index === 0 ? { ...permission, description: `${permission.description} changed` } : permission,
        ) as never,
      }),
    ).not.toBe(INSTALLATION_SEED_FINGERPRINT);
  });

  it('rejects roles that refer to permissions outside the catalog', () => {
    expect(() =>
      validateInstallationSeedPlan({
        ...INSTALLATION_SEED_PLAN,
        roles: [
          {
            ...INSTALLATION_SEED_PLAN.roles[0]!,
            permissions: ['not.real.permission'] as never,
          },
        ] as never,
      }),
    ).toThrow(/unknown permission/i);
  });
});
