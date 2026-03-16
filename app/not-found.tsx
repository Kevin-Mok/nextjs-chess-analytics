import { ButtonLink } from "@/components/ui/button-link";
import { Panel } from "@/components/ui/panel";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Panel className="max-w-xl p-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-200/78">
          Not found
        </p>
        <h1 className="mt-4 font-display text-4xl text-white">
          That game route does not exist.
        </h1>
        <p className="mt-4 text-base leading-7 text-white/60">
          The static dataset could not find a matching game id. Head back to the
          explorer or the home page and continue from a valid link.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <ButtonLink href="/games" variant="secondary">
            Open games
          </ButtonLink>
          <ButtonLink href="/">Back home</ButtonLink>
        </div>
      </Panel>
    </div>
  );
}
