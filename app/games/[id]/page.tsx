import type { Route } from "next";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { GameReplay } from "@/components/detail/game-replay";
import { ButtonLink } from "@/components/ui/button-link";
import { PageIntro } from "@/components/ui/page-intro";
import { Panel } from "@/components/ui/panel";
import { ResultPill } from "@/components/ui/result-pill";
import { getGameById, getGames } from "@/lib/data";
import {
  formatColorLabel,
  formatFullDate,
  formatPlatformLabel,
  formatRating,
  formatRatingDelta,
  formatTimeControlLabel,
} from "@/lib/formatters";
import { buildMaterialBalanceSeries } from "@/lib/material";
import { createPageMetadata } from "@/lib/metadata";

interface GameDetailPageProps {
  params: Promise<{ id: string }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  const games = await getGames();

  return games.map((game) => ({
    id: game.id,
  }));
}

export async function generateMetadata({
  params,
}: GameDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const game = await getGameById(id);

  if (!game) {
    return createPageMetadata({
      title: "Game not found",
    });
  }

  return createPageMetadata({
    title: `${game.opponentName} · ${formatFullDate(game.date)}`,
    description: `${formatColorLabel(game.playerColor)} pieces, ${game.displayTermination}, ${formatTimeControlLabel(game.timeControl)}.`,
  });
}

export default async function GameDetailPage({ params }: GameDetailPageProps) {
  const { id } = await params;
  const [game, games] = await Promise.all([getGameById(id), getGames()]);

  if (!game) {
    notFound();
  }

  const materialSeries = buildMaterialBalanceSeries(game);
  const sequenceSortedGames = [...games].sort(
    (left, right) => left.sequence - right.sequence,
  );
  const currentIndex = sequenceSortedGames.findIndex(
    (candidate) => candidate.id === game.id,
  );
  const previousGame =
    currentIndex > 0 ? sequenceSortedGames[currentIndex - 1] : null;
  const nextGame =
    currentIndex >= 0 && currentIndex < sequenceSortedGames.length - 1
      ? sequenceSortedGames[currentIndex + 1]
      : null;

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="All Games"
        title={`${game.opponentName} · ${formatFullDate(game.date)}`}
        description={`${formatColorLabel(game.playerColor)} pieces, ${formatTimeControlLabel(game.timeControl)}, and a ${game.displayTermination.toLowerCase()}.`}
        actions={
          <>
            <ResultPill result={game.result} />
            <ButtonLink href="/games" variant="secondary">
              Back to All Games
            </ButtonLink>
          </>
        }
      />
      <GameReplay
        fenByPly={game.fenByPly}
        sanMoves={game.sanMoves}
        playerColor={game.playerColor}
        materialSeries={materialSeries}
      />
      <Panel className="p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200/78">
              Metadata summary
            </p>
            <p className="mt-2 text-sm text-white/56">
              Core fields preserved from the normalized schema and derived
              helpers.
            </p>
          </div>
          <ResultPill result={game.result} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetaItem label="Date" value={formatFullDate(game.date)} />
          <MetaItem label="Platform" value={formatPlatformLabel(game.platform)} />
          <MetaItem label="Opponent" value={game.opponentName} />
          <MetaItem label="Color" value={formatColorLabel(game.playerColor)} />
          <MetaItem label="Rating" value={formatRating(game.playerRating)} />
          <MetaItem label="Delta" value={formatRatingDelta(game.ratingDelta)} />
          <MetaItem
            label="Time control"
            value={formatTimeControlLabel(game.timeControl)}
          />
          <MetaItem label="Termination" value={game.displayTermination} />
          <MetaItem label="Move count" value={String(game.moveCount)} />
        </div>
      </Panel>
      <div className="grid gap-4 md:grid-cols-2">
        <NavigationCard
          label="Previous game"
          gameId={previousGame?.id ?? null}
          title={previousGame?.opponentName ?? "Start of sequence"}
          detail={
            previousGame
              ? `${formatFullDate(previousGame.date)} · ${previousGame.displayTermination}`
              : "There is no earlier game in sequence order."
          }
        />
        <NavigationCard
          label="Next game"
          gameId={nextGame?.id ?? null}
          title={nextGame?.opponentName ?? "End of sequence"}
          detail={
            nextGame
              ? `${formatFullDate(nextGame.date)} · ${nextGame.displayTermination}`
              : "There is no later game in sequence order."
          }
        />
      </div>
    </div>
  );
}

interface MetaItemProps {
  label: string;
  value: string;
}

function MetaItem({ label, value }: MetaItemProps) {
  return (
    <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">
        {label}
      </p>
      <p className="mt-2 text-sm leading-6 text-white/74">{value}</p>
    </div>
  );
}

interface NavigationCardProps {
  label: string;
  gameId: string | null;
  title: string;
  detail: string;
}

function NavigationCard({
  label,
  gameId,
  title,
  detail,
}: NavigationCardProps) {
  const content = (
    <Panel className="h-full p-5 transition hover:border-amber-200/20 hover:bg-white/[0.06]">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/38">
        {label}
      </p>
      <p className="mt-3 font-display text-2xl text-white">{title}</p>
      <p className="mt-3 text-sm leading-6 text-white/58">{detail}</p>
    </Panel>
  );

  if (!gameId) {
    return content;
  }

  return <Link href={`/games/${gameId}` as Route}>{content}</Link>;
}
