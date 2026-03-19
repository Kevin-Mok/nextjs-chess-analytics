import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SiteHeader } from "@/components/ui/site-header";

describe("SiteHeader", () => {
  it("renders a collapsed mobile-navigation trigger in the closed state", () => {
    const markup = renderToStaticMarkup(createElement(SiteHeader));
    const overviewIndex = markup.indexOf(">Overview<");
    const insightsIndex = markup.indexOf(">Elo Over Time<");
    const highlightsIndex = markup.indexOf(">Highlight Games<");
    const gamesIndex = markup.indexOf(">All Games<");

    expect(markup).toContain("Kevin Mok");
    expect(markup).toContain("Chess Analytics");
    expect(markup).toContain('aria-label="Open navigation menu"');
    expect(markup).toContain('aria-controls="mobile-navigation-menu"');
    expect(markup).toContain('aria-expanded="false"');
    expect(markup.match(/>Overview</g)).toHaveLength(1);
    expect(markup.match(/>Elo Over Time</g)).toHaveLength(1);
    expect(markup.match(/>Highlight Games</g)).toHaveLength(1);
    expect(markup.match(/>All Games</g)).toHaveLength(1);
    expect(overviewIndex).toBeGreaterThanOrEqual(0);
    expect(insightsIndex).toBeGreaterThan(overviewIndex);
    expect(highlightsIndex).toBeGreaterThan(insightsIndex);
    expect(gamesIndex).toBeGreaterThan(highlightsIndex);
  });
});
