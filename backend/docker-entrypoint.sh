#!/bin/sh
set -e

if [ -n "$BACKEND_DATABASE_URL" ]; then
  export DATABASE_URL="$BACKEND_DATABASE_URL"
fi

if [ "$RUN_MIGRATIONS" = "true" ]; then
  max_attempts="${MIGRATION_MAX_ATTEMPTS:-15}"
  retry_delay="${MIGRATION_RETRY_DELAY:-4}"
  attempt=1

  until npx prisma migrate deploy; do
    if [ "$attempt" -ge "$max_attempts" ]; then
      echo "Prisma migration failed after ${max_attempts} attempts"
      exit 1
    fi

    echo "Waiting for database before retrying migrations (${attempt}/${max_attempts})..."
    attempt=$((attempt + 1))
    sleep "$retry_delay"
  done
fi

exec node dist/src/server.js
