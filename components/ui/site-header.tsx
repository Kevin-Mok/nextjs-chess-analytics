import type { Route } from "next";
import Link from "next/link";

import { MobileNavMenu } from "@/components/ui/mobile-nav-menu";

const navigation: Array<{ href: Route; label: string }> = [
  { href: "/", label: "Overview" },
  { href: "/insights", label: "Insights" },
  { href: "/games", label: "Games" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/8 bg-[#09090c]/78 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4 lg:px-8">
        <Link href="/" className="min-w-0 flex-1 sm:flex-none">
          <span className="inline-flex max-w-full flex-wrap items-baseline gap-x-1.5 gap-y-0.5 font-display text-[0.95rem] font-semibold leading-[0.95] tracking-[0.01em] sm:text-lg sm:leading-tight">
            <span className="text-white">Kevin Mok&apos;s</span>
            <span className="text-amber-200">Chess Analytics</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] p-1 text-sm sm:flex">
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
        <MobileNavMenu items={navigation} />
      </div>
    </header>
  );
}
