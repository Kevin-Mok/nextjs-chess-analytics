import type { GamePlatform } from "@/types/chess";

export const PLATFORM_LABELS: Record<GamePlatform, string> = {
  "chess-com": "Chess.com",
  lichess: "Lichess",
};

export const PLATFORM_LINE_COLORS: Record<GamePlatform, string> = {
  "chess-com": "#f5cc80",
  lichess: "#60a5fa",
};

export function getPlatformLabel(platform: GamePlatform): string {
  return PLATFORM_LABELS[platform];
}

export function getPlatformFromSite(site: string): GamePlatform {
  return site.toLowerCase().includes("lichess.org") ? "lichess" : "chess-com";
}
