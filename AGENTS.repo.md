# AGENTS.repo.md

Repository-specific strict additions for `/home/kevin/coding/chess-site`.

These rules add constraints on top of the active `AGENTS.md` instructions and do not relax any baseline requirement.

## PGN Import Hygiene

- Treat the combined PGN in `pgn/` as the tracked canonical source for bulk Chess.com game history.
- Treat the latest Lichess bulk source as a cached build artifact under `data/cache/`, not a tracked PGN that should dirty the live checkout.
- When a new bulk PGN export is added, merge its games into the canonical combined PGN instead of leaving the export as a separate tracked artifact.
- Dedupe during every merge so the canonical combined PGN contains one copy of each game.
- After the merge succeeds and validation passes, remove the raw import PGN file in the same change.
- Do not leave already-ingested bulk PGN exports in `pgn/` after their games have been added to the canonical combined PGN.
- Build-time Lichess refreshes must preserve the last good cache on failure and must not require tracked PGN edits on the server.
