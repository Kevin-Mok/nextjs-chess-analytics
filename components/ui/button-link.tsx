import type { Route } from "next";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const buttonLinkVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/60",
  {
    variants: {
      variant: {
        primary:
          "bg-amber-300 text-stone-950 shadow-[0_12px_30px_rgba(245,204,128,0.24)] hover:bg-amber-200",
        secondary:
          "border border-white/12 bg-white/6 text-white hover:bg-white/10",
        ghost:
          "text-white/70 hover:bg-white/6 hover:text-white",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  },
);

interface ButtonLinkProps extends VariantProps<typeof buttonLinkVariants> {
  href: Route;
  children: ReactNode;
  className?: string;
}

export function ButtonLink({
  children,
  className,
  variant,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(buttonLinkVariants({ variant }), className)}
      {...props}
    >
      {children}
    </Link>
  );
}
