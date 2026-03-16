import type { Route } from "next";
import Link from "next/link";

import { Panel } from "@/components/ui/panel";
import type { SpotlightGame } from "@/types/chess";

interface SpotlightStripProps {
  spotlights: SpotlightGame[];
}

export function SpotlightStrip({ spotlights }: SpotlightStripProps) {
  return (
    <section className="space-y-4">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-200/78">
          Spotlight strip
        </p>
        <h2 className="font-display text-3xl text-white">
          A few moments worth pulling into the narrative.
        </h2>
      </div>
      <div className="grid gap-4 lg:grid-cols-4">
        {spotlights.map((spotlight) => (
          <Link
            key={spotlight.gameId}
            href={`/games/${spotlight.gameId}` as Route}
          >
            <Panel className="flex h-full flex-col gap-4 p-5 transition hover:-translate-y-0.5 hover:border-amber-200/20 hover:bg-white/[0.06]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/40">
                {spotlight.title}
              </p>
              <p className="text-sm leading-6 text-white/72">
                {spotlight.description}
              </p>
              <span className="text-sm text-amber-200/78">Open game detail</span>
            </Panel>
          </Link>
        ))}
      </div>
    </section>
  );
}
