import { createHash } from 'node:crypto';

import {
  PERMISSION_CATALOG,
  PERMISSION_CATALOG_VERSION,
} from '../authorization/permissions.js';
import {
  DEFAULT_ROLE_TEMPLATES,
  DEFAULT_ROLE_TEMPLATE_VERSION,
} from '../authorization/roles.js';

export const SYSTEM_SEED_VERSION = 1 as const;

export interface InstallationSeedPlan {
  readonly systemSeedVersion: typeof SYSTEM_SEED_VERSION;
  readonly permissionCatalogVersion: typeof PERMISSION_CATALOG_VERSION;
  readonly roleTemplateVersion: typeof DEFAULT_ROLE_TEMPLATE_VERSION;
  readonly permissions: typeof PERMISSION_CATALOG;
  readonly roles: typeof DEFAULT_ROLE_TEMPLATES;
}

export const INSTALLATION_SEED_PLAN: InstallationSeedPlan = Object.freeze({
  systemSeedVersion: SYSTEM_SEED_VERSION,
  permissionCatalogVersion: PERMISSION_CATALOG_VERSION,
  roleTemplateVersion: DEFAULT_ROLE_TEMPLATE_VERSION,
  permissions: PERMISSION_CATALOG,
  roles: DEFAULT_ROLE_TEMPLATES,
});

export function validateInstallationSeedPlan(plan: InstallationSeedPlan = INSTALLATION_SEED_PLAN): void {
  const permissionIds = new Set<string>();
  for (const permission of plan.permissions) {
    if (permissionIds.has(permission.id)) {
      throw new Error(`Duplicate permission in seed plan: ${permission.id}.`);
    }
    permissionIds.add(permission.id);
  }

  const roleKeys = new Set<string>();
  for (const role of plan.roles) {
    if (roleKeys.has(role.key)) {
      throw new Error(`Duplicate role in seed plan: ${role.key}.`);
    }
    roleKeys.add(role.key);
    const rolePermissions = new Set<string>();
    for (const permission of role.permissions) {
      if (!permissionIds.has(permission)) {
        throw new Error(`Role ${role.key} references unknown permission ${permission}.`);
      }
      if (rolePermissions.has(permission)) {
        throw new Error(`Role ${role.key} repeats permission ${permission}.`);
      }
      rolePermissions.add(permission);
    }
  }

  const superAdministrator = plan.roles.find((role) => role.key === 'super-administrator');
  if (superAdministrator === undefined) {
    throw new Error('Installation seed plan must contain the super-administrator role template.');
  }
  const superPermissions = new Set<string>(superAdministrator.permissions);
  if (
    superPermissions.size !== permissionIds.size ||
    [...permissionIds].some((id) => !superPermissions.has(id))
  ) {
    throw new Error(
      'Super-administrator seed template must explicitly grant every current permission.',
    );
  }
}

function canonicalSeedPayload(plan: InstallationSeedPlan): string {
  return JSON.stringify({
    systemSeedVersion: plan.systemSeedVersion,
    permissionCatalogVersion: plan.permissionCatalogVersion,
    roleTemplateVersion: plan.roleTemplateVersion,
    permissions: plan.permissions.map((permission) => ({
      id: permission.id,
      area: permission.area,
      description: permission.description,
    })),
    roles: plan.roles.map((role) => ({
      key: role.key,
      name: role.name,
      description: role.description,
      scopeStrategy: role.scopeStrategy,
      permissions: [...role.permissions],
    })),
  });
}

export function fingerprintInstallationSeedPlan(
  plan: InstallationSeedPlan = INSTALLATION_SEED_PLAN,
): string {
  validateInstallationSeedPlan(plan);
  return createHash('sha256').update(canonicalSeedPayload(plan), 'utf8').digest('hex');
}

validateInstallationSeedPlan();

export const INSTALLATION_SEED_FINGERPRINT = fingerprintInstallationSeedPlan();

export const INSTALLATION_SEED_DESCRIPTOR = Object.freeze({
  systemSeedVersion: SYSTEM_SEED_VERSION,
  permissionCatalogVersion: PERMISSION_CATALOG_VERSION,
  roleTemplateVersion: DEFAULT_ROLE_TEMPLATE_VERSION,
  fingerprint: INSTALLATION_SEED_FINGERPRINT,
});
