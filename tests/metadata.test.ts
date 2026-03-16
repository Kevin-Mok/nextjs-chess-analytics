import { describe, expect, it } from "vitest";

import {
  SITE_LOCALE,
  SITE_NAME,
  SITE_OG_IMAGE,
  SITE_OG_IMAGE_TYPE,
  SITE_URL,
  createPageMetadata,
} from "@/lib/metadata";

describe("site metadata", () => {
  it("resolves social images against the production origin", () => {
    const metadata = createPageMetadata();
    const metadataBase = metadata.metadataBase;
    const canonical = metadata.alternates?.canonical;
    const openGraph = metadata.openGraph;
    const canonicalUrl =
      typeof canonical === "string"
        ? canonical
        : canonical instanceof URL
          ? canonical.toString()
          : null;

    expect(metadataBase?.toString()).toBe(`${SITE_URL}/`);
    expect(canonicalUrl).toBe(SITE_URL);
    expect(openGraph).toMatchObject({
      url: SITE_URL,
      siteName: SITE_NAME,
      locale: SITE_LOCALE,
    });
    expect(openGraph?.images).toMatchObject([
      {
        url: SITE_OG_IMAGE,
        width: 1424,
        height: 752,
        alt: SITE_NAME,
        type: SITE_OG_IMAGE_TYPE,
      },
    ]);
    if (!metadataBase) {
      throw new Error("metadataBase should be defined for production social previews");
    }
    expect(new URL(SITE_OG_IMAGE, metadataBase).toString()).toBe(
      `${SITE_URL}${SITE_OG_IMAGE}`,
    );
    expect(metadata.twitter?.images).toEqual([SITE_OG_IMAGE]);
  });
});
