# Initial Server Support Matrix

**Task:** M0-004  
**Status:** ACCEPTED initial support policy  
**Last reviewed:** 14 August 2026

This document defines the initial server compatibility promise for the pre-alpha architecture. It intentionally keeps the production matrix narrower than the set of platforms on which individual dependencies may happen to run.

## Production server baseline

| Area | Initial supported policy |
| --- | --- |
| Host OS | Linux x86_64 |
| Node.js | 24.x LTS only |
| PostgreSQL | Major 16, 17, or 18 |
| PostgreSQL minor | Current supported minor for the chosen major |
| Package manager | pnpm 11.x as locked by the repository |
| App topology | application process + PostgreSQL are the only mandatory services |
| TLS | HTTPS required before remote production access; localhost HTTP may be used during local installation |
| File storage | local filesystem is the default provider contract; S3-compatible storage remains optional |
| Docker | not yet an official production-support promise; container baseline remains a later hardening task |

macOS and Windows may be used for development where the repository toolchain works, but they are not part of the initial production server support promise until fresh-install and operational evidence exists on those platforms.

## Node.js policy

The repository supports **Node.js 24.x** for the initial release line.

As reviewed on 14 August 2026, Node.js lists v24 (Krypton) as LTS and v26 as Current. The project therefore does not expand its production support matrix to Node 26 before that line reaches the project's own compatibility review and test gate.

Repository enforcement points:

- root `package.json` engine range remains `>=24 <25`;
- `.node-version` remains `24`;
- installer requirements use the centralized `apps/server/src/platform-support.ts` policy instead of a second hard-coded version rule.

Primary source:

- https://nodejs.org/en/about/previous-releases

## PostgreSQL policy

The initial supported PostgreSQL majors are **16 through 18**, with **16 as the minimum**.

As reviewed on 14 August 2026, PostgreSQL lists the following supported current minors:

- PostgreSQL 16.14;
- PostgreSQL 17.10;
- PostgreSQL 18.4.

The PostgreSQL project recommends staying on the current minor release for the selected major. ScolaOS therefore supports a major line, not an indefinitely frozen minor version.

Primary sources:

- https://www.postgresql.org/support/versioning/
- https://www.postgresql.org/docs/release/18.4/

## Compatibility gates

Documenting the support matrix does **not** substitute for M0-031.

Before the architecture/release gate can treat the database stack as proven, the Drizzle/PostgreSQL POC must still demonstrate at minimum:

1. generated migrations apply to a fresh supported PostgreSQL instance;
2. the migration journal is correct and reruns do not replay applied migrations;
3. constraints and transaction rollback behavior are proven;
4. application connection/version checks reject unsupported majors;
5. the minimum major (PostgreSQL 16) is exercised;
6. the current primary major (PostgreSQL 18 at this review) is exercised;
7. the Node 24 production runtime executes the server/database integration suite.

PostgreSQL 17 should remain covered by ordinary CI/integration compatibility once the DB test matrix exists.

## Change policy

Changing any of the following requires explicit compatibility review and documentation update:

- minimum Node major;
- minimum PostgreSQL major;
- adding/removing a PostgreSQL major;
- adding a production OS/architecture;
- making Docker an officially supported production path.

Dropping a still-supported environment must be treated as a release/upgrade compatibility decision, not an incidental dependency bump.
