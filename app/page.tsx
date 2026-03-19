import { BuildStory } from "@/components/home/build-story";
import { HighlightedGamesPreview } from "@/components/home/highlighted-games-preview";
import { HomeHero } from "@/components/home/home-hero";
import { KpiCluster } from "@/components/home/kpi-cluster";
import { RecentGamesPreview } from "@/components/home/recent-games-preview";
import { SpotlightStrip } from "@/components/home/spotlight-strip";
import { getHighlightedGames, getSiteData } from "@/lib/data";

export default async function HomePage() {
  const [{ summary }, highlights] = await Promise.all([
    getSiteData(),
    getHighlightedGames(),
  ]);

  return (
    <div className="space-y-8">
      <HomeHero summary={summary} />
      <KpiCluster summary={summary} />
      <SpotlightStrip spotlights={summary.spotlights} />
      <HighlightedGamesPreview highlights={highlights.slice(0, 3)} />
      <BuildStory />
      <RecentGamesPreview games={summary.recentGames.slice(0, 3)} />
    </div>
  );
}
