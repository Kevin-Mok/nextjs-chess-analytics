import { HighlightsList } from "@/components/highlights/highlights-list";
import { PageIntro } from "@/components/ui/page-intro";
import { getHighlightedGames } from "@/lib/data";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Highlight Games",
  description:
    "Curated replay pages for standout wins in the Highlight Games collection, each paired with structured excerpts from the local markdown analysis pipeline.",
  pathname: "/highlights",
});

export default async function HighlightsPage() {
  const highlights = await getHighlightedGames();

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Highlight Games"
        title="Featured Highlight Games with built-in replay and analysis."
        description="This section pulls a hand-picked Highlight Games collection into the site with repo-local PGNs, structured markdown excerpts, and direct links back to the original game sources."
      />
      <HighlightsList highlights={highlights} />
    </div>
  );
}
