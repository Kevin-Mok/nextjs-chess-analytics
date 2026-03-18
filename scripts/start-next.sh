#!/usr/bin/env bash
set -euo pipefail

args=("$@")
host="0.0.0.0"
port="3000"
lock_fd=""

if [[ "${args[0]-}" == "--" ]]; then
  args=("${args[@]:1}")
fi

index=0
while (( index < ${#args[@]} )); do
  case "${args[$index]}" in
    --hostname|-H)
      if (( index + 1 < ${#args[@]} )); then
        host="${args[$((index + 1))]}"
      fi
      index=$((index + 2))
      ;;
    --port|-p)
      if (( index + 1 < ${#args[@]} )); then
        port="${args[$((index + 1))]}"
      fi
      index=$((index + 2))
      ;;
    *)
      index=$((index + 1))
      ;;
  esac
done

sanitized_host="${host//[^[:alnum:]]/_}"
lock_file="${CHESS_START_NEXT_LOCK_FILE:-/tmp/kevin-mok-chess-next-start-${sanitized_host}-${port}.lock}"

if ! command -v flock >/dev/null 2>&1; then
  printf '[start-next] Missing required command: flock\n' >&2
  exit 1
fi

exec {lock_fd}> "$lock_file"

if ! flock -n "$lock_fd"; then
  printf '[start-next] Another site process is already holding %s for %s:%s\n' "$lock_file" "$host" "$port" >&2
  exit 1
fi

if [[ "${CHESS_START_NEXT_DRY_RUN:-0}" == "1" ]]; then
  printf 'next start'
  for arg in "${args[@]}"; do
    printf ' <%s>' "$arg"
  done
  printf '\n'

  if [[ "${CHESS_START_NEXT_WAIT_FOR_STDIN:-0}" == "1" ]]; then
    read -r _
  fi

  exit 0
fi

exec next start "${args[@]}"
