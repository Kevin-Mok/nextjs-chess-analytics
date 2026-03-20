import { describe, expect, it } from "vitest";

import { parsePgnExport } from "@/lib/pgn";

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
});
