# Elevate Home ELO Preview

## Goal

Turn the homepage ELO preview into a premium landing-page chart card that mirrors the insights route's visual language while staying compact and focused on the latest games.

## Steps

- [x] Add shared helper logic for the home preview window, y-axis domain padding, and deterministic annotations.
- [x] Update the homepage data handoff so the preview receives recent enriched ELO data plus relevant milestone context.
- [x] Rebuild the home preview card with richer chart layers, callouts, tooltip content, and stronger visual chrome.
- [x] Extend test coverage for the new home preview helper behavior and update the README note about the homepage chart.
- [x] Run verification with `pnpm test`, `pnpm typecheck`, and `pnpm lint`.

## Review

- Added shared home-preview helpers in `lib/insights-chart.ts` so the hero card always renders the latest 18 games, uses a padded visible y-domain, and selects deterministic annotations without relying on route-specific chart state.
- Rebuilt `components/home/hero-preview.tsx` as a composed mini-insights chart with premium card styling, recent-window stat chips, result-colored points, a rolling-average line, and safe milestone defaults.
- Updated `components/home/home-hero.tsx` to pass the full ELO series plus milestone context into the preview and patched the helper/component to fail closed if milestones are omitted.
- Extended `tests/elo-chart.test.ts` with home-preview coverage for recent-window slicing, y-domain padding, and milestone-vs-window-peak annotation behavior.
- Updated `README.md` to mention the homepage’s recent-window ELO preview.
- Verification passed with `pnpm test`, `pnpm typecheck`, `pnpm lint`, and `pnpm build`.
