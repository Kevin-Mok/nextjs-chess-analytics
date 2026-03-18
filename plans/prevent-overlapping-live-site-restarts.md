# Prevent Overlapping Live Site Restarts

## Goal

Stop `scripts/update-live-site.sh` from racing with itself so the live site does not fail with `EADDRINUSE` when two restart runs overlap.

## Assumptions

- The historical `next start "--" "--hostname" ...` entries in `log/live-site.log` are from the pre-fix launcher and are no longer the active issue.
- The remaining `EADDRINUSE` failures are most likely caused by concurrent restart invocations or a short-lived listener race, since no listener was present on `127.0.0.1:3003` during inspection after the failure.
- Rejecting a second in-flight restart is preferable to allowing both runs to proceed and potentially leaving the site down.

## Steps

- [x] Add an executable regression for overlapping restart runs.
- [x] Patch `scripts/update-live-site.sh` to serialize live-site updates and improve port diagnostics.
- [x] Verify with focused tests and full repo checks.

## Review

- Added a concurrency regression to [`tests/live-site-start.test.ts`](/home/kevin/chess/tests/live-site-start.test.ts) that holds a repo-local deployment lock in one shell and verifies a second shell is rejected.
- Updated [`scripts/update-live-site.sh`](/home/kevin/chess/scripts/update-live-site.sh) to take an exclusive `flock` on `log/live-site.lock`, wait for port `3003` to clear after shutdown, and log live listener details if startup still fails.
- Updated [`README.md`](/home/kevin/chess/README.md) to document the lock-based overlap protection.
- Verification passed with `bash -n scripts/update-live-site.sh`, `CHESS_START_NEXT_DRY_RUN=1 pnpm start -- --hostname 127.0.0.1 --port 3003`, `pnpm test`, and `pnpm lint`.
