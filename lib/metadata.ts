import type { Metadata } from "next";

export const SITE_NAME = "Kevin Mok's Chess Analytics";
export const SITE_DESCRIPTION =
  "Next.js App Router chess analytics project using TypeScript, Recharts, and interactive replay UI to showcase Kevin Mok's frontend engineering.";
export const SITE_URL = "https://chess.kevin-mok.com";
export const SITE_OG_IMAGE = "/og-image.jpg";

interface MetadataOptions {
  title?: string;
  description?: string;
}

export function createPageMetadata(
  options: MetadataOptions = {},
): Metadata {
  const title = options.title ?? SITE_NAME;
  const description = options.description ?? SITE_DESCRIPTION;

  return {
    title,
    description,
    metadataBase: new URL(SITE_URL),
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
      apple: "/favicon.svg",
    },
    openGraph: {
      title,
      description,
      type: "website",
      images: [
        {
          url: SITE_OG_IMAGE,
          width: 1424,
          height: 752,
          alt: SITE_NAME,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [SITE_OG_IMAGE],
    },
  };
}
