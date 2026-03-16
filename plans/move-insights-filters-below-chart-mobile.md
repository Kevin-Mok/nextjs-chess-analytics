# Move Insights Filters Below Chart On Mobile

## Goal

Place the `/insights` filter card stack below the Elo chart on phone-width screens while preserving the existing desktop order and keeping the empty-state recovery flow unchanged.

## Assumptions

1. Desktop should continue to show filters above the chart.
2. The mobile reorder should apply only when the Elo chart is present; the empty state should still keep filters above the fallback panel.
3. A layout-only change is sufficient, with no changes to filtering or routing behavior.

## Steps

- [x] Add a regression test that captures the mobile chart-first ordering contract.
- [x] Update the insights page layout to reorder the chart and filters only on mobile.
- [x] Run focused verification and record the result.

## Review

- Added `tests/insights-page.test.ts` as a page-level regression that renders `/insights` with mocked client components and asserts the chart-first mobile order classes while keeping desktop DOM order intact.
- Updated `app/insights/page.tsx` so non-empty insights results wrap the filters and Elo chart in responsive order containers: chart first on mobile, original order from `md` upward, and unchanged filter-first behavior for the empty state.
- Updated `README.md` to reflect that the mobile insights route now leads with the chart before the filter stack.
- Verification passed with `pnpm test tests/insights-page.test.ts`, `pnpm typecheck`, `pnpm test`, and `pnpm lint`.
