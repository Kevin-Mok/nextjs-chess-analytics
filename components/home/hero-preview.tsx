"use client";

import { useReducedMotion, motion } from "motion/react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  type TooltipContentProps,
  XAxis,
  YAxis,
} from "recharts";

import { formatCompactDate, formatRating } from "@/lib/formatters";

interface HeroPreviewPoint {
  sequence: number;
  date: string;
  rating: number;
}

interface HeroPreviewProps {
  points: HeroPreviewPoint[];
}

function HeroTooltip({ active, payload }: TooltipContentProps) {
  const point = payload?.[0]?.payload as HeroPreviewPoint | undefined;

  if (!active || !point) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-[#09090c]/92 px-4 py-3 text-sm shadow-[0_18px_40px_rgba(0,0,0,0.4)]">
      <p className="font-medium text-white">{formatRating(point.rating)} Elo</p>
      <p className="mt-1 text-white/58">{formatCompactDate(point.date)}</p>
    </div>
  );
}

export function HeroPreview({ points }: HeroPreviewProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
      animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(245,204,128,0.14),_transparent_45%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.35)]"
    >
      <div className="absolute inset-0 opacity-40">
        <motion.div
          animate={
            prefersReducedMotion
              ? undefined
              : { rotate: [0, 2, 0], y: [0, -6, 0] }
          }
          transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY }}
          className="absolute -right-6 top-8 grid grid-cols-4 gap-2"
        >
          {Array.from({ length: 16 }, (_, index) => (
            <span
              key={index}
              className={[
                "h-10 w-10 rounded-md border border-white/8",
                index % 2 === 0 ? "bg-white/10" : "bg-amber-200/12",
              ].join(" ")}
            />
          ))}
        </motion.div>
      </div>
      <div className="relative space-y-5">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200/72">
            Elo preview
          </p>
          <p className="max-w-sm text-sm leading-6 text-white/62">
            A compact view of the rating curve driving the full insights route.
          </p>
        </div>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={points} margin={{ top: 10, right: 6, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="heroRating" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f5cc80" stopOpacity={0.55} />
                  <stop offset="100%" stopColor="#f5cc80" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.08)" />
              <XAxis
                dataKey="sequence"
                tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={42}
              />
              <Tooltip
                cursor={{ stroke: "rgba(245,204,128,0.18)" }}
                content={(props) => <HeroTooltip {...props} />}
              />
              <Area
                type="monotone"
                dataKey="rating"
                stroke="#f5cc80"
                strokeWidth={2.5}
                fill="url(#heroRating)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}
