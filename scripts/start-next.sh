#!/usr/bin/env bash
set -euo pipefail

args=("$@")

if [[ "${args[0]-}" == "--" ]]; then
  args=("${args[@]:1}")
fi

if [[ "${CHESS_START_NEXT_DRY_RUN:-0}" == "1" ]]; then
  printf 'next start'
  for arg in "${args[@]}"; do
    printf ' <%s>' "$arg"
  done
  printf '\n'
  exit 0
fi

exec next start "${args[@]}"
