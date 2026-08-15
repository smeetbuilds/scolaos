import { describe, expect, it } from 'vitest';

import { ScolaApiError } from '../errors.js';
import {
  AuditQueryService,
  auditEventsToCsv,
  decodeAuditCursor,
  encodeAuditCursor,
  normalizeAuditQuery,
  type AuditEventReadStore,
} from './query.js';
import type { AuditEvent } from './types.js';

const SECRET = 'test-audit-cursor-secret-that-is-long-enough-123';

function event(id: string, occurredAt: string, reason?: string): AuditEvent {
  return {
    id,
    occurredAt,
    actor: { type: 'user', userId: 'user-1' },
    action: 'student.read',
    outcome: 'success',
    source: 'api',
    ...(reason === undefined ? {} : { reason }),
  };
}

describe('audit query foundation', () => {
  it('round-trips signed cursors and rejects tampering', () => {
    const cursor = encodeAuditCursor({ occurredAt: '2026-08-15T10:00:00Z', id: 'evt-2' }, SECRET);
    expect(decodeAuditCursor(cursor, SECRET)).toEqual({ occurredAt: '2026-08-15T10:00:00.000Z', id: 'evt-2' });
    expect(() => decodeAuditCursor(`${cursor}x`, SECRET)).toThrowError(
      expect.objectContaining({ code: 'AUDIT_CURSOR_INVALID', statusCode: 400 }),
    );
  });

  it('normalizes bounded filters and rejects cross-shape ambiguity', () => {
    expect(normalizeAuditQuery({ limit: 25, outcomes: ['denied', 'denied'], from: '2026-08-01' }, SECRET)).toMatchObject({
      limit: 25,
      outcomes: ['denied'],
      from: '2026-08-01T00:00:00.000Z',
    });
    expect(() => normalizeAuditQuery({ action: 'student.read', actionPrefix: 'student.' }, SECRET)).toThrow(ScolaApiError);
    expect(() => normalizeAuditQuery({ limit: 101 }, SECRET)).toThrow(ScolaApiError);
  });

  it('uses limit+1 keyset paging and produces the next cursor from the last visible row', async () => {
    const rows = [
      event('evt-3', '2026-08-15T12:00:00Z'),
      event('evt-2', '2026-08-15T11:00:00Z'),
      event('evt-1', '2026-08-15T10:00:00Z'),
    ];
    let requestedLimit = 0;
    const store: AuditEventReadStore = {
      query: async (input) => {
        requestedLimit = input.limit;
        return rows.slice(0, input.limit);
      },
    };
    const service = new AuditQueryService(store, SECRET);
    const page = await service.page({ limit: 2 });
    expect(requestedLimit).toBe(3);
    expect(page.items.map((item) => item.id)).toEqual(['evt-3', 'evt-2']);
    expect(decodeAuditCursor(page.nextCursor!, SECRET).id).toBe('evt-2');
  });

  it('rejects a read adapter that violates newest-first keyset order', async () => {
    const service = new AuditQueryService({
      query: async () => [event('old', '2026-08-14T10:00:00Z'), event('new', '2026-08-15T10:00:00Z')],
    }, SECRET);
    await expect(service.page({})).rejects.toThrow(/newest-first/);
  });

  it('rejects oversized exports instead of silently truncating them', async () => {
    const service = new AuditQueryService({
      query: async (input) => Array.from({ length: input.limit }, (_, index) =>
        event(`evt-${String(9999 - index).padStart(4, '0')}`, new Date(Date.UTC(2026, 7, 15, 12, 0, 0) - index * 1000).toISOString()),
      ),
    }, SECRET);
    await expect(service.export({}, 10)).rejects.toMatchObject({ code: 'AUDIT_EXPORT_TOO_LARGE' });
  });

  it('neutralizes spreadsheet formula prefixes in CSV output', () => {
    const csv = auditEventsToCsv([event('evt-1', '2026-08-15T10:00:00Z', '=HYPERLINK("https://bad")')]);
    expect(csv).toContain("'=HYPERLINK");
    expect(csv).not.toContain(',"=HYPERLINK');
  });
});
