"use client";

import type { Route } from "next";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

const MOBILE_MENU_ID = "mobile-navigation-menu";

interface MobileNavMenuProps {
  items: Array<{ href: Route; label: string }>;
  className?: string;
}

export function MobileNavMenu({ items, className }: MobileNavMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className={cn("relative sm:hidden", className)}>
      <button
        type="button"
        aria-controls={MOBILE_MENU_ID}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
        onClick={() => setIsOpen((open) => !open)}
        className="relative z-50 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-white/[0.04] text-white transition hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/60"
      >
        {isOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
      </button>
      {isOpen ? (
        <>
          <button
            type="button"
            aria-label="Dismiss navigation menu"
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-30 bg-[#09090c]/44 backdrop-blur-[2px]"
          />
          <div
            id={MOBILE_MENU_ID}
            className="absolute right-0 top-[calc(100%+1rem)] z-50 w-[min(17rem,calc(100vw-2rem))] overflow-hidden rounded-[1.75rem] border border-white/12 bg-[#0f1015]/96 p-2 shadow-[0_24px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl"
          >
            <nav
              aria-label="Mobile navigation"
              className="flex flex-col gap-1"
            >
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="rounded-[1.15rem] px-4 py-3 text-sm font-medium text-white/72 transition hover:bg-white/8 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/60"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </>
      ) : null}
    </div>
  );
}
