import type { Metadata } from "next";

export const SITE_NAME = "Kevin Mok PGN Analytics";
export const SITE_DESCRIPTION =
  "Recruiter-facing chess analytics built from a static PGN ingest pipeline, typed data transforms, and App Router UI.";
export const SITE_OG_IMAGE = "/og-default.svg";

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
          width: 1200,
          height: 630,
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
