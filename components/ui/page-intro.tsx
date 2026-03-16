import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface PageIntroProps {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
  className?: string;
}

export function PageIntro({
  eyebrow,
  title,
  description,
  actions,
  className,
}: PageIntroProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6 rounded-[2rem] border border-white/10 bg-white/[0.03] px-6 py-8 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:px-8",
        className,
      )}
    >
      <div className="max-w-3xl space-y-4">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-200/80">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          {title}
        </h1>
        <p className="max-w-2xl text-base leading-7 text-white/68 sm:text-lg">
          {description}
        </p>
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}
