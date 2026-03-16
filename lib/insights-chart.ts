import type { EloPoint } from "@/types/chess";

const FLAT_RATING_DOMAIN_PADDING = 8;

export interface ChartEloPoint extends EloPoint {
  gameNumber: number;
}

export function formatGameNumberTick(value: number | string): string {
  return `#${String(value)}`;
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
