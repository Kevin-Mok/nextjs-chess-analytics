import type { EloPoint, GameResult, MilestonePoint } from "@/types/chess";

const FLAT_RATING_DOMAIN_PADDING = 8;
const HOME_PREVIEW_WINDOW_SIZE = 18;
const HOME_PREVIEW_MIN_DOMAIN_PADDING = 10;
const HOME_PREVIEW_DOMAIN_PADDING_RATIO = 0.18;
const HOME_MILESTONE_PRIORITY = [
  "Peak rating",
  "Biggest jump",
  "Worst dip",
  "Lowest point",
] as const;

export interface ChartEloPoint extends EloPoint {
  gameNumber: number;
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
