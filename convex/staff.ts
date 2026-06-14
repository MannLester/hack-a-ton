import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";

type PendingReview = Doc<"listingReviews"> & {
  hackathon: Doc<"hackathons"> | null;
  organizer: Doc<"organizers"> | null;
};

async function requireMutationStaffUser(ctx: MutationCtx, staffUserId: Id<"users">) {
  const staffUser = await ctx.db.get(staffUserId);

  if (!staffUser || staffUser.role !== "staff") {
    throw new Error("Staff access is required.");
  }

  return staffUser;
}

async function requireQueryStaffUser(ctx: QueryCtx, staffUserId: Id<"users">) {
  const staffUser = await ctx.db.get(staffUserId);

  if (!staffUser || staffUser.role !== "staff") {
    throw new Error("Staff access is required.");
  }

  return staffUser;
}

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
  args: {
    staffUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await requireQueryStaffUser(ctx, args.staffUserId);
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
    staffUserId: v.id("users"),
    reviewId: v.id("listingReviews"),
  },
  handler: async (ctx, args) => {
    await requireMutationStaffUser(ctx, args.staffUserId);
    const review = await requirePendingReview(ctx, args.reviewId);
    const now = Date.now();

    await ctx.db.patch(review.hackathonId, {
      status: "published",
      publishedAt: now,
    });
    await ctx.db.patch(args.reviewId, {
      reviewerUserId: args.staffUserId,
      status: "approved",
      reviewedAt: now,
    });

    return review.hackathonId;
  },
});

export const requestListingEdits = mutation({
  args: {
    staffUserId: v.id("users"),
    reviewId: v.id("listingReviews"),
    note: v.string(),
  },
  handler: async (ctx, args) => {
    await requireMutationStaffUser(ctx, args.staffUserId);
    const review = await requirePendingReview(ctx, args.reviewId);
    const now = Date.now();

    await ctx.db.patch(review.hackathonId, {
      status: "needs_edits",
    });
    await ctx.db.patch(args.reviewId, {
      reviewerUserId: args.staffUserId,
      status: "needs_edits",
      note: args.note,
      reviewedAt: now,
    });

    return review.hackathonId;
  },
});
