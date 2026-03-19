import { describe, expect, it } from "vitest";

import { parseHighlightReadme, serializeHighlightManifest } from "@/lib/highlights";

const README_FIXTURE = `# Chess Highlight Games

## Highlight Games
| Date | Opponent | Platform | Result | Game Link | Why it matters |
| --- | --- | --- | --- | --- | --- |
| 2026-03-06 | AmeerIrfan | Lichess | Win (White, 1-0) | [Lichess game](https://lichess.org/jdooSl0M) | Practical resignation win where \`40. Rc2\` ended the tactical race. |
| 2026-03-15 | creppyG | Chess.com | Win (Black, 0-1) | [Chess.com analysis](https://www.chess.com/analysis/game/live/165996433052/analysis) | Move-table domination reached \`100.0/0.0/0.0\` by move 9 and held through \`56...Qa8#\`. |
| 2026-03-19 | sozplayschess05 | Chess.com | Win (Black, 0-1) | [Chess.com game](https://www.chess.com/game/live/166156046882) | Clean mate finish where \`21. Qf4\` allowed \`21...Qd2#\` immediately. |
`;

describe("parseHighlightReadme", () => {
  it("extracts highlight rows with inferred slugs and titles", () => {
    const entries = parseHighlightReadme(README_FIXTURE);

    expect(entries).toHaveLength(3);
    expect(entries[0]).toMatchObject({
      date: "2026-03-06",
      opponent: "AmeerIrfan",
      title: "Practical resignation vs AmeerIrfan",
      slug: "2026-03-06-ameerirfan-practical-race",
    });
    expect(entries[1]).toMatchObject({
      title: "Domination vs creppyG",
      slug: "2026-03-15-creppyg-domination",
    });
    expect(entries[2]).toMatchObject({
      title: "Clean mate vs sozplayschess05",
      slug: "2026-03-19-sozplayschess05-clean-mate",
    });
    expect(entries[0]?.links).toEqual([
      {
        label: "Lichess game",
        href: "https://lichess.org/jdooSl0M",
      },
    ]);
  });
});

describe("serializeHighlightManifest", () => {
  it("emits the generated manifest module shape", () => {
    const manifest = serializeHighlightManifest(
      parseHighlightReadme(README_FIXTURE),
    );

    expect(manifest).toContain('import type { HighlightSpec } from "@/lib/highlights";');
    expect(manifest).toContain("export const HIGHLIGHT_SPECS");
    expect(manifest).toContain("2026-03-06-ameerirfan-practical-race");
    expect(manifest).toContain("2026-03-19-sozplayschess05-clean-mate");
  });
});
