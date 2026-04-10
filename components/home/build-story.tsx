import { Panel } from "@/components/ui/panel";

export function BuildStory() {
  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <Panel className="p-7">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-200/78">
            Why this project exists
          </p>
          <h2 className="font-display text-3xl text-white">
            A chess export became a frontend product exercise.
          </h2>
          <p className="text-sm leading-7 text-white/68">
            Recruiters should not need to infer engineering taste from source
            code alone. This project packages a raw chess export as a polished,
            data-rich interface to demonstrate typed transformations, visual
            hierarchy, interaction design, and production-minded App Router
            composition.
          </p>
          <p className="text-sm leading-7 text-white/58">
            The chess domain is just the raw material. The actual signal is how
            the data gets normalized, summarized, and surfaced without hiding
            the implementation quality behind a generic dashboard template.
          </p>
        </div>
      </Panel>
      <Panel className="p-7">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-200/78">
            How it was built
          </p>
          <h2 className="font-display text-3xl text-white">
            Static data pipeline, typed contracts, small client islands.
          </h2>
          <ul className="space-y-3 text-sm leading-7 text-white/66">
            <li>
              Chess.com history and a cached Lichess export are parsed into one
              normalized JSON layer with platform tags, rating history, FEN
              timelines, opening signatures, and analytics summaries.
            </li>
            <li>
              Pages read from `lib/data.ts` only, so the UI never reaches into
              the raw source file or adds a runtime backend just to render charts.
            </li>
            <li>
              Client components are limited to the places where interaction
              matters: charts, replay controls, URL-backed filters, and hero
              micro-motion.
            </li>
          </ul>
        </div>
      </Panel>
    </section>
  );
}
