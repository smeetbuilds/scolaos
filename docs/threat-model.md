# ScolaOS Threat Model

**Status:** Initial M0 baseline  
**Review trigger:** installer/auth/fees/files/update architecture changes and every major release gate

## 1. Security objectives

ScolaOS must protect:

- student, guardian, staff, health/contact and other personal data;
- authentication credentials, sessions and recovery tokens;
- academic integrity: enrollment, attendance, marks, results and publication state;
- financial integrity: charges, payments, discounts, refunds and receipts;
- institution/branch/class/subject authorization boundaries;
- private files, exports and generated documents;
- server configuration, cryptographic secrets and integration credentials;
- backups, restore inputs and update/migration integrity;
- audit history required to explain privileged changes.

Availability matters, but confidentiality and integrity failures affecting children, credentials, finance, or cross-school boundaries are treated as higher-severity defects.

## 2. System/trust boundaries

```text
Browser / Tauri desktop / mobile
             |
         public network
             |
      reverse proxy / TLS
             |
        ScolaOS server
       /      |       \
PostgreSQL  storage   job worker/scheduler
                       |
                optional providers
              SMTP / payments / SMS
```

High-privilege setup path:

```text
unconfigured server -> /start/installation -> DB/config/secrets -> installed lock
```

Trust must never be inferred merely from client type, hidden UI, route naming, local network location, or a user-supplied institution/branch identifier.

## 3. Threat actors

- unauthenticated internet attacker;
- authenticated student/guardian attempting horizontal or vertical privilege escalation;
- authenticated staff member exceeding assigned class/subject/branch scope;
- malicious or compromised administrator;
- attacker with stolen session/device;
- compromised dependency, CI workflow, release artifact or update channel;
- attacker controlling an uploaded file, backup archive, webhook payload, job payload or integration response;
- accidental/malicious self-host configuration that exposes private storage or secrets.

## 4. Security invariants

1. Server-side authorization is required for every protected use case.
2. IDs from clients are identifiers, never authorization evidence.
3. The installer cannot perform privileged mutation after successful installation.
4. Secrets and reset/session tokens are never written to normal application logs.
5. Private files are not served directly from a public uploads directory.
6. Financial corrections are append/correct operations with audit history; receipt/payment integrity is not implemented as arbitrary CRUD.
7. Published academic outcomes and post-lock attendance corrections are auditable.
8. Update/restore input is treated as untrusted until authenticity/compatibility checks pass.
9. Background jobs re-authorize or operate from explicitly trusted server-side context and are idempotent where retries can duplicate effects.
10. Offline/native caches contain the minimum sensitive data required and use platform secure storage for reusable credentials.

## 5. Threat register

| ID | Surface | Threat | Required controls / tracked work |
|---|---|---|---|
| TM-INST-01 | Installer | Re-run or concurrent install mutates an installed instance | explicit boot state, install lock, permanent mutation lock, integration tests (`M1-001..040`) |
| TM-INST-02 | Installer | CSRF/origin abuse causes privileged setup action | installer origin/CSRF strategy, no ambient privileged session (`M1-037`) |
| TM-INST-03 | Installer | DB password/secrets leak in responses/logs | secret redaction, write-only credential UX, safe error envelope (`M1-003..005`) |
| TM-AUTH-01 | Login | Brute force/credential stuffing | rate limits, generic failures, audit/security events (`M1-054..058`) |
| TM-AUTH-02 | Sessions | Session theft/replay or failure to revoke | secure transport/storage, expiry, revocation, device/session management (`M1-053..059`) |
| TM-AUTH-03 | Recovery | Reset-token disclosure/reuse | hashed/single-use/expiring reset tokens, rate limits, security logs (`M1-057`) |
| TM-SCOPE-01 | API | IDOR/cross-branch/cross-class access | centralized authorization service, scoped grants, negative integration suite (`M1-060..066`) |
| TM-SCOPE-02 | Data | Cross-institution leakage if multi-institution support expands | explicit institution membership/context; evaluate PostgreSQL RLS defense-in-depth (`ADR-015`, `M1-064`) |
| TM-FILE-01 | Upload | Path traversal, executable/polyglot or oversized file | generated storage keys, MIME/content/size validation, provider abstraction (`M6-001..003`) |
| TM-FILE-02 | Download | Private file becomes guessable/public | authorized download service, private local root, negative tests (`M2-032`, `M6-002`) |
| TM-FIN-01 | Fees | Amount/discount/refund tampering | server-calculated rules, scoped permissions, audit events, integrity constraints (`M4-010..024`) |
| TM-FIN-02 | Payments | Replay/forged provider callbacks | signed webhook verification, idempotency, provider transaction uniqueness (gateway implementation) |
| TM-FIN-03 | Receipts | Historic payment evidence silently edited | immutable numbering/receipt rules and correction workflow (`M4-016..019`) |
| TM-UPD-01 | Supply chain | Malicious/tampered release or dependency | dependency/security automation, release checks, signed updater only after review (`M0-017..019`, `M6-045`) |
| TM-UPD-02 | Migration | Failed/incompatible migration corrupts DB | immutable migrations, compatibility metadata, backup, N-1 upgrade test (`M6-040..043`) |
| TM-BACK-01 | Backup | Backup exposes full sensitive dataset | protected storage/download, optional encryption, retention/access controls (`M6-030..036`) |
| TM-BACK-02 | Restore | Malicious/incompatible archive overwrites files/DB | manifest/checksum/version preflight, traversal-safe extraction, maintenance mode, restore tests (`M6-032..035`) |
| TM-JOB-01 | Jobs | Retry duplicates email/payment/result side effects | typed/versioned job contract, idempotency/deduplication, retry policy (`M0-076`, `M6-010..015`) |
| TM-LOG-01 | Observability | PII/credentials/tokens leak to logs | structured allowlisted logging/redaction and correlation IDs (`M1-005`, `M1-085`) |
| TM-CLIENT-01 | Native/offline | Stolen device exposes token/roster | secure-storage abstraction, minimal offline cache, revocable sessions (`M0-036`, `M5-012`, `M5-033`) |
| TM-CLIENT-02 | Offline sync | Replay/conflict corrupts attendance | idempotent operations, version/conflict handling, E2E offline suite (`M5-050..055`) |

## 6. Security testing strategy

- negative authorization tests are mandatory, not only happy paths;
- installer tests cover fresh, failed, concurrent and post-install rerun attempts;
- file tests cover traversal, unauthorized access, MIME/size validation and untrusted names;
- finance tests cover duplicate/replayed operations and correction audit history;
- migration/restore tests use disposable realistic PostgreSQL instances;
- dependency audit and secret scanning are continuous repository controls;
- production 1.0 receives an explicit end-to-end security review (`M6-060..067`).

## 7. Accepted residual risks in M0

No production feature is shipped at M0. Authentication transport, PostgreSQL RLS strategy, payment gateway implementation, updater design and backup encryption remain open/provisional decisions and therefore cannot be considered production security controls yet.
