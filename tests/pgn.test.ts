import { describe, expect, it } from "vitest";

import { parsePgnExport, sortGamesByChronology } from "@/lib/pgn";

const EXPORT_FIXTURE = `
[Event "Live Chess"]
[Site "Chess.com"]
[Date "2026.03.20"]
[White "SoloPistol"]
[Black "FastOpponent"]
[Result "1-0"]
[WhiteElo "1500"]
[BlackElo "1480"]
[TimeControl "300+5"]
[Termination "SoloPistol won by checkmate"]

1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 1-0

[Event "Live Chess"]
[Site "Chess.com"]
[Date "2026.03.20"]
[White "SoloPistol"]
[Black "SlowOpponent"]
[Result "1-0"]
[WhiteElo "1505"]
[BlackElo "1495"]
[TimeControl "600+5"]
[Termination "SoloPistol won by checkmate"]

1. d4 d5 2. c4 e6 3. Nc3 Nf6 1-0
`.trim();

const LICHESS_EXPORT_FIXTURE = `
[Event "rated rapid game"]
[Site "https://lichess.org/example123"]
[Date "2026.03.22"]
[UTCDate "2026.03.22"]
[UTCTime "12:10:34"]
[White "SoloPistol"]
[Black "Opponent"]
[Result "1-0"]
[WhiteElo "1012"]
[BlackElo "1005"]
[TimeControl "600+0"]
[Termination "Normal"]

1. e4 { [%eval 0.2] [%clk 0:10:00] } 1... c5 { [%clk 0:10:00] } 2. Nf3 { [%clk 0:09:59] } 2... d6 { [%clk 0:09:58] } 1-0
`.trim();

const CHESS_COM_SAME_DAY_FIXTURE = `
[Event "Live Chess"]
[Site "Chess.com"]
[Date "2026.03.22"]
[White "SoloPistol"]
[Black "LaterOpponent"]
[Result "1-0"]
[WhiteElo "1500"]
[BlackElo "1480"]
[TimeControl "600+5"]
[EndTime "15:13:18 GMT+0000"]
[Termination "SoloPistol won by checkmate"]

1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 1-0
`.trim();

describe("parsePgnExport", () => {
  it("skips games whose base time control is below 600 seconds", () => {
    const parsed = parsePgnExport(EXPORT_FIXTURE);

    expect(parsed.games).toHaveLength(1);
    expect(parsed.games[0]?.opponentName).toBe("SlowOpponent");
    expect(parsed.games[0]?.timeControl).toBe("600+5");
    expect(parsed.warnings).toContain(
      "Skipped game 1: TimeControl 300+5 is below the 600-second minimum.",
    );
  });

  it("tags Lichess games with their platform while keeping annotated PGNs parseable", () => {
    const parsed = parsePgnExport(LICHESS_EXPORT_FIXTURE);

    expect(parsed.warnings).toEqual([]);
    expect(parsed.games).toHaveLength(1);
    expect(parsed.games[0]).toMatchObject({
      platform: "lichess",
      site: "https://lichess.org/example123",
      timeControl: "600+0",
      sanMoves: ["e4", "c5", "Nf3", "d6"],
    });
  });

  it("orders same-day mixed-source games by their available timestamps", () => {
    const chessGames = parsePgnExport(CHESS_COM_SAME_DAY_FIXTURE).games;
    const lichessGames = parsePgnExport(LICHESS_EXPORT_FIXTURE).games;

    expect(
      sortGamesByChronology([...chessGames, ...lichessGames]).map((game) => game.opponentName),
    ).toEqual(["Opponent", "LaterOpponent"]);
  });
});
