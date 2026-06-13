import { describe, expect, test } from "vitest";
import { getLeaderboardScore, sortLeaderboardRows } from "../lib/leaderboard";

describe("leaderboard scoring", () => {
  test("scores participation, finalist, winner, and verified entries", () => {
    expect(
      getLeaderboardScore({
        participations: 3,
        finals: 2,
        wins: 1,
        verified: 2,
        teamsFormed: 1,
      }),
    ).toBe(39);
  });

  test("sorts higher scores first and uses display name as tiebreaker", () => {
    const rows = sortLeaderboardRows([
      { userId: "b", displayName: "Bea", initials: "B", score: 12, wins: 0, finals: 1, participations: 2, verified: 0, teamsFormed: 0 },
      { userId: "a", displayName: "Ana", initials: "A", score: 12, wins: 0, finals: 1, participations: 2, verified: 0, teamsFormed: 0 },
      { userId: "c", displayName: "Carlo", initials: "C", score: 18, wins: 1, finals: 1, participations: 1, verified: 0, teamsFormed: 1 },
    ]);

    expect(rows.map((row) => row.displayName)).toEqual(["Carlo", "Ana", "Bea"]);
  });
});
