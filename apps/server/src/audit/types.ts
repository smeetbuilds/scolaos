export type AuditOutcome = 'success' | 'failure' | 'denied';
export type AuditSource = 'api' | 'installer' | 'job' | 'system';

export type AuditActor =
  | { readonly type: 'user'; readonly userId: string; readonly context?: readonly string[] }
  | { readonly type: 'system'; readonly name: string }
  | { readonly type: 'job'; readonly jobId: string; readonly name: string }
  | { readonly type: 'installer'; readonly installationId?: string }
  | { readonly type: 'integration'; readonly integrationId: string };

export interface AuditResource {
  readonly type: string;
  readonly id: string;
}

export type AuditMetadataPrimitive = string | number | boolean | null;
export type AuditMetadataValue =
  | AuditMetadataPrimitive
  | readonly AuditMetadataValue[]
  | { readonly [key: string]: AuditMetadataValue };
export type AuditMetadata = Readonly<Record<string, AuditMetadataValue>>;

export interface AuditEventDraft {
  readonly institutionId?: string;
  readonly branchId?: string;
  readonly actor: AuditActor;
  readonly action: string;
  readonly resource?: AuditResource;
  readonly outcome: AuditOutcome;
  readonly requestId?: string;
  readonly jobId?: string;
  readonly source: AuditSource;
  readonly reason?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface AuditEvent extends Omit<AuditEventDraft, 'metadata'> {
  readonly id: string;
  readonly occurredAt: string;
  readonly metadata?: AuditMetadata;
}

export interface AuditEventStore {
  append(event: AuditEvent): Promise<void>;
}

export interface AuditWriteFailure {
  readonly event: AuditEvent;
  readonly error: unknown;
}
