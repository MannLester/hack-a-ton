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

export function getLeaderboardScore(input: LeaderboardScoreInput) {
  return (
    input.participations * 2 +
    input.finals * 5 +
    input.wins * 15 +
    input.verified * 2 +
    input.teamsFormed * 4
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
