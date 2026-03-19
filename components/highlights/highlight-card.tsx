import type { Route } from "next";
import Link from "next/link";

import { Panel } from "@/components/ui/panel";
import { ResultPill } from "@/components/ui/result-pill";
import {
  formatColorLabel,
  formatCompactDate,
  formatMoveCount,
  formatTimeControlLabel,
} from "@/lib/formatters";
import type { HighlightedGame } from "@/types/chess";

interface HighlightCardProps {
  highlight: HighlightedGame;
  ctaLabel?: string;
}

export function HighlightCard({
  highlight,
  ctaLabel = "Open Highlight Game",
}: HighlightCardProps) {
  return (
    <Link href={`/highlights/${highlight.slug}` as Route}>
      <Panel className="flex h-full flex-col gap-5 p-5 transition hover:-translate-y-0.5 hover:border-amber-200/20 hover:bg-white/[0.06]">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-white/42">
              {formatCompactDate(highlight.game.date)} · {highlight.platform}
            </p>
            <p className="font-display text-2xl text-white">
              {highlight.title}
            </p>
          </div>
          <ResultPill result={highlight.game.result} />
        </div>
        <p className="text-sm leading-6 text-white/62">
          {highlight.whyItMatters}
        </p>
        <div className="grid grid-cols-2 gap-3 text-sm text-white/62">
          <div>
            <p className="text-white/38">Opponent</p>
            <p className="mt-1 text-white/78">{highlight.game.opponentName}</p>
          </div>
          <div>
            <p className="text-white/38">Color</p>
            <p className="mt-1 text-white/78">
              {formatColorLabel(highlight.game.playerColor)}
            </p>
          </div>
          <div>
            <p className="text-white/38">Time control</p>
            <p className="mt-1 text-white/78">
              {formatTimeControlLabel(highlight.game.timeControl)}
            </p>
          </div>
          <div>
            <p className="text-white/38">Length</p>
            <p className="mt-1 text-white/78">
              {formatMoveCount(highlight.game.moveCount)}
            </p>
          </div>
        </div>
        <p className="text-sm text-white/54">{highlight.game.displayTermination}</p>
        <span className="text-sm text-amber-200/78">{ctaLabel}</span>
      </Panel>
    </Link>
  );
}
