#!/bin/bash

# ==============================================================================
# Yokan Board Deployment Script
# 
# This script automates the update and deployment process using a 
# "Build-Verify-Swap" strategy to minimize downtime and ensure safety.
# ==============================================================================

set -eo pipefail

# --- Configuration Loading ---
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${SCRIPT_DIR}/../.env"

if [ -f "${ENV_FILE}" ]; then
    # shellcheck disable=SC1090
    source "${ENV_FILE}"
fi

# --- Fallback Defaults (if not set in .env) ---
PROJECT_ROOT="${PROJECT_ROOT:-$HOME/dev/github/yokan-board/yokan-board}"
COMPOSE_DIR="${COMPOSE_DIR:-$HOME/dc/yokan-board}"
WIN_COMPOSE_DIR="${WIN_COMPOSE_DIR:-$HOME/dc/yokan-win-board}"
DB_PATH="${DB_PATH:-$COMPOSE_DIR/server/data/db.sqlite}"
BACKUP_DIR="${BACKUP_DIR:-$COMPOSE_DIR/server/data/backup}"

SERVER_IMAGE="${SERVER_IMAGE:-yokanboard/yokan-server}"
CLIENT_IMAGE="${CLIENT_IMAGE:-yokanboard/yokan-client}"
TAG="${TAG:-dev}"
TAG_NEW="${TAG}-new"
TAG_LAST="${TAG}-last"

HEALTH_CHECK_URL="${HEALTH_CHECK_URL:-https://yokan.win/login}"
MAX_RETRIES=12
RETRY_INTERVAL=5

# --- Utilities ---
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

error_exit() {
    log "ERROR: $1" >&2
    exit 1
}

rollback() {
    log "ROLLBACK: Attempting to restore previous images..."
    
    # Restore tags
    docker image tag "${SERVER_IMAGE}:${TAG_LAST}" "${SERVER_IMAGE}:${TAG}" || log "Warning: Failed to retag server"
    docker image tag "${CLIENT_IMAGE}:${TAG_LAST}" "${CLIENT_IMAGE}:${TAG}" || log "Warning: Failed to retag client"
    
    # Restart services
    log "Restarting services with previous images..."
    cd "${COMPOSE_DIR}" && docker compose up -d
    cd "${WIN_COMPOSE_DIR}" && docker compose up -d
    
    log "Rollback completed. Please check service status manually."
}

# --- Phase 1: Pre-flight Checks ---
log "Starting Pre-flight checks..."

if [ ! -d "${PROJECT_ROOT}" ]; then error_exit "Project root not found: ${PROJECT_ROOT}"; fi
if [ ! -d "${COMPOSE_DIR}" ]; then error_exit "Compose directory not found: ${COMPOSE_DIR}"; fi
if [ ! -d "${WIN_COMPOSE_DIR}" ]; then error_exit "Windows Compose directory not found: ${WIN_COMPOSE_DIR}"; fi
if ! docker info > /dev/null 2>&1; then error_exit "Docker daemon is not running."; fi

log "Pre-flight checks passed."

# --- Phase 2: Transactional Build ---
log "Updating source code..."
cd "${PROJECT_ROOT}"
git pull --ff-only

log "Building updated server image..."
cd "${PROJECT_ROOT}/server"
docker build --no-cache -t "${SERVER_IMAGE}:${TAG_NEW}" .

log "Building updated client image..."
cd "${PROJECT_ROOT}/client"
docker build --no-cache -t "${CLIENT_IMAGE}:${TAG_NEW}" .

log "Builds successful."

# --- Phase 3: Data Preservation ---
log "Performing database backup..."
if [ ! -f "${DB_PATH}" ]; then
    log "Warning: Database file not found at ${DB_PATH}. Skipping backup."
else
    mkdir -p "${BACKUP_DIR}"
    BACKUP_FILE="${BACKUP_DIR}/$(date +%Y%m%d-%H%M%S)-db.sqlite"
    cp "${DB_PATH}" "${BACKUP_FILE}"
    log "Backup created: ${BACKUP_FILE}"
fi

# --- Phase 4: Shutdown and Swap ---
log "Shutting down current instances..."
cd "${COMPOSE_DIR}" && docker compose down -v
cd "${WIN_COMPOSE_DIR}" && docker compose down -v

log "Rotating Docker tags..."
# Backup current to last
docker image tag "${SERVER_IMAGE}:${TAG}" "${SERVER_IMAGE}:${TAG_LAST}" || true
docker image tag "${CLIENT_IMAGE}:${TAG}" "${CLIENT_IMAGE}:${TAG_LAST}" || true

# Promote new to dev
docker image tag "${SERVER_IMAGE}:${TAG_NEW}" "${SERVER_IMAGE}:${TAG}"
docker image tag "${CLIENT_IMAGE}:${TAG_NEW}" "${CLIENT_IMAGE}:${TAG}"

log "Starting up updated instances..."
cd "${COMPOSE_DIR}" && docker compose up -d
cd "${WIN_COMPOSE_DIR}" && docker compose up -d

# --- Phase 5: Verification ---
log "Verifying deployment health..."

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
    log "Deployment successful!"
    # Cleanup temporary tag
    docker rmi "${SERVER_IMAGE}:${TAG_NEW}" "${CLIENT_IMAGE}:${TAG_NEW}" || true
else
    log "Health check failed after $MAX_RETRIES attempts."
    rollback
    exit 1
fi