# Share Runtime Lock Across Live Starts

## Goal

Prevent `EADDRINUSE` races that can still occur when the chess site is started outside `scripts/update-live-site.sh` by moving the lock onto the actual runtime start path.

## Assumptions

- The `2026-03-18 19:57:40 UTC` failure happened after the repo-local overlap-lock commit existed, so the conflicting process likely did not go through the same `update-live-site.sh` lock.
- A shared lock on the actual `next start --hostname 127.0.0.1 --port 3003` path is more reliable than only locking the deploy helper.
- A host-global lock file under `/tmp` is acceptable for coordinating multiple checkouts or shell launchers on the same machine.

## Steps

- [x] Add a regression for overlapping runtime starts that share the same host/port lock.
- [x] Patch the start wrapper and live update script to use the shared runtime lock.
- [x] Verify with focused tests and full repo checks.

## Review

- Added a runtime-lock regression to [`tests/live-site-start.test.ts`](/home/kevin/chess/tests/live-site-start.test.ts) that starts two overlapping `pnpm start -- --hostname 127.0.0.1 --port 3003` processes against the same temp lock and verifies the second one is rejected.
- Updated [`scripts/start-next.sh`](/home/kevin/chess/scripts/start-next.sh) to normalize the forwarded args, derive a host/port-specific lock path under `/tmp`, acquire it with `flock`, and keep that lock for the life of `next start`.
- Updated [`scripts/update-live-site.sh`](/home/kevin/chess/scripts/update-live-site.sh) to launch the live server through `pnpm start -- --hostname "$HOST" --port "$PORT"` so the deploy path uses the same runtime lock as manual starts.
- Updated [`README.md`](/home/kevin/chess/README.md) to document the shared runtime lock behavior.
- Verification passed with `bash -n scripts/start-next.sh`, `bash -n scripts/update-live-site.sh`, `CHESS_START_NEXT_DRY_RUN=1 pnpm start -- --hostname 127.0.0.1 --port 3003`, `pnpm test`, and `pnpm lint`.
