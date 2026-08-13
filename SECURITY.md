# Security Policy

ScolaOS handles sensitive school, student, staff, authentication, financial, and document data. Security defects are treated as product defects, not optional hardening.

## Supported versions

There is no stable release yet. During pre-alpha development, only the current `main` branch is maintained. A version support table will be added before the first public release.

## Reporting a vulnerability

Do **not** publish exploitable security details in a public issue. Use GitHub's private vulnerability reporting / security-advisory flow for this repository when available. If that channel is temporarily unavailable, contact the repository owner privately through GitHub rather than posting exploit details publicly.

Please include the affected revision/version, impact, reproducible steps or a minimal proof of concept where safe, and suggested remediation if known.

## Security scope

High-priority areas include installer exposure, authentication/session handling, permission/scope bypass, school/branch isolation, private file access, uploads, financial integrity, update packages, backups/restores, background jobs, secrets, and API abuse.

The active threat-model task is tracked as `M0-005`.
