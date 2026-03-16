import type { Route } from "next";
import type { ReactNode } from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";

interface GamesPaginationProps {
  page: number;
  totalPages: number;
  pathname: string;
  params: Record<string, string | undefined>;
}

export function GamesPagination({
  page,
  totalPages,
  pathname,
  params,
}: GamesPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = Array.from(
    new Set([1, page - 1, page, page + 1, totalPages].filter((value) => value >= 1 && value <= totalPages)),
  );

  function buildHref(nextPage: number): Route {
    const search = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
      if (value) {
        search.set(key, value);
      }
    }

    if (nextPage > 1) {
      search.set("page", String(nextPage));
    } else {
      search.delete("page");
    }

    const query = search.toString();

    return (query ? `${pathname}?${query}` : pathname) as Route;
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-white/56">
        Page {page} of {totalPages}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <PaginationLink href={buildHref(Math.max(1, page - 1))} disabled={page === 1}>
          Prev
        </PaginationLink>
        {pages.map((value) => (
          <PaginationLink
            key={value}
            href={buildHref(value)}
            current={value === page}
          >
            {value}
          </PaginationLink>
        ))}
        <PaginationLink
          href={buildHref(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
        >
          Next
        </PaginationLink>
      </div>
    </div>
  );
}

interface PaginationLinkProps {
  href: Route;
  children: ReactNode;
  current?: boolean;
  disabled?: boolean;
}

function PaginationLink({
  href,
  children,
  current = false,
  disabled = false,
}: PaginationLinkProps) {
  if (disabled) {
    return (
      <span className="inline-flex h-10 items-center rounded-full border border-white/8 px-4 text-sm text-white/24">
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-10 items-center rounded-full border px-4 text-sm transition",
        current
          ? "border-amber-200/30 bg-amber-200/12 text-amber-100"
          : "border-white/10 bg-white/[0.03] text-white/64 hover:bg-white/[0.08] hover:text-white",
      )}
    >
      {children}
    </Link>
  );
}
