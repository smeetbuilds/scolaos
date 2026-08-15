import type { AuditEventDraft } from '../audit/types.js';
import { auditEventsToCsv, type AuditQueryFilters, type AuditQueryInput, type AuditQueryPage, type AuditQueryService } from '../audit/query.js';
import { defineProtectedOperation, type AuthorizationHttpApplication } from '../authorization/http-application.js';
import type { AuthorizationTarget } from '../authorization/types.js';
import { ScolaApiError } from '../errors.js';
import type { HealthAdminService, HealthAdminView } from '../health/admin.js';
import type { IdentityHttpRequestContext } from '../identity/http-boundary.js';

export const AUDIT_LIST_OPERATION = defineProtectedOperation({
  id: 'operations.audit.list',
  permission: 'system.audit.read',
  targetMode: 'single',
});

export const AUDIT_EXPORT_OPERATION = defineProtectedOperation({
  id: 'operations.audit.export',
  permission: 'system.audit.read',
  targetMode: 'single',
});

export const HEALTH_READ_OPERATION = defineProtectedOperation({
  id: 'operations.health.read',
  permission: 'system.health.read',
  targetMode: 'single',
});

export interface OperationsAuditPort {
  recordBestEffort(draft: AuditEventDraft): Promise<unknown>;
}

export interface OperationsRequestBase {
  readonly request: IdentityHttpRequestContext;
  readonly target: AuthorizationTarget;
  readonly requestId?: string;
}

export interface ListAuditRequest extends OperationsRequestBase {
  readonly query: AuditQueryInput;
}

export interface ExportAuditRequest extends OperationsRequestBase {
  readonly filters: AuditQueryFilters;
}

function constrainAuditScope<T extends AuditQueryFilters>(target: AuthorizationTarget, input: T): T {
  if (target.institutionId !== undefined && input.institutionId !== undefined && target.institutionId !== input.institutionId) {
    throw new ScolaApiError('AUDIT_SCOPE_INVALID', 'Audit query scope is outside the authorized target.', 403);
  }
  if (target.branchId !== undefined && input.branchId !== undefined && target.branchId !== input.branchId) {
    throw new ScolaApiError('AUDIT_SCOPE_INVALID', 'Audit query scope is outside the authorized target.', 403);
  }
  return {
    ...input,
    ...(target.institutionId === undefined ? {} : { institutionId: target.institutionId }),
    ...(target.branchId === undefined ? {} : { branchId: target.branchId }),
  };
}

function exportAuditDraft(userId: string, count: number, requestId: string | undefined, target: AuthorizationTarget): AuditEventDraft {
  return {
    actor: { type: 'user', userId },
    action: 'operations.audit.exported',
    outcome: 'success',
    source: 'api',
    ...(target.institutionId === undefined ? {} : { institutionId: target.institutionId }),
    ...(target.branchId === undefined ? {} : { branchId: target.branchId }),
    ...(requestId === undefined ? {} : { requestId }),
    metadata: { exportedEventCount: count },
  };
}

export class OperationsAdminApplication {
  public constructor(
    private readonly authorization: Pick<AuthorizationHttpApplication, 'authorizeSingle'>,
    private readonly auditQuery: Pick<AuditQueryService, 'page' | 'export'>,
    private readonly health: Pick<HealthAdminService, 'adminView'>,
    private readonly audit: OperationsAuditPort,
  ) {}

  public async listAudit(input: ListAuditRequest, now = new Date()): Promise<AuditQueryPage> {
    await this.authorization.authorizeSingle({
      request: input.request,
      policy: AUDIT_LIST_OPERATION,
      target: input.target,
      ...(input.requestId === undefined ? {} : { requestId: input.requestId }),
    }, now);
    return this.auditQuery.page(constrainAuditScope(input.target, input.query));
  }

  public async exportAuditCsv(input: ExportAuditRequest, now = new Date()): Promise<string> {
    const authorized = await this.authorization.authorizeSingle({
      request: input.request,
      policy: AUDIT_EXPORT_OPERATION,
      target: input.target,
      ...(input.requestId === undefined ? {} : { requestId: input.requestId }),
    }, now);
    const events = await this.auditQuery.export(constrainAuditScope(input.target, input.filters));
    await this.audit.recordBestEffort(exportAuditDraft(
      authorized.principal.actor.userId,
      events.length,
      input.requestId,
      input.target,
    ));
    return auditEventsToCsv(events);
  }

  public async healthView(input: OperationsRequestBase, now = new Date()): Promise<HealthAdminView> {
    await this.authorization.authorizeSingle({
      request: input.request,
      policy: HEALTH_READ_OPERATION,
      target: input.target,
      ...(input.requestId === undefined ? {} : { requestId: input.requestId }),
    }, now);
    return this.health.adminView();
  }
}
