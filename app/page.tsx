import { BuildStory } from "@/components/home/build-story";
import { HomeHero } from "@/components/home/home-hero";
import { KpiCluster } from "@/components/home/kpi-cluster";
import { RecentGamesPreview } from "@/components/home/recent-games-preview";
import { SpotlightStrip } from "@/components/home/spotlight-strip";
import { getSiteData } from "@/lib/data";

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
