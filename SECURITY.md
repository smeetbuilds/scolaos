# Security Policy

This project handles sensitive school, student, guardian, staff, authentication, financial and private-document data. Security defects are treated as product defects.

For the detailed reporting/disclosure policy, read [`docs/security-disclosure.md`](docs/security-disclosure.md).

## Supported versions

There is no stable release yet. During pre-alpha development, security fixes target the current `main` branch unless a maintainer explicitly identifies another affected revision.

A supported-version/backport table will be published before the first stable release.

## Reporting a vulnerability

**Do not publish exploitable details in a public issue, discussion, pull request or social post before coordinated disclosure.**

Use GitHub's private vulnerability reporting / private security-advisory mechanism for `smeetbuilds/scolaos` when available. If it is unavailable, contact the repository owner privately through GitHub.

A useful report includes:

- affected commit/version;
- vulnerable component/route/module;
- security impact and prerequisites;
- reproducible safe steps or a minimal proof of concept;
- expected vs actual behavior;
- whether sensitive/cross-institution data is affected;
- suggested mitigation if known.

Use synthetic data and remove credentials, tokens, keys, production URLs and real school/user data.

## Security scope

High-priority areas include:

- installer exposure/re-entry/configuration disclosure;
- password/session/reset flows;
- permission/scope and institution/branch isolation;
- private-file access and uploads;
- database/data-integrity boundaries;
- financial mutations;
- jobs/outbox/idempotency where duplicate effects matter;
- backup/restore/update trust;
- secrets/redaction;
- CSRF/security headers/API abuse;
- dependency vulnerabilities reachable in supported deployments.

The maintained threat model is [`docs/threat-model.md`](docs/threat-model.md).

## Testing safety

Prefer local/disposable instances with synthetic data. Do not test against a third party's school deployment without authorization, access unrelated private records, perform denial-of-service testing against shared systems, persist malware/backdoors, or use social engineering against users/maintainers.

See the complete boundaries in [`docs/security-disclosure.md`](docs/security-disclosure.md).

## Disclosure and fixes

Please allow maintainers to validate, patch and prepare release/advisory information before publication of technical exploit details. Security fixes should add regression coverage and inspect adjacent paths for the same vulnerability class where practical.

The project is pre-alpha and currently makes **no bug-bounty or commercial response-SLA promise** unless separately stated in writing.

## Repository security baseline

- security-sensitive data must be excluded from source, logs and audit metadata;
- authentication/authorization enforcement is server-side;
- installer mutation is intended to become permanently unavailable after verified setup;
- private storage is private by default;
- dependency/security scanning recipes exist but GitHub Actions execution is currently manual-only by owner policy;
- vulnerability handling is distinct from ordinary public bug reporting.
