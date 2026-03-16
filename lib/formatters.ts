import { format, parseISO } from "date-fns";

import { formatSignedNumber } from "@/lib/utils";
import type { GameResult, PlayerColor } from "@/types/chess";

function formatSeconds(totalSeconds: number): string {
  if (totalSeconds >= 3600) {
    const hours = totalSeconds / 3600;

    return `${Number.isInteger(hours) ? hours : hours.toFixed(1)}h`;
  }

  if (totalSeconds >= 60) {
    const minutes = totalSeconds / 60;

    return `${Number.isInteger(minutes) ? minutes : minutes.toFixed(1)}m`;
  }

  return `${totalSeconds}s`;
}

export function formatCompactDate(value: string): string {
  return format(parseISO(value), "MMM d");
}

export function formatFullDate(value: string): string {
  return format(parseISO(value), "MMM d, yyyy");
}

export function formatResultLabel(result: GameResult): string {
  if (result === "win") {
    return "Win";
  }

  if (result === "loss") {
    return "Loss";
  }

  return "Draw";
}

export function formatColorLabel(color: PlayerColor): string {
  return color === "white" ? "White" : "Black";
}

export function formatRating(value: number | null): string {
  return value === null ? "n/a" : value.toLocaleString();
}

export function formatRatingDelta(value: number | null): string {
  return formatSignedNumber(value);
}

export function formatMoveCount(value: number): string {
  return `${value} moves`;
}

export function formatTimeControlLabel(value: string): string {
  const parts = value.split("+");

  if (parts.length !== 2) {
    return value;
  }

  const baseSeconds = Number(parts[0]);
  const incrementSeconds = Number(parts[1]);

  if (!Number.isFinite(baseSeconds) || !Number.isFinite(incrementSeconds)) {
    return value;
  }

  if (incrementSeconds === 0) {
    return formatSeconds(baseSeconds);
  }

  return `${formatSeconds(baseSeconds)} + ${formatSeconds(incrementSeconds)}`;
}
