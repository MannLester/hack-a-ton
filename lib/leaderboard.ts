export type TeamResultPlacement = "first" | "second" | "third" | "participant";

export type PlacementCountInput = {
  placement: TeamResultPlacement;
};

export type PlacementStat = {
  placement: TeamResultPlacement;
  label: string;
  count: number;
  points: number;
};

export type LeaderboardScoreInput = {
  participations: number;
  finals: number;
  wins: number;
  verified: number;
  teamsFormed: number;
};

export type LeaderboardRow = LeaderboardScoreInput & {
  userId: string;
  displayName: string;
  initials: string;
  score: number;
};

export function getPlacementScore(placement: TeamResultPlacement) {
  if (placement === "first") return 100;
  if (placement === "second") return 70;
  if (placement === "third") return 50;

  return 10;
}

export function getPlacementLabel(placement: TeamResultPlacement) {
  if (placement === "first") return "1st place";
  if (placement === "second") return "2nd place";
  if (placement === "third") return "3rd place";

  return "Participant";
}

export function getPlacementStats(entries: PlacementCountInput[]): PlacementStat[] {
  const placements: TeamResultPlacement[] = [
    "first",
    "second",
    "third",
    "participant",
  ];

  return placements.map((placement) => {
    const count = entries.filter((entry) => entry.placement === placement).length;

    return {
      placement,
      label: getPlacementLabel(placement),
      count,
      points: count * getPlacementScore(placement),
    };
  });
}

export function getLeaderboardScore(input: LeaderboardScoreInput) {
  return (
    input.wins * getPlacementScore("first") +
    Math.max(input.finals - input.wins, 0) * getPlacementScore("third") +
    Math.max(input.participations - input.finals, 0) * getPlacementScore("participant")
  );
}

export function sortLeaderboardRows(rows: LeaderboardRow[]) {
  return [...rows].sort((firstRow, secondRow) => {
    if (secondRow.score !== firstRow.score) {
      return secondRow.score - firstRow.score;
    }

    return firstRow.displayName.localeCompare(secondRow.displayName);
  });
}
