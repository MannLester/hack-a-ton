import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { requireCurrentOrganizer } from "./users";
import { requireOwnedCoverImageUpload } from "./files";
import { getTrustedCoverImageUrl } from "../lib/cover-image-upload";

const cancellationVisibilityWindowMs = 3 * 24 * 60 * 60 * 1000;

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
  coverImageUrl: v.optional(v.string()),
  coverImageStorageId: v.optional(v.id("_storage")),
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
  ctx: MutationCtx | QueryCtx,
  organizerId: Id<"organizers">,
  hackathonId: Id<"hackathons">,
) {
  const hackathon = await ctx.db.get(hackathonId);

  if (!hackathon || hackathon.organizerId !== organizerId) {
    throw new Error("Hackathon not found for organizer.");
  }

  return hackathon;
}

async function getPendingListingReview(
  ctx: MutationCtx,
  hackathonId: Id<"hackathons">,
) {
  return ctx.db
    .query("listingReviews")
    .withIndex("by_hackathon", (index) => index.eq("hackathonId", hackathonId))
    .filter((queryBuilder) =>
      queryBuilder.eq(queryBuilder.field("status"), "pending"),
    )
    .first();
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



async function getResolvedCoverImageUrl(
  ctx: QueryCtx,
  hackathon: Doc<"hackathons">,
) {
  if (!hackathon.coverImageStorageId) return hackathon.coverImageUrl;

  const storedUrl = await ctx.storage.getUrl(hackathon.coverImageStorageId);
  return storedUrl ?? hackathon.coverImageUrl;
}

async function getLatestListingReviewNote(
  ctx: QueryCtx,
  hackathonId: Id<"hackathons">,
) {
  const reviews = await ctx.db
    .query("listingReviews")
    .withIndex("by_hackathon", (index) => index.eq("hackathonId", hackathonId))
    .collect();
  const meaningfulReviews = reviews.filter((review) =>
    Boolean(review.note?.trim()),
  );
  const latestReview = meaningfulReviews.sort(
    (firstReview, secondReview) =>
      (secondReview.reviewedAt ?? 0) - (firstReview.reviewedAt ?? 0),
  )[0];

  return latestReview?.note?.trim();
}
export const getDashboard = query({
  args: {},
  handler: async (ctx) => {
    const { organizer } = await requireCurrentOrganizer(ctx);
    const hackathons = await ctx.db
      .query("hackathons")
      .withIndex("by_organizer", (index) =>
        index.eq("organizerId", organizer._id),
      )
      .collect();

    const listingsWithReviewNotes = await Promise.all(
      hackathons.map(async (hackathon) => ({
        ...hackathon,
        coverImageUrl: await getResolvedCoverImageUrl(ctx, hackathon),
        reviewNote: await getLatestListingReviewNote(ctx, hackathon._id),
      })),
    );

    return {
      stats: getOrganizerStats(hackathons),
      hackathons: listingsWithReviewNotes,
    };
  },
});

export const createDraftListing = mutation({
  args: {
    ...listingFields,
  },
  handler: async (ctx, args) => {
    const { organizer } = await requireCurrentOrganizer(ctx);
    await requireOwnedCoverImageUpload(
      ctx,
      args.coverImageStorageId,
      organizer._id,
    );

    return ctx.db.insert("hackathons", {
      organizerId: organizer._id,
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
      coverImageUrl: getTrustedCoverImageUrl(args),
      coverImageStorageId: args.coverImageStorageId,
      status: "draft",
      updatedAt: Date.now(),
    });
  },
});

export const updateDraftListing = mutation({
  args: {
    hackathonId: v.id("hackathons"),
    ...listingFields,
  },
  handler: async (ctx, args) => {
    const { organizer } = await requireCurrentOrganizer(ctx);
    const hackathon = await requireOrganizerHackathon(
      ctx,
      organizer._id,
      args.hackathonId,
    );

    const canUpdateListing =
      hackathon.status === "draft" ||
      hackathon.status === "needs_edits" ||
      hackathon.status === "published";

    await requireOwnedCoverImageUpload(
      ctx,
      args.coverImageStorageId,
      organizer._id,
    );

    if (!canUpdateListing) {
      throw new Error(
        "Only drafts, listings needing edits, or active listings can be updated here.",
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
      coverImageUrl: getTrustedCoverImageUrl(args),
      coverImageStorageId: args.coverImageStorageId,
      updatedAt: Date.now(),
    });

    return args.hackathonId;
  },
});

export const submitListingForReview = mutation({
  args: {
    hackathonId: v.id("hackathons"),
  },
  handler: async (ctx, args) => {
    const { organizer } = await requireCurrentOrganizer(ctx);
    const hackathon = await requireOrganizerHackathon(
      ctx,
      organizer._id,
      args.hackathonId,
    );

    if (hackathon.status === "pending_review") {
      return args.hackathonId;
    }

    if (hackathon.status !== "draft" && hackathon.status !== "needs_edits") {
      throw new Error(
        "Only drafts or listings needing edits can be submitted.",
      );
    }

    await ctx.db.patch(args.hackathonId, {
      status: "pending_review",
    });

    const pendingReview = await getPendingListingReview(ctx, args.hackathonId);

    if (!pendingReview) {
      await ctx.db.insert("listingReviews", {
        hackathonId: args.hackathonId,
        status: "pending",
      });
    }

    return args.hackathonId;
  },
});


export const cancelListing = mutation({
  args: {
    hackathonId: v.id("hackathons"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const reason = args.reason.trim();

    if (reason.length < 20) {
      throw new Error("Cancellation reason must explain what happened.");
    }

    const { organizer } = await requireCurrentOrganizer(ctx);
    const hackathon = await requireOrganizerHackathon(
      ctx,
      organizer._id,
      args.hackathonId,
    );
    const canCancelListing = hackathon.status === "published";

    if (!canCancelListing) {
      throw new Error("Only active participant-visible listings can be cancelled.");
    }

    const now = Date.now();

    await ctx.db.patch(args.hackathonId, {
      status: "cancelled",
      cancellationReason: reason,
      cancelledAt: now,
      cancellationVisibleUntil: now + cancellationVisibilityWindowMs,
      updatedAt: now,
    });

    return args.hackathonId;
  },
});


export const archiveListing = mutation({
  args: {
    hackathonId: v.id("hackathons"),
  },
  handler: async (ctx, args) => {
    const { organizer } = await requireCurrentOrganizer(ctx);
    const hackathon = await requireOrganizerHackathon(
      ctx,
      organizer._id,
      args.hackathonId,
    );

    if (hackathon.status === "archived") {
      return args.hackathonId;
    }

    await ctx.db.patch(args.hackathonId, {
      status: "archived",
    });

    return args.hackathonId;
  },
});

export const getInsights = query({
  args: {},
  handler: async (ctx) => {
    const { organizer } = await requireCurrentOrganizer(ctx);
    const hackathons = await ctx.db
      .query("hackathons")
      .withIndex("by_organizer", (index) =>
        index.eq("organizerId", organizer._id),
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
