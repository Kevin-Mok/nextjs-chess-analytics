# Create Live Update Script

## Goal

Add a single helper script for the live checkout that safely pulls the latest code, refreshes dependencies, rebuilds the app, and restarts the site on `127.0.0.1:3003`.

## Assumptions

- Live deploys happen from a clean git checkout on the target machine.
- The site is started directly from this repo checkout rather than a separate process manager such as `systemd` or `pm2`.
- Writing the server PID and output to the gitignored `log/` directory is sufficient for first-pass operations.

## Steps

- [x] Review the current package scripts and repo conventions.
- [x] Add a guarded live-update script under `scripts/`.
- [x] Document the workflow and verify the script syntax plus the production build.

## Review

- Added [`scripts/update-live-site.sh`](/home/kevin/coding/chess-site/scripts/update-live-site.sh) to run `git pull --ff-only`, `pnpm install --frozen-lockfile`, `pnpm run build`, and a background restart of `pnpm start -- --hostname 127.0.0.1 --port 3003`.
- The script writes a managed PID to `log/live-site.pid`, app output to `log/live-site.log`, and refuses to deploy from a dirty checkout.
- It will stop an existing listener on port `3003` only when that listener is running from this repo checkout; otherwise it exits instead of killing an unrelated process.
- Verification passed with `bash -n scripts/update-live-site.sh`, an expected dirty-check failure from `./scripts/update-live-site.sh`, and a green `pnpm run build`.
