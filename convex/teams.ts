import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { requireParticipantVisibleHackathon } from "./hackathons";
import { getCurrentUser, getCurrentUserOrRequestedClerkUser } from "./users";

type LftProfileWithUser = Doc<"lftProfiles"> & {
  displayName: string;
  schoolOrCompany: string | null;
  matchPercent: number;
};

type RecruitingTeam = Doc<"teams"> & {
  leadUserId: Id<"users">;
  hackathonName: string;
  hackathonLocation: string;
};

type InterestedUser = Doc<"users"> & {
  decisionId: Id<"teamDecisions">;
  teamId: Id<"teams"> | undefined;
  hackathonId: Id<"hackathons"> | undefined;
};

type TeamMemberProfile = {
  userId: Id<"users">;
  displayName: string;
  initials: string;
  meta: string | null;
  isLead: boolean;
};

const maxUserTeamScan = 200;

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
  ctx: MutationCtx | QueryCtx,
  fromUserId: Id<"users">,
  toUserId: Id<"users">,
  teamId: Id<"teams"> | undefined,
) {
  return ctx.db
    .query("teamDecisions")
    .withIndex("by_from_user", (index) =>
      index.eq("fromUserId", fromUserId),
    )
    .filter((queryBuilder) =>
      queryBuilder.and(
        queryBuilder.eq(queryBuilder.field("toUserId"), toUserId),
        queryBuilder.eq(queryBuilder.field("teamId"), teamId),
      ),
    )
    .first();
}

async function requireVisibleHackathonScope(
  ctx: MutationCtx | QueryCtx,
  hackathonId: Id<"hackathons"> | undefined,
) {
  if (!hackathonId) return;

  await requireParticipantVisibleHackathon(ctx, hackathonId);
}

async function getDecidedProfileUserIds(ctx: QueryCtx, userId: Id<"users">) {
  const decisions = await ctx.db
    .query("teamDecisions")
    .withIndex("by_from_user", (index) => index.eq("fromUserId", userId))
    .collect();

  return new Set(
    decisions
      .filter((decision) => !decision.teamId)
      .map((decision) => decision.toUserId),
  );
}

async function getRecruitingTeamWithHackathon(
  ctx: QueryCtx,
  team: Doc<"teams">,
) {
  const hackathon = await ctx.db.get(team.hackathonId);
  const leadUserId = team.members[0];

  if (!hackathon) return null;
  if (!leadUserId) return null;

  return {
    ...team,
    leadUserId,
    hackathonName: hackathon.name,
    hackathonLocation: hackathon.location,
  } satisfies RecruitingTeam;
}

async function getTeamMemberProfile(
  ctx: QueryCtx,
  userId: Id<"users">,
  leadUserId: Id<"users">,
) {
  const user = await ctx.db.get(userId);

  return {
    userId,
    displayName: user?.displayName ?? "Unknown builder",
    initials: user?.initials ?? "HA",
    meta: [user?.schoolOrCompany, user?.location].filter(Boolean).join(" · ") || null,
    isLead: userId === leadUserId,
  } satisfies TeamMemberProfile;
}

async function findReverseLike(
  ctx: MutationCtx,
  fromUserId: Id<"users">,
  toUserId: Id<"users">,
  teamId: Id<"teams"> | undefined,
) {
  return ctx.db
    .query("teamDecisions")
    .withIndex("by_from_user", (index) =>
      index.eq("fromUserId", toUserId),
    )
    .filter((queryBuilder) =>
      queryBuilder.and(
        queryBuilder.eq(queryBuilder.field("toUserId"), fromUserId),
        queryBuilder.eq(queryBuilder.field("teamId"), teamId),
        queryBuilder.eq(queryBuilder.field("decision"), "like"),
      ),
    )
    .first();
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

async function findRecruitingTeamLedByUser(
  ctx: MutationCtx,
  leadUserId: Id<"users">,
  hackathonId: Id<"hackathons"> | undefined,
) {
  const recruitingTeams = await ctx.db
    .query("teams")
    .withIndex("by_status", (index) => index.eq("status", "recruiting"))
    .collect();

  return (
    recruitingTeams.find((team) => {
      const isLead = team.members[0] === leadUserId;
      const matchesHackathon = !hackathonId || team.hackathonId === hackathonId;

      return isLead && matchesHackathon;
    }) ?? null
  );
}

async function addUserToTeamIfPossible(
  ctx: MutationCtx,
  team: Doc<"teams">,
  userId: Id<"users">,
) {
  if (team.members.includes(userId)) return team._id;
  if (team.currentSize >= team.targetSize) return null;

  const nextMembers = [...team.members, userId];
  const nextCurrentSize = nextMembers.length;
  const nextStatus =
    nextCurrentSize >= team.targetSize ? "full" : team.status;

  await ctx.db.patch(team._id, {
    members: nextMembers,
    currentSize: nextCurrentSize,
    status: nextStatus,
  });

  return team._id;
}

async function addMutualLikeUserToLeadTeam(
  ctx: MutationCtx,
  fromUserId: Id<"users">,
  toUserId: Id<"users">,
  hackathonId: Id<"hackathons"> | undefined,
  teamId: Id<"teams"> | undefined,
) {
  const selectedTeam = teamId ? await ctx.db.get(teamId) : null;

  if (selectedTeam) {
    const selectedLeadUserId = selectedTeam.members[0];
    const joiningUserId =
      selectedLeadUserId === fromUserId ? toUserId : fromUserId;

    return addUserToTeamIfPossible(ctx, selectedTeam, joiningUserId);
  }

  const fromUserTeam = await findRecruitingTeamLedByUser(
    ctx,
    fromUserId,
    hackathonId,
  );

  if (fromUserTeam)
    return addUserToTeamIfPossible(ctx, fromUserTeam, toUserId);

  const toUserTeam = await findRecruitingTeamLedByUser(
    ctx,
    toUserId,
    hackathonId,
  );

  if (!toUserTeam) return null;

  return addUserToTeamIfPossible(ctx, toUserTeam, fromUserId);
}

async function createMatchIfMutualLike(
  ctx: MutationCtx,
  fromUserId: Id<"users">,
  toUserId: Id<"users">,
  hackathonId: Id<"hackathons"> | undefined,
) {
  const reverseLike = await findReverseLike(ctx, fromUserId, toUserId, undefined);

  if (!reverseLike) return null;

  const existingMatch = await findExistingMatch(ctx, fromUserId, toUserId);

  await addMutualLikeUserToLeadTeam(
    ctx,
    fromUserId,
    toUserId,
    hackathonId,
    undefined,
  );

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

async function respondToTeamApplication(
  ctx: MutationCtx,
  fromUserId: Id<"users">,
  applicantUserId: Id<"users">,
  teamId: Id<"teams">,
  decision: "like" | "pass",
) {
  if (decision === "pass") return null;

  const team = await ctx.db.get(teamId);

  if (!team) return null;
  if (team.members[0] !== fromUserId) return null;

  return addUserToTeamIfPossible(ctx, team, applicantUserId);
}

export const listActiveProfiles = query({
  args: {
    clerkUserId: v.optional(v.string()),
    hackathonId: v.optional(v.id("hackathons")),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUserOrRequestedClerkUser(
      ctx,
      args.clerkUserId,
    );
    await requireVisibleHackathonScope(ctx, args.hackathonId);

    const activeProfiles = await ctx.db
      .query("lftProfiles")
      .withIndex("by_active", (index) => index.eq("isActive", true))
      .collect();
    const visibleProfiles = activeProfiles.filter((profile) => {
      const isDifferentUser = profile.userId !== currentUser._id;
      const matchesHackathon =
        !args.hackathonId || profile.hackathonId === args.hackathonId;

      return isDifferentUser && matchesHackathon;
    });

    return Promise.all(
      visibleProfiles.map((profile) =>
        getProfileWithUser(ctx, profile, currentUser._id),
      ),
    );
  },
});

export const listRecruitingTeams = query({
  args: {
    clerkUserId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUserOrRequestedClerkUser(
      ctx,
      args.clerkUserId,
    );
    const decisions = await ctx.db
      .query("teamDecisions")
      .withIndex("by_from_user", (index) =>
        index.eq("fromUserId", currentUser._id),
      )
      .collect();
    const decidedTeamIds = new Set(
      decisions
        .map((decision) => decision.teamId)
        .filter((teamId): teamId is Id<"teams"> => Boolean(teamId)),
    );
    const recruitingTeams = await ctx.db
      .query("teams")
      .withIndex("by_status", (index) => index.eq("status", "recruiting"))
      .collect();
    const visibleTeams = recruitingTeams.filter((team) => {
      const isNotMember = !team.members.includes(currentUser._id);
      const isUndecided = !decidedTeamIds.has(team._id);

      return isNotMember && isUndecided;
    });
    const teamsWithHackathon = await Promise.all(
      visibleTeams.map((team) => getRecruitingTeamWithHackathon(ctx, team)),
    );

    return teamsWithHackathon.filter((team) => team !== null);
  },
});

export const getMyProfile = query({
  args: {},
  handler: async (ctx) => {
    const currentUser = await getCurrentUser(ctx);

    return ctx.db
      .query("lftProfiles")
      .withIndex("by_user", (index) => index.eq("userId", currentUser._id))
      .first();
  },
});

export const upsertProfile = mutation({
  args: {
    hackathonId: v.optional(v.id("hackathons")),
    role: v.string(),
    stack: v.array(v.string()),
    availability: v.string(),
    goal: v.string(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    await requireVisibleHackathonScope(ctx, args.hackathonId);

    const existingProfile = await ctx.db
      .query("lftProfiles")
      .withIndex("by_user", (index) => index.eq("userId", currentUser._id))
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
        userId: currentUser._id,
        ...profileFields,
      });

    await ctx.db.patch(existingProfile._id, profileFields);
    return existingProfile._id;
  },
});

export const decideOnProfile = mutation({
  args: {
    toUserId: v.id("users"),
    teamId: v.optional(v.id("teams")),
    hackathonId: v.optional(v.id("hackathons")),
    decision: v.union(v.literal("like"), v.literal("pass")),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    await requireVisibleHackathonScope(ctx, args.hackathonId);

    const existingDecision = await findExistingDecision(
      ctx,
      currentUser._id,
      args.toUserId,
      args.teamId,
    );
    const decisionFields = {
      teamId: args.teamId,
      hackathonId: args.hackathonId,
      decision: args.decision,
    };

    if (existingDecision)
      await ctx.db.patch(existingDecision._id, decisionFields);
    if (!existingDecision) {
      await ctx.db.insert("teamDecisions", {
        fromUserId: currentUser._id,
        toUserId: args.toUserId,
        ...decisionFields,
      });
    }

    if (args.teamId)
      return respondToTeamApplication(
        ctx,
        currentUser._id,
        args.toUserId,
        args.teamId,
        args.decision,
      );

    if (args.decision === "pass") return null;

    return createMatchIfMutualLike(
      ctx,
      currentUser._id,
      args.toUserId,
      args.hackathonId,
    );
  },
});

export const listMyMatches = query({
  args: {},
  handler: async (ctx) => {
    const currentUser = await getCurrentUser(ctx);
    const [firstUserMatches, secondUserMatches] = await Promise.all([
      ctx.db
        .query("teamMatches")
        .withIndex("by_first_user", (index) =>
          index.eq("firstUserId", currentUser._id),
        )
        .collect(),
      ctx.db
        .query("teamMatches")
        .withIndex("by_second_user", (index) =>
          index.eq("secondUserId", currentUser._id),
        )
        .collect(),
    ]);

    return [...firstUserMatches, ...secondUserMatches].filter(
      (match) => match.status === "active",
    );
  },
});

export const getMyTeam = query({
  args: {},
  handler: async (ctx) => {
    const currentUser = await getCurrentUser(ctx);
    const allTeams = await ctx.db.query("teams").take(maxUserTeamScan);
    const team = allTeams.find((item) => item.members.includes(currentUser._id));

    if (!team) return null;

    const leadUserId = team.members[0];
    const memberProfiles = await Promise.all(
      team.members.map((memberId) =>
        getTeamMemberProfile(ctx, memberId, leadUserId),
      ),
    );

    return {
      ...team,
      memberProfiles,
    };
  },
});

export const listMyTeams = query({
  args: {
    clerkUserId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUserOrRequestedClerkUser(
      ctx,
      args.clerkUserId,
    );
    const allTeams = await ctx.db.query("teams").take(maxUserTeamScan);
    const joinedTeams = allTeams.filter((team) =>
      team.members.includes(currentUser._id),
    );

    return Promise.all(
      joinedTeams.map(async (team) => {
        const leadUserId = team.members[0];
        const memberProfiles = await Promise.all(
          team.members.map((memberId) =>
            getTeamMemberProfile(ctx, memberId, leadUserId),
          ),
        );

        return {
          ...team,
          memberProfiles,
        };
      }),
    );
  },
});

export const listByHackathon = query({
  args: {
    hackathonId: v.id("hackathons"),
  },
  handler: async (ctx, args) => {
    await requireParticipantVisibleHackathon(ctx, args.hackathonId);

    const hackathonTeams = await ctx.db
      .query("teams")
      .withIndex("by_hackathon", (index) =>
        index.eq("hackathonId", args.hackathonId),
      )
      .collect();

    return Promise.all(
      hackathonTeams.map(async (team) => {
        const leadUserId = team.members[0];
        const memberProfiles = await Promise.all(
          team.members.map((memberId) =>
            getTeamMemberProfile(ctx, memberId, leadUserId),
          ),
        );

        return {
          ...team,
          memberProfiles,
        };
      }),
    );
  },
});

export const listInterestedUsersForMyTeam = query({
  args: {
    clerkUserId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUserOrRequestedClerkUser(
      ctx,
      args.clerkUserId,
    );
    const allTeams = await ctx.db.query("teams").take(maxUserTeamScan);
    const ledTeams = allTeams.filter((item) => item.members[0] === currentUser._id);
    const ledTeamIds = new Set(ledTeams.map((team) => team._id));

    if (ledTeams.length === 0) return [];

    const inboundLikes = await ctx.db
      .query("teamDecisions")
      .filter((queryBuilder) =>
          queryBuilder.and(
          queryBuilder.eq(queryBuilder.field("toUserId"), currentUser._id),
          queryBuilder.eq(queryBuilder.field("decision"), "like"),
        ),
      )
      .collect();
    const teamInboundLikes = inboundLikes.filter(
      (decision) => decision.teamId && ledTeamIds.has(decision.teamId),
    );
    const undecidedLikes = await Promise.all(
      teamInboundLikes.map(async (decision) => {
        const existingResponse = await findExistingDecision(
          ctx,
          currentUser._id,
          decision.fromUserId,
          decision.teamId,
        );
        const user = await ctx.db.get(decision.fromUserId);

        if (existingResponse) return null;
        if (!user) return null;

        return {
          ...user,
          decisionId: decision._id,
          teamId: decision.teamId,
          hackathonId: decision.hackathonId,
        } satisfies InterestedUser;
      }),
    );

    return undecidedLikes.filter((user) => user !== null);
  },
});

export const createTeam = mutation({
  args: {
    clerkUserId: v.optional(v.string()),
    teamName: v.string(),
    hackathonId: v.id("hackathons"),
    goal: v.string(),
    roles: v.array(v.string()),
    targetSize: v.number(),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUserOrRequestedClerkUser(
      ctx,
      args.clerkUserId,
    );
    await requireParticipantVisibleHackathon(ctx, args.hackathonId);

    return ctx.db.insert("teams", {
      hackathonId: args.hackathonId,
      teamName: args.teamName,
      goal: args.goal,
      members: [currentUser._id],
      currentSize: 1,
      targetSize: args.targetSize,
      missingRoles: args.roles,
      status: "recruiting",
    });
  },
});
