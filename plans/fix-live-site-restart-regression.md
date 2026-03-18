# Fix Live Site Restart Regression

## Goal

Make the live-site restart path reliably launch the production server on `127.0.0.1:3003` without regressing into the broken `pnpm start -- --hostname ...` invocation or failing on stale repo-local listeners.

## Assumptions

- `scripts/update-live-site.sh` is the canonical restart entry point for this checkout.
- The live site should continue writing its PID and output under `log/`.
- If port `3003` is occupied by a process outside this repo checkout, the script should keep failing closed instead of killing unrelated services.

## Steps

- [x] Reproduce the bad CLI argument handling and inspect the current listener/process state for port `3003`.
- [x] Patch the confirmed failure point with the smallest safe change.
- [x] Verify the shell script and the restart/startup path with executable checks.

## Review

- Added [`scripts/start-next.sh`](/home/kevin/chess/scripts/start-next.sh) and pointed `package.json` `start` at it so `pnpm start -- --hostname 127.0.0.1 --port 3003` strips pnpm's stray delimiter before `next start`.
- Hardened [`scripts/update-live-site.sh`](/home/kevin/chess/scripts/update-live-site.sh) so `stop_pid` terminates descendant processes and treats zombie wrappers as exited instead of waiting the full retry window.
- Added [`tests/live-site-start.test.ts`](/home/kevin/chess/tests/live-site-start.test.ts) to cover both the argument-forwarding regression and the managed parent/child shutdown path.
- Updated [`README.md`](/home/kevin/chess/README.md) to document the manual start command and the child-process cleanup behavior.
