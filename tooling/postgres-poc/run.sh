#!/usr/bin/env bash
set -euo pipefail

if [[ "${SCOLAOS_POC_ALLOW_DESTRUCTIVE:-}" != "1" ]]; then
  echo "Refusing to run: set SCOLAOS_POC_ALLOW_DESTRUCTIVE=1 for the disposable M0-031 database." >&2
  exit 2
fi

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL is required." >&2
  exit 2
fi

if ! command -v psql >/dev/null 2>&1; then
  echo "psql is required to execute the M0-031 PostgreSQL acceptance harness." >&2
  exit 2
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

psql "$DATABASE_URL" --set=ON_ERROR_STOP=1 --file="$SCRIPT_DIR/reference-schema.sql"
psql "$DATABASE_URL" --set=ON_ERROR_STOP=1 --file="$SCRIPT_DIR/verify.sql"

echo "M0-031 PostgreSQL acceptance harness passed."
