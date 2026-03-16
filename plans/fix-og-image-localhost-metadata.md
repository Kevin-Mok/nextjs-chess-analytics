# Fix OG Image Localhost Metadata

## Goal

Ensure the live site emits Open Graph and Twitter image metadata against the production origin instead of `http://localhost:3000`.

## Assumptions

1. The public site origin is `https://chess.kevin-mok.com`.
2. The broken OG image URL is caused by missing `metadataBase` in the Next metadata tree.
3. A focused unit test around the shared metadata helper is the closest reliable reproducer for this bug in this repo.

## Plan

- [x] Add a regression test that fails when metadata does not include the production `metadataBase`.
- [x] Patch the shared metadata helper so relative social image paths resolve against the production origin.
- [x] Run focused automated verification for the new metadata test and adjacent regressions.

## Review

- Added `tests/metadata.test.ts` to lock the production `metadataBase` and resolved OG image URL.
- Updated `lib/metadata.ts` to set `metadataBase` to `https://chess.kevin-mok.com`.
- Verification passed with `pnpm test -- metadata`, `pnpm typecheck`, `pnpm lint`, and `pnpm test`.
