import { execFile } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";

import {
  buildHighlightedGame,
  parseHighlightReadme,
  serializeHighlightManifest,
  sortHighlightedGames,
  type HighlightSpec,
  type HighlightReadmeEntry,
} from "@/lib/highlights";
import { parseSinglePgn } from "@/lib/pgn";
import type { HighlightedGame, NormalizedGame } from "@/types/chess";

const DEFAULT_SOURCE_ROOT = "/home/kevin/Documents/chess";

interface GameCandidate {
  filePath: string;
  stem: string;
  game: NormalizedGame;
  raw: string;
}

const execFileAsync = promisify(execFile);

function escapeForRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getHighlightSearchTerms(entry: HighlightReadmeEntry): string[] {
  const linkTerms = entry.links.flatMap((link) => {
    try {
      const url = new URL(link.href);
      const pathnameParts = url.pathname.split("/").filter(Boolean);
      const finalSegment = pathnameParts.at(-1);

      return [link.href, finalSegment ?? ""];
    } catch {
      return [link.href];
    }
  });

  return [
    entry.opponent,
    entry.date.replaceAll("-", "."),
    ...linkTerms,
  ].filter(Boolean);
}

async function resolveGamePathWithRg(
  sourceRoot: string,
  entry: HighlightReadmeEntry,
): Promise<string | null> {
  const gamesRoot = path.join(sourceRoot, "games");
  const searchTerms = getHighlightSearchTerms(entry);

  if (searchTerms.length === 0) {
    return null;
  }

  const pattern = searchTerms.map(escapeForRegExp).join("|");

  try {
    const { stdout } = await execFileAsync("rg", ["-l", pattern, gamesRoot], {
      cwd: sourceRoot,
    });
    const matches = stdout
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .filter((filePath) => filePath.endsWith(".pgn"))
      .filter(
        (filePath) =>
          !filePath.replaceAll("\\", "/").includes("/games/all/"),
      );

    return matches.sort((left, right) => left.localeCompare(right))[0] ?? null;
  } catch {
    return null;
  }
}

async function collectFiles(
  root: string,
  extension: string,
): Promise<string[]> {
  const entries = await fs.readdir(root, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(root, entry.name);

      if (entry.isDirectory()) {
        return collectFiles(entryPath, extension);
      }

      if (entry.isFile() && entry.name.endsWith(extension)) {
        return [entryPath];
      }

      return [];
    }),
  );

  return files.flat();
}

async function buildGameIndex(sourceRoot: string): Promise<GameCandidate[]> {
  const gamesRoot = path.join(sourceRoot, "games");
  const files = await collectFiles(gamesRoot, ".pgn");
  const candidates: GameCandidate[] = [];

  for (const filePath of files) {
    const normalizedPath = filePath.replaceAll("\\", "/");

    if (normalizedPath.includes("/games/all/")) {
      continue;
    }

    const raw = await fs.readFile(filePath, "utf8");
    const stem = path.basename(filePath, ".pgn");

    try {
      const game = parseSinglePgn(raw, {
        id: stem,
        sequence: candidates.length + 1,
      });

      candidates.push({
        filePath,
        stem,
        game,
        raw,
      });
    } catch {
      continue;
    }
  }

  return candidates;
}

function resolveGameCandidate(
  entry: HighlightReadmeEntry,
  candidates: GameCandidate[],
): GameCandidate {
  const matches = candidates.filter(
    (candidate) =>
      candidate.game.date === entry.date &&
      candidate.game.opponentName === entry.opponent,
  );

  if (matches.length === 0) {
    throw new Error(
      `Could not find a PGN for ${entry.opponent} on ${entry.date}.`,
    );
  }

  return matches.sort((left, right) => left.filePath.localeCompare(right.filePath))[0];
}

async function resolveAnalysisPath(
  sourceRoot: string,
  stem: string,
): Promise<string> {
  const directPath = path.join(sourceRoot, "analysis", `${stem}.md`);

  try {
    await fs.access(directPath);
    return directPath;
  } catch {
    // Fall back to a recursive basename search.
  }

  const files = await collectFiles(path.join(sourceRoot, "analysis"), ".md");
  const matches = files.filter((filePath) => path.basename(filePath, ".md") === stem);

  if (matches.length === 0) {
    throw new Error(`Could not find analysis markdown for ${stem}.`);
  }

  return matches.sort((left, right) => left.localeCompare(right))[0];
}

async function clearContentSnapshot(contentRoot: string): Promise<void> {
  await fs.mkdir(contentRoot, { recursive: true });
  const entries = await fs.readdir(contentRoot, { withFileTypes: true });

  await Promise.all(
    entries
      .filter((entry) => entry.isDirectory())
      .map((entry) =>
        fs.rm(path.join(contentRoot, entry.name), {
          recursive: true,
          force: true,
        }),
      ),
  );
}

function toHighlightSpec(entry: HighlightReadmeEntry): HighlightSpec {
  return {
    slug: entry.slug,
    title: entry.title,
    platform: entry.platform,
    resultLabel: entry.resultLabel,
    whyItMatters: entry.whyItMatters,
    links: entry.links,
  };
}

async function writeSnapshotAndDerivedData(
  root: string,
  sourceRoot: string,
  entries: HighlightReadmeEntry[],
  candidates: GameCandidate[],
): Promise<HighlightedGame[]> {
  const contentRoot = path.join(root, "content", "highlights");
  const outputDir = path.join(root, "data", "derived");
  const derivedHighlights: HighlightedGame[] = [];
  const manifestSpecs: HighlightSpec[] = [];

  await clearContentSnapshot(contentRoot);

  for (const [index, entry] of entries.entries()) {
    const rgResolvedPath = await resolveGamePathWithRg(sourceRoot, entry);
    const gameCandidate = rgResolvedPath
      ? candidates.find((candidate) => candidate.filePath === rgResolvedPath) ??
        (() => {
          throw new Error(
            `Resolved ${entry.opponent} to ${rgResolvedPath}, but it was not parseable as a PGN candidate.`,
          );
        })()
      : resolveGameCandidate(entry, candidates);

    const analysisPath = await resolveAnalysisPath(sourceRoot, gameCandidate.stem);
    const analysisRaw = await fs.readFile(analysisPath, "utf8");
    const spec = toHighlightSpec(entry);
    const normalizedGame = parseSinglePgn(gameCandidate.raw, {
      id: spec.slug,
      sequence: index + 1,
    });
    const targetDir = path.join(contentRoot, spec.slug);

    await fs.mkdir(targetDir, { recursive: true });
    await Promise.all([
      fs.copyFile(gameCandidate.filePath, path.join(targetDir, "game.pgn")),
      fs.copyFile(analysisPath, path.join(targetDir, "analysis.md")),
    ]);

    manifestSpecs.push(spec);
    derivedHighlights.push(
      buildHighlightedGame(spec, normalizedGame, analysisRaw),
    );
  }

  await fs.writeFile(
    path.join(contentRoot, "manifest.ts"),
    serializeHighlightManifest(manifestSpecs),
    "utf8",
  );

  await fs.mkdir(outputDir, { recursive: true });
  const sortedHighlights = sortHighlightedGames(derivedHighlights);

  await fs.writeFile(
    path.join(outputDir, "highlights.json"),
    JSON.stringify(sortedHighlights, null, 2),
    "utf8",
  );

  return sortedHighlights;
}

async function main(): Promise<void> {
  const root = process.cwd();
  const sourceRoot = process.env.CHESS_HIGHLIGHTS_ROOT ?? DEFAULT_SOURCE_ROOT;
  const readmePath = path.join(sourceRoot, "README.md");
  const readme = await fs.readFile(readmePath, "utf8");
  const entries = parseHighlightReadme(readme);

  if (entries.length === 0) {
    throw new Error("No highlight entries were found in the external README.");
  }

  const candidates = await buildGameIndex(sourceRoot);
  const highlights = await writeSnapshotAndDerivedData(
    root,
    sourceRoot,
    entries,
    candidates,
  );

  console.info(
    `Ingested ${highlights.length} highlights from ${sourceRoot}.`,
  );
}

void main();
