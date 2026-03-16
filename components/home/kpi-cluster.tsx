import { Activity, Crown, Flame, Gauge, Target } from "lucide-react";

import { StatCard } from "@/components/ui/stat-card";
import { formatPercent } from "@/lib/utils";
import { formatRating } from "@/lib/formatters";
import type { InsightSummary } from "@/types/chess";

interface KpiClusterProps {
  summary: InsightSummary;
}

export function KpiCluster({ summary }: KpiClusterProps) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      <StatCard
        label="Current rating"
        value={formatRating(summary.currentRating)}
        detail={`Net ${summary.netRatingChange === null ? "n/a" : `${summary.netRatingChange > 0 ? "+" : ""}${summary.netRatingChange}`} across the dataset`}
        icon={<Gauge className="h-4 w-4" />}
      />
      <StatCard
        label="Peak rating"
        value={formatRating(summary.peakRating)}
        detail="Best single point on the ladder"
        icon={<Crown className="h-4 w-4" />}
      />
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
