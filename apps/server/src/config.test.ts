import { describe, expect, it } from 'vitest';

import { loadServerConfig } from './config.js';

describe('server configuration', () => {
  it('uses safe local defaults', () => {
    expect(loadServerConfig({})).toEqual({ host: '127.0.0.1', port: 3000 });
  });

  it('accepts an explicit host and port', () => {
    expect(loadServerConfig({ HOST: '0.0.0.0', PORT: '8080' })).toEqual({
      host: '0.0.0.0',
      port: 8080,
    });
  });

  it.each(['0', '65536', 'abc', '3000.5'])('rejects invalid PORT=%s', (port) => {
    expect(() => loadServerConfig({ PORT: port })).toThrow(
      'PORT must be an integer between 1 and 65535.',
    );
  });
});
