import { cache } from "react";
import { promises as fs } from "node:fs";
import path from "node:path";

import type {
  DerivedSiteData,
  HighlightedGame,
  InsightSummary,
  NormalizedGame,
  OpeningSignature,
} from "@/types/chess";

const ROOT = process.cwd();
const DERIVED_DIR = path.join(ROOT, "data", "derived");

async function readJsonFile<T>(fileName: string): Promise<T> {
  const filePath = path.join(DERIVED_DIR, fileName);
  const raw = await fs.readFile(filePath, "utf8");

  return JSON.parse(raw) as T;
}

export const getGames = cache(async (): Promise<NormalizedGame[]> =>
  readJsonFile<NormalizedGame[]>("games.json"),
);

export const getSummary = cache(async (): Promise<InsightSummary> =>
  readJsonFile<InsightSummary>("summary.json"),
);

export const getOpenings = cache(async (): Promise<OpeningSignature[]> =>
  readJsonFile<OpeningSignature[]>("openings.json"),
);

export const getHighlightedGames = cache(async (): Promise<HighlightedGame[]> =>
  readJsonFile<HighlightedGame[]>("highlights.json"),
);

export const getSiteData = cache(async (): Promise<DerivedSiteData> => {
  const [games, summary, openings] = await Promise.all([
    getGames(),
    getSummary(),
    getOpenings(),
  ]);

  return {
    identity: summary.identity,
    games,
    summary,
    openings,
  };
});

export async function getGameById(gameId: string): Promise<NormalizedGame | null> {
  const games = await getGames();

  return games.find((game) => game.id === gameId) ?? null;
}

export async function getHighlightedGameBySlug(
  slug: string,
): Promise<HighlightedGame | null> {
  const highlights = await getHighlightedGames();

  return highlights.find((highlight) => highlight.slug === slug) ?? null;
}
