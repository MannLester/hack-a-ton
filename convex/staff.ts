import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { requireCurrentStaffUser } from "./users";

type PendingReview = Doc<"listingReviews"> & {
  hackathon: Doc<"hackathons"> | null;
  organizer: Doc<"organizers"> | null;
};

async function requirePendingReview(
  ctx: MutationCtx,
  reviewId: Id<"listingReviews">,
) {
  const review = await ctx.db.get(reviewId);

  if (!review || review.status !== "pending") {
    throw new Error("Pending review not found.");
  }

  return review;
}

async function getPendingReview(ctx: QueryCtx, review: Doc<"listingReviews">) {
  const hackathon = await ctx.db.get(review.hackathonId);
  const organizer = hackathon ? await ctx.db.get(hackathon.organizerId) : null;

  return {
    ...review,
    hackathon,
    organizer,
  } satisfies PendingReview;
}

export const listPendingReviews = query({
  args: {},
  handler: async (ctx) => {
    await requireCurrentStaffUser(ctx);
    const pendingReviews = await ctx.db
      .query("listingReviews")
      .withIndex("by_status", (index) => index.eq("status", "pending"))
      .collect();

    return Promise.all(
      pendingReviews.map((review) => getPendingReview(ctx, review)),
    );
  },
});

export const approveListing = mutation({
  args: {
    reviewId: v.id("listingReviews"),
  },
  handler: async (ctx, args) => {
    const staffUser = await requireCurrentStaffUser(ctx);
    const review = await requirePendingReview(ctx, args.reviewId);
    const now = Date.now();

    await ctx.db.patch(review.hackathonId, {
      status: "published",
      publishedAt: now,
    });
    await ctx.db.patch(args.reviewId, {
      reviewerUserId: staffUser._id,
      status: "approved",
      reviewedAt: now,
    });

    return review.hackathonId;
  },
});

export const requestListingEdits = mutation({
  args: {
    reviewId: v.id("listingReviews"),
    note: v.string(),
  },
  handler: async (ctx, args) => {
    const staffUser = await requireCurrentStaffUser(ctx);
    const review = await requirePendingReview(ctx, args.reviewId);
    const now = Date.now();

    await ctx.db.patch(review.hackathonId, {
      status: "needs_edits",
    });
    await ctx.db.patch(args.reviewId, {
      reviewerUserId: staffUser._id,
      status: "needs_edits",
      note: args.note,
      reviewedAt: now,
    });

    return review.hackathonId;
  },
});
