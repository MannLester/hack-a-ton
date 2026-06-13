import { query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import {
  getLeaderboardScore,
  sortLeaderboardRows,
  type LeaderboardRow,
} from "../lib/leaderboard";

type PortfolioStats = {
  participations: number;
  finals: number;
  wins: number;
  verified: number;
};

function getEmptyStats(): PortfolioStats {
  return {
    participations: 0,
    finals: 0,
    wins: 0,
    verified: 0,
  };
}

function getStatsFromEntries(entries: Doc<"portfolioEntries">[]) {
  return entries.reduce((stats, entry) => {
    const finals = entry.result === "finalist" || entry.result === "winner" ? 1 : 0;
    const wins = entry.result === "winner" ? 1 : 0;
    const verified = entry.source === "verified" ? 1 : 0;

    return {
      participations: stats.participations + 1,
      finals: stats.finals + finals,
      wins: stats.wins + wins,
      verified: stats.verified + verified,
    };
  }, getEmptyStats());
}

function getTeamsFormed(teams: Doc<"teams">[], userId: Id<"users">) {
  return teams.filter((team) => team.members[0] === userId).length;
}

export const listTopBuilders = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const entries = await ctx.db.query("portfolioEntries").collect();
    const teams = await ctx.db.query("teams").collect();
    const rows = users.map((user) => {
      const userEntries = entries.filter((entry) => entry.userId === user._id);
      const stats = getStatsFromEntries(userEntries);
      const teamsFormed = getTeamsFormed(teams, user._id);
      const score = getLeaderboardScore({ ...stats, teamsFormed });

      return {
        userId: user._id,
        displayName: user.displayName,
        initials: user.initials,
        score,
        teamsFormed,
        ...stats,
      } satisfies LeaderboardRow;
    });

    return sortLeaderboardRows(rows)
      .filter((row) => row.score > 0)
      .slice(0, 20);
  },
});
