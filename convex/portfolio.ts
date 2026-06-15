import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";
import { getPlacementStats } from "../lib/leaderboard";
import {
  getCurrentUser,
  getCurrentUserOrRequestedClerkUser,
  requireCurrentStaffUser,
} from "./users";

type PortfolioStats = {
  participations: number;
  finals: number;
  wins: number;
  verified: number;
};

type UserBadge = Doc<"badges"> & {
  awardedAt: number;
};

export type PublicPortfolioUser = Pick<
  Doc<"users">,
  | "_id"
  | "displayName"
  | "initials"
  | "schoolOrCompany"
  | "location"
  | "bio"
  | "onboardingDomains"
  | "onboardingTechStack"
  | "githubUrl"
  | "linkedinUrl"
  | "portfolioUrl"
>;

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

const maxPortfolioResultScan = 500;

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

export function toPublicPortfolioUser(
  user: Doc<"users">,
): PublicPortfolioUser {
  return {
    _id: user._id,
    displayName: user.displayName,
    initials: user.initials,
    schoolOrCompany: user.schoolOrCompany,
    location: user.location,
    bio: user.bio,
    onboardingDomains: user.onboardingDomains,
    onboardingTechStack: user.onboardingTechStack,
    githubUrl: user.githubUrl,
    linkedinUrl: user.linkedinUrl,
    portfolioUrl: user.portfolioUrl,
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
  const teamResults = await ctx.db.query("teamResults").take(maxPortfolioResultScan);
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
    clerkUserId: v.optional(v.string()),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const currentUser = args.userId
      ? null
      : await getCurrentUserOrRequestedClerkUser(ctx, args.clerkUserId);
    const targetUserId = args.userId ?? currentUser?._id;

    if (!targetUserId) throw new Error("User profile target is required.");

    const user = await ctx.db.get(targetUserId);
    const entries = await getVerifiedPortfolioEntries(ctx, targetUserId);
    const badges = await getUserBadges(ctx, targetUserId);

    return {
      user: user ? toPublicPortfolioUser(user) : null,
      badges,
      stats: getPortfolioStats(entries),
      placementStats: getPlacementStats(entries),
      entries,
    };
  },
});

export const listEntries = query({
  args: {
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const currentUser = args.userId ? null : await getCurrentUser(ctx);
    const targetUserId = args.userId ?? currentUser?._id;

    if (!targetUserId) throw new Error("User profile target is required.");

    return getVerifiedPortfolioEntries(ctx, targetUserId);
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
    await requireCurrentStaffUser(ctx);

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
