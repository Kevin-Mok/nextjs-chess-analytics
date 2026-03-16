import type { EloPoint, GameResult, MilestonePoint } from "@/types/chess";

const FLAT_RATING_DOMAIN_PADDING = 8;
const HOME_PREVIEW_WINDOW_SIZE = 18;
const HOME_PREVIEW_MIN_DOMAIN_PADDING = 10;
const HOME_PREVIEW_DOMAIN_PADDING_RATIO = 0.18;
const DESKTOP_ELO_CHART_MAX_TICKS = 8;
const MOBILE_ELO_CHART_MIN_WIDTH = 560;
const MOBILE_ELO_CHART_MAX_WIDTH = 780;
const MOBILE_ELO_CHART_BASE_WIDTH = 120;
const MOBILE_ELO_CHART_WIDTH_PER_POINT = 5;
const MOBILE_CHART_TAP_SLOP = 12;
const DESKTOP_ELO_TOOLTIP_CURSOR = {
  stroke: "rgba(245,204,128,0.16)",
} as const;
const HOME_MILESTONE_PRIORITY = [
  "Peak rating",
  "Biggest jump",
  "Worst dip",
  "Lowest point",
] as const;

export interface ChartEloPoint extends EloPoint {
  gameNumber: number;
}

export interface ChartTouchPoint {
  clientX: number;
  clientY: number;
}

export interface HomePreviewAnnotation {
  gameId: string;
  title: string;
  sequence: number;
  rating: number;
  tone: "current" | "milestone" | "windowPeak";
}

export interface HomePreviewWindow {
  points: EloPoint[];
  domain: [number, number];
  annotations: HomePreviewAnnotation[];
}

export interface EloChartMilestoneConfig {
  gameId: string;
  rating: number;
  title: string;
  label: string | null;
  position: "top" | "insideBottomLeft";
}

export interface EloChartConfig {
  enableHorizontalScroll: boolean;
  accessibilityLayer: boolean;
  showNativeTooltip: boolean;
  surfaceTabIndex?: number;
  surfaceFocusable?: boolean;
  tooltipCursor: false | { stroke: string };
  contentWidth: number | null;
  xAxisTickCount: number;
  yAxisWidth: number;
  tickFontSize: number;
  margin: {
    top: number;
    right: number;
    left: number;
    bottom: number;
  };
  milestoneLabelFontSize: number;
  milestoneDotRadius: number;
  milestones: EloChartMilestoneConfig[];
}

interface GetEloChartConfigOptions {
  pointCount: number;
  domain: [number, number];
  milestones: MilestonePoint[];
  isMobile?: boolean;
}

export function formatGameNumberTick(value: number | string): string {
  return `#${String(value)}`;
}

export function getResultColor(result: GameResult): string {
  if (result === "win") {
    return "#34d399";
  }

  if (result === "loss") {
    return "#fb7185";
  }

  return "#e5e7eb";
}

export function withChartGameNumbers(points: EloPoint[]): ChartEloPoint[] {
  return points.map((point, index) => ({
    ...point,
    gameNumber: index + 1,
  }));
}

export function isMobileChartTap(
  startPoint: ChartTouchPoint | null,
  endPoint: ChartTouchPoint | null,
): boolean {
  if (!startPoint || !endPoint) {
    return false;
  }

  return (
    Math.abs(endPoint.clientX - startPoint.clientX) <= MOBILE_CHART_TAP_SLOP &&
    Math.abs(endPoint.clientY - startPoint.clientY) <= MOBILE_CHART_TAP_SLOP
  );
}

export function getSelectedChartPoint(
  points: ChartEloPoint[],
  selectedGameId: string | null,
): ChartEloPoint | null {
  if (!selectedGameId) {
    return null;
  }

  return points.find((point) => point.gameId === selectedGameId) ?? null;
}

export function getRatingDomain(points: EloPoint[]): [number, number] {
  if (points.length === 0) {
    return [0, 1];
  }

  const ratings = points.map((point) => point.rating);
  const minRating = Math.min(...ratings);
  const maxRating = Math.max(...ratings);

  if (minRating === maxRating) {
    return [
      minRating - FLAT_RATING_DOMAIN_PADDING,
      maxRating + FLAT_RATING_DOMAIN_PADDING,
    ];
  }

  return [minRating, maxRating];
}

function getMobileEloChartWidth(pointCount: number): number {
  return Math.max(
    MOBILE_ELO_CHART_MIN_WIDTH,
    Math.min(
      MOBILE_ELO_CHART_MAX_WIDTH,
      MOBILE_ELO_CHART_BASE_WIDTH + pointCount * MOBILE_ELO_CHART_WIDTH_PER_POINT,
    ),
  );
}

export function getEloChartConfig({
  pointCount,
  milestones,
  isMobile = false,
}: GetEloChartConfigOptions): EloChartConfig {
  return {
    enableHorizontalScroll: isMobile,
    accessibilityLayer: !isMobile,
    showNativeTooltip: !isMobile,
    surfaceTabIndex: isMobile ? -1 : undefined,
    surfaceFocusable: isMobile ? false : undefined,
    tooltipCursor: isMobile ? false : DESKTOP_ELO_TOOLTIP_CURSOR,
    contentWidth: isMobile ? getMobileEloChartWidth(pointCount) : null,
    xAxisTickCount:
      pointCount > 1
        ? Math.min(DESKTOP_ELO_CHART_MAX_TICKS, pointCount)
        : 1,
    yAxisWidth: 52,
    tickFontSize: 11,
    margin: isMobile
      ? { top: 16, right: 18, left: 0, bottom: 4 }
      : { top: 16, right: 18, left: -18, bottom: 4 },
    milestoneLabelFontSize: 11,
    milestoneDotRadius: 5,
    milestones: milestones.map((milestone) => ({
      gameId: milestone.gameId,
      rating: milestone.rating,
      title: milestone.title,
      label: milestone.title,
      position: "top",
    })),
  };
}

export function getHomePreviewRatingDomain(points: EloPoint[]): [number, number] {
  if (points.length === 0) {
    return [0, 1];
  }

  const ratings = points.map((point) => point.rating);
  const minRating = Math.min(...ratings);
  const maxRating = Math.max(...ratings);

  if (minRating === maxRating) {
    return [
      minRating - HOME_PREVIEW_MIN_DOMAIN_PADDING,
      maxRating + HOME_PREVIEW_MIN_DOMAIN_PADDING,
    ];
  }

  const padding = Math.max(
    HOME_PREVIEW_MIN_DOMAIN_PADDING,
    Math.ceil((maxRating - minRating) * HOME_PREVIEW_DOMAIN_PADDING_RATIO),
  );

  return [minRating - padding, maxRating + padding];
}

function getMilestonePriority(title: string): number {
  const index = HOME_MILESTONE_PRIORITY.indexOf(
    title as (typeof HOME_MILESTONE_PRIORITY)[number],
  );

  return index === -1 ? HOME_MILESTONE_PRIORITY.length : index;
}

function getHomePreviewAnnotations(
  points: EloPoint[],
  milestones: MilestonePoint[] = [],
): HomePreviewAnnotation[] {
  if (points.length === 0) {
    return [];
  }

  const currentPoint = points.at(-1);

  if (!currentPoint) {
    return [];
  }

  const visibleGameIds = new Set(points.map((point) => point.gameId));
  const currentAnnotation: HomePreviewAnnotation = {
    gameId: currentPoint.gameId,
    title: "Current",
    sequence: currentPoint.sequence,
    rating: currentPoint.rating,
    tone: "current",
  };
  const visibleMilestone = milestones
    .filter(
      (milestone) =>
        milestone.gameId !== currentPoint.gameId &&
        visibleGameIds.has(milestone.gameId),
    )
    .sort((left, right) => {
      const priorityDifference =
        getMilestonePriority(left.title) - getMilestonePriority(right.title);

      if (priorityDifference !== 0) {
        return priorityDifference;
      }

      return left.sequence - right.sequence;
    })[0];

  if (visibleMilestone) {
    return [
      {
        gameId: visibleMilestone.gameId,
        title: visibleMilestone.title,
        sequence: visibleMilestone.sequence,
        rating: visibleMilestone.rating,
        tone: "milestone",
      },
      currentAnnotation,
    ];
  }

  const windowPeak = points
    .filter((point) => point.gameId !== currentPoint.gameId)
    .sort((left, right) => {
      if (right.rating !== left.rating) {
        return right.rating - left.rating;
      }

      return left.sequence - right.sequence;
    })[0];

  if (!windowPeak) {
    return [currentAnnotation];
  }

  return [
    {
      gameId: windowPeak.gameId,
      title: "Window peak",
      sequence: windowPeak.sequence,
      rating: windowPeak.rating,
      tone: "windowPeak",
    },
    currentAnnotation,
  ];
}

export function buildHomePreviewWindow(
  points: EloPoint[],
  milestones: MilestonePoint[] = [],
  windowSize = HOME_PREVIEW_WINDOW_SIZE,
): HomePreviewWindow {
  const recentPoints = points.slice(-windowSize);

  return {
    points: recentPoints,
    domain: getHomePreviewRatingDomain(recentPoints),
    annotations: getHomePreviewAnnotations(recentPoints, milestones),
  };
}
