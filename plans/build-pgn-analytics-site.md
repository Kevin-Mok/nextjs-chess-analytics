# Build PGN Analytics Site

## Goal

Implement a recruiter-facing Next.js chess analytics site from the Chess.com PGN export, using `Kevin Mok` as the public display identity and `SoloPistol` as the source-data username.

## Steps

- [x] Fix Vitest alias resolution and verify the PGN regression suite against the checked-in source PGN.
- [x] Add pure UI-facing helper modules for filtering, sorting, pagination, formatting, metadata, and material balance without changing the normalized schema contract.
- [x] Implement the App Router shell plus `/`, `/games`, `/games/[id]`, `/insights`, and `/not-found` with route-area components and static assets.
- [x] Add metadata assets, recruiter-facing copy, README coverage, and plan review notes.
- [x] Run ingest, tests, lint, typecheck, and production build.

## Review

- `vitest.config.ts` now resolves `@/*` from the repo root, which unblocked the existing PGN regression suite.
- The local canonical PGN in `pgn/chess_com_games_2026-03-15_combined.pgn` yields a `59 / 54 / 6` record across 119 games. The previous `62 / 51 / 6` expectation was stale relative to the actual file, so the test was updated after verifying raw headers and result tags.
- The site now reads derived JSON only through `lib/data.ts`; pages do not parse PGN at runtime and no API routes were added.
- Local fonts are bundled under `app/fonts/` and loaded with `next/font/local` so the build works offline.
- `package.json` uses `node --import tsx scripts/ingest-pgn.ts` so the ingest script no longer depends on `tsx` IPC behavior that fails in the sandbox.
- `next.config.ts` forces webpack for builds and disables Next's duplicate build-time TypeScript validation. Standalone `pnpm typecheck` remains the required type gate.
