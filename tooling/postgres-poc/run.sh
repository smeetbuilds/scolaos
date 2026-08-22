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
PSQL_ARGS=("$DATABASE_URL" --no-psqlrc --set=ON_ERROR_STOP=1)

server_version_num="$(psql "${PSQL_ARGS[@]}" --tuples-only --no-align --command='SHOW server_version_num;')"
if [[ ! "$server_version_num" =~ ^[0-9]+$ ]]; then
  echo "Could not determine PostgreSQL server_version_num safely." >&2
  exit 3
fi

server_major=$((10#$server_version_num / 10000))
case "$server_major" in
  16|17|18) ;;
  *)
    echo "Unsupported PostgreSQL major $server_major; ScolaOS currently supports PostgreSQL 16-18." >&2
    exit 3
    ;;
esac

if [[ -n "${SCOLAOS_EXPECT_POSTGRES_MAJOR:-}" ]]; then
  if [[ ! "$SCOLAOS_EXPECT_POSTGRES_MAJOR" =~ ^[0-9]+$ ]]; then
    echo "SCOLAOS_EXPECT_POSTGRES_MAJOR must be an integer PostgreSQL major." >&2
    exit 2
  fi
  if (( server_major != 10#$SCOLAOS_EXPECT_POSTGRES_MAJOR )); then
    echo "Connected to PostgreSQL $server_major but expected PostgreSQL $SCOLAOS_EXPECT_POSTGRES_MAJOR." >&2
    exit 3
  fi
fi

can_create="$(
  psql "${PSQL_ARGS[@]}" \
    --tuples-only \
    --no-align \
    --command="SELECT has_database_privilege(current_user, current_database(), 'CREATE');"
)"
if [[ "$can_create" != "t" ]]; then
  echo "The PostgreSQL account must have CREATE privilege on the disposable POC database." >&2
  exit 3
fi

psql "${PSQL_ARGS[@]}" --file="$SCRIPT_DIR/reference-schema.sql"
psql "${PSQL_ARGS[@]}" --file="$SCRIPT_DIR/verify.sql"

echo "M0-031 PostgreSQL acceptance harness passed on PostgreSQL $server_major."
