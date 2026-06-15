import { query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import {
  getPlacementScore,
  sortLeaderboardRows,
  type LeaderboardRow,
} from "../lib/leaderboard";

type UserStats = {
  participations: number;
  finals: number;
  wins: number;
  verified: number;
  score: number;
};

const maxLeaderboardUsers = 500;
const maxLeaderboardTeamResults = 500;
const maxLeaderboardTeams = 500;

function getEmptyStats(): UserStats {
  return {
    participations: 0,
    finals: 0,
    wins: 0,
    verified: 0,
    score: 0,
  };
}

function getTeamsFormed(teams: Doc<"teams">[], userId: Id<"users">) {
  return teams.filter((team) => team.members[0] === userId).length;
}

function addResultToStats(
  stats: UserStats,
  placement: Doc<"teamResults">["placement"],
) {
  const isFinalist = placement === "first" || placement === "second" || placement === "third";
  const isWinner = placement === "first";

  return {
    participations: stats.participations + 1,
    finals: stats.finals + (isFinalist ? 1 : 0),
    wins: stats.wins + (isWinner ? 1 : 0),
    verified: stats.verified + 1,
    score: stats.score + getPlacementScore(placement),
  };
}

function getStatsByUserId(
  teamResults: Doc<"teamResults">[],
  teams: Doc<"teams">[],
) {
  const teamById = new Map(teams.map((team) => [team._id, team]));
  const statsByUserId = new Map<Id<"users">, UserStats>();

  for (const teamResult of teamResults) {
    const team = teamById.get(teamResult.teamId);

    if (!team) continue;

    for (const userId of team.members) {
      const currentStats = statsByUserId.get(userId) ?? getEmptyStats();
      statsByUserId.set(userId, addResultToStats(currentStats, teamResult.placement));
    }
  }

  return statsByUserId;
}

export const listTopBuilders = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").take(maxLeaderboardUsers);
    const teamResults = await ctx.db
      .query("teamResults")
      .take(maxLeaderboardTeamResults);
    const teams = await ctx.db.query("teams").take(maxLeaderboardTeams);
    const statsByUserId = getStatsByUserId(teamResults, teams);
    const rows = users.map((user) => {
      const stats = statsByUserId.get(user._id) ?? getEmptyStats();
      const teamsFormed = getTeamsFormed(teams, user._id);

      return {
        userId: user._id,
        displayName: user.displayName,
        initials: user.initials,
        teamsFormed,
        ...stats,
      } satisfies LeaderboardRow;
    });

    return sortLeaderboardRows(rows)
      .filter((row) => row.score > 0)
      .slice(0, 20);
  },
});
