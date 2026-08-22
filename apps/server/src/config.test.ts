import { describe, expect, it } from 'vitest';

import { loadServerConfig } from './config.js';

describe('server configuration', () => {
  it('uses safe local defaults', () => {
    expect(loadServerConfig({})).toEqual({
      host: '127.0.0.1',
      port: 3000,
      dataDirectory: './data',
      trustedProxyCidrs: [],
    });
  });

  it('accepts explicit host, port, data-directory, proxy, and installer bootstrap settings', () => {
    expect(
      loadServerConfig({
        HOST: '0.0.0.0',
        PORT: '8080',
        SCOLA_DATA_DIR: '/srv/school/data',
        SCOLA_TRUST_PROXY: '127.0.0.1,10.0.0.0/8',
        SCOLA_INSTALLER_BOOTSTRAP_TOKEN: 'test-bootstrap-token-that-is-long-enough',
      }),
    ).toEqual({
      host: '0.0.0.0',
      port: 8080,
      dataDirectory: '/srv/school/data',
      trustedProxyCidrs: ['127.0.0.1', '10.0.0.0/8'],
      installerBootstrapToken: 'test-bootstrap-token-that-is-long-enough',
    });
  });

  it.each(['0', '65536', 'abc', '3000.5'])('rejects invalid PORT=%s', (port) => {
    expect(() => loadServerConfig({ PORT: port })).toThrow(
      'PORT must be an integer between 1 and 65535.',
    );
  });

  it('rejects malformed proxy and weak installer bootstrap configuration', () => {
    expect(() => loadServerConfig({ SCOLA_TRUST_PROXY: 'bad proxy value' })).toThrow(
      'SCOLA_TRUST_PROXY must be a comma-separated list of trusted proxy addresses or CIDRs.',
    );
    expect(() => loadServerConfig({ SCOLA_INSTALLER_BOOTSTRAP_TOKEN: 'too-short' })).toThrow(
      'SCOLA_INSTALLER_BOOTSTRAP_TOKEN must contain between 32 and 512 safe characters.',
    );
  });
});
