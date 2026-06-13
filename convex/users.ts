import { v } from "convex/values";
import { mutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";

const userIdentityFields = {
  clerkUserId: v.string(),
  displayName: v.string(),
  initials: v.string(),
  schoolOrCompany: v.optional(v.string()),
  location: v.optional(v.string()),
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

async function getUserByClerkId(ctx: MutationCtx, clerkUserId: string) {
  return ctx.db
    .query("users")
    .withIndex("by_clerk_user_id", (index) =>
      index.eq("clerkUserId", clerkUserId),
    )
    .unique();
}

async function getOrganizerByOwnerId(
  ctx: MutationCtx,
  ownerUserId: Id<"users">,
) {
  return ctx.db
    .query("organizers")
    .withIndex("by_owner", (index) => index.eq("ownerUserId", ownerUserId))
    .unique();
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
  const userFields = {
    clerkUserId: args.clerkUserId,
    displayName: args.displayName,
    initials: getResolvedInitials(args.displayName, args.initials),
    role: args.role,
    schoolOrCompany: args.schoolOrCompany,
    location: args.location,
  };

  if (!existingUser) return ctx.db.insert("users", userFields);

  await ctx.db.patch(existingUser._id, userFields);
  return existingUser._id;
}

export const ensureParticipantUser = mutation({
  args: userIdentityFields,
  handler: async (ctx, args) => {
    return upsertUser(ctx, {
      ...args,
      role: "participant",
    });
  },
});

export const ensureOrganizerAccount = mutation({
  args: {
    ...userIdentityFields,
    organizerName: v.string(),
  },
  handler: async (ctx, args) => {
    const ownerUserId = await upsertUser(ctx, {
      clerkUserId: args.clerkUserId,
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
