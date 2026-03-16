import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SiteHeader } from "@/components/ui/site-header";

describe("SiteHeader", () => {
  it("renders a collapsed mobile-navigation trigger in the closed state", () => {
    const markup = renderToStaticMarkup(createElement(SiteHeader));

    expect(markup).toContain("Kevin Mok");
    expect(markup).toContain("Chess Analytics");
    expect(markup).toContain('aria-label="Open navigation menu"');
    expect(markup).toContain('aria-controls="mobile-navigation-menu"');
    expect(markup).toContain('aria-expanded="false"');
    expect(markup.match(/>Overview</g)).toHaveLength(1);
    expect(markup.match(/>Insights</g)).toHaveLength(1);
    expect(markup.match(/>Games</g)).toHaveLength(1);
  });
});
