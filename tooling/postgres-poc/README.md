# M0-031 PostgreSQL acceptance harness

This directory contains the database-semantic acceptance harness for the Drizzle/PostgreSQL architecture POC.

It is intentionally independent from Drizzle so it can verify SQL semantics independently from the ORM that will generate and query the production schema.

## Safety

The harness drops and recreates the schema `scolaos_m0_031`. Run it **only against a disposable POC database**.

It refuses to execute unless both are present:

- `SCOLAOS_POC_ALLOW_DESTRUCTIVE=1`
- `DATABASE_URL`

The script does not echo the database URL. It also verifies that the connected server is PostgreSQL 16, 17 or 18 and that the current database account has `CREATE` privilege before destructive DDL begins.

Set `SCOLAOS_EXPECT_POSTGRES_MAJOR` when the caller must prove a specific server major. CI uses that guard for the PostgreSQL 16 and 18 boundary matrix.

## Run

```bash
SCOLAOS_POC_ALLOW_DESTRUCTIVE=1 \
SCOLAOS_EXPECT_POSTGRES_MAJOR=16 \
DATABASE_URL='postgresql://user:password@127.0.0.1:5432/scolaos_poc' \
bash ./tooling/postgres-poc/run.sh
```

Requirements: Bash and `psql`.

A successful run prints the verified server major, for example:

```text
M0-031 PostgreSQL acceptance harness passed on PostgreSQL 16.
```

## What this proves

`reference-schema.sql` and `verify.sql` exercise:

- PostgreSQL schema/table creation;
- tenant-scoped foreign keys;
- uniqueness and check constraints;
- operational indexes;
- transaction rollback behavior;
- minimum supported/target PostgreSQL server-major compatibility at the SQL-semantic layer.

The existing CI workflow runs this harness against PostgreSQL 16 and 18 service containers. A workflow run must actually pass before that execution can be cited as evidence.

## What remains open

Passing this harness does **not** complete M0-031. The final POC must still:

1. add `drizzle-orm`, `drizzle-kit` and the selected PostgreSQL driver through normal pnpm resolution so `pnpm-lock.yaml` is generated rather than hand-edited;
2. define the representative schema through Drizzle;
3. generate and commit SQL migrations through Drizzle Kit;
4. apply those migrations to disposable PostgreSQL 16 and 18 instances;
5. validate the Drizzle migration journal;
6. exercise representative typed inserts/selects/transactions through `drizzle-orm`;
7. update ADR-009/M0-039 only after executable evidence is green.

Until those steps are executed, Drizzle remains `PROVISIONAL` and M0-031 remains `IN PROGRESS`.
