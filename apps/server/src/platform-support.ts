export const SUPPORTED_NODE_MAJORS = [24] as const;
export const MINIMUM_POSTGRES_MAJOR = 16;
export const MAXIMUM_POSTGRES_MAJOR = 18;

export interface ParsedPostgresVersion {
  readonly major: number;
  readonly minor: number | null;
}

export function parseNodeMajor(version: string): number | null {
  const match = /^v?(\d+)(?:\.|$)/.exec(version.trim());
  if (!match) return null;
  const major = Number.parseInt(match[1] ?? '', 10);
  return Number.isInteger(major) ? major : null;
}

export function isSupportedNodeVersion(version: string): boolean {
  const major = parseNodeMajor(version);
  return major !== null && (SUPPORTED_NODE_MAJORS as readonly number[]).includes(major);
}

export function parsePostgresVersion(version: string | number): ParsedPostgresVersion | null {
  const raw = String(version).trim();
  const match = /^(\d+)(?:\.(\d+))?/.exec(raw);
  if (!match) return null;
  const major = Number.parseInt(match[1] ?? '', 10);
  const minor = match[2] === undefined ? null : Number.parseInt(match[2], 10);
  if (!Number.isInteger(major) || (minor !== null && !Number.isInteger(minor))) return null;
  return { major, minor };
}

export function isSupportedPostgresVersion(version: string | number): boolean {
  const parsed = parsePostgresVersion(version);
  return parsed !== null && parsed.major >= MINIMUM_POSTGRES_MAJOR && parsed.major <= MAXIMUM_POSTGRES_MAJOR;
}

export function assertSupportedPostgresVersion(version: string | number): ParsedPostgresVersion {
  const parsed = parsePostgresVersion(version);
  if (parsed === null || parsed.major < MINIMUM_POSTGRES_MAJOR || parsed.major > MAXIMUM_POSTGRES_MAJOR) {
    throw new Error(`PostgreSQL ${MINIMUM_POSTGRES_MAJOR}-${MAXIMUM_POSTGRES_MAJOR} is required by this release.`);
  }
  return parsed;
}
