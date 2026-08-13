# M0-031 — Drizzle/PostgreSQL proof of concept

**Status:** IN PROGRESS — execution gate pending  
**Prepared:** 13 August 2026  
**Architecture decisions informed:** ADR-002, ADR-009, ADR-027

## Purpose

Prove that ScolaOS can use Drizzle ORM + Drizzle Kit against ordinary self-hosted PostgreSQL with committed SQL migrations, deterministic migration tracking, strong relational constraints, transaction safety, and repeatable integration tests.

This is an architecture proof, not the production school schema.

## Current execution constraint

The current implementation environment has no PostgreSQL server/client, Docker, Podman, or package-registry connectivity. GitHub Actions are intentionally manual-only because the owner has exhausted the current Actions allowance.

Therefore this task must **not** be marked passed from static code or SQL review alone.

## Candidate stable stack for the execution pass

Versions verified from the public package registries on 13 August 2026:

- `drizzle-orm` `0.45.2`
- `drizzle-kit` `0.31.10`
- `pg` `8.22.0`
- `@types/pg` `8.20.0`

Use the `node-postgres` driver for the POC because it is a direct PostgreSQL driver with no hosted service dependency and is documented by Drizzle as a supported PostgreSQL connection path.

Before adding these packages, regenerate `pnpm-lock.yaml` in an environment that can reach the package registry and verify frozen installation. Do not hand-edit dependency resolution into the lockfile.

References:

- https://orm.drizzle.team/docs/get-started-postgresql
- https://orm.drizzle.team/docs/kit-overview
- https://orm.drizzle.team/docs/drizzle-kit-migrate
- https://www.npmjs.com/package/drizzle-orm
- https://www.npmjs.com/package/drizzle-kit
- https://www.npmjs.com/package/pg

## PostgreSQL execution matrix

The POC should run against at least:

1. PostgreSQL `16.14` — candidate lower supported major for ScolaOS 1.0.
2. PostgreSQL `18.4` — current production major as of this POC preparation.

PostgreSQL `17.10` is desirable as an intermediate compatibility run when an environment is available. The final minimum supported major is decided by `M0-004`, not by this document.

PostgreSQL's official support policy currently lists majors 14–18 as supported; 14 reaches end of support in November 2026. ScolaOS should not choose its long-lived 1.0 minimum solely because an old major is technically still supported at POC time.

Reference: https://www.postgresql.org/support/versioning/

## Acceptance model

The POC uses three deliberately small entities:

- institution;
- student;
- enrollment.

The model is designed to prove the database properties ScolaOS depends on:

- UUID primary keys supplied by the application;
- institution-scoped uniqueness;
- foreign-key enforcement;
- a compound foreign key preventing cross-institution student enrollment;
- check constraints;
- operational indexes;
- transactional rollback;
- explicit timestamps;
- predictable `RESTRICT` semantics for destructive parent deletes.

`tooling/postgres-poc/reference-schema.sql` is an **acceptance reference**, not a production migration and not evidence that Drizzle generated the schema. The eventual Drizzle schema/migration must be compared against these semantics and then executed against real PostgreSQL.

## Migration rules to prove

The execution pass must demonstrate all of the following:

1. Define the POC model in a typed Drizzle PostgreSQL schema.
2. Generate SQL with Drizzle Kit; do not write the passing migration by hand.
3. Commit the generated SQL and Drizzle metadata/snapshot required for deterministic future generation.
4. Apply the migration to a fresh PostgreSQL database.
5. Confirm Drizzle records successfully applied migrations in its migration journal (`drizzle.__drizzle_migrations`).
6. Re-run migration application and prove already-applied migrations are not replayed.
7. Run `tooling/postgres-poc/verify.sql` successfully.
8. Prove a normal application transaction rolls back atomically.
9. Prove unique, check, and foreign-key constraints fail safely.
10. Prove the institution/student compound relationship rejects cross-institution enrollment.
11. Prove required indexes exist.
12. Capture PostgreSQL and package versions used for the evidence report.
13. Confirm no Supabase/Firebase/cloud-specific database feature is required.

## Failure-safety requirements

- The POC database must be disposable and isolated from real data.
- Migration failure must terminate with a non-zero result; no error swallowing.
- Credentials are supplied through `DATABASE_URL` and must not be printed.
- Never put production credentials in repository files, shell history examples, or logs.
- Never use `drizzle-kit push` as the production migration strategy. ScolaOS requires source-controlled SQL migrations.
- Released production migrations will be immutable. Corrections happen through new forward migrations.

## Prepared acceptance harness

`tooling/postgres-poc/run.sh` performs a destructive guard check and then runs:

1. `reference-schema.sql` — creates the isolated acceptance schema in a disposable database.
2. `verify.sql` — validates uniqueness, tenant/institution boundaries, check constraints, transaction rollback, and required indexes.

The reference harness can be run now in any PostgreSQL-capable environment:

```bash
SCOLAOS_POC_ALLOW_DESTRUCTIVE=1 \
DATABASE_URL='postgresql://user:password@127.0.0.1:5432/scolaos_poc' \
./tooling/postgres-poc/run.sh
```

This command validates PostgreSQL semantics only. It does **not** complete M0-031 until the same semantics are produced/applied through Drizzle Kit and the typed Drizzle data path is integration-tested.

## Remaining implementation sequence

1. Obtain a real PostgreSQL 16/18 execution environment with package-registry access.
2. Add the exact reviewed Drizzle/node-postgres packages and regenerate the pnpm lockfile normally.
3. Add `apps/server/src/db/schema.ts` and Drizzle configuration.
4. Generate the first SQL migration with Drizzle Kit.
5. Add a database connection/repository POC and integration tests.
6. Execute fresh migrate, repeat migrate, constraint tests and transaction tests against PostgreSQL 16 and 18.
7. Record results here.
8. Mark M0-031 DONE only after executable evidence passes.
9. Proceed to M0-004 support matrix and M0-039 architecture lock.

## Current conclusion

Drizzle remains **PROVISIONAL**. The migration design and real-Postgres acceptance contract are now prepared, but the decisive runtime evidence is intentionally still open.
