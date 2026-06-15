import { describe, expect, test } from "vitest";
import { getLeaderboardScore, getPlacementScore, getPlacementStats, sortLeaderboardRows } from "../lib/leaderboard";

describe("leaderboard scoring", () => {
  test("weights organizer-submitted placements", () => {
    expect(getPlacementScore("first")).toBe(100);
    expect(getPlacementScore("second")).toBe(70);
    expect(getPlacementScore("third")).toBe(50);
    expect(getPlacementScore("participant")).toBe(10);
  });

  test("scores verified organizer results from placement-weighted stats", () => {
    expect(
      getLeaderboardScore({
        participations: 3,
        finals: 2,
        wins: 1,
        verified: 2,
        teamsFormed: 1,
      }),
    ).toBe(160);
  });

  test("counts profile placements and points by placement", () => {
    const stats = getPlacementStats([
      { placement: "first" },
      { placement: "first" },
      { placement: "second" },
      { placement: "participant" },
    ]);

    expect(stats).toEqual([
      { placement: "first", label: "1st place", count: 2, points: 200 },
      { placement: "second", label: "2nd place", count: 1, points: 70 },
      { placement: "third", label: "3rd place", count: 0, points: 0 },
      { placement: "participant", label: "Participant", count: 1, points: 10 },
    ]);
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
