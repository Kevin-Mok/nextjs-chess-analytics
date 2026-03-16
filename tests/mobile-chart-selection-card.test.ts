import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { MobilePinnedGameCard } from "@/components/insights/elo-chart";
import type { ChartEloPoint } from "@/lib/insights-chart";

function createChartPoint(overrides: Partial<ChartEloPoint> = {}): ChartEloPoint {
  return {
    gameId: overrides.gameId ?? "game-9",
    gameNumber: overrides.gameNumber ?? 9,
    sequence: overrides.sequence ?? 9,
    date: overrides.date ?? "2026-02-14",
    rating: overrides.rating ?? 332,
    delta: overrides.delta ?? 26,
    result: overrides.result ?? "win",
    color: overrides.color ?? "white",
    opponent: overrides.opponent ?? "LEO-2232",
    timeControl: overrides.timeControl ?? "900+10",
    rollingAverage: overrides.rollingAverage ?? 328,
  };
}

describe("MobilePinnedGameCard", () => {
  it("renders the empty mobile prompt when no point is selected", () => {
    const html = renderToStaticMarkup(
      createElement(MobilePinnedGameCard, {
        point: null,
      }),
    );

    expect(html).toContain("Tap a point to inspect a game.");
    expect(html).not.toContain("Open game");
  });

  it("renders the selected game details and CTA", () => {
    const html = renderToStaticMarkup(
      createElement(MobilePinnedGameCard, {
        point: createChartPoint(),
      }),
    );

    expect(html).toContain("332");
    expect(html).toContain("Game #9");
    expect(html).toContain("LEO-2232");
    expect(html).toContain("Open game");
    expect(html).toContain('href="/games/game-9"');
  });
});
