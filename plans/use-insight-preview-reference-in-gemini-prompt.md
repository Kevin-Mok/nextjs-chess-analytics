# Use Insight Preview Reference In Gemini Prompt

## Goal

Update the Gemini OG-image prompt so it uses the attached rating-history screenshot as the canonical insight-preview reference, and store that screenshot in the repo under a stable prompt-asset path.

## Assumptions

- The screenshot is a prompt-generation reference asset, not a site-shipped image.
- Keeping the image beside the prompt materials in `prompts/assets/` is the appropriate default location.
- The prompt should preserve the chart's recognizable structure while still allowing Gemini to polish and simplify it for a social-card composition.

## Steps

- [x] Confirm which clipboard image matches the attached screenshot.
- [x] Copy the screenshot into `prompts/assets/` under a descriptive filename.
- [x] Update `prompts/gemini-open-graph-image.md` to reference that asset as the main insight preview.
- [x] Verify the copied asset path and final prompt diff.

## Review

- Copied the attached screenshot into `prompts/assets/rating-history-insight-preview.png`.
- Updated `prompts/gemini-open-graph-image.md` so Gemini is told to attach that file and preserve the chart's concrete structure as the hero insight preview.
- Verified the prompt uses `Kevin Mok's Chess Analytics` in the updated branded text references.
