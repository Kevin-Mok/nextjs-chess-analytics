import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-10 text-sm text-white/56 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8">
        <div className="space-y-2">
          <p className="font-display text-base text-white">
            Static-data chess analytics built from a typed game-data pipeline.
          </p>
          <p>
            The UI reads derived JSON only. There is no runtime parsing of the
            original export or extra backend.
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link href="/" className="hover:text-white">
            Overview
          </Link>
          <Link href="/insights" className="hover:text-white">
            Elo Over Time
          </Link>
          <Link href="/games" className="hover:text-white">
            All Games
          </Link>
        </div>
      </div>
    </footer>
  );
}
