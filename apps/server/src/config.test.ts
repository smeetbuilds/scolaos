import { describe, expect, it } from 'vitest';

import { loadServerConfig } from './config.js';

describe('server configuration', () => {
  it('uses safe local defaults', () => {
    expect(loadServerConfig({})).toEqual({
      host: '127.0.0.1',
      port: 3000,
      dataDirectory: './data',
    });
  });

  it('accepts explicit host, port, and data-directory settings', () => {
    expect(
      loadServerConfig({ HOST: '0.0.0.0', PORT: '8080', SCOLA_DATA_DIR: '/srv/school/data' }),
    ).toEqual({
      host: '0.0.0.0',
      port: 8080,
      dataDirectory: '/srv/school/data',
    });
  });

  it.each(['0', '65536', 'abc', '3000.5'])('rejects invalid PORT=%s', (port) => {
    expect(() => loadServerConfig({ PORT: port })).toThrow(
      'PORT must be an integer between 1 and 65535.',
    );
  });
});
