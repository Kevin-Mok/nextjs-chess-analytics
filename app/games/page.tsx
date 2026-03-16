import { GamesFilters } from "@/components/games/games-filters";
import { GamesList } from "@/components/games/games-list";
import { GamesPagination } from "@/components/games/games-pagination";
import { PageIntro } from "@/components/ui/page-intro";
import {
  type GameColorFilter,
  type GameResultFilter,
  type GameSortMode,
  deriveGameFilterOptions,
  filterGames,
  paginateGames,
  sortGames,
} from "@/lib/game-filters";
import { getGames } from "@/lib/data";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Games Explorer",
  description:
    "Search, filter, sort, and page through the normalized Chess.com dataset without runtime PGN parsing.",
});

interface GamesPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const validColors = new Set<GameColorFilter>(["all", "white", "black"]);
const validResults = new Set<GameResultFilter>(["all", "win", "loss", "draw"]);
const validSortModes = new Set<GameSortMode>([
  "date-desc",
  "date-asc",
  "rating-desc",
  "rating-asc",
]);

function getSingleValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function GamesPage({ searchParams }: GamesPageProps) {
  const games = await getGames();
  const params = await searchParams;
  const options = deriveGameFilterOptions(games);
  const query = getSingleValue(params.q) ?? "";
  const colorValue = getSingleValue(params.color) ?? "all";
  const resultValue = getSingleValue(params.result) ?? "all";
  const timeControlValue = getSingleValue(params.timeControl) ?? "all";
  const sortValue = getSingleValue(params.sort) ?? "date-desc";
  const pageValue = Number(getSingleValue(params.page) ?? "1");
  const color = validColors.has(colorValue as GameColorFilter)
    ? (colorValue as GameColorFilter)
    : "all";
  const result = validResults.has(resultValue as GameResultFilter)
    ? (resultValue as GameResultFilter)
    : "all";
  const sort = validSortModes.has(sortValue as GameSortMode)
    ? (sortValue as GameSortMode)
    : "date-desc";
  const filteredGames = filterGames(games, {
    query,
    color,
    result,
    timeControl: timeControlValue,
  });
  const sortedGames = sortGames(filteredGames, sort);
  const pagination = paginateGames(
    sortedGames,
    Number.isFinite(pageValue) ? pageValue : 1,
  );

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Games explorer"
        title="Explore the normalized game log."
        description="The explorer is server-rendered from derived JSON, with URL-backed search params for search, result splits, time controls, sort order, and pagination."
      />
      <GamesFilters
        key={[query, color, result, timeControlValue, sort].join("|")}
        initialQuery={query}
        color={color}
        result={result}
        timeControl={timeControlValue}
        sort={sort}
        timeControls={options.timeControls}
      />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-white/58">
          Showing {pagination.startIndex}-{pagination.endIndex} of{" "}
          {pagination.totalItems} filtered games from {games.length} total.
        </p>
        <p className="text-xs uppercase tracking-[0.2em] text-white/36">
          Default sort: newest first
        </p>
      </div>
      <GamesList games={pagination.items} />
      <GamesPagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        pathname="/games"
        params={{
          q: query || undefined,
          color: color === "all" ? undefined : color,
          result: result === "all" ? undefined : result,
          timeControl: timeControlValue === "all" ? undefined : timeControlValue,
          sort: sort === "date-desc" ? undefined : sort,
        }}
      />
    </div>
  );
}
