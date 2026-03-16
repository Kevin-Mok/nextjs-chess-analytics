import { format, parseISO, subDays } from "date-fns";

import { clamp } from "@/lib/utils";
import type { GameResult, NormalizedGame, PlayerColor } from "@/types/chess";

export const GAME_PAGE_SIZE = 24;

export type GameColorFilter = "all" | PlayerColor;
export type GameResultFilter = "all" | GameResult;
export type GameSortMode =
  | "date-desc"
  | "date-asc"
  | "rating-desc"
  | "rating-asc";
export type InsightRange = "all" | "30d" | "90d";

export interface GameFilterInput {
  query?: string;
  color?: GameColorFilter;
  result?: GameResultFilter;
  timeControl?: string;
  startDate?: string | null;
  endDate?: string | null;
}

export interface GameFilterOptions {
  timeControls: string[];
  minDate: string | null;
  maxDate: string | null;
}

export interface PaginationResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
}

function compareDateWithSequence(
  left: Pick<NormalizedGame, "date" | "sequence">,
  right: Pick<NormalizedGame, "date" | "sequence">,
): number {
  if (left.date !== right.date) {
    return left.date.localeCompare(right.date);
  }

  return left.sequence - right.sequence;
}

function compareNullableNumbers(
  left: number | null,
  right: number | null,
  direction: "asc" | "desc",
): number {
  if (left === null && right === null) {
    return 0;
  }

  if (left === null) {
    return 1;
  }

  if (right === null) {
    return -1;
  }

  return direction === "asc" ? left - right : right - left;
}

export function filterGames(
  games: NormalizedGame[],
  filters: GameFilterInput,
): NormalizedGame[] {
  const query = filters.query?.trim().toLowerCase() ?? "";
  const color = filters.color ?? "all";
  const result = filters.result ?? "all";
  const timeControl = filters.timeControl ?? "all";
  const startDate = filters.startDate ?? null;
  const endDate = filters.endDate ?? null;

  return games.filter((game) => {
    if (color !== "all" && game.playerColor !== color) {
      return false;
    }

    if (result !== "all" && game.result !== result) {
      return false;
    }

    if (timeControl !== "all" && game.timeControl !== timeControl) {
      return false;
    }

    if (startDate !== null && game.date < startDate) {
      return false;
    }

    if (endDate !== null && game.date > endDate) {
      return false;
    }

    if (query.length === 0) {
      return true;
    }

    const searchableText = [
      game.opponentName,
      game.openingLabel,
      game.displayTermination,
      game.termination,
    ]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(query);
  });
}

export function sortGames(
  games: NormalizedGame[],
  sortMode: GameSortMode = "date-desc",
): NormalizedGame[] {
  const sorted = [...games];

  sorted.sort((left, right) => {
    if (sortMode === "date-asc") {
      return compareDateWithSequence(left, right);
    }

    if (sortMode === "date-desc") {
      return compareDateWithSequence(right, left);
    }

    if (sortMode === "rating-asc") {
      const comparison = compareNullableNumbers(
        left.playerRating,
        right.playerRating,
        "asc",
      );

      return comparison !== 0 ? comparison : compareDateWithSequence(right, left);
    }

    const comparison = compareNullableNumbers(
      left.playerRating,
      right.playerRating,
      "desc",
    );

    return comparison !== 0 ? comparison : compareDateWithSequence(right, left);
  });

  return sorted;
}

export function paginateGames<T>(
  items: T[],
  page: number,
  pageSize: number = GAME_PAGE_SIZE,
): PaginationResult<T> {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = clamp(page, 1, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  return {
    items: items.slice(startIndex, endIndex),
    page: safePage,
    pageSize,
    totalItems,
    totalPages,
    startIndex: totalItems === 0 ? 0 : startIndex + 1,
    endIndex,
  };
}

export function deriveGameFilterOptions(
  games: NormalizedGame[],
): GameFilterOptions {
  const counts = new Map<string, number>();

  for (const game of games) {
    counts.set(game.timeControl, (counts.get(game.timeControl) ?? 0) + 1);
  }

  const timeControls = [...counts.entries()]
    .sort((left, right) => {
      if (left[1] !== right[1]) {
        return right[1] - left[1];
      }

      return left[0].localeCompare(right[0]);
    })
    .map(([label]) => label);

  return {
    timeControls,
    minDate: games[0]?.date ?? null,
    maxDate: games.at(-1)?.date ?? null,
  };
}

export function getDateRangeForInsightWindow(
  games: NormalizedGame[],
  range: InsightRange,
): Pick<GameFilterInput, "startDate" | "endDate"> {
  if (range === "all") {
    return {
      startDate: null,
      endDate: null,
    };
  }

  const latestDate = games.at(-1)?.date;

  if (!latestDate) {
    return {
      startDate: null,
      endDate: null,
    };
  }

  const latest = parseISO(latestDate);
  const days = range === "30d" ? 29 : 89;

  return {
    startDate: format(subDays(latest, days), "yyyy-MM-dd"),
    endDate: latestDate,
  };
}
