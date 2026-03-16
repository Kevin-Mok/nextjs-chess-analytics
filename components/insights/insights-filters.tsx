"use client";

import type { Route } from "next";
import { startTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type {
  GameColorFilter,
  GameResultFilter,
  InsightRange,
} from "@/lib/game-filters";

interface InsightsFiltersProps {
  color: GameColorFilter;
  result: GameResultFilter;
  timeControl: string;
  range: InsightRange;
  timeControls: string[];
}

export function InsightsFilters({
  color,
  result,
  timeControl,
  range,
  timeControls,
}: InsightsFiltersProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  function navigate(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(updates)) {
      if (!value || value === "all") {
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
    <div className="grid gap-3 rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5 md:grid-cols-2 xl:grid-cols-4">
      <FilterSelect
        label="Color"
        value={color}
        onChange={(value) => navigate({ color: value })}
        options={[
          { value: "all", label: "All colors" },
          { value: "white", label: "White" },
          { value: "black", label: "Black" },
        ]}
      />
      <FilterSelect
        label="Result"
        value={result}
        onChange={(value) => navigate({ result: value })}
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
        onChange={(value) => navigate({ timeControl: value })}
        options={[
          { value: "all", label: "All controls" },
          ...timeControls.map((item) => ({ value: item, label: item })),
        ]}
      />
      <FilterSelect
        label="Date range"
        value={range}
        onChange={(value) => navigate({ range: value })}
        options={[
          { value: "all", label: "Full dataset" },
          { value: "30d", label: "Last 30 days" },
          { value: "90d", label: "Last 90 days" },
        ]}
      />
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
