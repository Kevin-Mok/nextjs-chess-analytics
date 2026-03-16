import type { NormalizedGame, PlayerColor } from "@/types/chess";

const PIECE_VALUES: Record<string, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
};

export interface MaterialBalancePoint {
  ply: number;
  value: number;
}

function getMaterialBalanceFromFen(fen: string, playerColor: PlayerColor): number {
  const board = fen.split(" ")[0] ?? "";
  let whiteTotal = 0;
  let blackTotal = 0;

  for (const symbol of board) {
    const normalized = symbol.toLowerCase();

    if (!(normalized in PIECE_VALUES)) {
      continue;
    }

    if (symbol === normalized) {
      blackTotal += PIECE_VALUES[normalized];
    } else {
      whiteTotal += PIECE_VALUES[normalized];
    }
  }

  return playerColor === "white"
    ? whiteTotal - blackTotal
    : blackTotal - whiteTotal;
}

export function buildMaterialBalanceSeries(
  game: Pick<NormalizedGame, "fenByPly" | "playerColor">,
): MaterialBalancePoint[] {
  return game.fenByPly.map((fen, ply) => ({
    ply,
    value: getMaterialBalanceFromFen(fen, game.playerColor),
  }));
}
