import { promises as fs } from "node:fs";
import path from "node:path";

import { HIGHLIGHT_SPECS } from "@/content/highlights/manifest";
import { buildInsightSummary, buildOpeningHighlights } from "@/lib/analytics";
import { buildHighlightedGame, sortHighlightedGames } from "@/lib/highlights";
import { PLAYER_IDENTITY } from "@/lib/identity";
import { parsePgnExport, parseSinglePgn, sortGamesByChronology } from "@/lib/pgn";
import type { HighlightedGame } from "@/types/chess";

const CHESS_COM_SOURCE_RELATIVE_PATH = path.join(
  "pgn",
  "chess_com_games_2026-03-15_combined.pgn",
);
const LICHESS_CACHE_RELATIVE_PATH = path.join(
  "data",
  "cache",
  "lichess_SoloPistol_latest.pgn",
);

async function buildHighlights(root: string): Promise<HighlightedGame[]> {
  const highlightsRoot = path.join(root, "content", "highlights");
  const highlights = await Promise.all(
    HIGHLIGHT_SPECS.map(async (spec, index) => {
      const sourceDir = path.join(highlightsRoot, spec.slug);
      const [pgnRaw, analysisRaw] = await Promise.all([
        fs.readFile(path.join(sourceDir, "game.pgn"), "utf8"),
        fs.readFile(path.join(sourceDir, "analysis.md"), "utf8"),
      ]);
      const game = parseSinglePgn(pgnRaw, {
        id: spec.slug,
        sequence: index + 1,
      });

      return buildHighlightedGame(spec, game, analysisRaw);
    }),
  );

  return sortHighlightedGames(highlights);
}

async function readOptionalFile(filePath: string): Promise<string | null> {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }

    throw error;
  }
}

async function main(): Promise<void> {
  const root = process.cwd();
  const chessComSourcePath = path.join(root, CHESS_COM_SOURCE_RELATIVE_PATH);
  const lichessSourcePath = path.join(root, LICHESS_CACHE_RELATIVE_PATH);
  const outputDir = path.join(root, "data", "derived");
  const chessComRaw = await fs.readFile(chessComSourcePath, "utf8");
  const lichessRaw = await readOptionalFile(lichessSourcePath);
  const chessComParsed = parsePgnExport(chessComRaw);
  const lichessParsed = lichessRaw ? parsePgnExport(lichessRaw) : { games: [], warnings: [] };
  const parsedGames = sortGamesByChronology(
    [...chessComParsed.games, ...lichessParsed.games]
    .map((game) => ({
      ...game,
      id: `${game.platform}-${game.id}`,
    }))
  )
    .map((game, index) => ({
      ...game,
      sequence: index + 1,
    }));
  const warnings = [
    ...chessComParsed.warnings.map((warning) => `Chess.com: ${warning}`),
    ...lichessParsed.warnings.map((warning) => `Lichess: ${warning}`),
  ];

  if (parsedGames.length === 0) {
    throw new Error("PGN ingest failed: no valid games were parsed.");
  }

  const highlights = await buildHighlights(root);
  const summary = buildInsightSummary(parsedGames);
  const openings = buildOpeningHighlights(parsedGames);

  await fs.mkdir(outputDir, { recursive: true });
  await Promise.all([
    fs.writeFile(
      path.join(outputDir, "games.json"),
      JSON.stringify(parsedGames, null, 2),
      "utf8",
    ),
    fs.writeFile(
      path.join(outputDir, "summary.json"),
      JSON.stringify(summary, null, 2),
      "utf8",
    ),
    fs.writeFile(
      path.join(outputDir, "openings.json"),
      JSON.stringify(openings, null, 2),
      "utf8",
    ),
    fs.writeFile(
      path.join(outputDir, "highlights.json"),
      JSON.stringify(highlights, null, 2),
      "utf8",
    ),
  ]);

  if (!lichessRaw) {
    console.warn(
      `Lichess cache missing at ${LICHESS_CACHE_RELATIVE_PATH}; building from Chess.com history only.`,
    );
  }

  for (const warning of warnings) {
    console.warn(warning);
  }

  console.info(
    `Ingested ${parsedGames.length} games across Chess.com and Lichess for ${PLAYER_IDENTITY.displayName}.`,
  );
}

void main();
