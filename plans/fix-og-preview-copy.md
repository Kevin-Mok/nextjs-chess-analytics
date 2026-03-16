# Fix OG Preview Copy

## Goal

Update the site share preview so it uses `Kevin Mok's` branding, refers to chess instead of PGN, and highlights the frontend stack for web-focused recruiters.

## Assumptions

- The requested change applies to social/share metadata and the default OG image asset.
- Internal implementation details can stay in engineering docs unless they are part of the share-preview copy.
- Matching the metadata text and the OG image text is more important than preserving the previous technical phrasing.

## Steps

- [x] Inspect the metadata helper, homepage metadata override, and OG SVG asset.
- [x] Update the preview title/description and image copy to the new recruiter-facing wording.
- [x] Verify the final strings are consistent across the preview sources.

## Review

- Updated the shared metadata title to `Kevin Mok's Chess Analytics` and centralized a stack-specific description in `lib/metadata.ts`.
- Updated `public/og-default.svg` so the rendered social card uses the possessive title and stack-focused supporting line.
- Removed the duplicate home-page metadata override so the preview copy is controlled from one source.
- Verification passed with `pnpm typecheck`, `pnpm build`, and targeted string checks across the changed files.
