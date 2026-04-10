import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { buildInsightSummary, buildOpeningHighlights } from "@/lib/analytics";
import { PLAYER_IDENTITY } from "@/lib/identity";
import { parsePgnExport } from "@/lib/pgn";
import type { NormalizedGame } from "@/types/chess";

const fixture = readFileSync(
  path.join(process.cwd(), "pgn", "chess_com_games_2026-03-15_combined.pgn"),
  "utf8",
);

const CHESS_COM_MIXED_FIXTURE = `
[Event "Live Chess"]
[Site "Chess.com"]
[Date "2026.03.20"]
[White "SoloPistol"]
[Black "FastOpponent"]
[Result "1-0"]
[WhiteElo "1500"]
[BlackElo "1480"]
[TimeControl "600+5"]
[Termination "SoloPistol won by checkmate"]

1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 1-0

[Event "Live Chess"]
[Site "Chess.com"]
[Date "2026.03.21"]
[White "SoloPistol"]
[Black "SlowOpponent"]
[Result "0-1"]
[WhiteElo "1492"]
[BlackElo "1510"]
[TimeControl "600+5"]
[Termination "SlowOpponent won by resignation"]

1. d4 d5 2. c4 e6 3. Nc3 Nf6 0-1
`.trim();

const LICHESS_MIXED_FIXTURE = `
[Event "rated rapid game"]
[Site "https://lichess.org/example123"]
[Date "2026.03.22"]
[White "SoloPistol"]
[Black "LichessOne"]
[Result "1-0"]
[WhiteElo "1012"]
[BlackElo "1005"]
[TimeControl "600+0"]
[Termination "Normal"]

1. e4 { [%eval 0.2] [%clk 0:10:00] } 1... c5 { [%clk 0:10:00] } 2. Nf3 { [%clk 0:09:59] } 2... d6 { [%clk 0:09:58] } 1-0

[Event "rated rapid game"]
[Site "https://lichess.org/example456"]
[Date "2026.03.23"]
[White "LichessTwo"]
[Black "SoloPistol"]
[Result "0-1"]
[WhiteElo "1014"]
[BlackElo "1020"]
[TimeControl "600+0"]
[Termination "Normal"]

1. d4 { [%clk 0:10:00] } 1... Nf6 { [%clk 0:10:00] } 2. c4 { [%clk 0:09:55] } 2... e6 { [%clk 0:09:57] } 0-1
`.trim();

function combineGames(...groups: NormalizedGame[][]): NormalizedGame[] {
  return groups
    .flat()
    .sort((left, right) => {
      if (left.date === right.date) {
        return left.sequence - right.sequence;
      }

      return left.date.localeCompare(right.date);
    })
    .map((game, index) => ({
      ...game,
      id: `${game.platform}-${index + 1}`,
      sequence: index + 1,
    }));
}

describe("PGN ingest pipeline", () => {
  const parsed = parsePgnExport(fixture);
  const summary = buildInsightSummary(parsed.games);

  it("parses every game in the export", () => {
    expect(parsed.warnings).toEqual([
      "Skipped game 122: TimeControl 300 is below the 600-second minimum.",
    ]);
    expect(parsed.games).toHaveLength(124);
  });

  it("maps the public player identity to Kevin Mok", () => {
    expect(parsed.games[0]?.playerDisplayName).toBe(PLAYER_IDENTITY.displayName);
    expect(parsed.games[0]?.playerUsername).toBe(PLAYER_IDENTITY.sourceUsername);
    expect(parsed.games.some((game) => game.displayTermination.includes("SoloPistol"))).toBe(false);
  });

  it("derives the expected result record", () => {
    expect(summary.record).toEqual({
      wins: 64,
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

  it("keeps rating pools separate for Chess.com and Lichess summaries", () => {
    const chessGames = parsePgnExport(CHESS_COM_MIXED_FIXTURE).games;
    const lichessGames = parsePgnExport(LICHESS_MIXED_FIXTURE).games;
    const mixedSummary = buildInsightSummary(combineGames(chessGames, lichessGames));

    expect(mixedSummary.record).toEqual({
      wins: 3,
      losses: 1,
      draws: 0,
    });
    expect(mixedSummary.ratingPlatforms.map((platform) => platform.platform)).toEqual([
      "chess-com",
      "lichess",
    ]);
    expect(mixedSummary.ratingPlatforms).toEqual([
      expect.objectContaining({
        platform: "chess-com",
        currentRating: 1492,
        peakRating: 1500,
        netRatingChange: -8,
      }),
      expect.objectContaining({
        platform: "lichess",
        currentRating: 1020,
        peakRating: 1020,
        netRatingChange: 8,
      }),
    ]);
    expect(
      mixedSummary.ratingPlatforms.every(
        (platform) =>
          platform.eloSeries.every((point) => point.platform === platform.platform),
      ),
    ).toBe(true);
  });
});
