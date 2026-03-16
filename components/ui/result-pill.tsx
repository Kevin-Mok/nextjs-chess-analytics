import { formatResultLabel } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { GameResult } from "@/types/chess";

interface ResultPillProps {
  result: GameResult;
  className?: string;
}

export function ResultPill({ result, className }: ResultPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]",
        result === "win" &&
          "bg-emerald-400/16 text-emerald-200 ring-1 ring-emerald-300/20",
        result === "loss" &&
          "bg-rose-400/14 text-rose-200 ring-1 ring-rose-300/20",
        result === "draw" &&
          "bg-white/10 text-white/72 ring-1 ring-white/12",
        className,
      )}
    >
      {formatResultLabel(result)}
    </span>
  );
}
