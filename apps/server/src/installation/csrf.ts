import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

const COOKIE_NAME = 'installer_csrf';
const SESSION_MAX_AGE_SECONDS = 30 * 60;

function parseCookie(header: string | undefined, name: string): string | undefined {
  if (header === undefined) {
    return undefined;
  }

  for (const part of header.split(';')) {
    const separator = part.indexOf('=');
    if (separator < 0) {
      continue;
    }
    const key = part.slice(0, separator).trim();
    if (key === name) {
      return part.slice(separator + 1).trim();
    }
  }

  return undefined;
}

function equalSecret(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export interface InstallerCsrfSession {
  readonly token: string;
  readonly setCookie: string;
  readonly expiresInSeconds: number;
}

export interface InstallerMutationContext {
  readonly cookieHeader?: string;
  readonly token?: string;
  readonly origin?: string;
  readonly host?: string;
  readonly protocol: string;
  readonly secFetchSite?: string;
}

export class InstallerCsrf {
  private readonly secret = randomBytes(32);

  private sign(nonce: string): string {
    return createHmac('sha256', this.secret).update(`v1:${nonce}`).digest('base64url');
  }

  public issue(secure: boolean): InstallerCsrfSession {
    const nonce = randomBytes(32).toString('base64url');
    const secureAttribute = secure ? '; Secure' : '';
    return {
      token: this.sign(nonce),
      setCookie: `${COOKIE_NAME}=${nonce}; Path=/start/installation; HttpOnly; SameSite=Strict; Max-Age=${SESSION_MAX_AGE_SECONDS}${secureAttribute}`,
      expiresInSeconds: SESSION_MAX_AGE_SECONDS,
    };
  }

  public verify(context: InstallerMutationContext): boolean {
    const secFetchSite = context.secFetchSite?.toLowerCase();
    if (
      secFetchSite !== undefined &&
      !['same-origin', 'same-site', 'none'].includes(secFetchSite)
    ) {
      return false;
    }

    if (context.origin !== undefined) {
      if (context.host === undefined) {
        return false;
      }

      let origin: URL;
      try {
        origin = new URL(context.origin);
      } catch {
        return false;
      }

      if (
        origin.host.toLowerCase() !== context.host.toLowerCase() ||
        origin.protocol !== `${context.protocol}:`
      ) {
        return false;
      }
    }

    const nonce = parseCookie(context.cookieHeader, COOKIE_NAME);
    if (nonce === undefined || context.token === undefined || context.token === '') {
      return false;
    }

    return equalSecret(this.sign(nonce), context.token);
  }
}
