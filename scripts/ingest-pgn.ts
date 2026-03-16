import { promises as fs } from "node:fs";
import path from "node:path";

import { buildInsightSummary, buildOpeningHighlights } from "@/lib/analytics";
import { PLAYER_IDENTITY } from "@/lib/identity";
import { parsePgnExport } from "@/lib/pgn";

async function main(): Promise<void> {
  const root = process.cwd();
  const sourcePath = path.join(root, "pgn", "chess_com_games_2026-03-15_combined.pgn");
  const outputDir = path.join(root, "data", "derived");
  const raw = await fs.readFile(sourcePath, "utf8");
  const parsed = parsePgnExport(raw);

  if (parsed.games.length === 0) {
    throw new Error("PGN ingest failed: no valid games were parsed.");
  }

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
  ]);

  for (const warning of parsed.warnings) {
    console.warn(warning);
  }

  console.info(
    `Ingested ${parsed.games.length} games for ${PLAYER_IDENTITY.displayName}.`,
  );
}

void main();
