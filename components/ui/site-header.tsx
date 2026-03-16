import type { Route } from "next";
import Link from "next/link";

const navigation: Array<{ href: Route; label: string }> = [
  { href: "/", label: "Overview" },
  { href: "/insights", label: "Insights" },
  { href: "/games", label: "Games" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/8 bg-[#09090c]/78 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="max-w-[18rem] sm:max-w-none">
          <span className="inline-flex flex-wrap items-baseline gap-x-2 gap-y-1 font-display text-base font-semibold leading-tight tracking-[0.01em] sm:text-lg">
            <span className="text-white">Kevin Mok&apos;s</span>
            <span className="text-amber-200">Chess Analytics</span>
          </span>
        </Link>
        <nav className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] p-1 text-sm">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-2 text-white/68 transition hover:bg-white/8 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
