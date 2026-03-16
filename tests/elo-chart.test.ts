import { describe, expect, it } from "vitest";

import {
  buildHomePreviewWindow,
  formatGameNumberTick,
  getHomePreviewRatingDomain,
  getRatingDomain,
  withChartGameNumbers,
} from "@/lib/insights-chart";
import type { EloPoint, MilestonePoint } from "@/types/chess";

function createPoint(overrides: Partial<EloPoint> = {}): EloPoint {
  return {
    gameId: overrides.gameId ?? "game-1",
    sequence: overrides.sequence ?? 1,
    date: overrides.date ?? "2026-03-15",
    rating: overrides.rating ?? 1200,
    delta: overrides.delta ?? null,
    result: overrides.result ?? "win",
    color: overrides.color ?? "white",
    opponent: overrides.opponent ?? "Opponent",
    timeControl: overrides.timeControl ?? "600",
    rollingAverage: overrides.rollingAverage ?? null,
  };
}

function createMilestone(
  overrides: Partial<MilestonePoint> = {},
): MilestonePoint {
  return {
    title: overrides.title ?? "Peak rating",
    description: overrides.description ?? "Highest point in the recent run.",
    gameId: overrides.gameId ?? "game-1",
    sequence: overrides.sequence ?? 1,
    date: overrides.date ?? "2026-03-15",
    rating: overrides.rating ?? 1200,
  };
}

describe("insights chart helpers", () => {
  it("formats x-axis ticks as game numbers", () => {
    expect(formatGameNumberTick(42)).toBe("#42");
  });

  it("assigns game numbers in visible time order", () => {
    const points = [
      createPoint({ gameId: "game-50", sequence: 50, date: "2026-01-04" }),
      createPoint({ gameId: "game-12", sequence: 12, date: "2026-01-05" }),
      createPoint({ gameId: "game-89", sequence: 89, date: "2026-01-06" }),
    ];

    expect(withChartGameNumbers(points).map((point) => point.gameNumber)).toEqual([
      1,
      2,
      3,
    ]);
  });

  it("uses the visible rating min/max for the y-axis domain", () => {
    const points = [
      createPoint({ gameId: "game-10", sequence: 10, rating: 1188 }),
      createPoint({ gameId: "game-22", sequence: 22, rating: 1246 }),
      createPoint({ gameId: "game-37", sequence: 37, rating: 1214 }),
    ];

    expect(getRatingDomain(points)).toEqual([1188, 1246]);
  });

  it("pads a flat rating series so the axis still has a usable range", () => {
    const points = [
      createPoint({ gameId: "game-7", sequence: 7, rating: 1200 }),
      createPoint({ gameId: "game-8", sequence: 8, rating: 1200 }),
    ];

    expect(getRatingDomain(points)).toEqual([1192, 1208]);
  });

  it("builds the home preview from the latest games and keeps the real sequence numbers", () => {
    const points = Array.from({ length: 20 }, (_, index) =>
      createPoint({
        gameId: `game-${index + 1}`,
        sequence: index + 55,
        date: `2026-03-${String(index + 1).padStart(2, "0")}`,
        rating: 1200 + index,
        rollingAverage: 1196 + index,
      }),
    );

    const preview = buildHomePreviewWindow(points, []);

    expect(preview.points).toHaveLength(18);
    expect(preview.points[0]?.sequence).toBe(57);
    expect(preview.points.at(-1)?.sequence).toBe(74);
    expect(preview.annotations.map((annotation) => annotation.title)).toEqual([
      "Window peak",
      "Current",
    ]);
  });

  it("adds breathing room to the home preview y-axis even for non-flat slices", () => {
    const points = [
      createPoint({ gameId: "game-10", sequence: 10, rating: 1188 }),
      createPoint({ gameId: "game-22", sequence: 22, rating: 1246 }),
      createPoint({ gameId: "game-37", sequence: 37, rating: 1214 }),
    ];

    expect(getHomePreviewRatingDomain(points)).toEqual([1177, 1257]);
  });

  it("prefers visible named milestones over a generic window-peak annotation", () => {
    const points = Array.from({ length: 18 }, (_, index) =>
      createPoint({
        gameId: `game-${index + 1}`,
        sequence: index + 102,
        date: `2026-03-${String(index + 1).padStart(2, "0")}`,
        rating: 1220 + index,
      }),
    );
    const milestonePoint = points[8];
    const preview = buildHomePreviewWindow(points, [
      createMilestone({
        gameId: milestonePoint?.gameId,
        sequence: milestonePoint?.sequence,
        date: milestonePoint?.date,
        rating: milestonePoint?.rating,
        title: "Biggest jump",
      }),
    ]);

    expect(preview.annotations.map((annotation) => annotation.title)).toEqual([
      "Biggest jump",
      "Current",
    ]);
  });
});
