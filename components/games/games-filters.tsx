"use client";

import type { Route } from "next";
import { startTransition } from "react";
import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type {
  GameColorFilter,
  GameResultFilter,
  GameSortMode,
} from "@/lib/game-filters";

interface GamesFiltersProps {
  initialQuery: string;
  color: GameColorFilter;
  result: GameResultFilter;
  timeControl: string;
  sort: GameSortMode;
  timeControls: string[];
}

export function GamesFilters({
  initialQuery,
  color,
  result,
  timeControl,
  sort,
  timeControls,
}: GamesFiltersProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  function navigate(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(updates)) {
      if (!value || value === "all" || value === "date-desc") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }

    const target = params.toString() ? `${pathname}?${params}` : pathname;

    startTransition(() => {
      router.replace(target as Route, { scroll: false });
    });
  }

  return (
    <div className="grid gap-3 rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_repeat(4,minmax(0,1fr))]">
      <label className="relative block">
        <span className="sr-only">Search games</span>
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/34" />
        <input
          defaultValue={initialQuery}
          onChange={(event) =>
            navigate({
              q:
                event.target.value.trim().length === 0
                  ? null
                  : event.target.value.trim(),
              page: null,
            })
          }
          placeholder="Search opponent, opening, or termination"
          className="h-12 w-full rounded-full border border-white/10 bg-[#101015] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/28 focus:border-amber-200/30"
        />
      </label>
      <FilterSelect
        label="Color"
        value={color}
        onChange={(value) => navigate({ color: value, page: null })}
        options={[
          { value: "all", label: "All colors" },
          { value: "white", label: "White" },
          { value: "black", label: "Black" },
        ]}
      />
      <FilterSelect
        label="Result"
        value={result}
        onChange={(value) => navigate({ result: value, page: null })}
        options={[
          { value: "all", label: "All results" },
          { value: "win", label: "Wins" },
          { value: "loss", label: "Losses" },
          { value: "draw", label: "Draws" },
        ]}
      />
      <FilterSelect
        label="Time control"
        value={timeControl}
        onChange={(value) => navigate({ timeControl: value, page: null })}
        options={[
          { value: "all", label: "All controls" },
          ...timeControls.map((item) => ({ value: item, label: item })),
        ]}
      />
      <FilterSelect
        label="Sort"
        value={sort}
        onChange={(value) => navigate({ sort: value, page: null })}
        options={[
          { value: "date-desc", label: "Newest first" },
          { value: "date-asc", label: "Oldest first" },
          { value: "rating-desc", label: "Highest rating" },
          { value: "rating-asc", label: "Lowest rating" },
        ]}
      />
      <div className="flex items-center rounded-full border border-white/10 bg-[#101015] px-4 text-xs uppercase tracking-[0.2em] text-white/42">
        URL-backed filters
      </div>
    </div>
  );
}

interface FilterSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: FilterSelectProps) {
  return (
    <label className="flex flex-col gap-2 rounded-[1.25rem] border border-white/10 bg-[#101015] px-4 py-3">
      <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="bg-transparent text-sm text-white outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-[#101015]">
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
