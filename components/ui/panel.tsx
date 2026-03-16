import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Panel({ children, className, ...props }: PanelProps) {
  return (
    <div className={cn("panel", className)} {...props}>
      {children}
    </div>
  );
}
