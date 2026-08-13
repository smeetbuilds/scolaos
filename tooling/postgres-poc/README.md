# M0-031 PostgreSQL acceptance harness

This directory contains the database-semantic acceptance harness for the Drizzle/PostgreSQL architecture POC.

It is intentionally independent from Drizzle so it can verify the SQL semantics produced by a future generated migration rather than validating the ORM against itself.

## Safety

The harness drops and recreates the schema `scolaos_m0_031`. Run it **only against a disposable POC database**.

It refuses to execute unless both are present:

- `SCOLAOS_POC_ALLOW_DESTRUCTIVE=1`
- `DATABASE_URL`

The script does not echo the database URL.

## Run

```bash
SCOLAOS_POC_ALLOW_DESTRUCTIVE=1 \
DATABASE_URL='postgresql://user:password@127.0.0.1:5432/scolaos_poc' \
./tooling/postgres-poc/run.sh
```

Requirements: Bash and `psql`.

A successful run prints:

```text
M0-031 PostgreSQL acceptance harness passed.
```

## Important

Passing this harness alone does not complete M0-031. The final POC must generate/apply the schema through Drizzle Kit, validate the Drizzle migration journal, exercise typed queries through `drizzle-orm`, and run against real PostgreSQL versions selected by the POC matrix.
