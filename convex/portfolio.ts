import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";

type PortfolioStats = {
  participations: number;
  finals: number;
  wins: number;
  verified: number;
};

type UserBadge = Doc<"badges"> & {
  awardedAt: number;
};

function getPortfolioStats(entries: Doc<"portfolioEntries">[]): PortfolioStats {
  return {
    participations: entries.length,
    finals: entries.filter(
      (entry) => entry.result === "finalist" || entry.result === "winner",
    ).length,
    wins: entries.filter((entry) => entry.result === "winner").length,
    verified: entries.filter((entry) => entry.source === "verified").length,
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

export const getProfile = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    const entries = await ctx.db
      .query("portfolioEntries")
      .withIndex("by_user", (index) => index.eq("userId", args.userId))
      .collect();
    const badges = await getUserBadges(ctx, args.userId);

    return {
      user,
      badges,
      stats: getPortfolioStats(entries),
      entries,
    };
  },
});

export const listEntries = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return ctx.db
      .query("portfolioEntries")
      .withIndex("by_user", (index) => index.eq("userId", args.userId))
      .collect();
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
  handler: async (ctx, args) => {
    return ctx.db.insert("portfolioEntries", {
      userId: args.userId,
      hackathonId: args.hackathonId,
      hackathonName: args.hackathonName,
      result: args.result,
      source: "self_reported",
    });
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
  handler: async (ctx, args) => {
    return ctx.db.insert("portfolioEntries", {
      userId: args.userId,
      hackathonId: args.hackathonId,
      hackathonName: args.hackathonName,
      result: args.result,
      source: "verified",
    });
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
  handler: async (ctx, args) => {
    const entry = await ctx.db.get(args.entryId);

    if (!entry || entry.userId !== args.userId || entry.source !== "self_reported") {
      throw new Error("Self-reported portfolio entry not found.");
    }

    await ctx.db.patch(args.entryId, {
      hackathonName: args.hackathonName,
      result: args.result,
    });

    return args.entryId;
  },
});

export const deleteSelfReportedEntry = mutation({
  args: {
    userId: v.id("users"),
    entryId: v.id("portfolioEntries"),
  },
  handler: async (ctx, args) => {
    const entry = await ctx.db.get(args.entryId);

    if (!entry || entry.userId !== args.userId || entry.source !== "self_reported") {
      throw new Error("Self-reported portfolio entry not found.");
    }

    await ctx.db.delete(args.entryId);
    return args.entryId;
  },
});
