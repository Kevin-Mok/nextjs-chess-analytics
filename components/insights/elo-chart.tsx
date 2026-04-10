"use client";

import type { Route } from "next";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  type MouseHandlerDataParam,
  ReferenceDot,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  type TooltipContentProps,
  XAxis,
  YAxis,
} from "recharts";

import {
  formatCompactDate,
  formatPlatformLabel,
  formatRating,
  formatTimeControlLabel,
} from "@/lib/formatters";
import {
  buildPlatformEloChartData,
  formatGameNumberTick,
  getEloChartConfig,
  getRatingDomain,
  type PlatformEloChartDatum,
} from "@/lib/insights-chart";
import { PLATFORM_LINE_COLORS } from "@/lib/platforms";
import type { EloPoint, MilestonePoint } from "@/types/chess";

interface EloChartProps {
  points: EloPoint[];
  milestones: MilestonePoint[];
}

interface LegacyMediaQueryList extends MediaQueryList {
  addListener: (listener: (event: MediaQueryListEvent) => void) => void;
  removeListener: (listener: (event: MediaQueryListEvent) => void) => void;
}

function getResultColor(result: EloPoint["result"]): string {
  if (result === "win") {
    return "#34d399";
  }

  if (result === "loss") {
    return "#fb7185";
  }

  return "#e5e7eb";
}

function EloTooltip({ active, payload }: TooltipContentProps) {
  const point = payload?.find((entry) => entry.payload)?.payload as
    | PlatformEloChartDatum
    | undefined;

  if (!active || !point) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-[#09090c]/92 px-4 py-3 text-sm shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
      <p className="font-medium text-white">
        {formatPlatformLabel(point.activePlatform)} · {formatRating(point.rating)} Elo{" "}
        <span className="text-white/42">
          ({point.delta === null ? "n/a" : `${point.delta > 0 ? "+" : ""}${point.delta}`})
        </span>
      </p>
      <p className="mt-1 text-white/64">
        Game {formatGameNumberTick(point.gameNumber)} · {point.opponent} · {formatCompactDate(point.date)}
      </p>
      <p className="mt-1 text-white/48">
        {formatTimeControlLabel(point.timeControl)}
      </p>
    </div>
  );
}

function hasLegacyMediaQueryListeners(
  mediaQuery: MediaQueryList,
): mediaQuery is LegacyMediaQueryList {
  return (
    "addListener" in mediaQuery &&
    typeof (mediaQuery as LegacyMediaQueryList).addListener === "function" &&
    "removeListener" in mediaQuery &&
    typeof (mediaQuery as LegacyMediaQueryList).removeListener === "function"
  );
}

function subscribeToViewportMatch(
  mediaQuery: MediaQueryList,
  listener: () => void,
): () => void {
  const handleChange = () => listener();

  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }

  if (hasLegacyMediaQueryListeners(mediaQuery)) {
    mediaQuery.addListener(handleChange);

    return () => mediaQuery.removeListener(handleChange);
  }

  return () => undefined;
}

export function EloChart({ points, milestones }: EloChartProps) {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const chartData = buildPlatformEloChartData(points);
  const milestoneGameNumbers = new Map(
    chartData.map((point) => [point.gameId, point.gameNumber]),
  );
  const [minRating, maxRating] = getRatingDomain(points);
  const chartConfig = getEloChartConfig({
    pointCount: chartData.length,
    domain: [minRating, maxRating],
    milestones,
    isMobile,
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 639px)");
    const updateMatch = () => setIsMobile(mediaQuery.matches);

    updateMatch();

    return subscribeToViewportMatch(mediaQuery, updateMatch);
  }, []);

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-4 sm:p-6">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200/78">
          Elo by game #
        </p>
        <p className="mt-2 text-xs text-white/58 sm:text-sm">
          One chronological timeline, with separate Chess.com and Lichess rating lines so the two ladders never collapse into one metric.
        </p>
      </div>
      <div className="mb-4 flex flex-wrap gap-4 text-xs uppercase tracking-[0.18em] text-white/42">
        <span className="inline-flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: PLATFORM_LINE_COLORS["chess-com"] }}
          />
          Chess.com line
        </span>
        <span className="inline-flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: PLATFORM_LINE_COLORS.lichess }}
          />
          Lichess line
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          Wins
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
          Losses
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-white/70" />
          Draws
        </span>
      </div>
      {chartConfig.enableHorizontalScroll ? (
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/36 sm:hidden">
          Swipe for full chart
        </p>
      ) : null}
      <div className="h-[24rem]">
        <div
          className={[
            "h-full",
            chartConfig.enableHorizontalScroll
              ? "overflow-x-auto overflow-y-hidden pb-2 touch-pan-x overscroll-x-contain"
              : "",
          ].join(" ")}
        >
          <div
            className="h-full min-w-full"
            style={
              chartConfig.contentWidth === null
                ? undefined
                : { width: `${chartConfig.contentWidth}px` }
            }
          >
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartData}
                margin={chartConfig.margin}
                onClick={(state: MouseHandlerDataParam) => {
                  const index =
                    typeof state.activeTooltipIndex === "number"
                      ? state.activeTooltipIndex
                      : -1;
                  const point = index >= 0 ? chartData[index] : undefined;

                  if (point?.gameId) {
                    router.push(`/games/${point.gameId}` as Route);
                  }
                }}
              >
                <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.08)" />
                <XAxis
                  type="number"
                  dataKey="gameNumber"
                  domain={["dataMin", "dataMax"]}
                  allowDecimals={false}
                  tickCount={chartConfig.xAxisTickCount}
                  tickFormatter={formatGameNumberTick}
                  tick={{
                    fill: "rgba(255,255,255,0.45)",
                    fontSize: chartConfig.tickFontSize,
                  }}
                  axisLine={false}
                  tickLine={false}
                  tickMargin={8}
                />
                <YAxis
                  domain={[minRating, maxRating]}
                  allowDecimals={false}
                  tick={{
                    fill: "rgba(255,255,255,0.45)",
                    fontSize: chartConfig.tickFontSize,
                  }}
                  axisLine={false}
                  tickLine={false}
                  tickMargin={8}
                  width={chartConfig.yAxisWidth}
                />
                <Tooltip
                  cursor={{ stroke: "rgba(245,204,128,0.16)" }}
                  content={(props) => <EloTooltip {...props} />}
                />
                <Line
                  type="monotone"
                  dataKey="chessComRating"
                  stroke={PLATFORM_LINE_COLORS["chess-com"]}
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={false}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="lichessRating"
                  stroke={PLATFORM_LINE_COLORS.lichess}
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={false}
                  connectNulls
                />
                <Scatter data={chartData} dataKey="rating">
                  {chartData.map((point) => (
                    <Cell key={point.gameId} fill={getResultColor(point.result)} />
                  ))}
                </Scatter>
                {chartConfig.milestones.map((milestone) => {
                  const labelPrefix =
                    milestone.platform === "chess-com" ? "Chess.com" : "Lichess";

                  return (
                    <ReferenceDot
                      key={milestone.gameId}
                      x={milestoneGameNumbers.get(milestone.gameId) ?? 0}
                      y={milestone.rating}
                      r={chartConfig.milestoneDotRadius}
                      fill={PLATFORM_LINE_COLORS[milestone.platform]}
                      stroke="rgba(9,9,12,0.95)"
                      label={{
                        position: milestone.position,
                        value: `${labelPrefix} ${milestone.title}`,
                        fill: "rgba(255,255,255,0.62)",
                        fontSize: chartConfig.milestoneLabelFontSize,
                      }}
                    />
                  );
                })}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
