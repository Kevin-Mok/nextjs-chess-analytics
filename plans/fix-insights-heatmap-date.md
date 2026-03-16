# Fix Insights Heatmap Date Crash

## Goal

Stop the `/insights` page from throwing `RangeError: Invalid time value` when the activity heatmap renders weeks with missing weekdays.

## Steps

- [x] Add a regression test that reproduces the crash by rendering `ActivityHeatmap` with a sparse week.
- [x] Implement the minimal fix so placeholder heatmap cells use a valid date path.
- [x] Run the targeted regression test and verify the relevant formatter/component behavior.

## Review

- Added `tests/activity-heatmap.test.ts`, which failed before the fix with the same `RangeError: Invalid time value` seen on `/insights`.
- Updated `components/insights/activity-heatmap.tsx` so synthetic empty-day cells derive `yyyy-MM-dd` dates from the existing ISO week key instead of using invalid strings like `2026-W11-0`.
- Verification passed with `pnpm test tests/activity-heatmap.test.ts`, `pnpm test`, `pnpm typecheck`, and `pnpm lint`.
