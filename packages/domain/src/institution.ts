export class DomainValidationError extends Error {
  public constructor(public readonly code: string, message: string) {
    super(message);
    this.name = 'DomainValidationError';
  }
}

export interface InstitutionSettingsInput {
  readonly name: string;
  readonly shortCode: string;
  readonly countryCode: string;
  readonly timezone: string;
  readonly currency: string;
  readonly locale: string;
  readonly weekStartsOn?: number;
}

export interface InstitutionSettings {
  readonly name: string;
  readonly shortCode: string;
  readonly countryCode: string;
  readonly timezone: string;
  readonly currency: string;
  readonly locale: string;
  readonly weekStartsOn: number;
}

export interface InstitutionBrandingInput {
  readonly logoStorageKey?: string | null;
  readonly logoAltText?: string | null;
}

export interface InstitutionBranding {
  readonly logoStorageKey: string | null;
  readonly logoAltText: string | null;
}

export interface BranchInput {
  readonly id: string;
  readonly institutionId: string;
  readonly code: string;
  readonly name: string;
  readonly timezone?: string | null;
  readonly isDefault?: boolean;
  readonly active?: boolean;
}

export interface Branch {
  readonly id: string;
  readonly institutionId: string;
  readonly code: string;
  readonly name: string;
  readonly timezone: string | null;
  readonly isDefault: boolean;
  readonly active: boolean;
}

export type AcademicSessionState = 'planned' | 'active' | 'closed';

export interface AcademicSessionInput {
  readonly id: string;
  readonly institutionId: string;
  readonly code: string;
  readonly name: string;
  readonly startsOn: string;
  readonly endsOn: string;
  readonly state?: AcademicSessionState;
}

export interface AcademicSession {
  readonly id: string;
  readonly institutionId: string;
  readonly code: string;
  readonly name: string;
  readonly startsOn: string;
  readonly endsOn: string;
  readonly state: AcademicSessionState;
}

export interface AcademicTermInput {
  readonly id: string;
  readonly academicSessionId: string;
  readonly code: string;
  readonly name: string;
  readonly startsOn: string;
  readonly endsOn: string;
  readonly sequence: number;
}

export interface AcademicTerm {
  readonly id: string;
  readonly academicSessionId: string;
  readonly code: string;
  readonly name: string;
  readonly startsOn: string;
  readonly endsOn: string;
  readonly sequence: number;
}

function requiredText(value: string, field: string, maxLength: number): string {
  const normalized = value.trim().replace(/\s+/g, ' ');
  if (normalized.length === 0) throw new DomainValidationError('REQUIRED', `${field} is required.`);
  if (normalized.length > maxLength) throw new DomainValidationError('TOO_LONG', `${field} is too long.`);
  return normalized;
}

function normalizedCode(value: string, field: string): string {
  const code = requiredText(value, field, 32).toUpperCase();
  if (!/^[A-Z0-9][A-Z0-9_-]{0,31}$/.test(code)) {
    throw new DomainValidationError('CODE_INVALID', `${field} must use letters, numbers, underscore or hyphen.`);
  }
  return code;
}

function validateTimeZone(value: string): string {
  const zone = requiredText(value, 'timezone', 128);
  try {
    new Intl.DateTimeFormat('en', { timeZone: zone }).format(new Date(0));
  } catch {
    throw new DomainValidationError('TIMEZONE_INVALID', 'timezone must be a valid IANA time zone.');
  }
  return zone;
}

function validateLocale(value: string): string {
  const locale = requiredText(value, 'locale', 64);
  try {
    const [canonical] = Intl.getCanonicalLocales(locale);
    if (!canonical) throw new Error('missing');
    return canonical;
  } catch {
    throw new DomainValidationError('LOCALE_INVALID', 'locale must be a valid BCP 47 locale.');
  }
}

function validateCurrency(value: string): string {
  const currency = requiredText(value, 'currency', 3).toUpperCase();
  if (!/^[A-Z]{3}$/.test(currency)) {
    throw new DomainValidationError('CURRENCY_INVALID', 'currency must be a three-letter ISO-style currency code.');
  }
  try {
    new Intl.NumberFormat('en', { style: 'currency', currency }).format(1);
  } catch {
    throw new DomainValidationError('CURRENCY_INVALID', 'currency is not supported by this runtime.');
  }
  return currency;
}

function validateCountry(value: string): string {
  const country = requiredText(value, 'countryCode', 2).toUpperCase();
  if (!/^[A-Z]{2}$/.test(country)) {
    throw new DomainValidationError('COUNTRY_INVALID', 'countryCode must be a two-letter country code.');
  }
  return country;
}

function validateDate(value: string, field: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new DomainValidationError('DATE_INVALID', `${field} must use YYYY-MM-DD.`);
  }
  const timestamp = Date.parse(`${value}T00:00:00Z`);
  if (Number.isNaN(timestamp) || new Date(timestamp).toISOString().slice(0, 10) !== value) {
    throw new DomainValidationError('DATE_INVALID', `${field} is not a real calendar date.`);
  }
  return value;
}

function assertRange(startsOn: string, endsOn: string, label: string): void {
  if (startsOn >= endsOn) {
    throw new DomainValidationError('DATE_RANGE_INVALID', `${label} end date must be after its start date.`);
  }
}

export function normalizeInstitutionSettings(input: InstitutionSettingsInput): InstitutionSettings {
  const weekStartsOn = input.weekStartsOn ?? 1;
  if (!Number.isInteger(weekStartsOn) || weekStartsOn < 0 || weekStartsOn > 6) {
    throw new DomainValidationError('WEEK_START_INVALID', 'weekStartsOn must be an integer from 0 through 6.');
  }
  return {
    name: requiredText(input.name, 'name', 160),
    shortCode: normalizedCode(input.shortCode, 'shortCode'),
    countryCode: validateCountry(input.countryCode),
    timezone: validateTimeZone(input.timezone),
    currency: validateCurrency(input.currency),
    locale: validateLocale(input.locale),
    weekStartsOn,
  };
}

export function normalizeInstitutionBranding(input: InstitutionBrandingInput): InstitutionBranding {
  const key = input.logoStorageKey == null ? null : requiredText(input.logoStorageKey, 'logoStorageKey', 512);
  if (key !== null && (key.startsWith('/') || key.includes('..') || /^[a-z]+:\/\//i.test(key))) {
    throw new DomainValidationError('LOGO_KEY_INVALID', 'logoStorageKey must be an opaque relative storage key, not a path or URL.');
  }
  const alt = input.logoAltText == null ? null : requiredText(input.logoAltText, 'logoAltText', 160);
  return { logoStorageKey: key, logoAltText: alt };
}

export function normalizeBranch(input: BranchInput): Branch {
  return {
    id: requiredText(input.id, 'branch.id', 128),
    institutionId: requiredText(input.institutionId, 'branch.institutionId', 128),
    code: normalizedCode(input.code, 'branch.code'),
    name: requiredText(input.name, 'branch.name', 160),
    timezone: input.timezone == null ? null : validateTimeZone(input.timezone),
    isDefault: input.isDefault ?? false,
    active: input.active ?? true,
  };
}

export function validateBranchCatalog(branches: readonly Branch[]): void {
  const codes = new Set<string>();
  const ids = new Set<string>();
  const byInstitution = new Map<string, Branch[]>();
  for (const branch of branches) {
    if (ids.has(branch.id)) throw new DomainValidationError('BRANCH_ID_DUPLICATE', 'Branch IDs must be unique.');
    ids.add(branch.id);
    const codeKey = `${branch.institutionId}\0${branch.code}`;
    if (codes.has(codeKey)) throw new DomainValidationError('BRANCH_CODE_DUPLICATE', 'Branch code must be unique within an institution.');
    codes.add(codeKey);
    if (branch.isDefault && !branch.active) throw new DomainValidationError('DEFAULT_BRANCH_INACTIVE', 'Default branch must be active.');
    const group = byInstitution.get(branch.institutionId) ?? [];
    group.push(branch);
    byInstitution.set(branch.institutionId, group);
  }
  for (const group of byInstitution.values()) {
    if (group.some((item) => item.active) && group.filter((item) => item.isDefault).length !== 1) {
      throw new DomainValidationError('DEFAULT_BRANCH_REQUIRED', 'Each institution with active branches must have exactly one default branch.');
    }
  }
}

export function setDefaultBranch(branches: readonly Branch[], branchId: string): readonly Branch[] {
  const target = branches.find((branch) => branch.id === branchId);
  if (!target || !target.active) throw new DomainValidationError('BRANCH_NOT_ELIGIBLE', 'Default branch must exist and be active.');
  const next = branches.map((branch) => branch.institutionId === target.institutionId
    ? { ...branch, isDefault: branch.id === target.id }
    : branch);
  validateBranchCatalog(next);
  return next;
}

export function normalizeAcademicSession(input: AcademicSessionInput): AcademicSession {
  const startsOn = validateDate(input.startsOn, 'session.startsOn');
  const endsOn = validateDate(input.endsOn, 'session.endsOn');
  assertRange(startsOn, endsOn, 'Academic session');
  const state = input.state ?? 'planned';
  if (!['planned', 'active', 'closed'].includes(state)) {
    throw new DomainValidationError('SESSION_STATE_INVALID', 'Academic session state is invalid.');
  }
  return {
    id: requiredText(input.id, 'session.id', 128),
    institutionId: requiredText(input.institutionId, 'session.institutionId', 128),
    code: normalizedCode(input.code, 'session.code'),
    name: requiredText(input.name, 'session.name', 160),
    startsOn,
    endsOn,
    state,
  };
}

export function validateAcademicSessionCatalog(sessions: readonly AcademicSession[]): void {
  const ids = new Set<string>();
  const codes = new Set<string>();
  const activeCounts = new Map<string, number>();
  for (const session of sessions) {
    if (ids.has(session.id)) throw new DomainValidationError('SESSION_ID_DUPLICATE', 'Academic session IDs must be unique.');
    ids.add(session.id);
    const codeKey = `${session.institutionId}\0${session.code}`;
    if (codes.has(codeKey)) throw new DomainValidationError('SESSION_CODE_DUPLICATE', 'Academic session code must be unique within an institution.');
    codes.add(codeKey);
    if (session.state === 'active') activeCounts.set(session.institutionId, (activeCounts.get(session.institutionId) ?? 0) + 1);
  }
  for (const count of activeCounts.values()) {
    if (count > 1) throw new DomainValidationError('MULTIPLE_ACTIVE_SESSIONS', 'An institution cannot have more than one active academic session.');
  }
}

export function activateAcademicSession(sessions: readonly AcademicSession[], sessionId: string): readonly AcademicSession[] {
  const target = sessions.find((session) => session.id === sessionId);
  if (!target) throw new DomainValidationError('SESSION_NOT_FOUND', 'Academic session does not exist.');
  if (target.state === 'closed') throw new DomainValidationError('SESSION_CLOSED', 'A closed academic session cannot be reactivated.');
  const next = sessions.map((session) => session.institutionId !== target.institutionId
    ? session
    : session.id === target.id
      ? { ...session, state: 'active' as const }
      : session.state === 'active'
        ? { ...session, state: 'planned' as const }
        : session);
  validateAcademicSessionCatalog(next);
  return next;
}

export function closeAcademicSession(sessions: readonly AcademicSession[], sessionId: string): readonly AcademicSession[] {
  const target = sessions.find((session) => session.id === sessionId);
  if (!target) throw new DomainValidationError('SESSION_NOT_FOUND', 'Academic session does not exist.');
  const next = sessions.map((session) => session.id === sessionId ? { ...session, state: 'closed' as const } : session);
  validateAcademicSessionCatalog(next);
  return next;
}

export function normalizeAcademicTerm(input: AcademicTermInput): AcademicTerm {
  const startsOn = validateDate(input.startsOn, 'term.startsOn');
  const endsOn = validateDate(input.endsOn, 'term.endsOn');
  assertRange(startsOn, endsOn, 'Academic term');
  if (!Number.isInteger(input.sequence) || input.sequence < 1 || input.sequence > 99) {
    throw new DomainValidationError('TERM_SEQUENCE_INVALID', 'Term sequence must be an integer from 1 through 99.');
  }
  return {
    id: requiredText(input.id, 'term.id', 128),
    academicSessionId: requiredText(input.academicSessionId, 'term.academicSessionId', 128),
    code: normalizedCode(input.code, 'term.code'),
    name: requiredText(input.name, 'term.name', 160),
    startsOn,
    endsOn,
    sequence: input.sequence,
  };
}

export function validateAcademicTerms(session: AcademicSession, terms: readonly AcademicTerm[]): void {
  const relevant = terms.filter((term) => term.academicSessionId === session.id).sort((a, b) => a.startsOn.localeCompare(b.startsOn));
  const ids = new Set<string>();
  const codes = new Set<string>();
  const sequences = new Set<number>();
  let previous: AcademicTerm | undefined;
  for (const term of relevant) {
    if (ids.has(term.id)) throw new DomainValidationError('TERM_ID_DUPLICATE', 'Academic term IDs must be unique.');
    if (codes.has(term.code)) throw new DomainValidationError('TERM_CODE_DUPLICATE', 'Term code must be unique within the academic session.');
    if (sequences.has(term.sequence)) throw new DomainValidationError('TERM_SEQUENCE_DUPLICATE', 'Term sequence must be unique within the academic session.');
    if (term.startsOn < session.startsOn || term.endsOn > session.endsOn) {
      throw new DomainValidationError('TERM_OUTSIDE_SESSION', 'Academic term must stay within its academic session.');
    }
    if (previous && term.startsOn <= previous.endsOn) {
      throw new DomainValidationError('TERM_OVERLAP', 'Academic terms in the same session must not overlap.');
    }
    ids.add(term.id);
    codes.add(term.code);
    sequences.add(term.sequence);
    previous = term;
  }
}
