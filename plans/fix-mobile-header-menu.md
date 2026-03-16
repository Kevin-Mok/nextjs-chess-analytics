# Fix Mobile Header Menu

## Goal

Reduce the sticky header height on phone-width screens by replacing the inline navigation with a hamburger-triggered dropdown while leaving the desktop header unchanged.

## Steps

- [x] Add a failing regression test that captures the new collapsed mobile-nav contract.
- [x] Implement a client-only mobile menu component and update the header spacing for small screens.
- [x] Run verification commands and record the outcome.

## Review

- Added `tests/site-header.test.ts` first as the closest reliable reproducer available in the current node-only Vitest setup; it failed until the header rendered a closed mobile-nav trigger.
- Added `components/ui/mobile-nav-menu.tsx` as a small client-only dropdown menu with `Escape`, backdrop-dismiss, and link-click close behavior.
- Updated `components/ui/site-header.tsx` so the desktop pill nav remains unchanged from `sm` upward while phone-width screens get tighter spacing, a flexible brand row, and the hamburger trigger.
- Verification passed with `pnpm test tests/site-header.test.ts`, `pnpm test`, `pnpm typecheck`, `pnpm lint`, and `pnpm build`.
