import type { ReactNode } from "react";

import { Panel } from "@/components/ui/panel";

interface StatCardProps {
  label: string;
  value: string;
  detail?: string;
  icon?: ReactNode;
}

export function StatCard({ label, value, detail, icon }: StatCardProps) {
  return (
    <Panel className="flex h-full flex-col gap-4 p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/48">
          {label}
        </p>
        {icon ? <div className="text-amber-200/72">{icon}</div> : null}
      </div>
      <div className="space-y-1">
        <p className="font-display text-3xl font-semibold text-white">
          {value}
        </p>
        {detail ? <p className="text-sm text-white/58">{detail}</p> : null}
      </div>
    </Panel>
  );
}
