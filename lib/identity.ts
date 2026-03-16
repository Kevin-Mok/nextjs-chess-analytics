import type { PlayerIdentity } from "@/types/chess";

export const PLAYER_IDENTITY: PlayerIdentity = {
  sourceUsername: "SoloPistol",
  displayName: "Kevin Mok",
};

export function replaceDisplayIdentity(value: string): string {
  return value.replaceAll(
    PLAYER_IDENTITY.sourceUsername,
    PLAYER_IDENTITY.displayName,
  );
}
