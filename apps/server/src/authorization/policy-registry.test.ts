import { describe, expect, it } from 'vitest';
import { AuthorizationPolicyRegistry } from './policy-registry.js';

describe('authorization policy registry', () => {
  it('registers stable operation policies and fails closed for unknown operations', () => {
    const registry = new AuthorizationPolicyRegistry([
      { id: 'students.profile.read', permission: 'student.read', targetMode: 'single' },
      { id: 'students.bulk.read', permission: 'student.read', targetMode: 'bulk' },
    ]);
    expect(registry.get('students.profile.read').permission).toBe('student.read');
    expect(registry.has('students.bulk.read')).toBe(true);
    expect(() => registry.get('missing.operation')).toThrow(/not registered/i);
  });

  it('rejects duplicate operation IDs', () => {
    expect(() => new AuthorizationPolicyRegistry([
      { id: 'students.profile.read', permission: 'student.read', targetMode: 'single' },
      { id: 'students.profile.read', permission: 'student.read', targetMode: 'single' },
    ])).toThrow(/duplicate/i);
  });
});
