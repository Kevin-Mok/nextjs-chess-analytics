# Lessons

- When the user corrects a public identity or naming detail, centralize that mapping explicitly instead of letting the raw source name leak into UI or docs.
- When touching branded copy after a user naming correction, explicitly preserve the exact possessive form they asked for, such as `Kevin Mok's`, in prompts and preview text.
- When a chart needs chronological game numbering or a user-specific rating baseline, derive it explicitly from the sorted series instead of trusting raw ingest sequence or inferred initial-rating jumps.
- When upgrading a chart preview, verify the axis domain and tick source against the intended visible slice before polishing visuals; premium styling does not compensate for wrong chronology or clipped labels.
- When widening a component prop contract, update every live callsite immediately and give shared helpers safe defaults so partial refactors fail closed instead of crashing at runtime.
- When a user says a mobile chart still feels cramped after density reduction, stop squeezing the plot further; preserve the axes and use a restrained horizontal-scroll width that adds space without making the chart excessively long.
- When a mobile chart artifact is described as a white outline, verify whether the visible bug is actually a mix of tap-highlight styling and Recharts tooltip cursor rendering before changing the chart accessibility layer.
- When adding mobile chart selection, do not mix chart-surface Recharts touch state with custom tap handling; keep swipe on the chart surface and bind selection to explicit dot hit targets instead.
- When a Recharts mobile artifact survives tooltip changes, target the root chart surface explicitly with `accessibilityLayer`, `tabIndex`, and SVG-level attributes instead of assuming wrapper CSS will reach the focused element.
