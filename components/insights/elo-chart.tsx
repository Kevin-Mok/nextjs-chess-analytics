"use client";

import type { Route } from "next";
import { useEffect, useRef, useState, type TouchEvent as ReactTouchEvent } from "react";
import { useRouter } from "next/navigation";
import {
  CartesianGrid,
  ComposedChart,
  Line,
  type MouseHandlerDataParam,
  ReferenceDot,
  ResponsiveContainer,
  Scatter,
  type ScatterShapeProps,
  Tooltip,
  type TooltipContentProps,
  XAxis,
  YAxis,
} from "recharts";

import { formatCompactDate, formatRating, formatTimeControlLabel } from "@/lib/formatters";
import {
  type ChartEloPoint,
  type ChartTouchPoint,
  formatGameNumberTick,
  getEloChartConfig,
  getRatingDomain,
  getSelectedChartPoint,
  isMobileChartTap,
  withChartGameNumbers,
} from "@/lib/insights-chart";
import { ButtonLink } from "@/components/ui/button-link";
import { ResultPill } from "@/components/ui/result-pill";
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

export function MobilePinnedGameCard({
  point,
}: {
  point: ChartEloPoint | null;
}) {
  if (!point) {
    return (
      <div className="rounded-[1.4rem] border border-white/10 bg-[#09090c]/92 px-4 py-3 shadow-[0_18px_40px_rgba(0,0,0,0.28)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-200/78">
          Pinned game
        </p>
        <p className="mt-3 text-sm text-white/72">Tap a point to inspect a game.</p>
        <p className="mt-1 text-xs text-white/48">
          Swipe horizontally to browse the full rating arc without losing your place.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[1.4rem] border border-amber-200/18 bg-[#09090c]/92 px-4 py-3 shadow-[0_18px_40px_rgba(0,0,0,0.28)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-200/78">
            Pinned game
          </p>
          <p className="mt-3 font-medium text-white">
            {formatRating(point.rating)} Elo{" "}
            <span className="text-white/42">
              ({point.delta === null ? "n/a" : `${point.delta > 0 ? "+" : ""}${point.delta}`})
            </span>
          </p>
        </div>
        <ResultPill result={point.result} className="shrink-0" />
      </div>
      <p className="mt-2 text-sm text-white/64">
        Game {formatGameNumberTick(point.gameNumber)} · {point.opponent} · {formatCompactDate(point.date)}
      </p>
      <p className="mt-1 text-sm text-white/48">
        {formatTimeControlLabel(point.timeControl)}
      </p>
      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-xs text-white/42">Pinned while you scroll</p>
        <ButtonLink
          href={`/games/${point.gameId}` as Route}
          variant="secondary"
          className="px-4 py-2 text-xs"
        >
          Open game
        </ButtonLink>
      </div>
    </div>
  );
}

function getTouchPoint(
  event: ReactTouchEvent<SVGElement>,
): ChartTouchPoint | null {
  const touch = event.touches[0] ?? event.changedTouches[0];

  if (!touch) {
    return null;
  }

  return {
    clientX: touch.clientX,
    clientY: touch.clientY,
  };
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
  const [showRollingAverage, setShowRollingAverage] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const chartSurfaceRef = useRef<SVGSVGElement | null>(null);
  const touchStartRef = useRef<ChartTouchPoint | null>(null);
  const suppressMobileTapRef = useRef(false);
  const chartPoints = withChartGameNumbers(points);
  const milestoneGameNumbers = new Map(
    chartPoints.map((point) => [point.gameId, point.gameNumber]),
  );
  const [minRating, maxRating] = getRatingDomain(points);
  const selectedPoint = getSelectedChartPoint(chartPoints, selectedGameId);
  const chartConfig = getEloChartConfig({
    pointCount: chartPoints.length,
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

  useEffect(() => {
    const chartSurface = chartSurfaceRef.current;

    if (!chartSurface) {
      return;
    }

    if (chartConfig.surfaceFocusable === false) {
      chartSurface.setAttribute("focusable", "false");
      return;
    }

    chartSurface.removeAttribute("focusable");
  }, [chartConfig.surfaceFocusable]);

  function resetMobileTouchTracking() {
    touchStartRef.current = null;
    suppressMobileTapRef.current = false;
  }

  function handleMobileDotTouchStart(
    event: ReactTouchEvent<SVGCircleElement>,
  ) {
    touchStartRef.current = getTouchPoint(event);
    suppressMobileTapRef.current = false;
  }

  function handleMobileDotTouchMove(
    event: ReactTouchEvent<SVGCircleElement>,
  ) {
    if (suppressMobileTapRef.current) {
      return;
    }

    const nextTouchPoint = getTouchPoint(event);

    if (!isMobileChartTap(touchStartRef.current, nextTouchPoint)) {
      suppressMobileTapRef.current = true;
    }
  }

  function handleMobileDotTouchEnd(
    point: ChartEloPoint,
    event: ReactTouchEvent<SVGCircleElement>,
  ) {
    const shouldSelect =
      !suppressMobileTapRef.current &&
      isMobileChartTap(touchStartRef.current, getTouchPoint(event));

    resetMobileTouchTracking();

    if (shouldSelect) {
      setSelectedGameId(point.gameId);
    }
  }

  function renderScatterPoint(shapeProps: ScatterShapeProps) {
    const point = shapeProps.payload as ChartEloPoint | undefined;
    const { cx, cy } = shapeProps;

    if (!point || typeof cx !== "number" || typeof cy !== "number") {
      return null;
    }

    const pointColor = getResultColor(point.result);
    const visibleRadius = isMobile ? 5.5 : 4.5;

    if (!isMobile) {
      return <circle cx={cx} cy={cy} r={visibleRadius} fill={pointColor} />;
    }

    return (
      <g>
        <circle cx={cx} cy={cy} r={visibleRadius} fill={pointColor} />
        <circle
          cx={cx}
          cy={cy}
          r={14}
          fill="transparent"
          pointerEvents="all"
          style={{ touchAction: "pan-x" }}
          onTouchStart={handleMobileDotTouchStart}
          onTouchMove={handleMobileDotTouchMove}
          onTouchEnd={(event) => handleMobileDotTouchEnd(point, event)}
          onTouchCancel={resetMobileTouchTracking}
        />
      </g>
    );
  }

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-4 sm:p-6">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200/78">
            Elo by game #
          </p>
          <p className="mt-2 text-xs text-white/58 sm:text-sm">
            Chronological game-number x-axis, result-colored points, rolling trendline, and milestone callouts.
          </p>
        </div>
        <label className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-white/68 sm:text-sm">
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
      {chartConfig.enableHorizontalScroll ? (
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/36 sm:hidden">
          Swipe for full chart. Tap a dot to pin details.
        </p>
      ) : null}
      {isMobile ? (
        <div className="mb-4 sm:hidden">
          <MobilePinnedGameCard point={selectedPoint} />
        </div>
      ) : null}
      <div className="h-[24rem]">
        <div
          className={[
            "elo-chart-scroll-shell h-full",
            chartConfig.enableHorizontalScroll
              ? "overflow-x-auto overflow-y-hidden pb-2 touch-pan-x overscroll-x-contain"
              : "",
          ].join(" ")}
        >
          <div
            className="elo-chart-scroll-content h-full min-w-full"
            style={
              chartConfig.contentWidth === null
                ? undefined
                : { width: `${chartConfig.contentWidth}px` }
            }
          >
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                accessibilityLayer={chartConfig.accessibilityLayer}
                data-mobile-chart-surface={isMobile ? "true" : undefined}
                data={chartPoints}
                margin={chartConfig.margin}
                ref={chartSurfaceRef}
                onClick={(state: MouseHandlerDataParam) => {
                  if (isMobile) {
                    return;
                  }

                  const index =
                    typeof state.activeTooltipIndex === "number"
                      ? state.activeTooltipIndex
                        : typeof state.activeIndex === "number"
                          ? state.activeIndex
                          : -1;
                  const point = index >= 0 ? chartPoints[index] : undefined;

                  if (point?.gameId) {
                    router.push(`/games/${point.gameId}` as Route);
                  }
                }}
                tabIndex={chartConfig.surfaceTabIndex}
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
                {chartConfig.showNativeTooltip ? (
                  <Tooltip
                    cursor={chartConfig.tooltipCursor}
                    content={(props) => <EloTooltip {...props} />}
                  />
                ) : null}
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
                <Scatter
                  data={chartPoints}
                  dataKey="rating"
                  shape={renderScatterPoint}
                  activeShape={renderScatterPoint}
                />
                {chartConfig.milestones.map((milestone) => (
                  <ReferenceDot
                    key={milestone.gameId}
                    x={milestoneGameNumbers.get(milestone.gameId) ?? 0}
                    y={milestone.rating}
                    r={chartConfig.milestoneDotRadius}
                    fill="#f5cc80"
                    stroke="rgba(9,9,12,0.95)"
                    label={{
                      position: milestone.position,
                      value: milestone.label,
                      fill: "rgba(255,255,255,0.62)",
                      fontSize: chartConfig.milestoneLabelFontSize,
                    }}
                  />
                ))}
                {isMobile && selectedPoint ? (
                  <ReferenceDot
                    x={selectedPoint.gameNumber}
                    y={selectedPoint.rating}
                    r={9}
                    fill="rgba(245,204,128,0.12)"
                    stroke="#f5cc80"
                    strokeWidth={2}
                    zIndex={700}
                  />
                ) : null}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
