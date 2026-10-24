#!/usr/bin/env bash
#
# One-command local database setup.
#
#   ./scripts/db-setup.sh           start Postgres, apply migrations, seed
#   ./scripts/db-setup.sh --reset   destroy the volume first (DELETES ALL LOCAL DATA)
#
# Safe to re-run: migrations and seeding are both idempotent.

set -euo pipefail

cd "$(dirname "$0")/.."

POSTGRES_USER="${POSTGRES_USER:-maison}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-maison_dev_password}"
POSTGRES_DB="${POSTGRES_DB:-maison}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"
DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:${POSTGRES_PORT}/${POSTGRES_DB}?schema=public"
export DATABASE_URL

RESET=false
for arg in "$@"; do
  case "$arg" in
    --reset) RESET=true ;;
    *) echo "Unknown option: $arg" >&2; exit 2 ;;
  esac
done

info()  { printf '\033[0;36m›\033[0m %s\n' "$1"; }
ok()    { printf '\033[0;32m✓\033[0m %s\n' "$1"; }
fail()  { printf '\033[0;31m✗\033[0m %s\n' "$1" >&2; exit 1; }

# --- 1. Preconditions -------------------------------------------------------

command -v docker >/dev/null 2>&1 || fail "Docker is not installed. See https://docs.docker.com/get-docker/"

if ! docker info >/dev/null 2>&1; then
  fail "The Docker daemon isn't running. Start Docker Desktop and re-run this script."
fi

# --- 2. Container -----------------------------------------------------------

if [ "$RESET" = true ]; then
  info "Removing the existing database volume (all local data will be lost)…"
  docker compose down --volumes
fi

info "Starting Postgres…"
docker compose up -d

# --- 3. Wait for readiness --------------------------------------------------
# Polls the container's own healthcheck rather than sleeping a fixed interval.

info "Waiting for Postgres to accept connections…"
for _ in $(seq 1 60); do
  status="$(docker inspect --format '{{.State.Health.Status}}' maison-postgres 2>/dev/null || echo starting)"
  if [ "$status" = "healthy" ]; then
    ok "Postgres is ready on port ${POSTGRES_PORT}."
    break
  fi
  if [ "$status" = "unhealthy" ]; then
    docker compose logs --tail 30 postgres
    fail "Postgres reported unhealthy. Logs above."
  fi
  sleep 1
done

if [ "${status:-}" != "healthy" ]; then
  docker compose logs --tail 30 postgres
  fail "Postgres did not become ready in time. Logs above."
fi

# --- 4. Link the app to it --------------------------------------------------
# .env.local is gitignored and holds the dev secrets; add DATABASE_URL if absent.

if [ ! -f .env.local ]; then
  info "Creating .env.local from .env.example…"
  cp .env.example .env.local
fi

if grep -q '^DATABASE_URL=' .env.local; then
  ok "DATABASE_URL already present in .env.local (left untouched)."
else
  info "Adding DATABASE_URL to .env.local…"
  printf '\n# Added by scripts/db-setup.sh\nDATABASE_URL="%s"\n' "$DATABASE_URL" >> .env.local
  ok "DATABASE_URL written to .env.local."
fi

# --- 5. Schema + data -------------------------------------------------------

info "Applying migrations…"
npx prisma migrate deploy

info "Generating Prisma client…"
npx prisma generate

info "Seeding the catalogue…"
npx prisma db seed

ok "Database ready. Run 'npm run dev' and the app will use it."
