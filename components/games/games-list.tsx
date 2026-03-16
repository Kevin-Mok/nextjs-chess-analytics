import type { Route } from "next";
import Link from "next/link";

import { ResultPill } from "@/components/ui/result-pill";
import {
  formatColorLabel,
  formatCompactDate,
  formatMoveCount,
  formatRating,
  formatRatingDelta,
  formatTimeControlLabel,
} from "@/lib/formatters";
import type { NormalizedGame } from "@/types/chess";

interface GamesListProps {
  games: NormalizedGame[];
}

const columns = [
  "Date",
  "Color",
  "Opponent",
  "Result",
  "Rating",
  "Delta",
  "Time",
  "Termination",
  "Moves",
];

export function GamesList({ games }: GamesListProps) {
  if (games.length === 0) {
    return (
      <div className="rounded-[1.75rem] border border-dashed border-white/10 bg-white/[0.03] px-6 py-12 text-center text-white/58">
        No games match the current filters.
      </div>
    );
  }

  return (
    <>
      <div className="hidden overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.03] lg:block">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-left text-xs uppercase tracking-[0.18em] text-white/42">
              {columns.map((column) => (
                <th key={column} className="px-4 py-4 font-medium">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {games.map((game) => (
              (() => {
                const detailHref = `/games/${game.id}` as Route;

                return (
                  <tr
                    key={game.id}
                    className="border-b border-white/6 text-sm text-white/72 transition hover:bg-white/[0.03]"
                  >
                    <GameCell href={detailHref}>{formatCompactDate(game.date)}</GameCell>
                    <GameCell href={detailHref}>
                      {formatColorLabel(game.playerColor)}
                    </GameCell>
                    <GameCell href={detailHref}>{game.opponentName}</GameCell>
                    <td className="px-4 py-4">
                      <Link href={detailHref} className="inline-flex">
                        <ResultPill result={game.result} />
                      </Link>
                    </td>
                    <GameCell href={detailHref}>
                      {formatRating(game.playerRating)}
                    </GameCell>
                    <GameCell href={detailHref}>
                      {formatRatingDelta(game.ratingDelta)}
                    </GameCell>
                    <GameCell href={detailHref}>
                      {formatTimeControlLabel(game.timeControl)}
                    </GameCell>
                    <GameCell href={detailHref} className="max-w-[18rem] truncate">
                      {game.displayTermination}
                    </GameCell>
                    <GameCell href={detailHref}>
                      {formatMoveCount(game.moveCount)}
                    </GameCell>
                  </tr>
                );
              })()
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid gap-4 lg:hidden">
        {games.map((game) => {
          const detailHref = `/games/${game.id}` as Route;

          return (
            <Link key={game.id} href={detailHref}>
              <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5 transition hover:border-amber-200/20 hover:bg-white/[0.06]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                      {formatCompactDate(game.date)} ·{" "}
                      {formatColorLabel(game.playerColor)}
                    </p>
                    <p className="mt-2 font-display text-2xl text-white">
                      {game.opponentName}
                    </p>
                  </div>
                  <ResultPill result={game.result} />
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3 text-sm text-white/62">
                  <div>
                    <p className="text-white/36">Rating</p>
                    <p className="mt-1 text-white/78">
                      {formatRating(game.playerRating)}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/36">Delta</p>
                    <p className="mt-1 text-white/78">
                      {formatRatingDelta(game.ratingDelta)}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/36">Time control</p>
                    <p className="mt-1 text-white/78">
                      {formatTimeControlLabel(game.timeControl)}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/36">Moves</p>
                    <p className="mt-1 text-white/78">
                      {formatMoveCount(game.moveCount)}
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-white/56">
                  {game.displayTermination}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}

interface GameCellProps {
  href: Route;
  children: string;
  className?: string;
}

function GameCell({ href, children, className }: GameCellProps) {
  return (
    <td className={`px-4 py-4 ${className ?? ""}`}>
      <Link href={href} className="block">
        {children}
      </Link>
    </td>
  );
}
