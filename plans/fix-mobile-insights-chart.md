# Fix Mobile Insights Chart

## Goal

Make the `/insights` Elo chart readable on phone-width screens with a restrained horizontal-scroll viewport that keeps the y-axis visible and the plot comfortably spaced.

## Steps

- [x] Replace the compact-mode regression tests with restrained horizontal-scroll expectations.
- [x] Rework the shared chart config and insights chart component to use minimal-but-comfortable mobile scroll width instead of density reduction.
- [x] Update the README note and rerun verification.

## Review

- Replaced the compact-mode helper assertions in `tests/elo-chart.test.ts` with a mobile scroll-width contract that failed first against the old implementation.
- Updated `lib/insights-chart.ts` so the insights chart keeps full labels/axes on mobile, exposes `enableHorizontalScroll` plus a restrained `contentWidth`, and uses a left margin that keeps the y-axis visible at the initial scroll position.
- Updated `components/insights/elo-chart.tsx` to reuse the existing mobile breakpoint detection for a horizontal scroll container, add a small swipe hint, and keep the inner chart width constrained to a moderate mobile scroll range instead of stretching excessively long.
- Updated `README.md` so the `/insights` route description reflects the horizontally scrollable mobile chart treatment.
- Verification passed with `pnpm test tests/elo-chart.test.ts`, `pnpm test`, `pnpm typecheck`, `pnpm lint`, and `pnpm build`.
