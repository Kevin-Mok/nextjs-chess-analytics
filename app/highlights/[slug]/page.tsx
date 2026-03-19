import type { Route } from "next";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { GameReplay } from "@/components/detail/game-replay";
import { ButtonLink } from "@/components/ui/button-link";
import { PageIntro } from "@/components/ui/page-intro";
import { Panel } from "@/components/ui/panel";
import { ResultPill } from "@/components/ui/result-pill";
import {
  getHighlightedGameBySlug,
  getHighlightedGames,
} from "@/lib/data";
import {
  formatColorLabel,
  formatFullDate,
  formatRating,
  formatTimeControlLabel,
} from "@/lib/formatters";
import { buildMaterialBalanceSeries } from "@/lib/material";
import { createPageMetadata } from "@/lib/metadata";

interface HighlightDetailPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  const highlights = await getHighlightedGames();

  return highlights.map((highlight) => ({
    slug: highlight.slug,
  }));
}

export async function generateMetadata({
  params,
}: HighlightDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const highlight = await getHighlightedGameBySlug(slug);

  if (!highlight) {
    return createPageMetadata({
      title: "Highlight Game not found",
      pathname: `/highlights/${slug}`,
    });
  }

  return createPageMetadata({
    title: highlight.title,
    description: highlight.whyItMatters,
    pathname: `/highlights/${slug}`,
  });
}

export default async function HighlightDetailPage({
  params,
}: HighlightDetailPageProps) {
  const { slug } = await params;
  const highlights = await getHighlightedGames();
  const highlight = highlights.find((entry) => entry.slug === slug) ?? null;

  if (!highlight) {
    notFound();
  }

  const materialSeries = buildMaterialBalanceSeries(highlight.game);
  const currentIndex = highlights.findIndex((entry) => entry.slug === highlight.slug);
  const previousHighlight = currentIndex < highlights.length - 1
    ? highlights[currentIndex + 1]
    : null;
  const nextHighlight = currentIndex > 0 ? highlights[currentIndex - 1] : null;

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Highlight Game"
        title={highlight.title}
        description={`${highlight.whyItMatters} ${formatFullDate(highlight.game.date)} · ${highlight.resultLabel}.`}
        actions={
          <>
            <ResultPill result={highlight.game.result} />
            <ButtonLink href="/highlights" variant="secondary">
              Back to Highlight Games
            </ButtonLink>
          </>
        }
      />
      <div className="flex flex-wrap gap-3">
        {highlight.links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center rounded-full border border-white/12 bg-white/6 px-4 py-2 text-sm text-white/72 transition hover:bg-white/10 hover:text-white"
          >
            {link.label}
          </a>
        ))}
      </div>
      <GameReplay
        fenByPly={highlight.game.fenByPly}
        sanMoves={highlight.game.sanMoves}
        playerColor={highlight.game.playerColor}
        materialSeries={materialSeries}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel className="p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200/78">
            Why it matters
          </p>
          <p className="mt-4 text-sm leading-7 text-white/68">
            {highlight.whyItMatters}
          </p>
        </Panel>
        <Panel className="p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200/78">
            How the game was won
          </p>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-white/68">
            {highlight.analysis.howTheGameWasWon.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Panel>
      </div>
      {highlight.analysis.significantSwings.length > 0 ? (
        <Panel className="p-6">
          <div className="mb-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200/78">
              Significant swings
            </p>
            <p className="text-sm leading-6 text-white/56">
              Structured excerpts from the local markdown analysis, with the raw
              move table intentionally omitted from the site view.
            </p>
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            {highlight.analysis.significantSwings.map((swing) => (
              <div
                key={swing.title}
                className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5"
              >
                <p className="text-sm font-medium text-white">{swing.title}</p>
                {swing.details.length > 0 ? (
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-white/62">
                    {swing.details.map((detail) => (
                      <li key={detail}>{detail}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </div>
        </Panel>
      ) : null}
      <Panel className="p-6">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200/78">
            Metadata summary
          </p>
          <p className="mt-2 text-sm text-white/56">
            Core PGN fields for the curated Highlight Game source file.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetaItem label="Date" value={formatFullDate(highlight.game.date)} />
          <MetaItem label="Opponent" value={highlight.game.opponentName} />
          <MetaItem
            label="Color"
            value={formatColorLabel(highlight.game.playerColor)}
          />
          <MetaItem label="Rating" value={formatRating(highlight.game.playerRating)} />
          <MetaItem
            label="Time control"
            value={formatTimeControlLabel(highlight.game.timeControl)}
          />
          <MetaItem label="Termination" value={highlight.game.displayTermination} />
          <MetaItem label="Move count" value={String(highlight.game.moveCount)} />
          <MetaItem label="Platform" value={highlight.platform} />
        </div>
      </Panel>
      <div className="grid gap-4 md:grid-cols-2">
        <HighlightNavigationCard
          label="Previous Highlight Game"
          highlight={previousHighlight}
          emptyTitle="Start of Highlight Games"
          emptyDetail="There is no older Highlight Game in the sequence."
        />
        <HighlightNavigationCard
          label="Next Highlight Game"
          highlight={nextHighlight}
          emptyTitle="Latest Highlight Game"
          emptyDetail="There is no newer Highlight Game in the sequence."
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

interface HighlightNavigationCardProps {
  label: string;
  highlight: Awaited<ReturnType<typeof getHighlightedGameBySlug>>;
  emptyTitle: string;
  emptyDetail: string;
}

function HighlightNavigationCard({
  label,
  highlight,
  emptyTitle,
  emptyDetail,
}: HighlightNavigationCardProps) {
  const content = (
    <Panel className="h-full p-5 transition hover:border-amber-200/20 hover:bg-white/[0.06]">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/38">
        {label}
      </p>
      <p className="mt-3 font-display text-2xl text-white">
        {highlight?.title ?? emptyTitle}
      </p>
      <p className="mt-3 text-sm leading-6 text-white/58">
        {highlight
          ? `${formatFullDate(highlight.game.date)} · ${highlight.whyItMatters}`
          : emptyDetail}
      </p>
    </Panel>
  );

  if (!highlight) {
    return content;
  }

  return <Link href={`/highlights/${highlight.slug}` as Route}>{content}</Link>;
}
