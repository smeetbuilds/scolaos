import { randomUUID } from 'node:crypto';

import type {
  AuditActor,
  AuditEvent,
  AuditEventDraft,
  AuditEventStore,
  AuditMetadata,
  AuditMetadataValue,
  AuditWriteFailure,
} from './types.js';

const ACTION_PATTERN = /^[a-z][a-z0-9]*(?:\.[a-z][a-z0-9]*)+$/;
const IDENTIFIER_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,191}$/;
const MAX_METADATA_DEPTH = 4;
const MAX_METADATA_KEYS = 40;
const MAX_ARRAY_ITEMS = 50;
const MAX_STRING_LENGTH = 500;
const SENSITIVE_KEYS = new Set([
  'password',
  'passwordhash',
  'passwd',
  'passphrase',
  'token',
  'accesstoken',
  'refreshtoken',
  'resettoken',
  'sessiontoken',
  'authorization',
  'cookie',
  'secret',
  'clientsecret',
  'credential',
  'credentials',
  'connectionstring',
  'databaseurl',
  'privatekey',
  'apikey',
  'cardnumber',
  'cvv',
  'cvc',
  'bankaccount',
  'iban',
]);
const SENSITIVE_VALUE_PATTERNS = [
  /\bBearer\s+[A-Za-z0-9._~+/=-]+/i,
  /\b(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?):\/\/[^\s/@:]+:[^\s/@]+@/i,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
];

function normalizedKey(key: string): string {
  return key.replace(/[^a-z0-9]/gi, '').toLowerCase();
}

function assertIdentifier(value: string | undefined, field: string): void {
  if (value !== undefined && !IDENTIFIER_PATTERN.test(value)) {
    throw new Error(`Audit ${field} is invalid.`);
  }
}

function sanitizeValue(value: unknown, depth: number): AuditMetadataValue {
  if (depth > MAX_METADATA_DEPTH) {
    throw new Error('Audit metadata exceeds maximum nesting depth.');
  }
  if (value === null || typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw new Error('Audit metadata numbers must be finite.');
    }
    return value;
  }
  if (typeof value === 'string') {
    if (value.length > MAX_STRING_LENGTH) {
      throw new Error('Audit metadata string is too long.');
    }
    if (SENSITIVE_VALUE_PATTERNS.some((pattern) => pattern.test(value))) {
      throw new Error('Audit metadata appears to contain a prohibited secret.');
    }
    return value;
  }
  if (Array.isArray(value)) {
    if (value.length > MAX_ARRAY_ITEMS) {
      throw new Error('Audit metadata array is too large.');
    }
    return value.map((item) => sanitizeValue(item, depth + 1));
  }
  if (typeof value === 'object' && value !== null) {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length > MAX_METADATA_KEYS) {
      throw new Error('Audit metadata object has too many keys.');
    }
    const output: Record<string, AuditMetadataValue> = {};
    for (const [key, child] of entries) {
      if (!/^[A-Za-z][A-Za-z0-9_.-]{0,63}$/.test(key)) {
        throw new Error('Audit metadata key is invalid.');
      }
      if (SENSITIVE_KEYS.has(normalizedKey(key))) {
        throw new Error(`Audit metadata key ${key} is prohibited.`);
      }
      output[key] = sanitizeValue(child, depth + 1);
    }
    return output;
  }
  throw new Error('Audit metadata contains an unsupported value type.');
}

export function sanitizeAuditMetadata(
  metadata: Readonly<Record<string, unknown>> | undefined,
): AuditMetadata | undefined {
  if (metadata === undefined) {
    return undefined;
  }
  return sanitizeValue(metadata, 0) as AuditMetadata;
}

function validateActor(actor: AuditActor): void {
  switch (actor.type) {
    case 'user':
      assertIdentifier(actor.userId, 'actor user ID');
      if (actor.context !== undefined) {
        if (actor.context.length > 20) {
          throw new Error('Audit actor context is too large.');
        }
        for (const value of actor.context) {
          assertIdentifier(value, 'actor context');
        }
      }
      break;
    case 'system':
      assertIdentifier(actor.name, 'system actor name');
      break;
    case 'job':
      assertIdentifier(actor.jobId, 'actor job ID');
      assertIdentifier(actor.name, 'job actor name');
      break;
    case 'installer':
      assertIdentifier(actor.installationId, 'installation ID');
      break;
    case 'integration':
      assertIdentifier(actor.integrationId, 'integration ID');
      break;
  }
}

export interface AuditServiceOptions {
  readonly now?: () => Date;
  readonly newId?: () => string;
  readonly onBestEffortFailure?: (failure: AuditWriteFailure) => void;
}

export class AuditService {
  private readonly now: () => Date;
  private readonly newId: () => string;
  private readonly onBestEffortFailure: (failure: AuditWriteFailure) => void;

  public constructor(private readonly store: AuditEventStore, options: AuditServiceOptions = {}) {
    this.now = options.now ?? (() => new Date());
    this.newId = options.newId ?? randomUUID;
    this.onBestEffortFailure = options.onBestEffortFailure ?? (() => undefined);
  }

  public build(draft: AuditEventDraft): AuditEvent {
    if (!ACTION_PATTERN.test(draft.action)) {
      throw new Error('Audit action must be lowercase dot-separated semantics.');
    }
    validateActor(draft.actor);
    assertIdentifier(draft.institutionId, 'institution ID');
    assertIdentifier(draft.branchId, 'branch ID');
    assertIdentifier(draft.requestId, 'request ID');
    assertIdentifier(draft.jobId, 'job ID');
    if (draft.resource !== undefined) {
      assertIdentifier(draft.resource.type, 'resource type');
      assertIdentifier(draft.resource.id, 'resource ID');
    }
    const reason = draft.reason;
    if (reason !== undefined) {
      if (reason.trim() === '' || reason.length > 500) {
        throw new Error('Audit reason is invalid.');
      }
      if (SENSITIVE_VALUE_PATTERNS.some((pattern) => pattern.test(reason))) {
        throw new Error('Audit reason appears to contain a prohibited secret.');
      }
    }
    const metadata = sanitizeAuditMetadata(draft.metadata);
    const { metadata: unsafeMetadata, ...safeDraft } = draft;
    void unsafeMetadata;
    return {
      ...safeDraft,
      id: this.newId(),
      occurredAt: this.now().toISOString(),
      ...(metadata === undefined ? {} : { metadata }),
    };
  }

  public async recordRequired(draft: AuditEventDraft): Promise<AuditEvent> {
    const event = this.build(draft);
    await this.store.append(event);
    return event;
  }

  public async recordBestEffort(draft: AuditEventDraft): Promise<AuditEvent> {
    const event = this.build(draft);
    try {
      await this.store.append(event);
    } catch (error) {
      this.onBestEffortFailure({ event, error });
    }
    return event;
  }
}
