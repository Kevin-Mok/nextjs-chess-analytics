# Create Gemini OG Image Prompt

## Goal

Add a Gemini-ready prompt doc that gives enough site, content, and design context to generate a branded Open Graph image for the chess analytics site.

## Steps

- [x] Inspect the site palette, current OG asset, and recruiter-facing product framing.
- [x] Gather the actual route and content context for home, insights, explorer, and replay/detail views.
- [x] Add a prompt doc under `prompts/` with a primary prompt, backup variant, and guardrails.
- [x] Verify the prompt doc contains the required palette anchors, CTA, and site-content framing.

## Review

- Added `prompts/gemini-open-graph-image.md` with explicit site context, route/content cues, palette anchors, a primary Gemini prompt, a cleaner backup variant, and negative constraints.
- Verified the prompt includes `1200x630`, `Kevin Mok Chess Analytics`, `Explore insights`, the graphite/amber palette values, and the recruiter-facing analytics/product framing.
