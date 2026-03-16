export type PlayerColor = "white" | "black";

export type GameResult = "win" | "loss" | "draw";

export interface PlayerIdentity {
  sourceUsername: string;
  displayName: string;
}

export interface DateRange {
  start: string;
  end: string;
}

export interface ResultBreakdown {
  wins: number;
  losses: number;
  draws: number;
}

export interface RecordSplit extends ResultBreakdown {
  winRate: number;
}

export interface NormalizedGame {
  id: string;
  sequence: number;
  date: string;
  event: string;
  site: string;
  playerColor: PlayerColor;
  playerDisplayName: string;
  playerUsername: string;
  opponentName: string;
  result: GameResult;
  playerRating: number | null;
  opponentRating: number | null;
  ratingDelta: number | null;
  timeControl: string;
  termination: string;
  displayTermination: string;
  sanMoves: string[];
  fenByPly: string[];
  plyCount: number;
  moveCount: number;
  finalFen: string;
  endTime: string | null;
  headers: Record<string, string>;
  openingSignature: string;
  openingLabel: string;
}

export interface EloPoint {
  gameId: string;
  sequence: number;
  date: string;
  rating: number;
  delta: number | null;
  result: GameResult;
  color: PlayerColor;
  opponent: string;
  timeControl: string;
  rollingAverage: number | null;
}

export interface MilestonePoint {
  title: string;
  description: string;
  gameId: string;
  sequence: number;
  date: string;
  rating: number;
}

export interface StreakSummary {
  type: Extract<GameResult, "win" | "loss">;
  length: number;
  startGameId: string;
  endGameId: string;
  startDate: string;
  endDate: string;
}

export interface HeatmapCell {
  date: string;
  count: number;
  weekday: number;
  week: string;
}

export interface TimeControlBreakdown extends RecordSplit {
  label: string;
  count: number;
}

export interface TerminationBreakdown {
  label: string;
  count: number;
}

export interface OpeningSignature {
  key: string;
  label: string;
  moves: string[];
  count: number;
  record: RecordSplit;
}

export interface RecentFormSummary {
  games: number;
  record: ResultBreakdown;
  winRate: number;
}

export interface SpotlightGame {
  gameId: string;
  title: string;
  description: string;
}

export interface InsightSummary {
  identity: PlayerIdentity;
  gameCount: number;
  dateRange: DateRange;
  currentRating: number | null;
  peakRating: number | null;
  peakGameId: string | null;
  lowestRating: number | null;
  lowestGameId: string | null;
  netRatingChange: number | null;
  ratingVolatility: number;
  averageMoveCount: number;
  mostCommonTimeControl: string;
  record: ResultBreakdown;
  winRate: number;
  white: RecordSplit;
  black: RecordSplit;
  currentStreak: {
    type: GameResult;
    length: number;
  };
  longestWinStreak: StreakSummary | null;
  longestLossStreak: StreakSummary | null;
  bestRecentForm: RecentFormSummary;
  activityHeatmap: HeatmapCell[];
  timeControlBreakdown: TimeControlBreakdown[];
  terminationBreakdown: TerminationBreakdown[];
  eloSeries: EloPoint[];
  milestonePoints: MilestonePoint[];
  openingHighlights: OpeningSignature[];
  spotlights: SpotlightGame[];
  recentGames: NormalizedGame[];
}

export interface DerivedSiteData {
  identity: PlayerIdentity;
  summary: InsightSummary;
  games: NormalizedGame[];
  openings: OpeningSignature[];
}
