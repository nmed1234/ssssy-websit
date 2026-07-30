#!/usr/bin/env bash
# scripts/deploy.sh — Production deploy script for Linux/macOS servers.
#
# Usage:
#   chmod +x scripts/deploy.sh
#   DEPLOY_ENV=prod ./scripts/deploy.sh
#
# Environment variables (can also be set in .env at repo root):
#   GITHUB_TOKEN   — PAT or Actions token to pull GHCR images
#   GITHUB_ACTOR   — GitHub username for GHCR login
#   IMAGE_TAG      — Image tag to deploy (default: latest)
#   DEPLOY_PATH    — Absolute path to the repo on this server (default: /opt/ssssy)

set -euo pipefail

# ── Config ────────────────────────────────────────────────────────────────────
DEPLOY_PATH="${DEPLOY_PATH:-/opt/ssssy}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
COMPOSE_FILE="docker-compose.prod.yml"

cd "$DEPLOY_PATH"

echo "==> Checking .env file..."
if [ ! -f .env ]; then
  echo "ERROR: .env file not found at $DEPLOY_PATH/.env"
  echo "       Copy backend/.env.example to .env and fill in all CHANGE_ME values."
  exit 1
fi

# Fail if any CHANGE_ME placeholders are still in .env
if grep -q "CHANGE_ME" .env; then
  echo "ERROR: .env still contains CHANGE_ME placeholder values. Update them before deploying."
  exit 1
fi

# ── GHCR login (optional — only needed if using pre-built images) ─────────────
if [ -n "${GITHUB_TOKEN:-}" ] && [ -n "${GITHUB_ACTOR:-}" ]; then
  echo "==> Logging in to GitHub Container Registry..."
  echo "$GITHUB_TOKEN" | docker login ghcr.io -u "$GITHUB_ACTOR" --password-stdin
fi

# ── Pull latest images ────────────────────────────────────────────────────────
echo "==> Pulling images (tag: $IMAGE_TAG)..."
IMAGE_TAG="$IMAGE_TAG" docker compose -f "$COMPOSE_FILE" pull backend frontend nginx 2>/dev/null || true

# ── Start / update services ───────────────────────────────────────────────────
echo "==> Starting services..."
IMAGE_TAG="$IMAGE_TAG" docker compose -f "$COMPOSE_FILE" up -d --no-build --remove-orphans

# ── Wait for backend health ───────────────────────────────────────────────────
echo "==> Waiting for backend to become healthy..."
TIMEOUT=120
ELAPSED=0
until docker inspect --format='{{.State.Health.Status}}' ssssy-backend 2>/dev/null | grep -q "healthy"; do
  if [ "$ELAPSED" -ge "$TIMEOUT" ]; then
    echo "ERROR: Backend did not become healthy within ${TIMEOUT}s."
    docker compose -f "$COMPOSE_FILE" logs --tail=50 backend
    exit 1
  fi
  sleep 5
  ELAPSED=$((ELAPSED + 5))
done
echo "    Backend is healthy (${ELAPSED}s)"

# ── Clean up dangling images ─────────────────────────────────────────────────
echo "==> Pruning dangling images..."
docker image prune -f

echo ""
echo "✓ Deployment complete (tag: $IMAGE_TAG)"
echo "  Site:    https://ssssyria.org"
echo "  Health:  https://ssssyria.org/actuator/health"
