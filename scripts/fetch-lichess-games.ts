import { promises as fs } from "node:fs";
import path from "node:path";

const DEFAULT_LICHESS_API_URL =
  "https://lichess.org/api/games/user/SoloPistol?tags=true&clocks=true&evals=true&opening=true&literate=true";
const LICHESS_CACHE_RELATIVE_PATH = path.join(
  "data",
  "cache",
  "lichess_SoloPistol_latest.pgn",
);

async function hasCachedPgn(cachePath: string): Promise<boolean> {
  try {
    await fs.access(cachePath);
    return true;
  } catch {
    return false;
  }
}

async function main(): Promise<void> {
  const root = process.cwd();
  const apiUrl = process.env.LICHESS_GAMES_API_URL ?? DEFAULT_LICHESS_API_URL;
  const cachePath = path.join(root, LICHESS_CACHE_RELATIVE_PATH);
  const cacheExists = await hasCachedPgn(cachePath);

  try {
    const response = await fetch(apiUrl, {
      headers: {
        Accept: "application/x-chess-pgn",
      },
    });

    if (!response.ok) {
      throw new Error(`Lichess responded with ${response.status} ${response.statusText}.`);
    }

    const raw = (await response.text()).trim();

    if (!raw.includes("[Event ")) {
      throw new Error("Lichess returned an empty or invalid PGN export.");
    }

    await fs.mkdir(path.dirname(cachePath), { recursive: true });
    await fs.writeFile(cachePath, `${raw}\n`, "utf8");

    console.info(`Cached latest Lichess PGN at ${LICHESS_CACHE_RELATIVE_PATH}.`);
  } catch (error) {
    if (cacheExists) {
      const message =
        error instanceof Error ? error.message : "Unknown fetch error.";

      console.warn(
        `Lichess refresh failed (${message}) - reusing cached PGN at ${LICHESS_CACHE_RELATIVE_PATH}.`,
      );
      return;
    }

    throw error;
  }
}

void main();
