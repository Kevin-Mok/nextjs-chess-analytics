# Rebrand Highlight Games And All Games

## Goal

Update the public-facing site copy so the curated highlights feature is branded as `Highlight Games`, the main games explorer is branded as `All Games`, and `Insights` is branded as `Elo Over Time`, while keeping the existing routes and internal implementation stable.

## Assumptions

- The request applies to user-visible labels, CTAs, metadata titles, docs, prompts, and tests that assert public copy.
- Stable internal names such as routes, file paths, data keys, and TypeScript symbols can remain unchanged unless a public string depends on them.
- Descriptive phrases like score counts or generic prose about individual games should stay natural instead of forcing `All Games` into every noun usage.

## Steps

- [x] Inspect all public-facing `Highlights`, `Games`, and `Insights` labels to separate branded surfaces from generic prose.
- [x] Update the branded site copy to use `Highlight Games`, `All Games`, and `Elo Over Time` with title case where appropriate.
- [x] Refresh the docs/tests that assert those labels and verify the sweep with targeted checks.

## Review

- Updated the primary route brands across the header, footer, hero CTA, home previews, route metadata, and page intros so the site now reads `Elo Over Time`, `Highlight Games`, and `All Games`.
- Kept internal routes, file paths, data keys, and TypeScript symbols stable to avoid an unnecessary structural rename while still delivering the requested branded copy.
- Refreshed README and prompt/docs copy so the renamed sections are described consistently outside the UI.
- Updated the nav regression test plus related fixtures/mocks to assert the new public labels.
- Targeted verification passed with `pnpm test tests/site-header.test.ts tests/highlights.test.ts tests/insights-page.test.ts`.
- `pnpm typecheck` passed after regenerating Next route types via the existing `pretypecheck` hook.
