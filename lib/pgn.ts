import { Chess } from "chess.js";
import { format, parse } from "date-fns";
import { z } from "zod";

import { PLAYER_IDENTITY, replaceDisplayIdentity } from "@/lib/identity";
import type { GameResult, NormalizedGame, PlayerColor } from "@/types/chess";

const headerSchema = z.object({
  Event: z.string().default("Live Chess"),
  Site: z.string().default("Chess.com"),
  Date: z.string(),
  White: z.string(),
  Black: z.string(),
  Result: z.enum(["1-0", "0-1", "1/2-1/2"]),
  WhiteElo: z.string().optional(),
  BlackElo: z.string().optional(),
  TimeControl: z.string().optional(),
  Termination: z.string().optional(),
  EndTime: z.string().optional(),
});

function normalizeDate(raw: string): string {
  return format(parse(raw, "yyyy.MM.dd", new Date()), "yyyy-MM-dd");
}

function getPlayerColor(headers: z.infer<typeof headerSchema>): PlayerColor {
  if (headers.White === PLAYER_IDENTITY.sourceUsername) {
    return "white";
  }

  if (headers.Black === PLAYER_IDENTITY.sourceUsername) {
    return "black";
  }

  throw new Error("Player identity missing from PGN headers.");
}

function getGameResult(
  color: PlayerColor,
  result: z.infer<typeof headerSchema>["Result"],
): GameResult {
  if (result === "1/2-1/2") {
    return "draw";
  }

  if ((result === "1-0" && color === "white") || (result === "0-1" && color === "black")) {
    return "win";
  }

  return "loss";
}

function getOpeningLabel(moves: string[]): string {
  const signature = moves.slice(0, 6);

  if (signature.length === 0) {
    return "No opening data";
  }

  if (signature[0] === "e4" && signature[1] === "e5" && signature[2] === "Nf3" && signature[3] === "Nc6") {
    return "Open Game shell";
  }

  if (signature[0] === "d4" && signature[1] === "d5" && signature[2] === "c4") {
    return "Queen's Gambit shape";
  }

  if (signature[0] === "e4" && signature[1] === "c5") {
    return "Sicilian shape";
  }

  if (signature[0] === "e4" && signature[1] === "e6") {
    return "French shape";
  }

  if (signature[0] === "e4" && signature[1] === "c6") {
    return "Caro-Kann shape";
  }

  if (signature[0] === "d4" && signature[1] === "Nf6" && signature[2] === "c4" && signature[3] === "g6") {
    return "King's Indian shape";
  }

  return `Signature: ${signature.join(" ")}`;
}

function safeNumber(value?: string): number | null {
  if (!value || value === "?") {
    return null;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : null;
}

function buildFenTimeline(moves: string[]): { fenByPly: string[]; finalFen: string } {
  const replay = new Chess();
  const fenByPly: string[] = [replay.fen()];

  for (const move of moves) {
    replay.move(move);
    fenByPly.push(replay.fen());
  }

  return {
    fenByPly,
    finalFen: replay.fen(),
  };
}

function sanitizePgnBlock(block: string): string {
  let sanitized = block
    .split("\n")
    .filter((line) => !/^https?:\/\/\S+$/.test(line.trim()))
    .join("\n")
    .replace(/\{[^}]*\}/g, " ")
    .replace(/\$\d+/g, " ");

  while (/\([^()]*\)/.test(sanitized)) {
    sanitized = sanitized.replace(/\([^()]*\)/g, " ");
  }

  return sanitized.trim();
}

export interface ParseResult {
  games: NormalizedGame[];
  warnings: string[];
}

interface NormalizePgnOptions {
  id: string;
  sequence: number;
}

const MINIMUM_INGEST_TIME_CONTROL_SECONDS = 600;

function getPgnBlocks(raw: string): string[] {
  return raw
    .split(/(?=\[Event )/g)
    .map((block) => block.trim())
    .filter(Boolean);
}

function getBaseTimeControlSeconds(value: string): number | null {
  const [base] = value.split("+");
  const parsed = Number(base);

  return Number.isFinite(parsed) ? parsed : null;
}

function normalizePgnBlock(
  block: string,
  options: NormalizePgnOptions,
): NormalizedGame {
  const chess = new Chess();
  chess.loadPgn(sanitizePgnBlock(block));
  const parsedHeaders = headerSchema.parse(chess.getHeaders());
  const playerColor = getPlayerColor(parsedHeaders);
  const sanMoves = chess.history();
  const { fenByPly, finalFen } = buildFenTimeline(sanMoves);
  const result = getGameResult(playerColor, parsedHeaders.Result);
  const openingMoves = sanMoves.slice(0, 6);

  return {
    id: options.id,
    sequence: options.sequence,
    date: normalizeDate(parsedHeaders.Date),
    event: parsedHeaders.Event,
    site: parsedHeaders.Site,
    playerColor,
    playerDisplayName: PLAYER_IDENTITY.displayName,
    playerUsername: PLAYER_IDENTITY.sourceUsername,
    opponentName:
      playerColor === "white" ? parsedHeaders.Black : parsedHeaders.White,
    result,
    playerRating:
      playerColor === "white"
        ? safeNumber(parsedHeaders.WhiteElo)
        : safeNumber(parsedHeaders.BlackElo),
    opponentRating:
      playerColor === "white"
        ? safeNumber(parsedHeaders.BlackElo)
        : safeNumber(parsedHeaders.WhiteElo),
    ratingDelta: null,
    timeControl: parsedHeaders.TimeControl ?? "Unknown",
    termination: parsedHeaders.Termination ?? "Unknown termination",
    displayTermination: replaceDisplayIdentity(
      parsedHeaders.Termination ?? "Unknown termination",
    ),
    sanMoves,
    fenByPly,
    plyCount: sanMoves.length,
    moveCount: Math.ceil(sanMoves.length / 2),
    finalFen,
    endTime: parsedHeaders.EndTime ?? null,
    headers: parsedHeaders,
    openingSignature: openingMoves.join(" "),
    openingLabel: getOpeningLabel(openingMoves),
  };
}

function finalizeParsedGames(games: NormalizedGame[]): NormalizedGame[] {
  const sortedGames = [...games].sort((left, right) => {
    if (left.date === right.date) {
      return left.sequence - right.sequence;
    }

    return left.date.localeCompare(right.date);
  });

  let previousRating: number | null = null;
  for (const game of sortedGames) {
    game.ratingDelta =
      game.playerRating !== null && previousRating !== null
        ? game.playerRating - previousRating
        : null;

    if (game.playerRating !== null) {
      previousRating = game.playerRating;
    }
  }

  return sortedGames;
}

export function parsePgnExport(raw: string): ParseResult {
  const warnings: string[] = [];
  const blocks = getPgnBlocks(raw);

  const games: NormalizedGame[] = [];

  for (const [index, block] of blocks.entries()) {
    try {
      const sequence = index + 1;
      const game = normalizePgnBlock(block, {
        id: `game-${sequence}`,
        sequence,
      });
      const baseTimeControlSeconds = getBaseTimeControlSeconds(game.timeControl);

      if (
        baseTimeControlSeconds !== null &&
        baseTimeControlSeconds < MINIMUM_INGEST_TIME_CONTROL_SECONDS
      ) {
        warnings.push(
          `Skipped game ${sequence}: TimeControl ${game.timeControl} is below the ${MINIMUM_INGEST_TIME_CONTROL_SECONDS}-second minimum.`,
        );
        continue;
      }

      games.push(game);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown parsing error";
      warnings.push(`Skipped game ${index + 1}: ${message}`);
    }
  }

  return {
    games: finalizeParsedGames(games),
    warnings,
  };
}

export function parseSinglePgn(
  raw: string,
  options: NormalizePgnOptions,
): NormalizedGame {
  const [firstBlock] = getPgnBlocks(raw);

  if (!firstBlock) {
    throw new Error("PGN ingest failed: no valid games were parsed.");
  }

  return normalizePgnBlock(firstBlock, options);
}
