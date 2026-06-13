import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";

const listingFields = {
  name: v.string(),
  dateLabel: v.string(),
  registrationDeadlineLabel: v.string(),
  setup: v.union(
    v.literal("Online"),
    v.literal("Onsite"),
    v.literal("Hybrid"),
  ),
  location: v.string(),
  region: v.union(
    v.literal("Luzon"),
    v.literal("Visayas"),
    v.literal("Mindanao"),
    v.literal("Philippines-wide"),
  ),
  eligibility: v.array(v.string()),
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

async function getListingInsights(
  ctx: QueryCtx,
  hackathonId: Id<"hackathons">,
) {
  const [
    savedHackathons,
    interestSignals,
    lftClickSignals,
    registrationClickSignals,
  ] = await Promise.all([
    ctx.db
      .query("savedHackathons")
      .withIndex("by_hackathon", (index) =>
        index.eq("hackathonId", hackathonId),
      )
      .collect(),
    ctx.db
      .query("listingSignals")
      .withIndex("by_hackathon_and_type", (index) =>
        index.eq("hackathonId", hackathonId).eq("type", "interest"),
      )
      .collect(),
    ctx.db
      .query("listingSignals")
      .withIndex("by_hackathon_and_type", (index) =>
        index.eq("hackathonId", hackathonId).eq("type", "lft_click"),
      )
      .collect(),
    ctx.db
      .query("listingSignals")
      .withIndex("by_hackathon_and_type", (index) =>
        index
          .eq("hackathonId", hackathonId)
          .eq("type", "external_registration_click"),
      )
      .collect(),
  ]);

  return {
    savedCount: savedHackathons.length,
    interestedCount: interestSignals.length,
    lftClickCount: lftClickSignals.length,
    externalRegistrationClickCount: registrationClickSignals.length,
  };
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
      setup: args.setup,
      location: args.location,
      region: args.region,
      eligibility: args.eligibility,
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

    if (hackathon.status !== "draft" && hackathon.status !== "needs_edits") {
      throw new Error(
        "Only drafts or listings needing edits can be updated here.",
      );
    }

    await ctx.db.patch(args.hackathonId, {
      name: args.name,
      dateLabel: args.dateLabel,
      registrationDeadlineLabel: args.registrationDeadlineLabel,
      setup: args.setup,
      location: args.location,
      region: args.region,
      eligibility: args.eligibility,
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

    if (hackathon.status !== "draft" && hackathon.status !== "needs_edits") {
      throw new Error(
        "Only drafts or listings needing edits can be submitted.",
      );
    }

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

export const getInsights = query({
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
    const listingInsights = await Promise.all(
      hackathons.map(async (hackathon) => ({
        hackathonId: hackathon._id,
        hackathonName: hackathon.name,
        ...(await getListingInsights(ctx, hackathon._id)),
      })),
    );

    return {
      totals: listingInsights.reduce(
        (totals, insight) => ({
          savedCount: totals.savedCount + insight.savedCount,
          interestedCount: totals.interestedCount + insight.interestedCount,
          lftClickCount: totals.lftClickCount + insight.lftClickCount,
          externalRegistrationClickCount:
            totals.externalRegistrationClickCount +
            insight.externalRegistrationClickCount,
        }),
        {
          savedCount: 0,
          interestedCount: 0,
          lftClickCount: 0,
          externalRegistrationClickCount: 0,
        },
      ),
      listings: listingInsights,
    };
  },
});
