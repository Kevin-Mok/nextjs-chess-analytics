import type { Metadata } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";

import { SiteFooter } from "@/components/ui/site-footer";
import { SiteHeader } from "@/components/ui/site-header";
import { SITE_NAME, createPageMetadata } from "@/lib/metadata";

import "@/app/globals.css";

const displayFont = localFont({
  src: "./fonts/GFSDidot-Regular.otf",
  variable: "--font-display",
  display: "swap",
});

const bodyFont = localFont({
  src: [
    {
      path: "./fonts/Cabin-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/Cabin-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/Cabin-Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-body",
  display: "swap",
});

const baseMetadata = createPageMetadata();

export const metadata: Metadata = {
  ...baseMetadata,
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      className={`${displayFont.variable} ${bodyFont.variable}`}
      suppressHydrationWarning
    >
      <body>
        <div className="site-background">
          <div className="background-orb background-orb-left" />
          <div className="background-orb background-orb-right" />
        </div>
        <div className="relative flex min-h-screen flex-col">
          <SiteHeader />
          <main className="relative z-10 flex-1">
            <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
              {children}
            </div>
          </main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
