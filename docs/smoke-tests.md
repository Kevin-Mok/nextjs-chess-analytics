# Smoke Tests

## Build Pipeline

- Action: Run `pnpm fetch:lichess && pnpm ingest:pgn`.
  Expected: The command refreshes `data/cache/lichess_SoloPistol_latest.pgn` when the API is reachable, rewrites `data/derived/*.json`, and logs a combined Chess.com plus Lichess ingest.

- Action: Run `pnpm build` after a successful Lichess fetch.
  Expected: `prebuild` refreshes the Lichess cache, the build completes without tracked PGN edits, and the site is ready to serve with both platforms present.

## Insights

- Action: Open `/insights`.
  Expected: The Elo chart shows separate Chess.com and Lichess lines, the legend names both platforms, and tooltip text includes the platform for the hovered point.

- Action: Change insights filters until only one platform has rated games in view.
  Expected: The chart still renders cleanly, and the rating-pool summary cards only show the platform data that is available.

## Games And Highlights

- Action: Open `/games` and any `/games/[id]` page.
  Expected: Each game clearly shows its platform label alongside the existing date, color, rating, and time-control metadata.

- Action: Open `/highlights` and at least one mixed-platform highlight.
  Expected: Highlight cards and detail pages keep the correct platform label and continue linking to the underlying game source.
