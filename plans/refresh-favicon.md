# Refresh Favicon

## Goal

Replace the current favicon with a clearer chess-knight mark that keeps the site's existing dark-and-amber palette.

## Assumptions

- The palette should remain anchored to the current dark background and amber accent colors.
- The main failure mode is recognition at favicon sizes, so silhouette clarity matters more than decorative detail.
- Reusing the existing `/favicon.svg` path avoids metadata churn.

## Steps

- [x] Inspect the current favicon, metadata wiring, and site palette.
- [x] Replace `public/favicon.svg` with a more legible knight silhouette.
- [x] Rasterize and inspect the icon at small sizes, then run a production build.

## Review

- Replaced the thin custom stroke mark with a scaled adaptation of the local `lucide-react` `ChessKnight` outline, which reads as a chess piece more clearly at favicon sizes.
- Kept the existing dark panel and amber accent palette so the icon stays aligned with the site background and highlight colors.
- Raster previews at `16x16`, `32x32`, and `64x64` confirmed the new silhouette survives downscaling better than the previous mark.
- `pnpm build` passed after the standard PGN rebuild, so the favicon still resolves cleanly through Next metadata.
