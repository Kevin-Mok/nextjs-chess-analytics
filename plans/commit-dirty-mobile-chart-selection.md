# Commit Dirty Mobile Chart Selection Changes

## Goal

Commit the current dirty tree with intent-specific history that explains what changed since `a476cfe fix(metadata): harden social preview tags`.

## Scope

The current diff cleanly separates into:

- a shippable mobile `/insights` chart behavior fix with tests and README copy
- internal process notes and follow-up tracking

Files currently in scope:

- `README.md`
- `app/globals.css`
- `components/insights/elo-chart.tsx`
- `lib/insights-chart.ts`
- `plans/fix-mobile-chart-selection-persistence.md`
- `tasks/lessons.md`
- `tests/elo-chart.test.ts`
- `tests/mobile-chart-selection-card.test.ts`
- `plans/commit-dirty-mobile-chart-selection.md`
- `tasks/todo.md`

## Proposed Commits

### Commit 1: Mobile chart selection persistence fix

Files:

- `README.md`
- `app/globals.css`
- `components/insights/elo-chart.tsx`
- `lib/insights-chart.ts`
- `tests/elo-chart.test.ts`
- `tests/mobile-chart-selection-card.test.ts`
- `plans/fix-mobile-chart-selection-persistence.md`

Why:

- These files are one cohesive behavior change: mobile users can pin a game while scrolling the Elo chart, inspect it in a fixed card, and still preserve the existing desktop interaction model.

Suggested message:

- `fix(insights): pin mobile chart selection while scrolling`

Suggested body:

- `Keep the selected mobile Elo point visible while users scroll the`
- `horizontally overflowing chart.`
- ``
- `- render a fixed pinned-game card above the chart on mobile`
- `- move selection to explicit dot hit targets so pan still works`
- `- disable mobile tooltip and focus artifacts on the chart surface`
- `- add regression coverage for tap-vs-scroll and selected-card rendering`
- `- update the README description of the /insights mobile interaction`

Pre-commit checks:

- `pnpm test tests/elo-chart.test.ts`
- `pnpm test tests/mobile-chart-selection-card.test.ts`
- `git status --short`
- `git diff --stat`

### Commit 2: Mobile chart follow-up notes

Files:

- `tasks/lessons.md`
- `tasks/todo.md`
- `plans/commit-dirty-mobile-chart-selection.md`

Why:

- These files are process artifacts: lessons from the debugging pass, next follow-up tasks, and the commit plan itself.

Suggested message:

- `chore: record mobile chart follow-ups`

Suggested body:

- `Document the follow-up work and debugging lessons after the mobile`
- `chart selection fix.`
- ``
- `- add todo items for viewport-width prompt work and graph fixes`
- `- record lessons from the mobile Recharts debugging pass`
- `- keep the split-commit plan with the intended staging strategy`

## Execution Steps

- [ ] Confirm the dirty tree still matches the files above.
- [ ] Stage the product files for Commit 1.
- [ ] Create Commit 1 with the suggested subject and body.
- [ ] Stage the process files for Commit 2.
- [ ] Create Commit 2 with the suggested subject and body.
- [ ] Push only if the branch should be updated immediately.

## Review

- A single `wip:` snapshot is still acceptable if this is only a disposable local checkpoint, but it is weaker history than the split above because the feature work is already coherent and explainable.
- `tasks/todo.md` tracks the next follow-up items after the mobile chart fix: making the prompt use viewport width and fixing the graph.
