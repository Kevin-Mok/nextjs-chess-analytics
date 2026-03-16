import { describe, expect, it } from "vitest";

import { SITE_OG_IMAGE, SITE_URL, createPageMetadata } from "@/lib/metadata";

describe("site metadata", () => {
  it("resolves social images against the production origin", () => {
    const metadata = createPageMetadata();
    const metadataBase = metadata.metadataBase;

    expect(metadataBase?.toString()).toBe(`${SITE_URL}/`);
    expect(metadata.openGraph?.images).toMatchObject([
      {
        url: SITE_OG_IMAGE,
        width: 1424,
        height: 752,
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
