#!/bin/sh
set -eu

mkdir -p /backups

while true; do
  TIMESTAMP=$(date +%Y%m%d_%H%M%S)
  FILE="/backups/${POSTGRES_DB}_${TIMESTAMP}.dump"

  echo "[backup] $(date): dumping ${POSTGRES_DB}..."
  if PGPASSWORD="$POSTGRES_PASSWORD" pg_dump -h "$PGHOST" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -F c -f "$FILE"; then
    echo "[backup] OK: $FILE"
  else
    echo "[backup] FAILED at $TIMESTAMP"
  fi

  sleep 86400
done
