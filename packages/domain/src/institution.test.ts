import { describe, expect, it } from 'vitest';

import {
  activateAcademicSession,
  closeAcademicSession,
  normalizeAcademicSession,
  normalizeAcademicTerm,
  normalizeBranch,
  normalizeInstitutionBranding,
  normalizeInstitutionSettings,
  setDefaultBranch,
  validateAcademicSessionCatalog,
  validateAcademicTerms,
  validateBranchCatalog,
} from './institution.js';

describe('institution settings', () => {
  it('normalizes locale, currency, country and codes', () => {
    expect(
      normalizeInstitutionSettings({
        name: '  North Star School  ',
        shortCode: ' nss ',
        countryCode: 'in',
        timezone: 'Asia/Kolkata',
        currency: 'inr',
        locale: 'en-in',
      }),
    ).toMatchObject({
      name: 'North Star School',
      shortCode: 'NSS',
      countryCode: 'IN',
      timezone: 'Asia/Kolkata',
      currency: 'INR',
      locale: 'en-IN',
      weekStartsOn: 1,
    });
  });

  it('rejects unsupported timezone and unsafe branding keys', () => {
    expect(() =>
      normalizeInstitutionSettings({
        name: 'School',
        shortCode: 'SCH',
        countryCode: 'IN',
        timezone: 'Mars/Olympus',
        currency: 'INR',
        locale: 'en-IN',
      }),
    ).toThrow(/time zone/i);

    expect(() => normalizeInstitutionBranding({ logoStorageKey: 'https://evil.example/logo.png' })).toThrow(/opaque relative storage key/i);
    expect(() => normalizeInstitutionBranding({ logoStorageKey: '../logo.png' })).toThrow(/opaque relative storage key/i);
  });
});

describe('branch invariants', () => {
  it('requires unique codes and one active default branch per institution', () => {
    const branches = [
      normalizeBranch({ id: 'b1', institutionId: 'i1', code: 'main', name: 'Main', isDefault: true }),
      normalizeBranch({ id: 'b2', institutionId: 'i1', code: 'east', name: 'East' }),
    ];
    expect(() => validateBranchCatalog(branches)).not.toThrow();

    expect(() =>
      validateBranchCatalog([
        ...branches,
        normalizeBranch({ id: 'b3', institutionId: 'i1', code: 'east', name: 'Duplicate' }),
      ]),
    ).toThrow(/unique within an institution/i);
  });

  it('switches the default branch atomically within the institution', () => {
    const branches = [
      normalizeBranch({ id: 'b1', institutionId: 'i1', code: 'main', name: 'Main', isDefault: true }),
      normalizeBranch({ id: 'b2', institutionId: 'i1', code: 'east', name: 'East' }),
    ];
    const next = setDefaultBranch(branches, 'b2');
    expect(next.find((branch) => branch.id === 'b1')?.isDefault).toBe(false);
    expect(next.find((branch) => branch.id === 'b2')?.isDefault).toBe(true);
  });
});

describe('academic session and term invariants', () => {
  const first = normalizeAcademicSession({
    id: 's1',
    institutionId: 'i1',
    code: '2025-26',
    name: '2025-26',
    startsOn: '2025-06-01',
    endsOn: '2026-05-31',
    state: 'active',
  });
  const second = normalizeAcademicSession({
    id: 's2',
    institutionId: 'i1',
    code: '2026-27',
    name: '2026-27',
    startsOn: '2026-06-01',
    endsOn: '2027-05-31',
  });

  it('allows at most one active session and never reactivates a closed session', () => {
    expect(() => validateAcademicSessionCatalog([first, second])).not.toThrow();
    const activated = activateAcademicSession([first, second], 's2');
    expect(activated.find((session) => session.id === 's1')?.state).toBe('planned');
    expect(activated.find((session) => session.id === 's2')?.state).toBe('active');

    const closed = closeAcademicSession(activated, 's1');
    expect(() => activateAcademicSession(closed, 's1')).toThrow(/cannot be reactivated/i);
  });

  it('requires terms to fit within a session and not overlap', () => {
    const terms = [
      normalizeAcademicTerm({
        id: 't1', academicSessionId: second.id, code: 'T1', name: 'Term 1',
        startsOn: '2026-06-01', endsOn: '2026-10-31', sequence: 1,
      }),
      normalizeAcademicTerm({
        id: 't2', academicSessionId: second.id, code: 'T2', name: 'Term 2',
        startsOn: '2026-11-01', endsOn: '2027-05-31', sequence: 2,
      }),
    ];
    expect(() => validateAcademicTerms(second, terms)).not.toThrow();

    expect(() =>
      validateAcademicTerms(second, [
        ...terms,
        normalizeAcademicTerm({
          id: 't3', academicSessionId: second.id, code: 'T3', name: 'Overlap',
          startsOn: '2026-10-01', endsOn: '2026-12-01', sequence: 3,
        }),
      ]),
    ).toThrow(/must not overlap/i);
  });
});
