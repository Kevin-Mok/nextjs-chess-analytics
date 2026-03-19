# Ingest New Highlight From Documents Chess

## Goal

Refresh the repo-local highlight snapshot so it includes the newer highlight already present in `/home/kevin/Documents/chess/README.md`.

## Steps

- [x] Verify the missing highlight entry and confirm the corresponding PGN plus analysis artifacts exist in the external chess workspace.
- [x] Run the highlights ingest against `/home/kevin/Documents/chess`.
- [x] Inspect the generated repo-local snapshot changes under `content/highlights/` and derived highlight data.
- [x] Run targeted verification and record the review.

## Review

- `/home/kevin/Documents/chess/README.md` included a newer `2026-03-19` highlight for `sozplayschess05` that was missing from the repo-local manifest.
- Added a targeted parser rule and test so `Clean mate finish ...` infers `Clean mate vs sozplayschess05` with the slug suffix `clean-mate` instead of the generic fallback label.
- `CHESS_HIGHLIGHTS_ROOT=/home/kevin/Documents/chess pnpm ingest:highlights` completed successfully and reported `Ingested 10 highlights from /home/kevin/Documents/chess.`
- The final ingest added `content/highlights/2026-03-19-sozplayschess05-clean-mate/` with the expected `game.pgn` and `analysis.md`, and refreshed `content/highlights/manifest.ts`.
- Derived data now includes the new highlight entry with the expected date, opponent, platform, and win result.
- Targeted verification passed with `pnpm test tests/highlights.test.ts`.
