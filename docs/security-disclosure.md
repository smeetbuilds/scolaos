# Security Vulnerability Reporting and Disclosure

**Tasks:** M6-067, M6-093 support  
**Status:** MAINTAINED policy  
**Last reviewed:** 14 August 2026

ScolaOS handles student, guardian, staff, authentication, financial and private-document data. Please report plausible security vulnerabilities privately so they can be validated and remediated before public exploit details are released.

## Where to report

Use GitHub's private vulnerability reporting / private security-advisory channel for `smeetbuilds/scolaos` when available.

If that mechanism is unavailable, contact the repository owner privately through GitHub. Do **not** open a public issue containing exploit details, secrets, private data or a working proof of concept.

## Include in a report

Provide enough information to reproduce and assess the issue:

- affected commit/version and deployment assumptions;
- vulnerable component/route/module;
- security impact and attacker prerequisites;
- reproducible steps or minimal safe proof of concept;
- expected vs actual behavior;
- whether authentication/permissions are required;
- whether cross-institution, student, staff, finance or private-file data is affected;
- suggested fix or mitigation if known.

Use synthetic data. Remove credentials, session/reset tokens, private keys, real student/school data, production URLs and other third-party secrets.

## High-priority categories

Examples include:

- authentication/session takeover or reset-flow bypass;
- authorization/scope or institution/branch isolation bypass;
- installer re-entry or configuration disclosure;
- SQL/data-integrity vulnerabilities;
- arbitrary private-file access or unsafe upload handling;
- financial mutation/integrity bypass;
- backup/restore/update trust failures;
- remote code execution, command/path traversal, SSRF or unsafe deserialization;
- secret/token exposure;
- CSRF on privileged browser actions;
- abuse/rate-limit defects with meaningful security impact;
- dependency vulnerabilities that are reachable in supported deployment paths.

## Testing boundaries

Security research must minimize harm.

Do not:

- access or alter data you do not own or have explicit permission to test;
- test against a third party's production school instance without authorization;
- perform denial-of-service/resource-exhaustion testing against shared infrastructure;
- persist malware/backdoors;
- exfiltrate more data than necessary to prove the issue;
- use social engineering against school users, students, parents, staff or maintainers;
- publish unremediated exploit details while a private report is being evaluated.

Prefer a local/disposable instance and synthetic data.

## Triage and communication

The project is currently pre-alpha and does not promise a commercial support SLA or bug bounty. Maintainers will evaluate reports based on reproducibility, impact, exploitability, affected data, default deployment exposure and available mitigations.

Duplicate, non-reproducible, purely theoretical, or out-of-scope reports may be closed without a security advisory. A report can still be useful even when the final severity differs from the reporter's estimate.

## Coordinated disclosure

Please allow remediation and release preparation before publishing technical exploit details. The maintainer and reporter should coordinate disclosure timing based on severity, patch availability and downstream self-hosted exposure.

When appropriate, the project may publish a GitHub security advisory/release note with affected versions, impact, mitigation and fixed version. Credit can be provided when the reporter wants attribution and doing so is safe.

## Security fixes

A security fix should include, as appropriate:

- a regression test that fails before the fix and passes after it;
- threat/authorization boundary review;
- affected-version analysis;
- backport/release decision once stable releases exist;
- advisory/release-note content that does not unnecessarily expose user secrets;
- audit of adjacent code paths for the same vulnerability class.

## Not a place for ordinary bugs

Non-security defects should follow the normal project contribution/issue process. Do not use the private security channel merely to obtain priority for a functional bug.

See also `SECURITY.md` and `docs/threat-model.md`.
