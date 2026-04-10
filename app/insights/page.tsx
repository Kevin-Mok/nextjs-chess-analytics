import type { ReactNode } from "react";
import { Activity, ArrowRightLeft, Clock3, Layers3, TrendingDown, TrendingUp } from "lucide-react";

import { ActivityHeatmap } from "@/components/insights/activity-heatmap";
import { EloChart } from "@/components/insights/elo-chart";
import { InsightsFilters } from "@/components/insights/insights-filters";
import { PageIntro } from "@/components/ui/page-intro";
import { Panel } from "@/components/ui/panel";
import { getGames } from "@/lib/data";
import {
  type GameColorFilter,
  type GameResultFilter,
  type InsightRange,
  deriveGameFilterOptions,
  filterGames,
  getDateRangeForInsightWindow,
} from "@/lib/game-filters";
import {
  formatRating,
  formatTimeControlLabel,
} from "@/lib/formatters";
import { createPageMetadata } from "@/lib/metadata";
import { formatPercent } from "@/lib/utils";
import { buildInsightSummary } from "@/lib/analytics";

export const metadata = createPageMetadata({
  title: "Elo Over Time",
  description:
    "Elo Over Time trends, streaks, activity heatmaps, and breakdowns derived from the static chess analytics summary.",
  pathname: "/insights",
});

interface InsightsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const validColors = new Set<GameColorFilter>(["all", "white", "black"]);
const validResults = new Set<GameResultFilter>(["all", "win", "loss", "draw"]);
const validRanges = new Set<InsightRange>(["all", "30d", "90d"]);

function getSingleValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function InsightsPage({
  searchParams,
}: InsightsPageProps) {
  const games = await getGames();
  const params = await searchParams;
  const options = deriveGameFilterOptions(games);
  const colorValue = getSingleValue(params.color) ?? "all";
  const resultValue = getSingleValue(params.result) ?? "all";
  const timeControlValue = getSingleValue(params.timeControl) ?? "all";
  const rangeValue = getSingleValue(params.range) ?? "all";
  const color = validColors.has(colorValue as GameColorFilter)
    ? (colorValue as GameColorFilter)
    : "all";
  const result = validResults.has(resultValue as GameResultFilter)
    ? (resultValue as GameResultFilter)
    : "all";
  const range = validRanges.has(rangeValue as InsightRange)
    ? (rangeValue as InsightRange)
    : "all";
  const dateRange = getDateRangeForInsightWindow(games, range);
  const filteredGames = filterGames(games, {
    color,
    result,
    timeControl: timeControlValue,
    ...dateRange,
  });
  const summary = buildInsightSummary(filteredGames);
  const ratingPlatforms = summary.ratingPlatforms;
  const ratingPoints = ratingPlatforms
    .flatMap((platform) => platform.eloSeries)
    .sort((left, right) => left.sequence - right.sequence);
  const ratingMilestones = ratingPlatforms
    .flatMap((platform) => platform.milestonePoints)
    .sort((left, right) => left.sequence - right.sequence);
  const platformCounts = filteredGames.reduce<Record<string, number>>((counts, game) => {
    counts[game.platform] = (counts[game.platform] ?? 0) + 1;
    return counts;
  }, {});
  const hasFilteredGames = filteredGames.length > 0;

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Elo Over Time"
        title="Rating trends and pattern breakdowns."
        description="The Elo Over Time route filters the derived dataset on the server, then hands a focused Elo series into client-side charting. Every other section stays static-data and reproducible."
      />
      <div className="grid gap-6">
        {hasFilteredGames ? (
          <>
            <div data-slot="insights-filters" className="order-2 md:order-1">
              <InsightsFilters
                color={color}
                result={result}
                timeControl={timeControlValue}
                range={range}
                timeControls={options.timeControls}
              />
            </div>
            <div data-slot="insights-chart" className="order-1 md:order-2">
              <EloChart
                points={ratingPoints}
                milestones={ratingMilestones}
              />
            </div>
          </>
        ) : (
          <>
            <InsightsFilters
              color={color}
              result={result}
              timeControl={timeControlValue}
              range={range}
              timeControls={options.timeControls}
            />
            <Panel className="p-8 text-center text-white/58">
              No games match the current filter set.
            </Panel>
          </>
        )}
      </div>
      {hasFilteredGames ? (
        <>
          <div className="grid gap-4 xl:grid-cols-3">
            <Panel className="p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200/78">
                Rating pools
              </p>
              <div className="mt-4 grid gap-3">
                {ratingPlatforms.map((platform) => (
                  <MiniSummary
                    key={platform.platform}
                    label={platform.label}
                    value={formatRating(platform.currentRating)}
                    detail={`Peak ${formatRating(platform.peakRating)} · Volatility ${Math.round(platform.ratingVolatility)}`}
                    icon={<TrendingUp className="h-4 w-4" />}
                  />
                ))}
              </div>
            </Panel>
            <Panel className="p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200/78">
                Peaks and floors
              </p>
              <div className="mt-4 grid gap-3">
                {ratingPlatforms.map((platform) => (
                  <MiniSummary
                    key={platform.platform}
                    label={platform.label}
                    value={`${formatRating(platform.peakRating)} / ${formatRating(platform.lowestRating)}`}
                    detail="Peak / floor"
                    icon={<Layers3 className="h-4 w-4" />}
                  />
                ))}
              </div>
            </Panel>
            <Panel className="p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200/78">
                Color split
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <MiniSummary
                  label="White"
                  value={formatPercent(summary.white.winRate)}
                  detail={`${summary.white.wins}-${summary.white.losses}-${summary.white.draws}`}
                  icon={<Layers3 className="h-4 w-4" />}
                />
                <MiniSummary
                  label="Black"
                  value={formatPercent(summary.black.winRate)}
                  detail={`${summary.black.wins}-${summary.black.losses}-${summary.black.draws}`}
                  icon={<ArrowRightLeft className="h-4 w-4" />}
                />
              </div>
            </Panel>
          </div>
          <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <Panel className="p-5">
              <ActivityHeatmap cells={summary.activityHeatmap} />
            </Panel>
            <Panel className="p-5">
              <SectionTitle
                title="Streak cards"
                copy="Current momentum, longest heater, and roughest downswing."
              />
              <div className="mt-4 grid gap-3">
                <MiniSummary
                  label="Current streak"
                  value={`${summary.currentStreak.length}`}
                  detail={summary.currentStreak.type}
                  icon={<Activity className="h-4 w-4" />}
                />
                <MiniSummary
                  label="Longest win streak"
                  value={`${summary.longestWinStreak?.length ?? 0}`}
                  detail={summary.longestWinStreak?.startDate ?? "n/a"}
                  icon={<TrendingUp className="h-4 w-4" />}
                />
                <MiniSummary
                  label="Longest loss streak"
                  value={`${summary.longestLossStreak?.length ?? 0}`}
                  detail={summary.longestLossStreak?.startDate ?? "n/a"}
                  icon={<TrendingDown className="h-4 w-4" />}
                />
              </div>
            </Panel>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Panel className="p-5">
              <SectionTitle
                title="Time-control breakdown"
                copy={`Most common control: ${formatTimeControlLabel(summary.mostCommonTimeControl)}`}
              />
              <BreakdownList
                items={summary.timeControlBreakdown.slice(0, 6).map((item) => ({
                  label: formatTimeControlLabel(item.label),
                  value: `${item.count} games`,
                  meta: `${formatPercent(item.winRate)} win rate`,
                }))}
              />
            </Panel>
            <Panel className="p-5">
              <SectionTitle
                title="Termination breakdown"
                copy="How games are ending after normalization."
              />
              <BreakdownList
                items={summary.terminationBreakdown.slice(0, 6).map((item) => ({
                  label: item.label,
                  value: `${item.count} games`,
                  meta: "",
                }))}
              />
            </Panel>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Panel className="p-5">
              <SectionTitle
                title="Opening highlights"
                copy="Heuristic opening signatures derived from the first few SAN moves."
              />
              <BreakdownList
                items={summary.openingHighlights.slice(0, 6).map((item) => ({
                  label: item.label,
                  value: `${item.count} games`,
                  meta: `${formatPercent(item.record.winRate)} win rate`,
                }))}
              />
            </Panel>
            <Panel className="p-5">
              <SectionTitle
                title="Top-level summary"
                copy="A compact readout of the filtered slice."
              />
              <div className="mt-4 grid gap-3">
                <MiniSummary
                  label="Average length"
                  value={`${Math.round(summary.averageMoveCount)}`}
                  detail="moves"
                  icon={<Clock3 className="h-4 w-4" />}
                />
                <MiniSummary
                  label="Platforms"
                  value={`${ratingPlatforms.length}`}
                  detail={`Chess.com ${platformCounts["chess-com"] ?? 0} · Lichess ${platformCounts.lichess ?? 0}`}
                  icon={<ArrowRightLeft className="h-4 w-4" />}
                />
              </div>
            </Panel>
          </div>
        </>
      ) : null}
    </div>
  );
}

interface SectionTitleProps {
  title: string;
  copy: string;
}

function SectionTitle({ title, copy }: SectionTitleProps) {
  return (
    <div>
      <p className="text-sm font-medium text-white">{title}</p>
      <p className="mt-1 text-sm text-white/54">{copy}</p>
    </div>
  );
}

interface MiniSummaryProps {
  label: string;
  value: string;
  detail: string;
  icon: ReactNode;
}

function MiniSummary({ label, value, detail, icon }: MiniSummaryProps) {
  return (
    <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
          {label}
        </p>
        <div className="text-amber-200/72">{icon}</div>
      </div>
      <p className="mt-3 font-display text-3xl text-white">{value}</p>
      <p className="mt-1 text-sm text-white/54">{detail}</p>
    </div>
  );
}

interface BreakdownListProps {
  items: Array<{
    label: string;
    value: string;
    meta: string;
  }>;
}

function BreakdownList({ items }: BreakdownListProps) {
  return (
    <div className="mt-4 grid gap-3">
      {items.map((item) => (
        <div
          key={`${item.label}-${item.value}`}
          className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] px-4 py-4"
        >
          <div className="flex items-start justify-between gap-4">
            <p className="text-sm text-white/72">{item.label}</p>
            <p className="font-medium text-white">{item.value}</p>
          </div>
          {item.meta ? <p className="mt-2 text-sm text-white/48">{item.meta}</p> : null}
        </div>
      ))}
    </div>
  );
}
