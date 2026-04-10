import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const { mockGames } = vi.hoisted(() => ({
  mockGames: [
    {
      id: "game-101",
      sequence: 101,
      date: "2026-03-15",
      platform: "chess-com",
      event: "Live Chess",
      site: "Chess.com",
      playerColor: "white",
      playerDisplayName: "Kevin Mok",
      playerUsername: "SoloPistol",
      opponentName: "Test Opponent",
      result: "win",
      playerRating: 1448,
      opponentRating: 1431,
      ratingDelta: 8,
      timeControl: "600+0",
      termination: "Normal",
      displayTermination: "Won by checkmate",
      sanMoves: ["e4", "e5", "Qh5"],
      fenByPly: ["startpos"],
      plyCount: 3,
      moveCount: 2,
      finalFen: "final-fen",
      endTime: "13:00:00",
      headers: {},
      openingSignature: "e4 e5 Qh5",
      openingLabel: "Wayward Queen Attack",
    },
  ],
}));

vi.mock("@/lib/data", () => ({
  getGames: vi.fn(() => Promise.resolve(mockGames)),
}));

vi.mock("@/components/insights/insights-filters", async () => {
  const { createElement } = await import("react");

  return {
    InsightsFilters: () =>
      createElement(
        "div",
        { "data-testid": "insights-filters" },
        "Elo Over Time filters",
      ),
  };
});

vi.mock("@/components/insights/elo-chart", async () => {
  const { createElement } = await import("react");

  return {
    EloChart: () =>
      createElement("div", { "data-testid": "elo-chart" }, "Elo chart"),
  };
});

import InsightsPage from "@/app/insights/page";

describe("InsightsPage", () => {
  it("keeps desktop DOM order while applying chart-first mobile ordering classes", async () => {
    const markup = renderToStaticMarkup(
      await InsightsPage({
        searchParams: Promise.resolve({}),
      }),
    );

    expect(markup).toMatch(
      /data-slot="insights-filters" class="[^"]*order-2[^"]*md:order-1[^"]*"/,
    );
    expect(markup).toMatch(
      /data-slot="insights-chart" class="[^"]*order-1[^"]*md:order-2[^"]*"/,
    );
    expect(markup.indexOf('data-slot="insights-filters"')).toBeLessThan(
      markup.indexOf('data-slot="insights-chart"'),
    );
  });
});
