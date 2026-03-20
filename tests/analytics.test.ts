import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { buildInsightSummary, buildOpeningHighlights } from "@/lib/analytics";
import { PLAYER_IDENTITY } from "@/lib/identity";
import { parsePgnExport } from "@/lib/pgn";

const fixture = readFileSync(
  path.join(process.cwd(), "pgn", "chess_com_games_2026-03-15_combined.pgn"),
  "utf8",
);

describe("PGN ingest pipeline", () => {
  const parsed = parsePgnExport(fixture);
  const summary = buildInsightSummary(parsed.games);

  it("parses every game in the export", () => {
    expect(parsed.warnings).toHaveLength(0);
    expect(parsed.games).toHaveLength(125);
  });

  it("maps the public player identity to Kevin Mok", () => {
    expect(parsed.games[0]?.playerDisplayName).toBe(PLAYER_IDENTITY.displayName);
    expect(parsed.games[0]?.playerUsername).toBe(PLAYER_IDENTITY.sourceUsername);
    expect(parsed.games.some((game) => game.displayTermination.includes("SoloPistol"))).toBe(false);
  });

  it("derives the expected result record", () => {
    expect(summary.record).toEqual({
      wins: 65,
      losses: 54,
      draws: 6,
    });
    expect(summary.mostCommonTimeControl).toBe("900+10");
  });

  it("builds a rating series with rolling data and milestone coverage", () => {
    expect(summary.eloSeries.length).toBeGreaterThan(100);
    expect(summary.eloSeries.some((point) => point.rollingAverage !== null)).toBe(true);
    expect(summary.eloSeries[0]?.opponent).toBe("bosevasanth");
    expect(
      summary.eloSeries.every(
        (point) => point.date > "2026-02-13" || (point.date === "2026-02-13" && point.sequence >= 55),
      ),
    ).toBe(true);
    expect(summary.milestonePoints.some((point) => point.title === "Peak rating")).toBe(true);
  });

  it("creates repeatable opening signatures", () => {
    const openings = buildOpeningHighlights(parsed.games);

    expect(openings[0]?.count).toBeGreaterThan(1);
    expect(openings[0]?.label.length).toBeGreaterThan(0);
  });
});
