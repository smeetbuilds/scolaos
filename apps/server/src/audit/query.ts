import { createHmac, timingSafeEqual } from 'node:crypto';

import { ScolaApiError } from '../errors.js';
import type { AuditEvent, AuditOutcome, AuditSource } from './types.js';

const CURSOR_PREFIX = 'aq1_';
const IDENTIFIER_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,191}$/;
const ACTION_PATTERN = /^[a-z][a-z0-9]*(?:\.[a-z][a-z0-9]*)+$/;
const ACTION_PREFIX_PATTERN = /^[a-z][a-z0-9]*(?:\.[a-z][a-z0-9]*)*\.?$/;
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;
const MAX_EXPORT_ROWS = 5_000;

export interface AuditCursorPosition {
  readonly occurredAt: string;
  readonly id: string;
}

export interface AuditQueryFilters {
  readonly institutionId?: string;
  readonly branchId?: string;
  readonly actorUserId?: string;
  readonly action?: string;
  readonly actionPrefix?: string;
  readonly outcomes?: readonly AuditOutcome[];
  readonly sources?: readonly AuditSource[];
  readonly from?: string;
  readonly to?: string;
}

export interface AuditQueryInput extends AuditQueryFilters {
  readonly limit?: number;
  readonly cursor?: string;
}

export interface NormalizedAuditQuery extends AuditQueryFilters {
  readonly limit: number;
  readonly before?: AuditCursorPosition;
}

export interface AuditEventReadStore {
  /** Return newest-first rows, ordered by occurredAt DESC, id DESC, with at most input.limit rows. */
  query(input: NormalizedAuditQuery): Promise<readonly AuditEvent[]>;
}

export interface AuditQueryPage {
  readonly items: readonly AuditEvent[];
  readonly nextCursor?: string;
}

function assertIdentifier(value: string | undefined, field: string): void {
  if (value !== undefined && !IDENTIFIER_PATTERN.test(value)) {
    throw new ScolaApiError('AUDIT_QUERY_INVALID', `${field} is invalid.`, 400);
  }
}

function parseIso(value: string | undefined, field: string): string | undefined {
  if (value === undefined) return undefined;
  const time = Date.parse(value);
  if (!Number.isFinite(time)) throw new ScolaApiError('AUDIT_QUERY_INVALID', `${field} is invalid.`, 400);
  return new Date(time).toISOString();
}

function uniqueEnum<T extends string>(values: readonly T[] | undefined, allowed: ReadonlySet<string>, field: string): readonly T[] | undefined {
  if (values === undefined) return undefined;
  if (values.length === 0) throw new ScolaApiError('AUDIT_QUERY_INVALID', `${field} cannot be empty.`, 400);
  const unique = [...new Set(values)];
  if (unique.some((value) => !allowed.has(value))) {
    throw new ScolaApiError('AUDIT_QUERY_INVALID', `${field} contains an unsupported value.`, 400);
  }
  return Object.freeze(unique);
}

function cursorMac(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(`audit-query:v1:${payload}`, 'utf8').digest('base64url');
}

function assertCursorSecret(secret: string): void {
  if (secret.length < 32) throw new Error('Audit query cursor secret must contain at least 32 characters.');
}

export function encodeAuditCursor(position: AuditCursorPosition, secret: string): string {
  assertCursorSecret(secret);
  assertIdentifier(position.id, 'Audit cursor ID');
  const occurredAt = parseIso(position.occurredAt, 'Audit cursor timestamp');
  if (occurredAt === undefined) throw new Error('Audit cursor timestamp is required.');
  const payload = Buffer.from(JSON.stringify({ t: occurredAt, i: position.id }), 'utf8').toString('base64url');
  return `${CURSOR_PREFIX}${payload}.${cursorMac(payload, secret)}`;
}

export function decodeAuditCursor(cursor: string, secret: string): AuditCursorPosition {
  assertCursorSecret(secret);
  if (!cursor.startsWith(CURSOR_PREFIX)) throw new ScolaApiError('AUDIT_CURSOR_INVALID', 'Audit cursor is invalid.', 400);
  const encoded = cursor.slice(CURSOR_PREFIX.length);
  const dot = encoded.lastIndexOf('.');
  if (dot < 1) throw new ScolaApiError('AUDIT_CURSOR_INVALID', 'Audit cursor is invalid.', 400);
  const payload = encoded.slice(0, dot);
  const mac = encoded.slice(dot + 1);
  const expected = cursorMac(payload, secret);
  const left = Buffer.from(mac, 'utf8');
  const right = Buffer.from(expected, 'utf8');
  if (left.length !== right.length || !timingSafeEqual(left, right)) {
    throw new ScolaApiError('AUDIT_CURSOR_INVALID', 'Audit cursor is invalid.', 400);
  }
  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { t?: unknown; i?: unknown };
    if (typeof decoded.t !== 'string' || typeof decoded.i !== 'string') throw new Error('shape');
    assertIdentifier(decoded.i, 'Audit cursor ID');
    const occurredAt = parseIso(decoded.t, 'Audit cursor timestamp');
    if (occurredAt === undefined) throw new Error('timestamp');
    return { occurredAt, id: decoded.i };
  } catch (error) {
    if (error instanceof ScolaApiError) throw error;
    throw new ScolaApiError('AUDIT_CURSOR_INVALID', 'Audit cursor is invalid.', 400);
  }
}

export function normalizeAuditQuery(input: AuditQueryInput, cursorSecret: string): NormalizedAuditQuery {
  assertCursorSecret(cursorSecret);
  assertIdentifier(input.institutionId, 'Institution ID');
  assertIdentifier(input.branchId, 'Branch ID');
  assertIdentifier(input.actorUserId, 'Actor user ID');
  if (input.action !== undefined && !ACTION_PATTERN.test(input.action)) {
    throw new ScolaApiError('AUDIT_QUERY_INVALID', 'Audit action is invalid.', 400);
  }
  if (input.actionPrefix !== undefined && !ACTION_PREFIX_PATTERN.test(input.actionPrefix)) {
    throw new ScolaApiError('AUDIT_QUERY_INVALID', 'Audit action prefix is invalid.', 400);
  }
  if (input.action !== undefined && input.actionPrefix !== undefined) {
    throw new ScolaApiError('AUDIT_QUERY_INVALID', 'Audit action and actionPrefix cannot be combined.', 400);
  }
  const from = parseIso(input.from, 'Audit range start');
  const to = parseIso(input.to, 'Audit range end');
  if (from !== undefined && to !== undefined && Date.parse(from) > Date.parse(to)) {
    throw new ScolaApiError('AUDIT_QUERY_INVALID', 'Audit time range is invalid.', 400);
  }
  const limit = input.limit ?? DEFAULT_LIMIT;
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT) {
    throw new ScolaApiError('AUDIT_QUERY_INVALID', `Audit limit must be between 1 and ${MAX_LIMIT}.`, 400);
  }
  const outcomes = uniqueEnum(input.outcomes, new Set(['success', 'failure', 'denied']), 'Audit outcomes');
  const sources = uniqueEnum(input.sources, new Set(['api', 'installer', 'job', 'system']), 'Audit sources');
  return {
    limit,
    ...(input.institutionId === undefined ? {} : { institutionId: input.institutionId }),
    ...(input.branchId === undefined ? {} : { branchId: input.branchId }),
    ...(input.actorUserId === undefined ? {} : { actorUserId: input.actorUserId }),
    ...(input.action === undefined ? {} : { action: input.action }),
    ...(input.actionPrefix === undefined ? {} : { actionPrefix: input.actionPrefix }),
    ...(outcomes === undefined ? {} : { outcomes }),
    ...(sources === undefined ? {} : { sources }),
    ...(from === undefined ? {} : { from }),
    ...(to === undefined ? {} : { to }),
    ...(input.cursor === undefined ? {} : { before: decodeAuditCursor(input.cursor, cursorSecret) }),
  };
}

function compareNewestFirst(a: AuditEvent, b: AuditEvent): number {
  const time = Date.parse(b.occurredAt) - Date.parse(a.occurredAt);
  if (time !== 0) return time;
  return b.id.localeCompare(a.id);
}

function assertStorePage(rows: readonly AuditEvent[], requestedLimit: number): void {
  if (rows.length > requestedLimit) throw new Error('Audit read store returned more rows than requested.');
  for (let index = 1; index < rows.length; index += 1) {
    const previous = rows[index - 1];
    const current = rows[index];
    if (previous === undefined || current === undefined || compareNewestFirst(previous, current) > 0) {
      throw new Error('Audit read store returned rows outside newest-first keyset order.');
    }
  }
}

export class AuditQueryService {
  public constructor(
    private readonly store: AuditEventReadStore,
    private readonly cursorSecret: string,
  ) {
    assertCursorSecret(cursorSecret);
  }

  public async page(input: AuditQueryInput): Promise<AuditQueryPage> {
    const normalized = normalizeAuditQuery(input, this.cursorSecret);
    const rows = await this.store.query({ ...normalized, limit: normalized.limit + 1 });
    assertStorePage(rows, normalized.limit + 1);
    const hasMore = rows.length > normalized.limit;
    const items = Object.freeze(rows.slice(0, normalized.limit));
    if (!hasMore || items.length === 0) return { items };
    const last = items[items.length - 1]!;
    return { items, nextCursor: encodeAuditCursor({ occurredAt: last.occurredAt, id: last.id }, this.cursorSecret) };
  }

  public async export(input: AuditQueryFilters, maxRows = MAX_EXPORT_ROWS): Promise<readonly AuditEvent[]> {
    if (!Number.isInteger(maxRows) || maxRows < 1 || maxRows > MAX_EXPORT_ROWS) {
      throw new ScolaApiError('AUDIT_EXPORT_INVALID', `Audit export limit must be between 1 and ${MAX_EXPORT_ROWS}.`, 400);
    }
    const normalized = normalizeAuditQuery({ ...input, limit: MAX_LIMIT }, this.cursorSecret);
    const rows = await this.store.query({ ...normalized, limit: maxRows + 1 });
    assertStorePage(rows, maxRows + 1);
    if (rows.length > maxRows) {
      throw new ScolaApiError('AUDIT_EXPORT_TOO_LARGE', 'Audit export is too large. Narrow the filters and try again.', 400);
    }
    return Object.freeze([...rows]);
  }
}

function csvCell(value: string): string {
  const normalized = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${normalized.replaceAll('"', '""')}"`;
}

function actorLabel(event: AuditEvent): string {
  switch (event.actor.type) {
    case 'user': return `user:${event.actor.userId}`;
    case 'system': return `system:${event.actor.name}`;
    case 'job': return `job:${event.actor.jobId}`;
    case 'installer': return `installer:${event.actor.installationId ?? ''}`;
    case 'integration': return `integration:${event.actor.integrationId}`;
  }
}

export function auditEventsToCsv(events: readonly AuditEvent[]): string {
  const header = ['occurredAt', 'id', 'action', 'outcome', 'source', 'actor', 'institutionId', 'branchId', 'resourceType', 'resourceId', 'requestId', 'reason'];
  const lines = [header.map(csvCell).join(',')];
  for (const event of events) {
    const values = [
      event.occurredAt,
      event.id,
      event.action,
      event.outcome,
      event.source,
      actorLabel(event),
      event.institutionId ?? '',
      event.branchId ?? '',
      event.resource?.type ?? '',
      event.resource?.id ?? '',
      event.requestId ?? '',
      event.reason ?? '',
    ];
    lines.push(values.map(csvCell).join(','));
  }
  return `${lines.join('\n')}\n`;
}
