# Commit Dirty Insights Baseline Changes

## Goal

Commit the current dirty tree without bundling unrelated intent together.

## Scope

- Runtime/UI fix for the insights Elo chart chronology and rating baseline cutoff.
- Regression tests covering the chart numbering, y-axis domain, and Bosevas cutoff.
- Process-memory update in `tasks/lessons.md`.

## Proposed Commits

### Commit 1: Insights chart chronology and rating baseline fix

Files:

- `components/insights/elo-chart.tsx`
- `lib/analytics.ts`
- `lib/insights-chart.ts`
- `tests/analytics.test.ts`
- `tests/elo-chart.test.ts`

Why:

- These files are one cohesive behavior change: the insights chart now numbers games by chronological display order and ignores the pre-Bosevas calibration games for rating-derived insights.

Suggested message:

- `fix: baseline rating insights and chart ordering`

Validation before commit:

- `pnpm test`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm rebuild:data`

### Commit 2: Lessons note from the correction

Files:

- `tasks/lessons.md`
- `plans/commit-dirty-insights-baseline.md`

Why:

- This is process guidance, not product behavior. Keeping it separate avoids mixing runtime changes with agent-memory maintenance.

Suggested message:

- `chore: record insight chart baseline notes`

## Execution Steps

- [ ] Review `git diff` once more to confirm no unrelated files are dirty.
- [ ] Stage the runtime/test files for Commit 1.
- [ ] Commit Commit 1 with the suggested conventional message.
- [ ] Stage `tasks/lessons.md` and `plans/commit-dirty-insights-baseline.md`.
- [ ] Commit Commit 2 with the suggested conventional message.
- [ ] Optionally push after each commit if the user wants the branch updated immediately.

## Review

- Current dirty files are limited to the insights chart fix, analytics cutoff, tests, and the lessons note.
- Validation already passed with `pnpm test`, `pnpm typecheck`, `pnpm lint`, and `pnpm rebuild:data`.
