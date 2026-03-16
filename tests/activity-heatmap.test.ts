import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ActivityHeatmap } from "@/components/insights/activity-heatmap";

describe("ActivityHeatmap", () => {
  it("renders sparse weeks without throwing on placeholder days", () => {
    const render = () =>
      renderToStaticMarkup(
        createElement(ActivityHeatmap, {
          cells: [
            {
              date: "2026-03-09",
              count: 2,
              weekday: 1,
              week: "2026-W11",
            },
          ],
        }),
      );

    expect(render).not.toThrow();
  });
});
