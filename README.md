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
- `/insights`: Elo trend view plus splits, streaks, heatmap, and breakdowns, with a horizontally scrollable mobile chart that preserves comfortable spacing and leads the filter stack on phones

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

## Live site update script

Run [`scripts/update-live-site.sh`](/home/kevin/chess/scripts/update-live-site.sh) on the production checkout to pull the latest code, install locked dependencies, rebuild the app, and restart the server on `127.0.0.1:3003`.

```bash
./scripts/update-live-site.sh
```

What it does:

- Refuses to deploy from a dirty git checkout.
- Acquires `log/live-site.lock` so overlapping restart runs fail fast instead of racing each other.
- Uses `git pull --ff-only` to avoid merge commits on the server.
- Runs `pnpm install --frozen-lockfile` before `pnpm run build`.
- Stops existing repo-local `pnpm start` / `pnpm exec next start` runners before restarting, including their child processes.
- Restarts the live server with `nohup pnpm start -- --hostname 127.0.0.1 --port 3003`.
- Writes the managed PID to `log/live-site.pid` and app output to `log/live-site.log`.

If port `3003` is already held by a process that was not started from this repo checkout, the script refuses to kill it and exits with a clear error so it does not take down an unrelated service.

For manual production starts, use the normal package script:

```bash
pnpm start -- --hostname 127.0.0.1 --port 3003
```

The repo wraps `next start` so pnpm's forwarded `--` delimiter does not get misinterpreted as a project directory.
That wrapper also holds a host/port runtime lock under `/tmp`, so overlapping `pnpm start` launches fail before they can race into `EADDRINUSE`.

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

## Social preview checklist

- Emit `og:title`, `og:description`, `og:url`, `og:image`, `og:type`, and a canonical URL from the same shared metadata source.
- Use absolute `https://` URLs for the canonical URL and all social images; never leak `localhost`, `http://`, or a temporary deployment host.
- Keep the public share URL, canonical URL, and `og:url` on the same host so third-party crawlers do not have to reconcile mismatched origins.
- Prefer stable social-card dimensions and include `og:image:width`, `og:image:height`, `og:image:alt`, and `og:image:type`.
- If a platform keeps showing an old preview after deployment, change the image URL itself because many scrapers cache images by URL.

## Known limitations

- Opening labels are heuristic signatures, not authoritative ECO classifications.
- There is no engine evaluation, annotation, or move-quality scoring.
- `/games` and `/insights` are query-param driven and server-render filtered, so they are not pre-rendered for every filter combination.
- The current dataset is small enough to keep the UI simple; no virtualization or export flows are included.

## Future enhancements

- Add richer opening taxonomy or ECO lookup when a trustworthy mapping source is available.
- Add downloadable insight snapshots or per-route OG images.
- Add richer game annotations, notable-moment heuristics, or tactical motif summaries.
