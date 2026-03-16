# Commit Dirty Branding And OG Image Changes

## Goal

Commit the current dirty tree without bundling prompt-source files, shipped site changes, and process notes into one grab-bag commit.

## Scope

- Gemini prompt materials for generating the Open Graph image.
- Shipped branding and social-preview updates used by the site.
- Process-memory notes recorded after the naming correction.

## Proposed Commits

### Commit 1: Gemini prompt materials

Files:

- `plans/create-gemini-og-image-prompt.md`
- `plans/use-insight-preview-reference-in-gemini-prompt.md`
- `prompts/assets/rating-history-insight-preview.png`
- `prompts/gemini-open-graph-image.md`

Why:

- These files are authoring inputs and execution notes for generating the Open Graph image. They are useful project artifacts, but they do not change shipped runtime behavior.

Suggested message:

- `docs: add gemini open graph image prompt assets`

Validation before commit:

- Confirm `prompts/gemini-open-graph-image.md` references `prompts/assets/rating-history-insight-preview.png`.
- Confirm the prompt text preserves the branded name `Kevin Mok's Chess Analytics`.

### Commit 2: Shipped branding and Open Graph image refresh

Files:

- `README.md`
- `components/ui/site-footer.tsx`
- `components/ui/site-header.tsx`
- `lib/metadata.ts`
- `public/og-image.jpg`

Why:

- These files are one cohesive product change: the public brand copy is normalized to `Kevin Mok's Chess Analytics`, the nav order is aligned around `Overview`, `Insights`, then `Games`, and the site now ships the generated JPG social card in metadata.

Suggested message:

- `feat: refresh branding and open graph image`

Validation before commit:

- `pnpm lint`
- `pnpm typecheck`
- Manual check in `pnpm dev` for the header and footer brand/nav copy.
- Manual check that metadata now points at `/og-image.jpg` with dimensions `1424x752`.

### Commit 3: Process notes for the naming correction

Files:

- `plans/commit-dirty-branding-og-image.md`
- `tasks/lessons.md`

Why:

- The lessons log and the commit plan are process/agent-memory artifacts. Keeping them separate avoids mixing internal workflow notes with product-facing changes.

Suggested message:

- `chore: record branding naming notes`

Validation before commit:

- Confirm the new lesson explicitly preserves the possessive branding form.

## Execution Steps

- [ ] Review `git status --short --untracked-files=all` once more before staging.
- [ ] Stage the prompt files for Commit 1 and create the docs commit.
- [ ] Stage the runtime and asset files for Commit 2 and create the feature commit.
- [ ] Stage `tasks/lessons.md` and this plan file for Commit 3 and create the chore commit.
- [ ] Run the validation checks tied to Commit 2 before calling the work complete.
- [ ] Push after each commit if the branch should be updated immediately.

## Review

- The current dirty tree cleanly separates into prompt-source docs, shipped branding/OG updates, and process notes.
- The only binary assets involved are `prompts/assets/rating-history-insight-preview.png` and `public/og-image.jpg`, which belong in different commits because one is prompt input and the other is the shipped site asset.
