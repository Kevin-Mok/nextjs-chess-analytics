# Gemini Open Graph Image Prompt

Use this prompt with Gemini image generation to create a branded Open Graph image for the site.

## Insight Preview Reference

Use [rating-history-insight-preview.png](assets/rating-history-insight-preview.png) as the canonical insight-preview reference image for this prompt.

How to use it:

- Attach the screenshot alongside the text prompt when running Gemini.
- Treat that screenshot as the main chart card to reinterpret, not as a generic inspiration image.
- Preserve the recognizable cues from the reference: chronological game-number x-axis, amber line, green win points, pink loss points, gray draw points, dashed rolling average, and milestone callouts.
- Keep the premium graphite/amber styling, but simplify tiny labels if needed for a clean social-card composition.

## Site Context

This image is for **Kevin Mok's Chess Analytics**, a recruiter-facing portfolio product built from a Chess.com game export.

What the site is:

- A polished static-data analytics site, not a generic chess blog or chess club page.
- A frontend portfolio artifact meant to signal product taste, strong UI craft, typed data transforms, and production-minded engineering.
- A Next.js App Router experience with derived JSON, interactive charts, replay controls, search/filter UX, and a premium visual system.

What the site shows:

- A homepage framed around “typed chess analytics with product-level polish.”
- An Elo Over Time dashboard focused on Elo/rating trends, streaks, activity heatmaps, white-vs-black splits, time-control breakdowns, and opening highlights.
- An All Games explorer for searching and filtering the normalized match log.
- A game-detail experience with board replay, move list, progression by ply, and a material-balance chart.

What the image should communicate first:

- This is a polished analytics product.
- Chess is the subject matter, but frontend engineering and information design are the real story.
- The audience is recruiters and hiring managers evaluating product taste and implementation quality.

## Brand And Visual Direction

Match the site’s actual visual language:

- Background: near-black graphite `#09090C` with subtle depth toward `#0E1017`
- Accent: warm amber/gold `#F5CC80` with highlight `#F9E1A9`
- Text: soft off-white `#F4F4F5`
- Chrome: thin translucent white borders, layered glass panels, faint grid texture, light noise, restrained glow
- Secondary atmosphere: subtle cool gray-blue ambient glow, but amber remains the main accent
- Typography mood: elegant editorial serif-display headline feel plus clean modern sans-serif supporting text

The image should feel:

- Premium
- Recruiter-friendly
- Modern analytics product
- Editorial and intentional
- Refined, not flashy

## Primary Gemini Prompt

Create a **1200x630** Open Graph image for **Kevin Mok's Chess Analytics**.

This is for a recruiter-facing chess analytics site built from a Chess.com game export. The product turns raw chess data into a polished analytics experience with clear storytelling, premium UI, interactive Elo charts, game replay controls, and filtered explorer views. The image should make the site feel like a serious frontend product, not a hobby blog.

Use the attached reference image `prompts/assets/rating-history-insight-preview.png` as the primary insight-preview input. The final image should still feel branded and polished, but it should clearly read as an elevated version of that exact chart preview.

Art direction:

- Dark graphite background using `#09090C` with subtle depth toward `#0E1017`
- Warm amber and soft gold accents using `#F5CC80` and `#F9E1A9`
- Off-white typography using `#F4F4F5`
- Layered glassmorphism cards, thin translucent borders, faint grid/noise texture, restrained atmospheric glow
- Premium dashboard-led composition, inspired by modern editorial analytics products rather than a literal app screenshot

Composition:

- One dominant hero card or dashboard panel in the center-left or center, based directly on the attached rating-history screenshot
- Reuse the reference chart's overall structure: chronological x-axis, amber connecting line, result-colored points, dashed rolling-average overlay, and milestone callouts
- Keep the chart wide and cinematic, but crop and simplify it so it feels like a premium insight preview inside a social card
- Light hints of KPI cards, explorer rows, or replay UI fragments, but keep the layout uncluttered
- Subtle chess references only: a minimal board fragment, geometric square pattern, or elegant chess texture
- Avoid making the chess motif louder than the analytics/product feel
- Preserve generous safe margins so the image reads clearly in link previews
- Do not replace the hero chart with an abstract sparkline, bar chart, or unrelated dashboard widget

Text to render clearly and legibly:

- Main title: **Kevin Mok's Chess Analytics**
- Supporting line: **Next.js, TypeScript, Recharts, and interactive replay UI**
- CTA chip or button: **Explore Elo Over Time**

Optional small supporting detail if space allows:

- `chess.kevin-mok.com`

Text treatment:

- Large, high-contrast, thumbnail-legible typography
- Limit the card to 2-3 text blocks total
- Make the CTA visible but secondary to the title
- If detailed interface labels are shown, keep them minimal and readable

Content cues to reflect the real site:

- Elo/rating history visualization that closely matches the attached insight preview
- Searchable game explorer
- Replay/detail view
- Static-data pipeline and polished product presentation

Overall result:

- Elegant, expensive, branded, and recruiter-ready
- Feels like a premium product share card for a data-rich frontend portfolio
- Clearly related to chess, but the dominant impression is polished analytics and product craftsmanship

## Cleaner Backup Variant

Create a **1200x630** social card for **Kevin Mok's Chess Analytics** with a premium dark analytics aesthetic. Use the attached `prompts/assets/rating-history-insight-preview.png` as the hero reference and reinterpret it into a cleaner, more polished Elo-over-time preview card. Keep the amber line, green/pink/gray result markers, dashed rolling-average overlay, and a few milestone callouts, but simplify tiny labels when needed. Include the text **Kevin Mok's Chess Analytics**, **Gameplay trends, product thinking, and polished frontend execution**, and a subtle CTA pill reading **Explore Elo Over Time**. Add only minimal chess texture, such as a faint board-grid fragment. Keep the design editorial, spacious, and luxury-product oriented rather than dense or literal.

## Negative Constraints

Avoid all of the following:

- Purple-heavy palettes
- Neon cyberpunk lighting
- Cartoon chess pieces
- Tournament-poster styling
- Crowded dashboards with tiny illegible labels
- Generic AI-art fantasy scenes
- Loud gamer aesthetics
- Photorealistic people
- Busy full-board screenshots
- Overly literal code-editor imagery
- Replacing the reference chart with a generic sparkline or unrelated data visualization

## Usage Notes

- Always attach `prompts/assets/rating-history-insight-preview.png` when running this prompt.
- Keep the brand name in rendered text as **Kevin Mok's Chess Analytics**.
- The rating-history chart from the reference should remain the dominant, recognizable insight preview even if Gemini cleans up labels, spacing, or chrome.
- If Gemini struggles with text rendering, ask it to keep the composition and leave clean negative space for later text overlay while preserving the CTA pill shape and placement.
- If the output feels too much like a chess poster, reduce chess elements and increase the product-card / analytics-panel feel.
- If the output feels too much like a literal app screenshot, simplify the UI fragments and polish the chart card, but keep the reference chart's core structure intact.
- Keep the main success criterion simple: the image should read as the share card for a sophisticated chess analytics product built to impress recruiters.
