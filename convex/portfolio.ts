import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";
import { getPlacementStats } from "../lib/leaderboard";

type PortfolioStats = {
  participations: number;
  finals: number;
  wins: number;
  verified: number;
};

type UserBadge = Doc<"badges"> & {
  awardedAt: number;
};

type VerifiedPortfolioEntry = {
  _id: Id<"portfolioEntries">;
  _creationTime: number;
  userId: Id<"users">;
  hackathonId: Id<"hackathons">;
  hackathonName: string;
  hackathonDate: string;
  result: "participant" | "finalist" | "winner";
  source: "verified";
  placement: Doc<"teamResults">["placement"];
  teamName: string;
};

function getPortfolioResult(placement: Doc<"teamResults">["placement"]) {
  if (placement === "first") return "winner";
  if (placement === "second" || placement === "third") return "finalist";

  return "participant";
}

function getPortfolioStats(entries: VerifiedPortfolioEntry[]): PortfolioStats {
  return {
    participations: entries.length,
    finals: entries.filter(
      (entry) => entry.result === "finalist" || entry.result === "winner",
    ).length,
    wins: entries.filter((entry) => entry.result === "winner").length,
    verified: entries.length,
  };
}


async function getUserBadges(ctx: QueryCtx, userId: Id<"users">) {
  const userBadges = await ctx.db
    .query("userBadges")
    .withIndex("by_user", (index) => index.eq("userId", userId))
    .collect();
  const badges = await Promise.all(
    userBadges.map(async (userBadge) => {
      const badge = await ctx.db.get(userBadge.badgeId);

      if (!badge) return null;

      return {
        ...badge,
        awardedAt: userBadge._creationTime,
      } satisfies UserBadge;
    }),
  );

  return badges.filter((badge): badge is UserBadge => badge !== null);
}

async function getVerifiedPortfolioEntries(ctx: QueryCtx, userId: Id<"users">) {
  const teamResults = await ctx.db.query("teamResults").collect();
  const entries = await Promise.all(
    teamResults.map(async (teamResult) => {
      const team = await ctx.db.get(teamResult.teamId);

      if (!team?.members.includes(userId)) return null;

      const hackathon = await ctx.db.get(teamResult.hackathonId);

      return {
        _id: teamResult._id as unknown as Id<"portfolioEntries">,
        _creationTime: teamResult._creationTime,
        userId,
        hackathonId: teamResult.hackathonId,
        hackathonName: hackathon?.name ?? "Hackathon",
        hackathonDate: hackathon?.dateLabel ?? "Date unavailable",
        result: getPortfolioResult(teamResult.placement),
        source: "verified",
        placement: teamResult.placement,
        teamName: team.teamName,
      } satisfies VerifiedPortfolioEntry;
    }),
  );

  return entries.filter(
    (entry): entry is VerifiedPortfolioEntry => entry !== null,
  );
}

export const getProfile = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    const entries = await getVerifiedPortfolioEntries(ctx, args.userId);
    const badges = await getUserBadges(ctx, args.userId);

    return {
      user,
      badges,
      stats: getPortfolioStats(entries),
      placementStats: getPlacementStats(entries),
      entries,
    };
  },
});

export const listEntries = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return getVerifiedPortfolioEntries(ctx, args.userId);
  },
});

export const addSelfReportedEntry = mutation({
  args: {
    userId: v.id("users"),
    hackathonId: v.optional(v.id("hackathons")),
    hackathonName: v.string(),
    result: v.union(
      v.literal("participant"),
      v.literal("finalist"),
      v.literal("winner"),
    ),
  },
  handler: async () => {
    throw new Error("Manual portfolio entries are disabled. Results come from organizers.");
  },
});

export const addVerifiedEntry = mutation({
  args: {
    userId: v.id("users"),
    hackathonId: v.optional(v.id("hackathons")),
    hackathonName: v.string(),
    result: v.union(
      v.literal("participant"),
      v.literal("finalist"),
      v.literal("winner"),
    ),
  },
  handler: async () => {
    throw new Error("Verified entries are generated from organizer team results.");
  },
});

export const awardBadge = mutation({
  args: {
    userId: v.id("users"),
    badgeId: v.id("badges"),
  },
  handler: async (ctx, args) => {
    const existingBadge = await ctx.db
      .query("userBadges")
      .withIndex("by_user_and_badge", (index) =>
        index.eq("userId", args.userId).eq("badgeId", args.badgeId),
      )
      .unique();

    if (existingBadge) return existingBadge._id;

    return ctx.db.insert("userBadges", {
      userId: args.userId,
      badgeId: args.badgeId,
    });
  },
});

export const updateSelfReportedEntry = mutation({
  args: {
    userId: v.id("users"),
    entryId: v.id("portfolioEntries"),
    hackathonName: v.string(),
    result: v.union(
      v.literal("participant"),
      v.literal("finalist"),
      v.literal("winner"),
    ),
  },
  handler: async () => {
    throw new Error("Manual portfolio entries are disabled. Results come from organizers.");
  },
});

export const deleteSelfReportedEntry = mutation({
  args: {
    userId: v.id("users"),
    entryId: v.id("portfolioEntries"),
  },
  handler: async () => {
    throw new Error("Manual portfolio entries are disabled. Results come from organizers.");
  },
});

