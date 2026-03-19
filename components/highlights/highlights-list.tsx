import { HighlightCard } from "@/components/highlights/highlight-card";
import type { HighlightedGame } from "@/types/chess";

interface HighlightsListProps {
  highlights: HighlightedGame[];
}

export function HighlightsList({ highlights }: HighlightsListProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
      {highlights.map((highlight) => (
        <HighlightCard key={highlight.slug} highlight={highlight} />
      ))}
    </div>
  );
}
