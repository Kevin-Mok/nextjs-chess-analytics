"use client";

import type { Route } from "next";
import { useState } from "react";
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

import { formatCompactDate, formatRating, formatTimeControlLabel } from "@/lib/formatters";
import {
  type ChartEloPoint,
  formatGameNumberTick,
  getRatingDomain,
  withChartGameNumbers,
} from "@/lib/insights-chart";
import type { EloPoint, MilestonePoint } from "@/types/chess";

interface EloChartProps {
  points: EloPoint[];
  milestones: MilestonePoint[];
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
  const point = payload?.[0]?.payload as ChartEloPoint | undefined;

  if (!active || !point) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-[#09090c]/92 px-4 py-3 text-sm shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
      <p className="font-medium text-white">
        {formatRating(point.rating)} Elo{" "}
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

export function EloChart({ points, milestones }: EloChartProps) {
  const router = useRouter();
  const [showRollingAverage, setShowRollingAverage] = useState(true);
  const chartPoints = withChartGameNumbers(points);
  const milestoneGameNumbers = new Map(
    chartPoints.map((point) => [point.gameId, point.gameNumber]),
  );
  const [minRating, maxRating] = getRatingDomain(points);
  const xAxisTickCount =
    chartPoints.length > 1 ? Math.min(8, chartPoints.length) : 1;

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200/78">
            Elo by game #
          </p>
          <p className="mt-2 text-sm text-white/58">
            Chronological game-number x-axis, result-colored points, rolling trendline, and milestone callouts.
          </p>
        </div>
        <label className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/68">
          <input
            type="checkbox"
            checked={showRollingAverage}
            onChange={(event) => setShowRollingAverage(event.target.checked)}
            className="accent-amber-200"
          />
          Show rolling average
        </label>
      </div>
      <div className="mb-4 flex flex-wrap gap-4 text-xs uppercase tracking-[0.18em] text-white/42">
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
      <div className="h-[24rem]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartPoints}
            margin={{ top: 16, right: 18, left: -18, bottom: 4 }}
            onClick={(state: MouseHandlerDataParam) => {
              const index =
                typeof state.activeTooltipIndex === "number"
                  ? state.activeTooltipIndex
                  : -1;
              const point = index >= 0 ? chartPoints[index] : undefined;

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
              tickCount={xAxisTickCount}
              tickFormatter={formatGameNumberTick}
              tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickMargin={8}
            />
            <YAxis
              domain={[minRating, maxRating]}
              allowDecimals={false}
              tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickMargin={8}
              width={52}
            />
            <Tooltip
              cursor={{ stroke: "rgba(245,204,128,0.16)" }}
              content={(props) => <EloTooltip {...props} />}
            />
            <Line
              type="monotone"
              dataKey="rating"
              stroke="#f5cc80"
              strokeWidth={2.5}
              dot={false}
              activeDot={false}
            />
            {showRollingAverage ? (
              <Line
                type="monotone"
                dataKey="rollingAverage"
                stroke="rgba(255,255,255,0.45)"
                strokeDasharray="4 6"
                strokeWidth={1.5}
                dot={false}
                activeDot={false}
                connectNulls={false}
              />
            ) : null}
            <Scatter data={chartPoints} dataKey="rating">
              {chartPoints.map((point) => (
                <Cell key={point.gameId} fill={getResultColor(point.result)} />
              ))}
            </Scatter>
            {milestones.map((milestone) => (
              <ReferenceDot
                key={milestone.gameId}
                x={milestoneGameNumbers.get(milestone.gameId) ?? 0}
                y={milestone.rating}
                r={5}
                fill="#f5cc80"
                stroke="rgba(9,9,12,0.95)"
                label={{
                  position: "top",
                  value: milestone.title,
                  fill: "rgba(255,255,255,0.62)",
                  fontSize: 11,
                }}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
