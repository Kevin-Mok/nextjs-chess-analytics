# Fix Upwork Social Preview Metadata

## Goal

Make the shared site metadata emit the canonical and Open Graph identity fields that third-party link-preview crawlers expect, so `https://chess.kevin-mok.com/` has a better chance of rendering a rich Upwork card instead of a bare domain preview.

## Assumptions

1. The public site origin is `https://chess.kevin-mok.com`.
2. The closest reliable reproducer in this repo is a focused metadata-helper unit test.
3. Upwork-specific crawler behavior cannot be tested directly from this repo, so verification stops at emitted metadata and local regression coverage.

## Plan

- [x] Add a regression test that fails when the shared metadata helper omits canonical and crawler-facing Open Graph identity fields.
- [x] Patch the metadata helper to emit canonical metadata, `og:url`, `og:site_name`, `og:locale`, and `og:image:type` alongside the existing image fields.
- [x] Add a concise README checklist for stable social-preview metadata.
- [x] Run focused verification for the metadata test and note any unrelated repo-wide verification failures.

## Review

- Expanded `tests/metadata.test.ts` so the reproducer now locks canonical metadata, `og:url`, `og:site_name`, `og:locale`, and the Open Graph image MIME type.
- Updated `lib/metadata.ts` to emit canonical metadata plus the missing Open Graph identity fields from the shared helper used by the site.
- Added a README social-preview checklist covering absolute HTTPS URLs, host consistency, required OG fields, and cache-busting expectations.
- Verification passed with `pnpm test -- metadata`, `pnpm typecheck`, and `pnpm test`.
