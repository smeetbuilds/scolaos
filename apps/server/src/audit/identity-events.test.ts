import { describe, expect, it } from 'vitest';

import {
  installerBootstrapAudit,
  loginRejectedAudit,
  loginSucceededAudit,
  logoutSucceededAudit,
  passwordResetRequestedAudit,
  passwordResetResultAudit,
} from './identity-events.js';

describe('identity/installer audit draft builders', () => {
  it('records successful session lifecycle without credentials', () => {
    const event = loginSucceededAudit({ userId: 'user-1', sessionId: 'session-1', transport: 'browser-cookie', requestId: 'request-1' });
    expect(event).toMatchObject({ action: 'auth.login.success', outcome: 'success', resource: { type: 'session', id: 'session-1' } });
    expect(JSON.stringify(event)).not.toContain('token');
    expect(logoutSucceededAudit({ userId: 'user-1', sessionId: 'session-1', transport: 'browser-cookie' }).action).toBe('auth.logout.success');
  });

  it('never requires the submitted login identifier in denied/failure events', () => {
    const event = loginRejectedAudit({ transport: 'native-bearer', reasonCode: 'invalid-credentials', sourceFingerprint: 'safe-hmac-fingerprint' });
    expect(event).toMatchObject({ action: 'auth.login.failure', outcome: 'failure', reason: 'invalid-credentials' });
    expect(event.metadata).not.toHaveProperty('login');
    expect(JSON.stringify(event)).not.toContain('admin@school.test');
  });

  it('keeps password-reset request audit independent of account existence', () => {
    expect(passwordResetRequestedAudit({ requestId: 'request-1' })).toMatchObject({ action: 'auth.passwordreset.request', outcome: 'success' });
    expect(passwordResetResultAudit({ outcome: 'failure', reasonCode: 'invalid-or-expired' })).toMatchObject({ action: 'auth.passwordreset.failure', outcome: 'failure' });
  });

  it('records installer bootstrap outcome using stable installation/institution identifiers', () => {
    expect(installerBootstrapAudit({ installationId: 'installation-1', institutionId: 'institution-1', outcome: 'success' }))
      .toMatchObject({ action: 'installer.bootstrap.success', source: 'installer', resource: { type: 'institution', id: 'institution-1' } });
  });
});
