# Filter Sub-600 Time Controls

## Goal

Exclude games whose PGN `TimeControl` base value is below `600` seconds from the bulk PGN ingest pipeline.

## Steps

- [x] Inspect the PGN ingest pipeline and confirm where time-control filtering should be applied.
- [x] Add a targeted parser test that proves `300`-second games are skipped while `600`-second games remain.
- [x] Implement the base-time cutoff in the PGN export parser and emit a clear warning when a game is skipped.
- [x] Run targeted verification, update any affected fixture assertions, and record the review.

## Review

- Added parser coverage in `tests/pgn.test.ts` that fails unless `300+5` is excluded while `600+5` remains ingested.
- `parsePgnExport` now skips games whose `TimeControl` base value is below `600` seconds and records a deterministic warning instead of silently including them.
- The canonical combined PGN contains one `300`-second game, so the aggregate fixture now ingests `124` games instead of `125` and the record shifts from `65-54-6` to `64-54-6`.
- Verification passed with `pnpm test tests/pgn.test.ts tests/analytics.test.ts` and `pnpm typecheck`.
- `pnpm test` still reports an unrelated pre-existing failure in `tests/live-site-start.test.ts` around the dry-run runtime start log not including the expected host/port fragment.
