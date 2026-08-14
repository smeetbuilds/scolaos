import { describe, expect, it } from 'vitest';

import {
  assertSupportedPostgresVersion,
  isSupportedNodeVersion,
  isSupportedPostgresVersion,
  parseNodeMajor,
  parsePostgresVersion,
} from './platform-support.js';

describe('server support matrix', () => {
  it('supports only the locked Node 24 release line', () => {
    expect(parseNodeMajor('v24.18.0')).toBe(24);
    expect(isSupportedNodeVersion('24.18.0')).toBe(true);
    expect(isSupportedNodeVersion('22.23.1')).toBe(false);
    expect(isSupportedNodeVersion('26.5.0')).toBe(false);
    expect(isSupportedNodeVersion('garbage')).toBe(false);
  });

  it('supports PostgreSQL majors 16 through 18', () => {
    expect(parsePostgresVersion('18.4')).toEqual({ major: 18, minor: 4 });
    expect(isSupportedPostgresVersion('16.14')).toBe(true);
    expect(isSupportedPostgresVersion('17.10')).toBe(true);
    expect(isSupportedPostgresVersion('18.4')).toBe(true);
    expect(isSupportedPostgresVersion('15.18')).toBe(false);
    expect(isSupportedPostgresVersion('19beta2')).toBe(false);
    expect(() => assertSupportedPostgresVersion('15.18')).toThrow(/16-18/);
  });
});
