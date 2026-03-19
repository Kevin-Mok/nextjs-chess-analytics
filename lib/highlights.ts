import { replaceDisplayIdentity } from "@/lib/identity";
import type {
  HighlightAnalysis,
  HighlightLink,
  HighlightedGame,
  HighlightSwing,
  NormalizedGame,
} from "@/types/chess";

export interface HighlightSpec {
  slug: string;
  title: string;
  platform: string;
  resultLabel: string;
  whyItMatters: string;
  links: HighlightLink[];
}

export interface HighlightReadmeEntry extends HighlightSpec {
  date: string;
  opponent: string;
}

function escapeForRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getMarkdownSection(markdown: string, heading: string): string {
  const expression = new RegExp(
    `## ${escapeForRegExp(heading)}\\n([\\s\\S]*?)(?=\\n## |$)`,
  );

  return markdown.match(expression)?.[1]?.trim() ?? "";
}

function stripCodeBlocks(value: string): string {
  return value.replace(/```[\s\S]*?```/g, "").trim();
}

function extractBulletBlocks(section: string): string[][] {
  const lines = stripCodeBlocks(section)
    .split("\n")
    .map((line) => replaceDisplayIdentity(line.trimEnd()))
    .map((line) => line.trim())
    .filter(Boolean);
  const blocks: string[][] = [];
  let currentBlock: string[] | null = null;

  for (const line of lines) {
    if (line.startsWith("- ")) {
      if (currentBlock) {
        blocks.push(currentBlock);
      }

      currentBlock = [line.slice(2)];
      continue;
    }

    if (currentBlock) {
      currentBlock.push(line);
    }
  }

  if (currentBlock) {
    blocks.push(currentBlock);
  }

  return blocks;
}

function parseHowTheGameWasWon(markdown: string): string[] {
  return extractBulletBlocks(getMarkdownSection(markdown, "How The Game Was Won"))
    .map((block) => block.join(" "));
}

function parseSignificantSwings(markdown: string): HighlightSwing[] {
  return extractBulletBlocks(getMarkdownSection(markdown, "Significant Swings"))
    .filter((block) => !block[0]?.startsWith("Config:"))
    .map((block) => ({
      title: block[0] ?? "",
      details: block.slice(1),
    }));
}

export function parseHighlightAnalysis(markdown: string): HighlightAnalysis {
  return {
    howTheGameWasWon: parseHowTheGameWasWon(markdown),
    significantSwings: parseSignificantSwings(markdown),
  };
}

export function buildHighlightedGame(
  spec: HighlightSpec,
  game: NormalizedGame,
  analysisMarkdown: string,
): HighlightedGame {
  return {
    slug: spec.slug,
    title: spec.title,
    platform: spec.platform,
    resultLabel: spec.resultLabel,
    whyItMatters: spec.whyItMatters,
    links: spec.links,
    game,
    analysis: parseHighlightAnalysis(analysisMarkdown),
  };
}

export function sortHighlightedGames(
  highlights: HighlightedGame[],
): HighlightedGame[] {
  return [...highlights].sort((left, right) => {
    if (left.game.date !== right.game.date) {
      return right.game.date.localeCompare(left.game.date);
    }

    return left.title.localeCompare(right.title);
  });
}

function stripMarkdownLinks(value: string): string {
  return value.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").trim();
}

function parseMarkdownLinks(value: string): HighlightLink[] {
  return [...value.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)].map((match) => ({
    label: match[1] ?? "",
    href: match[2] ?? "",
  }));
}

function splitMarkdownRow(line: string): string[] {
  return line
    .split("|")
    .slice(1, -1)
    .map((cell) => cell.trim());
}

function inferHighlightTitle(opponent: string, whyItMatters: string): string {
  const normalized = whyItMatters.toLowerCase();

  if (normalized.includes("fast tactical finish")) {
    return `Fast checkmate vs ${opponent}`;
  }

  if (normalized.includes("conversion ending")) {
    return `Conversion vs ${opponent}`;
  }

  if (normalized.includes("practical resignation")) {
    return `Practical resignation vs ${opponent}`;
  }

  if (normalized.includes("back-rank mate")) {
    return `Back-rank mate vs ${opponent}`;
  }

  if (normalized.includes("76-move")) {
    return `76-move grind vs ${opponent}`;
  }

  if (normalized.includes("short tactical finish")) {
    return `14-move checkmate vs ${opponent}`;
  }

  if (normalized.includes("move-table domination")) {
    return `Domination vs ${opponent}`;
  }

  if (normalized.includes("comeback mate")) {
    return `Comeback mate vs ${opponent}`;
  }

  if (normalized.includes("80% accuracy")) {
    return `80% accuracy win vs ${opponent}`;
  }

  if (normalized.includes("clean mate finish")) {
    return `Clean mate vs ${opponent}`;
  }

  return `Highlight vs ${opponent}`;
}

function inferHighlightDescriptor(whyItMatters: string): string {
  const normalized = whyItMatters.toLowerCase();

  if (normalized.includes("fast tactical finish")) {
    return "fast-checkmate";
  }

  if (normalized.includes("conversion ending")) {
    return "conversion";
  }

  if (normalized.includes("practical resignation")) {
    return "practical-race";
  }

  if (normalized.includes("back-rank mate")) {
    return "back-rank-mate";
  }

  if (normalized.includes("76-move")) {
    return "endgame-grind";
  }

  if (normalized.includes("short tactical finish")) {
    return "14-move-checkmate";
  }

  if (normalized.includes("move-table domination")) {
    return "domination";
  }

  if (normalized.includes("comeback mate")) {
    return "comeback-mate";
  }

  if (normalized.includes("80% accuracy")) {
    return "80-accuracy";
  }

  if (normalized.includes("clean mate finish")) {
    return "clean-mate";
  }

  return "highlight";
}

function toKebabCase(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function parseHighlightReadme(readme: string): HighlightReadmeEntry[] {
  const tableSection = getMarkdownSection(readme, "Highlight Games");
  const tableLines = tableSection
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("|"));

  if (tableLines.length < 3) {
    return [];
  }

  return tableLines.slice(2).map((line) => {
    const [date, opponent, platform, resultLabel, linkCell, whyCell] =
      splitMarkdownRow(line);
    const whyItMatters = stripMarkdownLinks(whyCell ?? "");
    const descriptor = inferHighlightDescriptor(whyItMatters);

    return {
      date: date ?? "",
      opponent: opponent ?? "",
      platform: platform ?? "",
      resultLabel: resultLabel ?? "",
      whyItMatters,
      links: parseMarkdownLinks(linkCell ?? ""),
      title: inferHighlightTitle(opponent ?? "", whyItMatters),
      slug: `${date ?? ""}-${toKebabCase(opponent ?? "")}-${descriptor}`,
    };
  });
}

export function serializeHighlightManifest(specs: HighlightSpec[]): string {
  const serializedSpecs = JSON.stringify(specs, null, 2);

  return `import type { HighlightSpec } from "@/lib/highlights";

export const HIGHLIGHT_SPECS: HighlightSpec[] = ${serializedSpecs};
`;
}
