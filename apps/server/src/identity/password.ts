import { randomBytes, scrypt as nodeScrypt, timingSafeEqual } from 'node:crypto';

import { ScolaApiError } from '../errors.js';

const PASSWORD_RECORD_PREFIX = 'scrypt';
const PASSWORD_RECORD_VERSION = 1;
const SCRYPT_COST = 65_536;
const SCRYPT_BLOCK_SIZE = 8;
const SCRYPT_PARALLELIZATION = 2;
const SCRYPT_KEY_LENGTH = 64;
const SCRYPT_MAX_MEMORY = 128 * 1024 * 1024;
const SALT_BYTES = 16;
export const MIN_PASSWORD_CODE_POINTS = 15;
export const MAX_PASSWORD_CODE_POINTS = 256;

export interface PasswordPolicyResult {
  readonly normalized: string;
  readonly codePoints: number;
}

function countCodePoints(value: string): number {
  return Array.from(value).length;
}

export function normalizePassword(password: string): string {
  return password.normalize('NFC');
}

export function validatePasswordPolicy(password: string): PasswordPolicyResult {
  const normalized = normalizePassword(password);
  const codePoints = countCodePoints(normalized);

  if (codePoints < MIN_PASSWORD_CODE_POINTS) {
    throw new ScolaApiError(
      'PASSWORD_TOO_SHORT',
      `Password must contain at least ${MIN_PASSWORD_CODE_POINTS} characters.`,
      400,
    );
  }

  if (codePoints > MAX_PASSWORD_CODE_POINTS) {
    throw new ScolaApiError(
      'PASSWORD_TOO_LONG',
      `Password must contain no more than ${MAX_PASSWORD_CODE_POINTS} characters.`,
      400,
    );
  }

  return { normalized, codePoints };
}

async function derive(
  password: string,
  salt: Buffer,
  cost: number,
  blockSize: number,
  parallelization: number,
  keyLength: number,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    nodeScrypt(
      password,
      salt,
      keyLength,
      { N: cost, r: blockSize, p: parallelization, maxmem: SCRYPT_MAX_MEMORY },
      (error, derivedKey) => {
        if (error !== null) {
          reject(error);
          return;
        }
        resolve(derivedKey);
      },
    );
  });
}

export async function hashPassword(password: string): Promise<string> {
  const { normalized } = validatePasswordPolicy(password);
  const salt = randomBytes(SALT_BYTES);
  const hash = await derive(
    normalized,
    salt,
    SCRYPT_COST,
    SCRYPT_BLOCK_SIZE,
    SCRYPT_PARALLELIZATION,
    SCRYPT_KEY_LENGTH,
  );

  return [
    PASSWORD_RECORD_PREFIX,
    String(PASSWORD_RECORD_VERSION),
    String(SCRYPT_COST),
    String(SCRYPT_BLOCK_SIZE),
    String(SCRYPT_PARALLELIZATION),
    String(SCRYPT_KEY_LENGTH),
    salt.toString('base64url'),
    hash.toString('base64url'),
  ].join('$');
}

interface ParsedPasswordRecord {
  readonly cost: number;
  readonly blockSize: number;
  readonly parallelization: number;
  readonly keyLength: number;
  readonly salt: Buffer;
  readonly hash: Buffer;
}

function parsePositiveInteger(value: string | undefined, name: string): number {
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1) {
    throw new Error(`Invalid password record ${name}.`);
  }
  return parsed;
}

function isPowerOfTwo(value: number): boolean {
  return value > 1 && (value & (value - 1)) === 0;
}

function parsePasswordRecord(record: string): ParsedPasswordRecord {
  const parts = record.split('$');
  if (
    parts.length !== 8 ||
    parts[0] !== PASSWORD_RECORD_PREFIX ||
    parts[1] !== String(PASSWORD_RECORD_VERSION)
  ) {
    throw new Error('Unsupported password record format.');
  }

  const cost = parsePositiveInteger(parts[2], 'cost');
  const blockSize = parsePositiveInteger(parts[3], 'block size');
  const parallelization = parsePositiveInteger(parts[4], 'parallelization');
  const keyLength = parsePositiveInteger(parts[5], 'key length');
  const salt = Buffer.from(parts[6] ?? '', 'base64url');
  const hash = Buffer.from(parts[7] ?? '', 'base64url');

  if (
    !isPowerOfTwo(cost) ||
    cost > SCRYPT_COST ||
    blockSize > SCRYPT_BLOCK_SIZE ||
    parallelization > SCRYPT_PARALLELIZATION ||
    keyLength > SCRYPT_KEY_LENGTH ||
    salt.length < SALT_BYTES ||
    hash.length !== keyLength
  ) {
    throw new Error('Password record parameters are outside supported verification bounds.');
  }

  return { cost, blockSize, parallelization, keyLength, salt, hash };
}

export async function verifyPassword(password: string, record: string): Promise<boolean> {
  let parsed: ParsedPasswordRecord;
  try {
    parsed = parsePasswordRecord(record);
  } catch {
    return false;
  }

  const normalized = normalizePassword(password);
  if (countCodePoints(normalized) > MAX_PASSWORD_CODE_POINTS) {
    return false;
  }

  try {
    const derived = await derive(
      normalized,
      parsed.salt,
      parsed.cost,
      parsed.blockSize,
      parsed.parallelization,
      parsed.keyLength,
    );
    return derived.length === parsed.hash.length && timingSafeEqual(derived, parsed.hash);
  } catch {
    return false;
  }
}

export function passwordRecordNeedsUpgrade(record: string): boolean {
  try {
    const parsed = parsePasswordRecord(record);
    return (
      parsed.cost !== SCRYPT_COST ||
      parsed.blockSize !== SCRYPT_BLOCK_SIZE ||
      parsed.parallelization !== SCRYPT_PARALLELIZATION ||
      parsed.keyLength !== SCRYPT_KEY_LENGTH
    );
  } catch {
    return true;
  }
}
