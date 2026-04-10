"use client";

import { useReducedMotion, motion } from "motion/react";
import {
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
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
  buildHomePreviewWindow,
  formatGameNumberTick,
  getResultColor,
  type HomePreviewAnnotation,
  type PlatformEloChartDatum,
} from "@/lib/insights-chart";
import { PLATFORM_LINE_COLORS } from "@/lib/platforms";
import { formatSignedNumber } from "@/lib/utils";
import type { EloPoint, MilestonePoint } from "@/types/chess";

interface HeroPreviewProps {
  points: EloPoint[];
  milestones?: MilestonePoint[];
}

interface MetricChipProps {
  label: string;
  value: string;
  detail: string;
}

function HeroTooltip({ active, payload }: TooltipContentProps) {
  const point = payload?.find((entry) => entry.payload)?.payload as
    | PlatformEloChartDatum
    | undefined;

  if (!active || !point) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-[#09090c]/92 px-4 py-3 text-sm shadow-[0_18px_40px_rgba(0,0,0,0.42)]">
      <p className="font-medium text-white">
        {formatPlatformLabel(point.activePlatform)} · {formatRating(point.rating)} Elo{" "}
        <span className="text-white/42">
          ({point.delta === null ? "n/a" : formatSignedNumber(point.delta)})
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

function MetricChip({
  label,
  value,
  detail,
}: MetricChipProps) {
  return (
    <div className="min-w-[9rem] rounded-[1.25rem] border border-white/10 bg-white/[0.04] px-3.5 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-sm">
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-white/42">
        {label}
      </p>
      <p className="mt-2 font-display text-xl text-white">{value}</p>
      <p className="mt-1 text-xs text-white/48">{detail}</p>
    </div>
  );
}

function getAnnotationLabelPosition(
  annotation: HomePreviewAnnotation,
  midpoint: number,
): "top" | "insideBottomLeft" | "insideBottomRight" {
  if (annotation.tone === "current") {
    return annotation.rating >= midpoint ? "insideBottomRight" : "top";
  }

  return annotation.rating >= midpoint ? "insideBottomLeft" : "top";
}

export function HeroPreview({ points, milestones = [] }: HeroPreviewProps) {
  const prefersReducedMotion = useReducedMotion();
  const preview = buildHomePreviewWindow(points, milestones);
  const recentPoints = preview.points;
  const chartData = buildPlatformEloChartData(recentPoints);
  const firstPoint = recentPoints[0];
  const lastPoint = recentPoints.at(-1);
  const xAxisTickCount = chartData.length > 1 ? Math.min(6, chartData.length) : 1;
  const labelMidpoint = (preview.domain[0] + preview.domain[1]) / 2;
  const record = recentPoints.reduce(
    (summary, point) => {
      if (point.result === "win") {
        summary.wins += 1;
      } else if (point.result === "loss") {
        summary.losses += 1;
      } else {
        summary.draws += 1;
      }

      return summary;
    },
    { wins: 0, losses: 0, draws: 0 },
  );
  const platformLabels = [...new Set(recentPoints.map((point) => formatPlatformLabel(point.platform)))];

  if (recentPoints.length === 0 || !firstPoint || !lastPoint) {
    return null;
  }

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
      animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.65, ease: "easeOut" }}
      className="relative overflow-hidden rounded-[2.2rem] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(245,204,128,0.22),_transparent_42%),radial-gradient(circle_at_bottom_left,_rgba(117,132,167,0.18),_transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.025))] p-6 shadow-[0_28px_110px_rgba(0,0,0,0.4)] sm:p-7"
    >
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),transparent_34%,transparent_70%,rgba(245,204,128,0.08))]" />
      <div className="absolute inset-x-6 top-5 h-px bg-gradient-to-r from-transparent via-white/16 to-transparent sm:inset-x-7" />
      <div className="absolute inset-0 opacity-45">
        <motion.div
          animate={
            prefersReducedMotion
              ? undefined
              : { rotate: [0, 2.5, 0], y: [0, -8, 0] }
          }
          transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY }}
          className="absolute -right-8 top-8 grid grid-cols-4 gap-3"
        >
          {Array.from({ length: 16 }, (_, index) => (
            <span
              key={index}
              className={[
                "h-14 w-14 rounded-xl border border-white/8 backdrop-blur-[2px]",
                index % 3 === 0 ? "bg-amber-200/10" : "bg-white/[0.045]",
              ].join(" ")}
            />
          ))}
        </motion.div>
      </div>
      <div className="relative">
        <div className="flex flex-col gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/16 bg-amber-200/8 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-amber-100/84">
              Recent run
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200/78">
                Elo preview
              </p>
              <p className="max-w-md text-sm leading-6 text-white/64">
                The latest {recentPoints.length}-game slice from the full rating arc, with live momentum, result-coded swings, and the same chart language as Elo Over Time.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <MetricChip
              label="Window"
              value={`${formatGameNumberTick(firstPoint.sequence)}-${formatGameNumberTick(lastPoint.sequence)}`}
              detail={`${recentPoints.length} recent games`}
            />
            <MetricChip
              label="Latest point"
              value={`${formatPlatformLabel(lastPoint.platform)} ${formatRating(lastPoint.rating)}`}
              detail="Most recent rated game"
            />
            <MetricChip
              label="Record"
              value={`${record.wins}-${record.losses}-${record.draws}`}
              detail="Wins-losses-draws"
            />
          </div>
          <div className="flex flex-wrap gap-4 text-[0.65rem] uppercase tracking-[0.22em] text-white/46">
            {platformLabels.map((label) => (
              <span key={label} className="inline-flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{
                    backgroundColor:
                      label === "Chess.com"
                        ? PLATFORM_LINE_COLORS["chess-com"]
                        : PLATFORM_LINE_COLORS.lichess,
                  }}
                />
                {label}
              </span>
            ))}
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
        </div>
        <div className="mt-6 h-[20rem] rounded-[1.7rem] border border-white/6 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] px-2 pb-1 pt-3 sm:h-[21rem] sm:px-3">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 18, right: 14, left: 10, bottom: 6 }}
            >
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.08)" />
              <XAxis
                type="number"
                dataKey="gameNumber"
                domain={["dataMin", "dataMax"]}
                allowDecimals={false}
                tickCount={xAxisTickCount}
                tickFormatter={formatGameNumberTick}
                tick={{ fill: "rgba(255,255,255,0.46)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickMargin={10}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={preview.domain}
                allowDecimals={false}
                tick={{ fill: "rgba(255,255,255,0.46)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickMargin={10}
                width={58}
              />
              <Tooltip
                cursor={{ stroke: "rgba(245,204,128,0.18)", strokeWidth: 1 }}
                content={(props) => <HeroTooltip {...props} />}
              />
              <Line
                type="monotone"
                dataKey="chessComRating"
                stroke={PLATFORM_LINE_COLORS["chess-com"]}
                strokeWidth={2.75}
                dot={false}
                activeDot={false}
                connectNulls
                isAnimationActive={!prefersReducedMotion}
                animationDuration={700}
              />
              <Line
                type="monotone"
                dataKey="lichessRating"
                stroke={PLATFORM_LINE_COLORS.lichess}
                strokeWidth={2.75}
                dot={false}
                activeDot={false}
                connectNulls
                isAnimationActive={!prefersReducedMotion}
                animationDuration={700}
              />
              <Scatter data={chartData} dataKey="rating">
                {chartData.map((point) => (
                  <Cell key={point.gameId} fill={getResultColor(point.result)} />
                ))}
              </Scatter>
              {preview.annotations.map((annotation) => (
                <ReferenceDot
                  key={annotation.gameId}
                  x={chartData.find((point) => point.gameId === annotation.gameId)?.gameNumber ?? annotation.sequence}
                  y={annotation.rating}
                  r={4.75}
                  fill={annotation.tone === "current" ? "#f5cc80" : "#f8fafc"}
                  stroke="rgba(9,9,12,0.95)"
                  label={{
                    position: getAnnotationLabelPosition(annotation, labelMidpoint),
                    value: annotation.title,
                    fill:
                      annotation.tone === "current"
                        ? "rgba(245,204,128,0.92)"
                        : "rgba(255,255,255,0.68)",
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}
