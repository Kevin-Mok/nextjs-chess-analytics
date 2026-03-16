#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
HOST="${HOST:-127.0.0.1}"
PORT="${PORT:-3003}"
LOG_DIR="$ROOT_DIR/log"
APP_LOG_FILE="$LOG_DIR/live-site.log"
PID_FILE="$LOG_DIR/live-site.pid"
STARTUP_WAIT_SECONDS="${STARTUP_WAIT_SECONDS:-3}"

timestamp() {
  date "+%Y-%m-%d %H:%M:%S"
}

log() {
  printf '[%s] %s\n' "$(timestamp)" "$*"
}

fail() {
  log "ERROR: $*"
  exit 1
}

require_command() {
  local command_name="$1"

  if ! command -v "$command_name" >/dev/null 2>&1; then
    fail "Missing required command: $command_name"
  fi
}

wait_for_exit() {
  local pid="$1"
  local attempts=20

  while kill -0 "$pid" 2>/dev/null; do
    if (( attempts == 0 )); then
      log "Process $pid did not stop in time; sending SIGKILL."
      kill -9 "$pid" 2>/dev/null || true
      break
    fi

    attempts=$((attempts - 1))
    sleep 0.5
  done
}

stop_pid() {
  local pid="$1"

  if kill -0 "$pid" 2>/dev/null; then
    log "Stopping process $pid"
    kill "$pid"
    wait_for_exit "$pid"
  fi
}

stop_existing_site_runners() {
  local excluded_pid="${1:-}"

  if ! command -v pgrep >/dev/null 2>&1; then
    return 0
  fi

  while IFS= read -r process_info; do
    local runner_pid="${process_info%% *}"
    local runner_cwd=""

    [[ -z "$runner_pid" ]] && continue
    [[ "$runner_pid" == "$$" ]] && continue
    [[ -n "$excluded_pid" && "$runner_pid" == "$excluded_pid" ]] && continue

    runner_cwd="$(readlink "/proc/$runner_pid/cwd" 2>/dev/null || true)"

    if [[ "$runner_cwd" == "$ROOT_DIR" ]]; then
      log "Stopping existing site runner from $ROOT_DIR (PID $runner_pid)"
      stop_pid "$runner_pid"
    fi
  done < <(pgrep -af 'pnpm start|pnpm exec next start|next start' || true)
}

stop_managed_process() {
  local managed_pid=""

  if [[ -f "$PID_FILE" ]]; then
    managed_pid="$(<"$PID_FILE")"

    if [[ -n "$managed_pid" ]]; then
      stop_pid "$managed_pid"
    fi

    rm -f "$PID_FILE"
  fi

  stop_existing_site_runners "$managed_pid"

  if ! command -v lsof >/dev/null 2>&1; then
    return 0
  fi

  while IFS= read -r listener_pid; do
    local listener_cwd=""

    [[ -z "$listener_pid" ]] && continue
    [[ "$listener_pid" == "$managed_pid" ]] && continue

    listener_cwd="$(readlink "/proc/$listener_pid/cwd" 2>/dev/null || true)"

    if [[ "$listener_cwd" == "$ROOT_DIR" ]]; then
      log "Stopping existing listener on port $PORT from $ROOT_DIR (PID $listener_pid)"
      stop_pid "$listener_pid"
      continue
    fi

    fail "Port $PORT is already in use by PID $listener_pid outside $ROOT_DIR. Stop it manually before retrying."
  done < <(lsof -tiTCP:"$PORT" -sTCP:LISTEN 2>/dev/null || true)
}

main() {
  require_command git
  require_command pnpm

  mkdir -p "$LOG_DIR"
  cd "$ROOT_DIR"

  if ! git diff --quiet --ignore-submodules -- || ! git diff --cached --quiet --ignore-submodules --; then
    fail "Working tree is dirty. Commit or stash local changes before updating the live site."
  fi

  log "Pulling latest changes with fast-forward only"
  git pull --ff-only

  log "Installing dependencies from pnpm-lock.yaml"
  pnpm install --frozen-lockfile

  log "Building production bundle"
  pnpm run build

  stop_managed_process

  printf '\n[%s] restarting live site\n' "$(timestamp)" >>"$APP_LOG_FILE"
  log "Starting live site on http://$HOST:$PORT"
  nohup pnpm exec next start --hostname "$HOST" --port "$PORT" >>"$APP_LOG_FILE" 2>&1 &
  local app_pid="$!"
  echo "$app_pid" >"$PID_FILE"

  sleep "$STARTUP_WAIT_SECONDS"

  if ! kill -0 "$app_pid" 2>/dev/null; then
    rm -f "$PID_FILE"
    log "Live site failed to stay up. Recent log output:"
    tail -n 40 "$APP_LOG_FILE" || true
    exit 1
  fi

  log "Live site restarted successfully with PID $app_pid"
  log "Server output is being written to $APP_LOG_FILE"
}

main "$@"
