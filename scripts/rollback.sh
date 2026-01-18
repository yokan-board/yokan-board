#!/bin/bash

# ==============================================================================
# Yokan Board Manual Rollback Script
# 
# Reverts the Docker tags to the previous version and restarts the containers.
# ==============================================================================

set -eo pipefail

# --- Configuration Loading ---
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${SCRIPT_DIR}/../.env"

if [ -f "${ENV_FILE}" ]; then
    # shellcheck disable=SC1090
    source "${ENV_FILE}"
fi

# --- Fallback Defaults ---
COMPOSE_DIR="${COMPOSE_DIR:-$HOME/dc/yokan-board}"
WIN_COMPOSE_DIR="${WIN_COMPOSE_DIR:-$HOME/dc/yokan-win-board}"

SERVER_IMAGE="${SERVER_IMAGE:-yokanboard/yokan-server}"
CLIENT_IMAGE="${CLIENT_IMAGE:-yokanboard/yokan-client}"
TAG="${TAG:-dev}"
TAG_LAST="${TAG}-last"

HEALTH_CHECK_URL="${HEALTH_CHECK_URL:-https://yokan.win/login}"
MAX_RETRIES=12
RETRY_INTERVAL=5

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

log "Starting manual rollback..."

# 1. Retag images
log "Restoring Docker tags from ${TAG_LAST} to ${TAG}..."
docker image tag "${SERVER_IMAGE}:${TAG_LAST}" "${SERVER_IMAGE}:${TAG}"
docker image tag "${CLIENT_IMAGE}:${TAG_LAST}" "${CLIENT_IMAGE}:${TAG}"

# 2. Restart services
log "Restarting services in ${COMPOSE_DIR}..."
cd "${COMPOSE_DIR}" && docker compose down -v && docker compose up -d

log "Restarting services in ${WIN_COMPOSE_DIR}..."
cd "${WIN_COMPOSE_DIR}" && docker compose down -v && docker compose up -d

# 3. Verification
log "Verifying rollback health..."

COUNT=0
SUCCESS=false

while [ $COUNT -lt $MAX_RETRIES ]; do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${HEALTH_CHECK_URL}") || HTTP_CODE=0
    
    if [ "$HTTP_CODE" -eq 200 ]; then
        log "Health check passed (HTTP 200)."
        SUCCESS=true
        break
    fi
    
    log "Attempt $((COUNT+1))/$MAX_RETRIES: Health check failed (HTTP $HTTP_CODE). Retrying in ${RETRY_INTERVAL}s..."
    sleep $RETRY_INTERVAL
    COUNT=$((COUNT+1))
done

if [ "$SUCCESS" = true ]; then
    log "Rollback successful and verified!"
else
    log "ERROR: Rollback health check failed after $MAX_RETRIES attempts."
    log "Manual intervention required. Check Docker logs for details."
    exit 1
fi
