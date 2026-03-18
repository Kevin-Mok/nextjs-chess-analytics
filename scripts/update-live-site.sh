#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
HOST="${HOST:-127.0.0.1}"
PORT="${PORT:-3003}"
LOG_DIR="$ROOT_DIR/log"
APP_LOG_FILE="$LOG_DIR/live-site.log"
PID_FILE="$LOG_DIR/live-site.pid"
LOCK_FILE="$LOG_DIR/live-site.lock"
STARTUP_WAIT_SECONDS="${STARTUP_WAIT_SECONDS:-3}"
LOCK_FD=""

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

acquire_update_lock() {
  if [[ -n "$LOCK_FD" ]]; then
    return 0
  fi

  require_command flock

  exec {LOCK_FD}> "$LOCK_FILE"

  if ! flock -n "$LOCK_FD"; then
    fail "Another live-site update is already running. Wait for it to finish before retrying."
  fi
}

collect_descendant_pids() {
  local pid="$1"
  local child_pid=""

  if ! command -v pgrep >/dev/null 2>&1; then
    return 0
  fi

  while IFS= read -r child_pid; do
    [[ -z "$child_pid" ]] && continue
    collect_descendant_pids "$child_pid"
    printf '%s\n' "$child_pid"
  done < <(pgrep -P "$pid" || true)
}

wait_for_exit() {
  local pid="$1"
  local attempts=20
  local process_state=""

  while kill -0 "$pid" 2>/dev/null; do
    process_state="$(ps -o stat= -p "$pid" 2>/dev/null | tr -d '[:space:]')"

    if [[ "$process_state" == Z* ]]; then
      return 0
    fi

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
  local descendant_pid=""
  local descendants=()

  if ! kill -0 "$pid" 2>/dev/null; then
    return 0
  fi

  while IFS= read -r descendant_pid; do
    [[ -z "$descendant_pid" ]] && continue
    descendants+=("$descendant_pid")
  done < <(collect_descendant_pids "$pid")

  if (( ${#descendants[@]} > 0 )); then
    log "Stopping child processes of $pid: ${descendants[*]}"
    kill "${descendants[@]}" 2>/dev/null || true
  fi

  log "Stopping process $pid"
  kill "$pid" 2>/dev/null || true
  wait_for_exit "$pid"

  for descendant_pid in "${descendants[@]}"; do
    wait_for_exit "$descendant_pid"
  done
}

log_port_listeners() {
  local listener_pid=""
  local listener_cwd=""

  if ! command -v lsof >/dev/null 2>&1; then
    return 0
  fi

  while IFS= read -r listener_pid; do
    [[ -z "$listener_pid" ]] && continue

    log "Port $PORT listener PID $listener_pid"
    ps -fp "$listener_pid" || true

    listener_cwd="$(readlink "/proc/$listener_pid/cwd" 2>/dev/null || true)"

    if [[ -n "$listener_cwd" ]]; then
      log "PID $listener_pid cwd: $listener_cwd"
    fi
  done < <(lsof -tiTCP:"$PORT" -sTCP:LISTEN 2>/dev/null || true)
}

wait_for_port_to_clear() {
  local attempts=20
  local listener_pid=""

  if ! command -v lsof >/dev/null 2>&1; then
    return 0
  fi

  while true; do
    listener_pid="$(lsof -tiTCP:"$PORT" -sTCP:LISTEN 2>/dev/null | head -n 1 || true)"

    if [[ -z "$listener_pid" ]]; then
      return 0
    fi

    if (( attempts == 0 )); then
      log "Port $PORT still has active listeners after shutdown."
      log_port_listeners
      fail "Port $PORT did not clear in time."
    fi

    attempts=$((attempts - 1))
    sleep 0.5
  done
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
  done < <(pgrep -af 'pnpm start|pnpm exec next start|next start|start-next.sh' || true)
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
  acquire_update_lock

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
  wait_for_port_to_clear

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
    log_port_listeners
    exit 1
  fi

  log "Live site restarted successfully with PID $app_pid"
  log "Server output is being written to $APP_LOG_FILE"
}

if [[ "${BASH_SOURCE[0]}" == "$0" ]]; then
  main "$@"
fi
