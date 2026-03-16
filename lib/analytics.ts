import { format } from "date-fns";

import type {
  EloPoint,
  HeatmapCell,
  InsightSummary,
  MilestonePoint,
  NormalizedGame,
  OpeningSignature,
  RecentFormSummary,
  RecordSplit,
  ResultBreakdown,
  SpotlightGame,
  StreakSummary,
  TerminationBreakdown,
  TimeControlBreakdown,
} from "@/types/chess";
import { PLAYER_IDENTITY } from "@/lib/identity";
import { average, rollingAverage } from "@/lib/utils";

const INSIGHT_RATING_BASELINE = {
  date: "2026-02-13",
  sequence: 55,
} as const;

function getBreakdown(games: NormalizedGame[]): ResultBreakdown {
  return games.reduce<ResultBreakdown>(
    (record, game) => {
      if (game.result === "win") {
        record.wins += 1;
      } else if (game.result === "loss") {
        record.losses += 1;
      } else {
        record.draws += 1;
      }

      return record;
    },
    {
      wins: 0,
      losses: 0,
      draws: 0,
    },
  );
}

function withWinRate(record: ResultBreakdown): RecordSplit {
  const total = record.wins + record.losses + record.draws;

  return {
    ...record,
    winRate: total === 0 ? 0 : (record.wins / total) * 100,
  };
}

function getLongestStreak(
  games: NormalizedGame[],
  type: "win" | "loss",
): StreakSummary | null {
  let best: StreakSummary | null = null;
  let currentLength = 0;
  let currentStart: NormalizedGame | null = null;

  for (const game of games) {
    if (game.result === type) {
      currentLength += 1;
      currentStart ??= game;

      if (
        best === null ||
        currentLength > best.length
      ) {
        best = {
          type,
          length: currentLength,
          startGameId: currentStart.id,
          endGameId: game.id,
          startDate: currentStart.date,
          endDate: game.date,
        };
      }
    } else {
      currentLength = 0;
      currentStart = null;
    }
  }

  return best;
}

function getCurrentStreak(games: NormalizedGame[]): { type: NormalizedGame["result"]; length: number } {
  if (games.length === 0) {
    return {
      type: "draw",
      length: 0,
    };
  }

  const lastResult = games.at(-1)?.result ?? "draw";
  let length = 0;

  for (const game of [...games].reverse()) {
    if (game.result !== lastResult) {
      break;
    }

    length += 1;
  }

  return {
    type: lastResult,
    length,
  };
}

function buildEloSeries(games: NormalizedGame[]): EloPoint[] {
  const ratedGames = games.filter((game) => game.playerRating !== null);
  const rolling = rollingAverage(
    ratedGames.map((game) => game.playerRating ?? 0),
    10,
  );

  return ratedGames.map((game, index) => ({
    gameId: game.id,
    sequence: game.sequence,
    date: game.date,
    rating: game.playerRating ?? 0,
    delta: game.ratingDelta,
    result: game.result,
    color: game.playerColor,
    opponent: game.opponentName,
    timeControl: game.timeControl,
    rollingAverage: rolling[index],
  }));
}

function isOnOrAfterInsightRatingBaseline(
  game: Pick<NormalizedGame, "date" | "sequence">,
): boolean {
  if (game.date !== INSIGHT_RATING_BASELINE.date) {
    return game.date > INSIGHT_RATING_BASELINE.date;
  }

  return game.sequence >= INSIGHT_RATING_BASELINE.sequence;
}

function getInsightRatingGames(games: NormalizedGame[]): NormalizedGame[] {
  return games.filter((game) => isOnOrAfterInsightRatingBaseline(game));
}

function buildHeatmap(games: NormalizedGame[]): HeatmapCell[] {
  const map = new Map<string, number>();

  for (const game of games) {
    map.set(game.date, (map.get(game.date) ?? 0) + 1);
  }

  return [...map.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([date, count]) => {
      const when = new Date(`${date}T00:00:00Z`);

      return {
        date,
        count,
        weekday: when.getUTCDay(),
        week: format(when, "yyyy-'W'II"),
      };
    });
}

function buildTimeControls(games: NormalizedGame[]): TimeControlBreakdown[] {
  const groups = new Map<string, NormalizedGame[]>();

  for (const game of games) {
    const bucket = groups.get(game.timeControl) ?? [];
    bucket.push(game);
    groups.set(game.timeControl, bucket);
  }

  return [...groups.entries()]
    .map(([label, bucket]) => ({
      label,
      count: bucket.length,
      ...withWinRate(getBreakdown(bucket)),
    }))
    .sort((left, right) => right.count - left.count);
}

function normalizeTermination(value: string): string {
  const lowered = value.toLowerCase();

  if (lowered.includes("checkmate")) {
    return "Checkmate";
  }

  if (lowered.includes("resignation")) {
    return "Resignation";
  }

  if (lowered.includes("abandoned")) {
    return "Game abandoned";
  }

  if (lowered.includes("on time")) {
    return "Won on time";
  }

  if (lowered.includes("stalemate")) {
    return "Stalemate";
  }

  if (lowered.includes("repetition")) {
    return "Repetition";
  }

  if (lowered.includes("timeout")) {
    return "Timeout / insufficient material";
  }

  return value;
}

function buildTerminations(games: NormalizedGame[]): TerminationBreakdown[] {
  const groups = new Map<string, number>();

  for (const game of games) {
    const key = normalizeTermination(game.displayTermination);
    groups.set(key, (groups.get(key) ?? 0) + 1);
  }

  return [...groups.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((left, right) => right.count - left.count);
}

export function buildOpeningHighlights(games: NormalizedGame[]): OpeningSignature[] {
  const groups = new Map<string, NormalizedGame[]>();

  for (const game of games) {
    const key = game.openingSignature || "No opening data";
    const bucket = groups.get(key) ?? [];
    bucket.push(game);
    groups.set(key, bucket);
  }

  return [...groups.entries()]
    .map(([key, bucket]) => ({
      key,
      label: bucket[0]?.openingLabel ?? key,
      moves: key === "No opening data" ? [] : key.split(" "),
      count: bucket.length,
      record: withWinRate(getBreakdown(bucket)),
    }))
    .sort((left, right) => right.count - left.count);
}

function getRecentForm(games: NormalizedGame[]): RecentFormSummary {
  const recent = games.slice(-10);
  const record = getBreakdown(recent);

  return {
    games: recent.length,
    record,
    winRate: withWinRate(record).winRate,
  };
}

function findSpotlights(games: NormalizedGame[]): SpotlightGame[] {
  const longestWin = getLongestStreak(games, "win");
  const longestLoss = getLongestStreak(games, "loss");
  const biggestMoveCount = [...games].sort((left, right) => right.moveCount - left.moveCount)[0];
  const shortestWin = [...games]
    .filter((game) => game.result === "win")
    .sort((left, right) => left.moveCount - right.moveCount)[0];

  return [
    longestWin
      ? {
          gameId: longestWin.endGameId,
          title: "Longest heater",
          description: `${longestWin.length} straight wins between ${longestWin.startDate} and ${longestWin.endDate}.`,
        }
      : null,
    longestLoss
      ? {
          gameId: longestLoss.endGameId,
          title: "Hardest downswing",
          description: `${longestLoss.length} consecutive losses before the trend reset.`,
        }
      : null,
    biggestMoveCount
      ? {
          gameId: biggestMoveCount.id,
          title: "Deepest grind",
          description: `${biggestMoveCount.moveCount} moves against ${biggestMoveCount.opponentName}.`,
        }
      : null,
    shortestWin
      ? {
          gameId: shortestWin.id,
          title: "Quickest finish",
          description: `${shortestWin.moveCount} moves to close out ${shortestWin.opponentName}.`,
        }
      : null,
  ].filter((item): item is SpotlightGame => item !== null);
}

function buildMilestones(games: NormalizedGame[], eloSeries: EloPoint[]): MilestonePoint[] {
  if (eloSeries.length === 0) {
    return [];
  }

  const peak = [...eloSeries].sort((left, right) => right.rating - left.rating)[0];
  const floor = [...eloSeries].sort((left, right) => left.rating - right.rating)[0];
  const bestJump = [...eloSeries]
    .filter((point) => point.delta !== null)
    .sort((left, right) => (right.delta ?? 0) - (left.delta ?? 0))[0];
  const worstDip = [...eloSeries]
    .filter((point) => point.delta !== null)
    .sort((left, right) => (left.delta ?? 0) - (right.delta ?? 0))[0];

  return [
    {
      title: "Peak rating",
      description: `${peak.rating} after game ${peak.sequence}.`,
      gameId: peak.gameId,
      sequence: peak.sequence,
      date: peak.date,
      rating: peak.rating,
    },
    {
      title: "Lowest point",
      description: `${floor.rating} before the climb stabilized.`,
      gameId: floor.gameId,
      sequence: floor.sequence,
      date: floor.date,
      rating: floor.rating,
    },
    bestJump
      ? {
          title: "Biggest jump",
          description: `${(bestJump.delta ?? 0) > 0 ? "+" : ""}${bestJump.delta ?? 0} rating swing.`,
          gameId: bestJump.gameId,
          sequence: bestJump.sequence,
          date: bestJump.date,
          rating: bestJump.rating,
        }
      : null,
    worstDip
      ? {
          title: "Worst dip",
          description: `${worstDip.delta ?? 0} rating swing.`,
          gameId: worstDip.gameId,
          sequence: worstDip.sequence,
          date: worstDip.date,
          rating: worstDip.rating,
        }
      : null,
  ].filter((item): item is MilestonePoint => item !== null);
}

export function buildInsightSummary(games: NormalizedGame[]): InsightSummary {
  // Skip the pre-Bosevas calibration games so rating insights start from the baseline the user wants.
  const ratingGames = getInsightRatingGames(games);
  const ratedGames = ratingGames.filter((game) => game.playerRating !== null);
  const eloSeries = buildEloSeries(ratingGames);
  const allRatings = ratedGames
    .map((game) => game.playerRating)
    .filter((rating): rating is number => rating !== null);
  const record = getBreakdown(games);
  const white = withWinRate(getBreakdown(games.filter((game) => game.playerColor === "white")));
  const black = withWinRate(getBreakdown(games.filter((game) => game.playerColor === "black")));
  const timeControlBreakdown = buildTimeControls(games);
  const openingHighlights = buildOpeningHighlights(games);

  const peakGame = ratedGames.reduce<NormalizedGame | null>((best, game) => {
    if (best === null) {
      return game;
    }

    return (game.playerRating ?? 0) > (best.playerRating ?? 0) ? game : best;
  }, null);
  const lowestGame = ratedGames.reduce<NormalizedGame | null>((best, game) => {
    if (best === null) {
      return game;
    }

    return (game.playerRating ?? Number.POSITIVE_INFINITY) < (best.playerRating ?? Number.POSITIVE_INFINITY)
      ? game
      : best;
  }, null);
  const firstRatedGame = ratedGames[0] ?? null;
  const lastRatedGame = ratedGames.at(-1) ?? null;

  return {
    identity: PLAYER_IDENTITY,
    gameCount: games.length,
    dateRange: {
      start: games[0]?.date ?? "",
      end: games.at(-1)?.date ?? "",
    },
    currentRating: lastRatedGame?.playerRating ?? null,
    peakRating: peakGame?.playerRating ?? null,
    peakGameId: peakGame?.id ?? null,
    lowestRating: lowestGame?.playerRating ?? null,
    lowestGameId: lowestGame?.id ?? null,
    netRatingChange:
      firstRatedGame?.playerRating !== null && lastRatedGame?.playerRating !== null
        ? (lastRatedGame?.playerRating ?? 0) - (firstRatedGame?.playerRating ?? 0)
        : null,
    ratingVolatility:
      allRatings.length > 1
        ? average(
            eloSeries
              .map((point) => Math.abs(point.delta ?? 0))
              .filter((value) => value > 0),
          )
        : 0,
    averageMoveCount: average(games.map((game) => game.moveCount)),
    mostCommonTimeControl: timeControlBreakdown[0]?.label ?? "Unknown",
    record,
    winRate: withWinRate(record).winRate,
    white,
    black,
    currentStreak: getCurrentStreak(games),
    longestWinStreak: getLongestStreak(games, "win"),
    longestLossStreak: getLongestStreak(games, "loss"),
    bestRecentForm: getRecentForm(games),
    activityHeatmap: buildHeatmap(games),
    timeControlBreakdown,
    terminationBreakdown: buildTerminations(games),
    eloSeries,
    milestonePoints: buildMilestones(ratingGames, eloSeries),
    openingHighlights: openingHighlights.slice(0, 6),
    spotlights: findSpotlights(games),
    recentGames: games.slice(-6).reverse(),
  };
}
