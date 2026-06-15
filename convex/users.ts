import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";

const userProfileFields = {
  displayName: v.string(),
  initials: v.string(),
  schoolOrCompany: v.optional(v.string()),
  location: v.optional(v.string()),
};

const onboardingDataFields = {
  clerkUserId: v.optional(v.string()),
  persona: v.union(v.literal("participant"), v.literal("organizer")),
  domains: v.array(v.string()),
  techStack: v.array(v.string()),
  locationStrategy: v.optional(v.union(v.literal("local"), v.literal("global"))),
  experienceLevel: v.optional(
    v.union(
      v.literal("first-timer"),
      v.literal("frequent-hacker"),
      v.literal("veteran"),
    ),
  ),
  githubUrl: v.optional(v.string()),
  linkedinUrl: v.optional(v.string()),
  portfolioUrl: v.optional(v.string()),
  orgName: v.optional(v.string()),
  orgBio: v.optional(v.string()),
};

function getInitials(displayName: string) {
  return displayName
    .split(" ")
    .map((namePart) => namePart[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getResolvedInitials(displayName: string, initials?: string) {
  const trimmedInitials = initials?.trim();

  if (trimmedInitials) return trimmedInitials.toUpperCase();

  return getInitials(displayName) || "HA";
}

type UserRole = Doc<"users">["role"];
type AuthCtx = MutationCtx | QueryCtx;

async function getUserByClerkId(ctx: AuthCtx, clerkUserId: string) {
  return ctx.db
    .query("users")
    .withIndex("by_clerk_user_id", (index) =>
      index.eq("clerkUserId", clerkUserId),
    )
    .unique();
}

async function getOrganizerByOwnerId(
  ctx: AuthCtx,
  ownerUserId: Id<"users">,
) {
  return ctx.db
    .query("organizers")
    .withIndex("by_owner", (index) => index.eq("ownerUserId", ownerUserId))
    .unique();
}

function getIdentityDisplayName(identity: Awaited<ReturnType<AuthCtx["auth"]["getUserIdentity"]>>) {
  return (
    identity?.name ??
    identity?.preferredUsername ??
    identity?.nickname ??
    identity?.email?.split("@")[0] ??
    "Hack-A-Ton Builder"
  );
}

export function getResolvedOnboardingClerkUserId({
  authenticatedSubject,
  requestedClerkUserId,
}: {
  authenticatedSubject?: string;
  requestedClerkUserId?: string;
}) {
  return authenticatedSubject ?? requestedClerkUserId;
}

export async function getAuthenticatedClerkSubject(ctx: AuthCtx) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) throw new Error("Authentication is required.");

  return identity.subject;
}

export async function getCurrentUser(ctx: AuthCtx) {
  const clerkUserId = await getAuthenticatedClerkSubject(ctx);
  const user = await getUserByClerkId(ctx, clerkUserId);

  if (!user) throw new Error("Current user record not found.");

  return user;
}

export async function ensureCurrentUser(
  ctx: MutationCtx,
  role: "participant" | "organizer",
) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) throw new Error("Authentication is required.");

  const displayName = getIdentityDisplayName(identity);

  return upsertUser(ctx, {
    clerkUserId: identity.subject,
    displayName,
    initials: getInitials(displayName) || "HA",
    role,
    schoolOrCompany: identity.email,
  });
}

export async function requireCurrentOrganizer(ctx: AuthCtx) {
  const currentUser = await getCurrentUser(ctx);
  const organizer = await getOrganizerByOwnerId(ctx, currentUser._id);

  if (!organizer) throw new Error("Organizer account is required.");

  return { currentUser, organizer };
}

export async function requireCurrentStaffUser(ctx: AuthCtx) {
  const currentUser = await getCurrentUser(ctx);

  if (currentUser.role !== "staff") throw new Error("Staff access is required.");

  return currentUser;
}

export async function requireCurrentUserRole(ctx: AuthCtx, role: UserRole) {
  const currentUser = await getCurrentUser(ctx);

  if (currentUser.role !== role) throw new Error(`${role} access is required.`);

  return currentUser;
}

async function upsertUser(
  ctx: MutationCtx,
  args: {
    clerkUserId: string;
    displayName: string;
    initials: string;
    role: "participant" | "organizer";
    schoolOrCompany?: string;
    location?: string;
  },
) {
  const existingUser = await getUserByClerkId(ctx, args.clerkUserId);
  const preservedRole: "participant" | "organizer" | "staff" =
    existingUser?.role === "staff" ? "staff" : args.role;
  const userFields = {
    clerkUserId: args.clerkUserId,
    displayName: args.displayName,
    initials: getResolvedInitials(args.displayName, args.initials),
    role: preservedRole,
    schoolOrCompany: args.schoolOrCompany,
    location: args.location,
  };

  if (!existingUser) return ctx.db.insert("users", userFields);

  await ctx.db.patch(existingUser._id, userFields);
  return existingUser._id;
}

export const ensureParticipantUser = mutation({
  args: userProfileFields,
  handler: async (ctx, args) => {
    const clerkUserId = await getAuthenticatedClerkSubject(ctx);
    const userId = await upsertUser(ctx, {
      ...args,
      clerkUserId,
      role: "participant",
    });

    return userId;
  },
});

export const ensureOrganizerAccount = mutation({
  args: {
    ...userProfileFields,
    organizerName: v.string(),
  },
  handler: async (ctx, args) => {
    const clerkUserId = await getAuthenticatedClerkSubject(ctx);
    const ownerUserId = await upsertUser(ctx, {
      clerkUserId,
      displayName: args.displayName,
      initials: args.initials,
      role: "organizer",
      schoolOrCompany: args.schoolOrCompany,
      location: args.location,
    });
    const existingOrganizer = await getOrganizerByOwnerId(ctx, ownerUserId);
    const organizerFields = {
      ownerUserId,
      name: args.organizerName,
    };

    if (!existingOrganizer) {
      const organizerId = await ctx.db.insert("organizers", organizerFields);
      return { userId: ownerUserId, organizerId };
    }

    await ctx.db.patch(existingOrganizer._id, organizerFields);
    return { userId: ownerUserId, organizerId: existingOrganizer._id };
  },
});

export const getStaffAccess = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    const user = identity ? await getUserByClerkId(ctx, identity.subject) : null;

    return {
      canAccessStaffView: user?.role === "staff",
      staffUserId: user?.role === "staff" ? user._id : null,
    };
  },
});

export const getOnboardingStatus = query({
  args: {
    clerkUserId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const clerkUserId = getResolvedOnboardingClerkUserId({
      authenticatedSubject: identity?.subject,
      requestedClerkUserId: args.clerkUserId,
    });
    const user = clerkUserId ? await getUserByClerkId(ctx, clerkUserId) : null;

    return {
      isComplete: Boolean(user?.onboardingCompletedAt),
      userId: user?._id ?? null,
      onboardingPersona: user?.onboardingPersona ?? null,
    };
  },
});

export const saveOnboardingProfile = mutation({
  args: {
    ...userProfileFields,
    ...onboardingDataFields,
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const clerkUserId = getResolvedOnboardingClerkUserId({
      authenticatedSubject: identity?.subject,
      requestedClerkUserId: args.clerkUserId,
    });

    if (!clerkUserId) throw new Error("Authentication is required.");

    const userId = await upsertUser(ctx, {
      clerkUserId,
      displayName: args.displayName,
      initials: args.initials,
      role: args.persona,
      schoolOrCompany: args.schoolOrCompany,
      location: args.location,
    });
    const currentUser = await ctx.db.get(userId);
    const userPatch = {
      onboardingCompletedAt: Date.now(),
      onboardingPersona: args.persona,
      onboardingDomains: args.domains,
      onboardingTechStack: args.techStack,
      onboardingLocationStrategy: args.locationStrategy,
      onboardingExperienceLevel: args.experienceLevel,
      githubUrl: args.githubUrl,
      linkedinUrl: args.linkedinUrl,
      portfolioUrl: args.portfolioUrl,
      bio: args.persona === "organizer" ? args.orgBio : undefined,
    };

    await ctx.db.patch(userId, userPatch);

    if (args.persona !== "organizer") return { userId };

    const existingOrganizer = await getOrganizerByOwnerId(ctx, userId);
    const organizerFields = {
      ownerUserId: userId,
      name: args.orgName?.trim() || currentUser?.displayName || "Organizer",
      websiteUrl: args.portfolioUrl,
    };

    if (!existingOrganizer) {
      const organizerId = await ctx.db.insert("organizers", organizerFields);
      return { userId, organizerId };
    }

    await ctx.db.patch(existingOrganizer._id, organizerFields);
    return { userId, organizerId: existingOrganizer._id };
  },
});

export const updateBio = mutation({
  args: {
    bio: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    if (!user) throw new Error("User not found.");

    await ctx.db.patch(user._id, {
      bio: args.bio.trim() || undefined,
    });

    return user._id;
  },
});
