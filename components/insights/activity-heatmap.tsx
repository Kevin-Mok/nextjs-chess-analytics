import { format, parse } from "date-fns";

import { formatCompactDate } from "@/lib/formatters";
import type { HeatmapCell } from "@/types/chess";

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getIntensityClass(count: number, maxCount: number): string {
  const ratio = maxCount === 0 ? 0 : count / maxCount;

  if (ratio >= 0.75) {
    return "bg-amber-200/70";
  }

  if (ratio >= 0.5) {
    return "bg-amber-200/46";
  }

  if (ratio > 0) {
    return "bg-amber-200/24";
  }

  return "bg-white/[0.04]";
}

function getPlaceholderDate(week: string, weekday: number, fallback: string): string {
  const isoWeekday = weekday === 0 ? 7 : weekday;
  const parsedDate = parse(`${week}-${isoWeekday}`, "RRRR-'W'II-i", new Date());

  if (Number.isNaN(parsedDate.getTime())) {
    return fallback;
  }

  return format(parsedDate, "yyyy-MM-dd");
}

interface ActivityHeatmapProps {
  cells: HeatmapCell[];
}

export function ActivityHeatmap({ cells }: ActivityHeatmapProps) {
  if (cells.length === 0) {
    return (
      <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-white/[0.02] px-5 py-8 text-sm text-white/56">
        No activity data is available for the current filter set.
      </div>
    );
  }

  const maxCount = Math.max(...cells.map((cell) => cell.count));
  const weeks = [...new Set(cells.map((cell) => cell.week))];
  const grid = weeks.map((week) => {
    const weekCells = cells.filter((cell) => cell.week === week);
    const fallbackDate = weekCells[0]?.date ?? cells[0]?.date ?? "";

    return weekdayLabels.map((_, weekday) => {
      const match = weekCells.find((cell) => cell.weekday === weekday);

      return match ?? {
        date: getPlaceholderDate(week, weekday, fallbackDate),
        count: 0,
        weekday,
        week,
      };
    });
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-white">Activity heatmap</p>
          <p className="mt-1 text-sm text-white/54">
            Game volume by weekday across the filtered range.
          </p>
        </div>
        <p className="text-xs uppercase tracking-[0.18em] text-white/38">
          {cells.length} active days
        </p>
      </div>
      <div className="overflow-x-auto">
        <div className="inline-grid gap-2" style={{ gridTemplateColumns: `auto repeat(${grid.length}, minmax(0, 1fr))` }}>
          {weekdayLabels.map((label) => (
            <div
              key={`label-${label}`}
              className="flex h-8 items-center justify-end pr-2 text-[11px] uppercase tracking-[0.18em] text-white/34"
            >
              {label}
            </div>
          ))}
          {grid.map((weekCells, weekIndex) =>
            weekCells.map((cell) => (
              <div
                key={`${cell.week}-${cell.weekday}`}
                title={`${formatCompactDate(cell.date)}: ${cell.count} games`}
                className={[
                  "h-8 w-8 rounded-md border border-white/6",
                  getIntensityClass(cell.count, maxCount),
                ].join(" ")}
                style={{ gridColumnStart: weekIndex + 2, gridRowStart: cell.weekday + 1 }}
              />
            )),
          )}
        </div>
      </div>
    </div>
  );
}
