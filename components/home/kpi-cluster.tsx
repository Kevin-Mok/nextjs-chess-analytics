import { Activity, Crown, Flame, Gauge, Target } from "lucide-react";

import { StatCard } from "@/components/ui/stat-card";
import { formatPercent } from "@/lib/utils";
import { formatRating } from "@/lib/formatters";
import type { InsightSummary } from "@/types/chess";

interface KpiClusterProps {
  summary: InsightSummary;
}

export function KpiCluster({ summary }: KpiClusterProps) {
  const ratingPlatforms = summary.ratingPlatforms.slice(0, 2);

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      {ratingPlatforms.map((platform) => (
        <StatCard
          key={platform.platform}
          label={`${platform.label} rating`}
          value={formatRating(platform.currentRating)}
          detail={`Peak ${formatRating(platform.peakRating)} · Net ${platform.netRatingChange === null ? "n/a" : `${platform.netRatingChange > 0 ? "+" : ""}${platform.netRatingChange}`}`}
          icon={
            platform.platform === "chess-com"
              ? <Gauge className="h-4 w-4" />
              : <Crown className="h-4 w-4" />
          }
        />
      ))}
      <StatCard
        label="Win rate"
        value={formatPercent(summary.winRate)}
        detail={`${summary.record.wins}-${summary.record.losses}-${summary.record.draws} overall`}
        icon={<Target className="h-4 w-4" />}
      />
      <StatCard
        label="Game count"
        value={summary.gameCount.toString()}
        detail={`Most common control: ${summary.mostCommonTimeControl}`}
        icon={<Activity className="h-4 w-4" />}
      />
      <StatCard
        label="Best recent form"
        value={formatPercent(summary.bestRecentForm.winRate)}
        detail={`${summary.bestRecentForm.record.wins}-${summary.bestRecentForm.record.losses}-${summary.bestRecentForm.record.draws} over the last ${summary.bestRecentForm.games}`}
        icon={<Flame className="h-4 w-4" />}
      />
    </section>
  );
}
