import { promises as fs } from "node:fs";
import path from "node:path";

import { HIGHLIGHT_SPECS } from "@/content/highlights/manifest";
import { buildInsightSummary, buildOpeningHighlights } from "@/lib/analytics";
import { buildHighlightedGame, sortHighlightedGames } from "@/lib/highlights";
import { PLAYER_IDENTITY } from "@/lib/identity";
import { parsePgnExport, parseSinglePgn } from "@/lib/pgn";
import type { HighlightedGame } from "@/types/chess";

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

async function main(): Promise<void> {
  const root = process.cwd();
  const sourcePath = path.join(root, "pgn", "chess_com_games_2026-03-15_combined.pgn");
  const outputDir = path.join(root, "data", "derived");
  const raw = await fs.readFile(sourcePath, "utf8");
  const parsed = parsePgnExport(raw);

  if (parsed.games.length === 0) {
    throw new Error("PGN ingest failed: no valid games were parsed.");
  }

  const highlights = await buildHighlights(root);
  const summary = buildInsightSummary(parsed.games);
  const openings = buildOpeningHighlights(parsed.games);

  await fs.mkdir(outputDir, { recursive: true });
  await Promise.all([
    fs.writeFile(
      path.join(outputDir, "games.json"),
      JSON.stringify(parsed.games, null, 2),
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

  for (const warning of parsed.warnings) {
    console.warn(warning);
  }

  console.info(
    `Ingested ${parsed.games.length} games for ${PLAYER_IDENTITY.displayName}.`,
  );
}

void main();
