import { clsx, type ClassValue } from "clsx";
import { format, parseISO } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatDisplayDate(value: string): string {
  return format(parseISO(value), "MMM d, yyyy");
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

export function formatSignedNumber(value: number | null): string {
  if (value === null) {
    return "n/a";
  }

  return `${value > 0 ? "+" : ""}${value}`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function rollingAverage(
  values: number[],
  windowSize: number,
): Array<number | null> {
  return values.map((_, index) => {
    const start = Math.max(0, index - windowSize + 1);
    const window = values.slice(start, index + 1);

    if (window.length < windowSize) {
      return null;
    }

    return average(window);
  });
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
