import type { Route } from "next";
import Link from "next/link";

import { Panel } from "@/components/ui/panel";
import { ResultPill } from "@/components/ui/result-pill";
import {
  formatColorLabel,
  formatCompactDate,
  formatPlatformLabel,
  formatRating,
  formatRatingDelta,
  formatTimeControlLabel,
} from "@/lib/formatters";
import type { NormalizedGame } from "@/types/chess";

interface RecentGamesPreviewProps {
  games: NormalizedGame[];
}

export function RecentGamesPreview({ games }: RecentGamesPreviewProps) {
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-200/78">
            Recent games
          </p>
          <h2 className="font-display text-3xl text-white">
            Fresh entries into the replay and explorer views.
          </h2>
        </div>
        <Link href="/games" className="text-sm text-white/62 hover:text-white">
          View All Games
        </Link>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {games.map((game) => (
          <Link key={game.id} href={`/games/${game.id}` as Route}>
            <Panel className="flex h-full flex-col gap-5 p-5 transition hover:-translate-y-0.5 hover:border-amber-200/20 hover:bg-white/[0.06]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/42">
                    {formatCompactDate(game.date)} · {formatPlatformLabel(game.platform)}
                  </p>
                  <p className="mt-2 font-display text-2xl text-white">
                    {game.opponentName}
                  </p>
                </div>
                <ResultPill result={game.result} />
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm text-white/62">
                <div>
                  <p className="text-white/38">Color</p>
                  <p className="mt-1 text-white/78">
                    {formatColorLabel(game.playerColor)}
                  </p>
                </div>
                <div>
                  <p className="text-white/38">Rating</p>
                  <p className="mt-1 text-white/78">
                    {formatRating(game.playerRating)}{" "}
                    <span className="text-white/44">
                      ({formatRatingDelta(game.ratingDelta)})
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-white/38">Time control</p>
                  <p className="mt-1 text-white/78">
                    {formatTimeControlLabel(game.timeControl)}
                  </p>
                </div>
                <div>
                  <p className="text-white/38">Moves</p>
                  <p className="mt-1 text-white/78">{game.moveCount}</p>
                </div>
              </div>
              <p className="text-sm leading-6 text-white/54">
                {game.displayTermination}
              </p>
            </Panel>
          </Link>
        ))}
      </div>
    </section>
  );
}
