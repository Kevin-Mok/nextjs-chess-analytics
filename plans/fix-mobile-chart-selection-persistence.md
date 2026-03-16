# Fix Mobile Chart Selection Persistence

## Goal

Keep the selected mobile `/insights` Elo point pinned while horizontally scrolling, show its details in a fixed in-frame card, and preserve the existing desktop hover + click-through behavior.

## Steps

- [x] Add failing regression coverage for mobile selection persistence and tap-vs-pan handling.
- [x] Implement mobile-only pinned point selection, fixed detail card rendering, and selected-dot highlighting without changing desktop navigation behavior.
- [x] Update README copy and rerun targeted plus full verification.

## Review

- Added helper-level regression coverage in `tests/elo-chart.test.ts` for mobile tap-vs-scroll classification, selected-point resolution by `gameId`, and mobile surface focus/tooltip config, then confirmed the new config assertions failed before implementation.
- Added `tests/mobile-chart-selection-card.test.ts` so the mobile empty-state prompt and selected-card CTA render path are covered independently of the chart event plumbing.
- Extended `lib/insights-chart.ts` with mobile surface config for `accessibilityLayer`, `tabIndex`, `focusable`, and native-tooltip enablement while preserving the existing desktop cursor behavior.
- Updated `components/insights/elo-chart.tsx` so mobile starts with an empty prompt card, removes the broken chart-surface touch selection path, binds mobile selection to enlarged dot hit targets, preserves horizontal scrolling, keeps a persistent selected-point highlight ring, and shows an explicit `Open game` CTA in the pinned card.
- Updated `app/globals.css` to suppress tap highlight and focus outline on the actual mobile chart shell and root surface SVG, and updated `README.md` so the `/insights` route description reflects the fixed-card mobile interaction.
- Verification passed with `pnpm test tests/elo-chart.test.ts`, `pnpm test tests/mobile-chart-selection-card.test.ts`, `pnpm test`, `pnpm typecheck`, `pnpm lint`, and `pnpm build`.
