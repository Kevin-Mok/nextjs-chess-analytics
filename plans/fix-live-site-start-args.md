# Fix Live Site Start Args

## Goal

Fix the live update script so the final restart step launches the production server on the configured host and port instead of failing on argument parsing.

## Assumptions

- The production restart should still run from this repo checkout and keep writing logs/PID files under `log/`.
- `pnpm exec next start` is acceptable in place of `pnpm start` if it preserves the same runtime behavior while handling CLI flags correctly.
- No other parts of `scripts/update-live-site.sh` need to change if the repro only fails on the startup command.

## Steps

- [x] Reproduce the failing startup command used by the live update script.
- [x] Patch the restart command to pass host and port flags correctly.
- [x] Verify the fixed command and shell script syntax.

## Review

- Updated [`scripts/update-live-site.sh`](/home/kevin/coding/chess-site/scripts/update-live-site.sh) to start the app with `pnpm exec next start --hostname "$HOST" --port "$PORT"`, which avoids the broken `pnpm start -- ...` argument forwarding.
- Added a repo-local runner sweep so the restart flow also stops existing `pnpm start`, `pnpm exec next start`, and `next start` processes running from this checkout before it checks for a listener on port `3003`.
- Updated [`README.md`](/home/kevin/coding/chess-site/README.md) to document the new restart command and the explicit runner cleanup behavior.
- Verification passed with `bash -n scripts/update-live-site.sh` and a real startup check via `timeout 8s pnpm exec next start --hostname 127.0.0.1 --port 3003`, which reached `Ready` on `http://127.0.0.1:3003` before the timeout stopped it.
