import Link from "next/link";

import { HighlightCard } from "@/components/highlights/highlight-card";
import type { HighlightedGame } from "@/types/chess";

interface HighlightedGamesPreviewProps {
  highlights: HighlightedGame[];
}

export function HighlightedGamesPreview({
  highlights,
}: HighlightedGamesPreviewProps) {
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-200/78">
            Highlight Games
          </p>
          <h2 className="font-display text-3xl text-white">
            Curated Highlight Games with replay boards and analysis excerpts.
          </h2>
        </div>
        <Link
          href="/highlights"
          className="text-sm text-white/62 hover:text-white"
        >
          View All Highlight Games
        </Link>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {highlights.map((highlight) => (
          <HighlightCard
            key={highlight.slug}
            highlight={highlight}
            ctaLabel="Open Highlight Game"
          />
        ))}
      </div>
    </section>
  );
}
