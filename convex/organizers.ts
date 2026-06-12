import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";

const listingFields = {
  name: v.string(),
  dateLabel: v.string(),
  registrationDeadlineLabel: v.string(),
  format: v.union(
    v.literal("Online"),
    v.literal("Onsite"),
    v.literal("Hybrid"),
  ),
  location: v.string(),
  eligibility: v.array(v.string()),
  themes: v.array(v.string()),
  teamSize: v.string(),
  prize: v.string(),
  difficulty: v.union(
    v.literal("Beginner"),
    v.literal("Intermediate"),
    v.literal("Open"),
  ),
  summary: v.string(),
  externalRegistrationUrl: v.optional(v.string()),
};

function getOrganizerStats(hackathons: Doc<"hackathons">[]) {
  return {
    published: hackathons.filter(
      (hackathon) => hackathon.status === "published",
    ).length,
    pendingReview: hackathons.filter(
      (hackathon) => hackathon.status === "pending_review",
    ).length,
    drafts: hackathons.filter((hackathon) => hackathon.status === "draft")
      .length,
  };
}

async function requireOrganizerHackathon(
  ctx: MutationCtx,
  organizerId: Id<"organizers">,
  hackathonId: Id<"hackathons">,
) {
  const hackathon = await ctx.db.get(hackathonId);

  if (!hackathon || hackathon.organizerId !== organizerId) {
    throw new Error("Hackathon not found for organizer.");
  }

  return hackathon;
}

export const getDashboard = query({
  args: {
    organizerId: v.id("organizers"),
  },
  handler: async (ctx, args) => {
    const hackathons = await ctx.db
      .query("hackathons")
      .withIndex("by_organizer", (index) =>
        index.eq("organizerId", args.organizerId),
      )
      .collect();

    return {
      stats: getOrganizerStats(hackathons),
      hackathons,
    };
  },
});

export const createDraftListing = mutation({
  args: {
    organizerId: v.id("organizers"),
    ...listingFields,
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("hackathons", {
      organizerId: args.organizerId,
      name: args.name,
      dateLabel: args.dateLabel,
      registrationDeadlineLabel: args.registrationDeadlineLabel,
      format: args.format,
      location: args.location,
      eligibility: args.eligibility,
      themes: args.themes,
      teamSize: args.teamSize,
      prize: args.prize,
      difficulty: args.difficulty,
      summary: args.summary,
      externalRegistrationUrl: args.externalRegistrationUrl,
      status: "draft",
    });
  },
});

export const updateDraftListing = mutation({
  args: {
    organizerId: v.id("organizers"),
    hackathonId: v.id("hackathons"),
    ...listingFields,
  },
  handler: async (ctx, args) => {
    const hackathon = await requireOrganizerHackathon(
      ctx,
      args.organizerId,
      args.hackathonId,
    );

    if (hackathon.status !== "draft" && hackathon.status !== "needs_edits")
      throw new Error(
        "Only drafts or listings needing edits can be updated here.",
      );

    await ctx.db.patch(args.hackathonId, {
      name: args.name,
      dateLabel: args.dateLabel,
      registrationDeadlineLabel: args.registrationDeadlineLabel,
      format: args.format,
      location: args.location,
      eligibility: args.eligibility,
      themes: args.themes,
      teamSize: args.teamSize,
      prize: args.prize,
      difficulty: args.difficulty,
      summary: args.summary,
      externalRegistrationUrl: args.externalRegistrationUrl,
    });

    return args.hackathonId;
  },
});

export const submitListingForReview = mutation({
  args: {
    organizerId: v.id("organizers"),
    hackathonId: v.id("hackathons"),
  },
  handler: async (ctx, args) => {
    const hackathon = await requireOrganizerHackathon(
      ctx,
      args.organizerId,
      args.hackathonId,
    );

    if (hackathon.status !== "draft" && hackathon.status !== "needs_edits")
      throw new Error(
        "Only drafts or listings needing edits can be submitted.",
      );

    await ctx.db.patch(args.hackathonId, {
      status: "pending_review",
    });

    await ctx.db.insert("listingReviews", {
      hackathonId: args.hackathonId,
      status: "pending",
    });

    return args.hackathonId;
  },
});
