# Lessons

- When the user corrects a public identity or naming detail, centralize that mapping explicitly instead of letting the raw source name leak into UI or docs.
- When touching branded copy after a user naming correction, explicitly preserve the exact possessive form they asked for, such as `Kevin Mok's`, in prompts and preview text.
- When a chart needs chronological game numbering or a user-specific rating baseline, derive it explicitly from the sorted series instead of trusting raw ingest sequence or inferred initial-rating jumps.
- When upgrading a chart preview, verify the axis domain and tick source against the intended visible slice before polishing visuals; premium styling does not compensate for wrong chronology or clipped labels.
- When widening a component prop contract, update every live callsite immediately and give shared helpers safe defaults so partial refactors fail closed instead of crashing at runtime.
- When a user says a mobile chart still feels cramped after density reduction, stop squeezing the plot further; preserve the axes and use a restrained horizontal-scroll width that adds space without making the chart excessively long.
- When a user refines route or section naming mid-task, treat it as a branding change: update the visible labels, preserve the exact capitalization they asked for, and sweep the related docs and tests in the same pass.
- When a user renames a top-level route during a branding sweep, update the secondary navigation, CTA labels, and route docs in the same pass so the old name does not linger outside the primary nav.
- When a user says a generated framework file should not be tracked, treat it as repo hygiene work: add the ignore rule and remove it from the git index instead of carrying it through feature commits.
- When ingesting a new bulk PGN export, merge it into the canonical combined PGN, dedupe overlapping games during the merge, and remove the raw import file once validation passes.
