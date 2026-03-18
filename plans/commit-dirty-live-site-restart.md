# Commit Dirty Live Site Restart Changes

## Goal

Commit the current dirty tree without bundling the live-site restart fix together with unrelated untracked work.

## Scope

- Runtime/admin fix for the production start path and managed restart cleanup.
- Regression tests covering pnpm argument forwarding and child-process shutdown.
- README updates for the live-site restart workflow.

## Explicitly Out Of Scope

- `scripts/setup-chess-host.sh`

Why:

- It was already untracked before this planning pass and is unrelated to the live-site restart regression. Do not bundle it into the same commit.

## Proposed Commits

### Commit 1: Live-site start and restart hardening

Files:

- `README.md`
- `package.json`
- `scripts/start-next.sh`
- `scripts/update-live-site.sh`
- `tests/live-site-start.test.ts`

Why:

- These files are one cohesive behavior change: manual `pnpm start -- --hostname ...` now works again, and the managed restart flow cleans up descendant processes instead of leaving stale listeners behind.

Suggested message:

- `fix(deploy): harden live site start and restart cleanup`

Validation before commit:

- `bash -n scripts/start-next.sh`
- `bash -n scripts/update-live-site.sh`
- `CHESS_START_NEXT_DRY_RUN=1 pnpm start -- --hostname 127.0.0.1 --port 3003`
- `pnpm test`
- `pnpm lint`

### Commit 2: Process notes for the restart regression

Files:

- `plans/fix-live-site-restart-regression.md`
- `plans/commit-dirty-live-site-restart.md`

Why:

- These are workflow artifacts that explain the investigation and commit strategy. Keeping them separate avoids mixing process notes with the shipped restart fix.

Suggested message:

- `chore: record live site restart fix notes`

Validation before commit:

- Confirm Commit 1 is already in place.
- Confirm these plan files accurately describe the final staged files and verification results.

## Execution Steps

- [ ] Re-run `git status --short` and confirm `scripts/setup-chess-host.sh` remains excluded.
- [ ] Stage the runtime/doc/test files for Commit 1.
- [ ] Create Commit 1 with the suggested conventional message.
- [ ] Stage the two plan files for Commit 2 only if you want process notes tracked in git.
- [ ] Create Commit 2 with the suggested conventional message.
- [ ] Push after each commit if this branch should be updated immediately.

## Review

- The runtime dirty tree is cohesive enough for a single fix commit.
- The only unrelated file in the working tree is the pre-existing untracked `scripts/setup-chess-host.sh`, which should stay out of this change set.
