# Add Dual-Source Ingest And Split Elo Lines

## Goal

Merge Chess.com and cached Lichess bulk games into one derived dataset, keep highlights mixed across both platforms, and split rating-specific analytics and chart lines by platform.

## Steps

- [x] Add failing coverage for mixed-source ingest, platform tagging, split rating summaries, and dual-line chart helpers.
- [x] Add a cached Lichess fetch script plus build hook, without dirtying the tracked PGN history on the live checkout.
- [x] Update ingest, analytics, types, and chart helpers to merge both sources and compute platform-specific rating data.
- [x] Update insights and home chart surfaces plus rating copy/cards for platform-split Elo output.
- [x] Update README, repo guidance, and smoke-test coverage; then run tests, typecheck, lint, and build.

## Review

- Added platform-aware parsing and dual-source ingest so the derived dataset now combines tracked Chess.com history with the cached Lichess export.
- Added build-time Lichess refresh with cache fallback so `pnpm build` and the live update script reuse the last good PGN when the API is unavailable.
- Split rating analytics and chart rendering by platform so Chess.com and Lichess Elo never collapse into one misleading number.
- Added platform labels to game and home surfaces, refreshed README and repo rules, and created `docs/smoke-tests.md` for the new manual checks.
- Verification passed with `pnpm test`, `pnpm typecheck`, `pnpm lint`, and `pnpm build`.
