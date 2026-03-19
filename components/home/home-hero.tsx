import { ArrowRight, Sparkles } from "lucide-react";

import { HeroPreview } from "@/components/home/hero-preview";
import { ButtonLink } from "@/components/ui/button-link";
import { Panel } from "@/components/ui/panel";
import { formatFullDate, formatRating } from "@/lib/formatters";
import type { InsightSummary } from "@/types/chess";

interface HomeHeroProps {
  summary: InsightSummary;
}

export function HomeHero({ summary }: HomeHeroProps) {
  return (
    <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <Panel className="relative overflow-hidden p-8 sm:p-10">
        <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,_rgba(245,204,128,0.12),_transparent_55%)]" />
        <div className="relative space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/18 bg-amber-200/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-amber-100/78">
            <Sparkles className="h-3.5 w-3.5" />
            Recruiter-facing build
          </div>
          <div className="space-y-5">
            <p className="text-sm uppercase tracking-[0.28em] text-white/40">
              Static chess analytics
            </p>
            <h1 className="font-display text-5xl font-semibold tracking-tight text-white sm:text-6xl">
              Typed chess analytics with product-level polish.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-white/64">
              This site turns a Chess.com export into a static-data Next.js
              experience: precomputed JSON, App Router pages, interactive
              charts, replay controls, and recruiter-facing engineering framing.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/insights">
              Open Elo Over Time
              <ArrowRight className="h-4 w-4" />
            </ButtonLink>
            <ButtonLink href="/highlights" variant="secondary">
              Browse Highlight Games
            </ButtonLink>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                Current rating
              </p>
              <p className="mt-2 font-display text-3xl text-white">
                {formatRating(summary.currentRating)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                Peak window
              </p>
              <p className="mt-2 font-display text-3xl text-white">
                {formatRating(summary.peakRating)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                Dataset span
              </p>
              <p className="mt-2 text-sm text-white/72">
                {formatFullDate(summary.dateRange.start)} to{" "}
                {formatFullDate(summary.dateRange.end)}
              </p>
            </div>
          </div>
        </div>
      </Panel>
      <HeroPreview
        points={summary.eloSeries}
        milestones={summary.milestonePoints}
      />
    </section>
  );
}
