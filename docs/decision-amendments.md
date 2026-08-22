# Decision Amendments

The amendments below were folded into the canonical `docs/decision.md` log during audit remediation on 22 August 2026. This file is retained only as historical evidence of why ADR-023 and ADR-025 changed; `docs/decision.md` is now authoritative for their current status and wording.

---

## ADR-023 Amendment — Project name/brand

**Effective:** 13 August 2026  
**Status:** REJECTED AS FINAL BRAND / replacement OPEN  
**Supersedes:** the provisional assumption that `ScolaOS` can continue as the eventual public product name.

### Evidence

A current conflict screen found an unrelated, active school-software product already using the exact **ScolaOS** name at `scolaos.com`, including current attendance and student-information product content in the same broad market.

Evidence and scope are recorded in `docs/brand-screening.md`.

### Decision

`ScolaOS` may remain the temporary repository/engineering codename while a replacement is selected, but it is **rejected as the final public product brand**.

The repository must not create additional permanent branding dependencies on this name before replacement-name screening is complete.

### Consequences

- `M0-003` remains IN PROGRESS until a replacement name passes product/domain/namespace screening and appropriate trademark clearance.
- Do not register final domains, publish final package namespaces, create app-store listings, signing identities, launch assets or permanent design-system branding under ScolaOS.
- Do not rename the repository automatically as part of this amendment; coordinate that migration only after a replacement is explicitly selected.
- Engineering identifiers should remain reasonably renameable until the brand decision closes.
- This is a product-conflict decision, not a legal finding of trademark infringement.

---

## ADR-025 Amendment — Authentication session transport

**Effective:** 13 August 2026  
**Status:** ACCEPTED  
**Supersedes:** ADR-025 OPEN state in the original `docs/decision.md` baseline.

### Decision

Use **opaque server-side sessions** for first-party authentication rather than self-contained JWT authorization claims.

Transport by client class:

- **Web/browser:** opaque session credential in an HttpOnly cookie. Production HTTPS uses a `__Host-` cookie with `Secure`, `Path=/`, no Domain and `SameSite=Lax`. Insecure cookies require explicit local-development opt-in only.
- **Desktop/mobile:** the same opaque credential class is carried as `Authorization: Bearer ...` and must be stored only through the approved native secure-storage platform bridge.

Server persistence stores only a cryptographic hash of each session credential. The raw credential is returned only when the session is issued.

### Session model

- Multiple concurrent device sessions are supported.
- Sessions have idle and absolute expiry.
- Individual sessions and all/other sessions can be revoked.
- Disabled users, revoked sessions, expired sessions and missing principals fail closed.
- Current authorization grants and relationship context are resolved from authoritative server-side state during authentication rather than copied into long-lived client-controlled claims.

### CSRF model

Browser credentials are cookies, so unsafe browser mutations require a CSRF defense. The core provides a token HMAC-bound to the server session. HTTP integration must combine this with origin/fetch-site validation and must never treat SameSite alone as the complete CSRF control.

Native bearer credentials are not ambient browser cookies and therefore do not use the browser-cookie CSRF mechanism.

### Why

This model directly supports self-hosted operation, predictable revocation, multiple devices, permission/account changes taking effect without waiting for JWT expiry, native secure storage, and straightforward audit/session management.

### Evidence

Implementation and executed core evidence are recorded in `apps/server/src/identity/` and `docs/pocs/identity-auth-foundation.md`.

### Consequences

- `M1-053` is DONE.
- Session persistence is a server-side database concern and must be designed with M1 identity schemas.
- Browser login/logout endpoints must set/clear the approved cookie attributes and enforce the CSRF/origin contract.
- Native clients must never place the bearer credential in ordinary preferences/local storage.
- A future switch to JWT/self-contained authorization requires a new ADR with explicit revocation, permission-freshness and self-hosting analysis.
