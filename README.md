# Kevin Mok's Chess Analytics

Recruiter-facing chess analytics site built as a static-data Next.js App Router project. The UI is fed by a PGN ingest pipeline that normalizes Chess.com games into derived JSON, then renders `/`, `/games`, `/games/[id]`, and `/insights` without runtime PGN parsing or a separate backend.

## Live demo

- https://chess.kevin-mok.com/

## Project purpose

- Turn a raw Chess.com export into a polished frontend portfolio artifact.
- Demonstrate typed data modeling, App Router composition, charting, replay controls, and recruiter-facing storytelling.
- Keep the runtime simple: pages read derived JSON only.

## Routes

- `/`: overview, hero, KPI cluster, spotlight strip, recruiter framing, recent games, and a recent-window ELO preview that mirrors the insights chart language
- `/games`: searchable and filterable explorer with URL-backed params
- `/games/[id]`: replay/detail page with move navigation and material balance
- `/insights`: Elo trend view plus splits, streaks, heatmap, and breakdowns

## Stack

- Next.js App Router
- React 19
- TypeScript (strict)
- Tailwind CSS via `app/globals.css`
- Recharts
- `react-chessboard`
- `chess.js`
- `date-fns`
- `zod`
- `motion`
- `next/font/local`

## PGN source and identity mapping

- Canonical source PGN: `pgn/chess_com_games_2026-03-15_combined.pgn`
- Public display identity: `Kevin Mok`
- Source-data username: `SoloPistol`
- Identity mapping lives in [`lib/identity.ts`](/home/kevin/coding/chess-site/lib/identity.ts)

The ingest pipeline preserves the source username where needed for parsing, then replaces public-facing text with the display identity in normalized output.

## Ingest and rebuild workflow

1. Raw PGN is parsed by [`scripts/ingest-pgn.ts`](/home/kevin/coding/chess-site/scripts/ingest-pgn.ts).
2. Parsing and normalization live in [`lib/pgn.ts`](/home/kevin/coding/chess-site/lib/pgn.ts).
3. Summary analytics live in [`lib/analytics.ts`](/home/kevin/coding/chess-site/lib/analytics.ts).
4. Derived JSON is written to `data/derived/`:
   - `games.json`
   - `summary.json`
   - `openings.json`
5. Pages load only through [`lib/data.ts`](/home/kevin/coding/chess-site/lib/data.ts).

`data/derived/` is ignored from source control and should be rebuilt from the canonical PGN when the export changes.

## Local commands

```bash
pnpm ingest:pgn
pnpm test
pnpm typecheck
pnpm lint
pnpm build
pnpm dev
```

## Architecture summary

- Core domain contracts stay in [`types/chess.ts`](/home/kevin/coding/chess-site/types/chess.ts), [`lib/pgn.ts`](/home/kevin/coding/chess-site/lib/pgn.ts), [`lib/analytics.ts`](/home/kevin/coding/chess-site/lib/analytics.ts), and [`lib/data.ts`](/home/kevin/coding/chess-site/lib/data.ts).
- UI-facing pure helpers live in `lib/`:
  - [`lib/game-filters.ts`](/home/kevin/coding/chess-site/lib/game-filters.ts) for filtering, sorting, pagination, and derived options
  - [`lib/material.ts`](/home/kevin/coding/chess-site/lib/material.ts) for material-balance series
  - [`lib/formatters.ts`](/home/kevin/coding/chess-site/lib/formatters.ts) for compact display formatting
- Components are grouped by route area under `components/home`, `components/games`, `components/detail`, `components/insights`, with shared pieces under `components/ui`.
- Client components are intentionally limited to:
  - hero micro-interactions
  - URL-interactive filters
  - charts
  - replay controls

## Validation notes

- The local canonical PGN currently produces `119` games with a `59 / 54 / 6` record. The older `62 / 51 / 6` expectation was stale relative to the checked-in source file and was updated after verifying the raw headers.
- `pnpm build` uses webpack plus bundled local fonts so the production build works in a network-restricted environment.
- Next's duplicate build-time TypeScript validation is disabled in `next.config.ts`; use `pnpm typecheck` as the authoritative type gate.

## Known limitations

- Opening labels are heuristic signatures, not authoritative ECO classifications.
- There is no engine evaluation, annotation, or move-quality scoring.
- `/games` and `/insights` are query-param driven and server-render filtered, so they are not pre-rendered for every filter combination.
- The current dataset is small enough to keep the UI simple; no virtualization or export flows are included.

## Future enhancements

- Add richer opening taxonomy or ECO lookup when a trustworthy mapping source is available.
- Add downloadable insight snapshots or per-route OG images.
- Add richer game annotations, notable-moment heuristics, or tactical motif summaries.
