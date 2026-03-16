import { BuildStory } from "@/components/home/build-story";
import { HomeHero } from "@/components/home/home-hero";
import { KpiCluster } from "@/components/home/kpi-cluster";
import { RecentGamesPreview } from "@/components/home/recent-games-preview";
import { SpotlightStrip } from "@/components/home/spotlight-strip";
import { getSiteData } from "@/lib/data";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  description:
    "Recruiter-facing overview of a static-data chess analytics site built with Next.js App Router, typed transforms, and focused client interactivity.",
});

export default async function HomePage() {
  const { summary } = await getSiteData();

  return (
    <div className="space-y-8">
      <HomeHero summary={summary} />
      <KpiCluster summary={summary} />
      <SpotlightStrip spotlights={summary.spotlights} />
      <BuildStory />
      <RecentGamesPreview games={summary.recentGames.slice(0, 3)} />
    </div>
  );
}
