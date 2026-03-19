# Fix Highlights Typecheck

## Goal

Make `pnpm typecheck` pass for the new highlights feature without depending on stale generated Next route types.

## Steps

- [x] Reproduce the current failure with `pnpm typecheck` and confirm the exact error set.
- [x] Fix the real source issues in the highlights detail page and ingest script.
- [x] Make the `typecheck` script regenerate typed routes before running `tsc`.
- [x] Re-run `pnpm typecheck` and record the final outcome.

## Review

- Added `pretypecheck` in `package.json` so `pnpm typecheck` now regenerates Next typed-route files before `tsc`, which removes the stale `/highlights` route failures.
- Updated `app/highlights/[slug]/page.tsx` to render highlight source URLs with a plain anchor because they are external links, not app routes.
- Fixed `scripts/ingest-highlights.ts` to import `HighlightSpec` from `@/lib/highlights`, which is where the canonical type now lives.
- Verification passed with `pnpm typecheck` and `pnpm ingest:highlights`.
