import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";

type LftProfileWithUser = Doc<"lftProfiles"> & {
  displayName: string;
  schoolOrCompany: string | null;
  matchPercent: number;
};

function getPairKey(firstUserId: Id<"users">, secondUserId: Id<"users">) {
  return [firstUserId, secondUserId].sort().join(":");
}

function getMatchPercent(
  viewerUserId: Id<"users">,
  profileUserId: Id<"users">,
) {
  const pairKey = getPairKey(viewerUserId, profileUserId);
  let total = 0;

  for (const character of pairKey) total += character.charCodeAt(0);

  return 70 + (total % 26);
}

async function getProfileWithUser(
  ctx: QueryCtx,
  profile: Doc<"lftProfiles">,
  viewerUserId: Id<"users">,
) {
  const user = await ctx.db.get(profile.userId);

  return {
    ...profile,
    displayName: user?.displayName ?? "Unknown builder",
    schoolOrCompany: user?.schoolOrCompany ?? null,
    matchPercent: getMatchPercent(viewerUserId, profile.userId),
  } satisfies LftProfileWithUser;
}

async function findExistingDecision(
  ctx: MutationCtx,
  fromUserId: Id<"users">,
  toUserId: Id<"users">,
) {
  return ctx.db
    .query("teamDecisions")
    .withIndex("by_pair", (index) =>
      index.eq("fromUserId", fromUserId).eq("toUserId", toUserId),
    )
    .unique();
}

async function findReverseLike(
  ctx: MutationCtx,
  fromUserId: Id<"users">,
  toUserId: Id<"users">,
) {
  return ctx.db
    .query("teamDecisions")
    .withIndex("by_pair", (index) =>
      index.eq("fromUserId", toUserId).eq("toUserId", fromUserId),
    )
    .filter((queryBuilder) =>
      queryBuilder.eq(queryBuilder.field("decision"), "like"),
    )
    .unique();
}

async function findExistingMatch(
  ctx: MutationCtx,
  firstUserId: Id<"users">,
  secondUserId: Id<"users">,
) {
  const [lowerUserId, higherUserId] = [firstUserId, secondUserId].sort() as [
    Id<"users">,
    Id<"users">,
  ];

  return ctx.db
    .query("teamMatches")
    .withIndex("by_first_user", (index) => index.eq("firstUserId", lowerUserId))
    .filter((queryBuilder) =>
      queryBuilder.eq(queryBuilder.field("secondUserId"), higherUserId),
    )
    .unique();
}

async function createMatchIfMutualLike(
  ctx: MutationCtx,
  fromUserId: Id<"users">,
  toUserId: Id<"users">,
  hackathonId: Id<"hackathons"> | undefined,
) {
  const reverseLike = await findReverseLike(ctx, fromUserId, toUserId);

  if (!reverseLike) return null;

  const existingMatch = await findExistingMatch(ctx, fromUserId, toUserId);

  if (existingMatch) return existingMatch._id;

  const [lowerUserId, higherUserId] = [fromUserId, toUserId].sort() as [
    Id<"users">,
    Id<"users">,
  ];

  return ctx.db.insert("teamMatches", {
    firstUserId: lowerUserId,
    secondUserId: higherUserId,
    hackathonId,
    status: "active",
  });
}

export const listActiveProfiles = query({
  args: {
    viewerUserId: v.id("users"),
    hackathonId: v.optional(v.id("hackathons")),
  },
  handler: async (ctx, args) => {
    const activeProfiles = await ctx.db
      .query("lftProfiles")
      .withIndex("by_active", (index) => index.eq("isActive", true))
      .collect();
    const visibleProfiles = activeProfiles.filter((profile) => {
      const isDifferentUser = profile.userId !== args.viewerUserId;
      const matchesHackathon =
        !args.hackathonId || profile.hackathonId === args.hackathonId;

      return isDifferentUser && matchesHackathon;
    });

    return Promise.all(
      visibleProfiles.map((profile) =>
        getProfileWithUser(ctx, profile, args.viewerUserId),
      ),
    );
  },
});

export const getMyProfile = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return ctx.db
      .query("lftProfiles")
      .withIndex("by_user", (index) => index.eq("userId", args.userId))
      .first();
  },
});

export const upsertProfile = mutation({
  args: {
    userId: v.id("users"),
    hackathonId: v.optional(v.id("hackathons")),
    role: v.string(),
    stack: v.array(v.string()),
    availability: v.string(),
    goal: v.string(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existingProfile = await ctx.db
      .query("lftProfiles")
      .withIndex("by_user", (index) => index.eq("userId", args.userId))
      .first();

    const profileFields = {
      hackathonId: args.hackathonId,
      role: args.role,
      stack: args.stack,
      availability: args.availability,
      goal: args.goal,
      isActive: args.isActive,
    };

    if (!existingProfile)
      return ctx.db.insert("lftProfiles", {
        userId: args.userId,
        ...profileFields,
      });

    await ctx.db.patch(existingProfile._id, profileFields);
    return existingProfile._id;
  },
});

export const decideOnProfile = mutation({
  args: {
    fromUserId: v.id("users"),
    toUserId: v.id("users"),
    hackathonId: v.optional(v.id("hackathons")),
    decision: v.union(v.literal("like"), v.literal("pass")),
  },
  handler: async (ctx, args) => {
    const existingDecision = await findExistingDecision(
      ctx,
      args.fromUserId,
      args.toUserId,
    );
    const decisionFields = {
      hackathonId: args.hackathonId,
      decision: args.decision,
    };

    if (existingDecision)
      await ctx.db.patch(existingDecision._id, decisionFields);
    if (!existingDecision) {
      await ctx.db.insert("teamDecisions", {
        fromUserId: args.fromUserId,
        toUserId: args.toUserId,
        ...decisionFields,
      });
    }

    if (args.decision === "pass") return null;

    return createMatchIfMutualLike(
      ctx,
      args.fromUserId,
      args.toUserId,
      args.hackathonId,
    );
  },
});

export const listMyMatches = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const [firstUserMatches, secondUserMatches] = await Promise.all([
      ctx.db
        .query("teamMatches")
        .withIndex("by_first_user", (index) =>
          index.eq("firstUserId", args.userId),
        )
        .collect(),
      ctx.db
        .query("teamMatches")
        .withIndex("by_second_user", (index) =>
          index.eq("secondUserId", args.userId),
        )
        .collect(),
    ]);

    return [...firstUserMatches, ...secondUserMatches].filter(
      (match) => match.status === "active",
    );
  },
});

export const getMyTeam = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const allTeams = await ctx.db.query("teams").collect();
    return allTeams.find((team) => team.members.includes(args.userId)) ?? null;
  },
});

export const createTeam = mutation({
  args: {
    userId: v.id("users"),
    teamName: v.string(),
    hackathonId: v.id("hackathons"),
    goal: v.string(),
    roles: v.array(v.string()),
    targetSize: v.number(),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("teams", {
      hackathonId: args.hackathonId,
      teamName: args.teamName,
      goal: args.goal,
      members: [args.userId],
      currentSize: 1,
      targetSize: args.targetSize,
      missingRoles: args.roles,
      status: "recruiting",
    });
  },
});
