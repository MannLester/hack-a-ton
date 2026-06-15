import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { getCurrentUser } from "./users";

const setupArgument = v.union(
  v.literal("All"),
  v.literal("Online"),
  v.literal("Onsite"),
  v.literal("Hybrid"),
);

type HackathonWithOrganizer = Doc<"hackathons"> & {
  organizerName: string;
  interestedCount: number;
  lftCount: number;
  savedCount: number;
};

type HackathonWithOrganizerName = Doc<"hackathons"> & {
  organizerName: string;
};

const defaultListingLimit = 50;
const maxListingLimit = 100;

function getBoundedLimit(limit: number | undefined) {
  if (!limit) return defaultListingLimit;

  return Math.min(Math.max(limit, 1), maxListingLimit);
}

function matchesQuery(
  hackathon: Doc<"hackathons">,
  organizerName: string,
  queryText: string,
) {
  const searchableText = [
    hackathon.name,
    organizerName,
    hackathon.location,
    hackathon.summary,
  ]
    .join(" ")
    .toLowerCase();

  return searchableText.includes(queryText.toLowerCase());
}

function matchesSetup(
  hackathon: Doc<"hackathons">,
  setup: "All" | "Online" | "Onsite" | "Hybrid",
) {
  return setup === "All" || hackathon.setup === setup;
}

function matchesRegion(
  hackathon: Doc<"hackathons">,
  region: "All" | "Luzon" | "Visayas" | "Mindanao",
) {
  return region === "All" || hackathon.region === region || hackathon.region === "Philippines-wide";
}

async function getListingCounts(ctx: QueryCtx, hackathonId: Id<"hackathons">) {
  const [interestSignals, lftProfiles, savedHackathons] = await Promise.all([
    ctx.db
      .query("listingSignals")
      .withIndex("by_hackathon_and_type", (index) =>
        index.eq("hackathonId", hackathonId).eq("type", "interest"),
      )
      .collect(),
    ctx.db
      .query("lftProfiles")
      .withIndex("by_hackathon", (index) =>
        index.eq("hackathonId", hackathonId),
      )
      .collect(),
    ctx.db
      .query("savedHackathons")
      .withIndex("by_hackathon", (index) =>
        index.eq("hackathonId", hackathonId),
      )
      .collect(),
  ]);

  return {
    interestedCount: interestSignals.length,
    lftCount: lftProfiles.filter((profile) => profile.isActive).length,
    savedCount: savedHackathons.length,
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

async function addOrganizerAndCounts(
  ctx: QueryCtx,
  hackathon: HackathonWithOrganizerName,
) {
  const [counts, coverImageUrl] = await Promise.all([
    getListingCounts(ctx, hackathon._id),
    getResolvedCoverImageUrl(ctx, hackathon),
  ]);

  return {
    ...hackathon,
    coverImageUrl,
    ...counts,
  } satisfies HackathonWithOrganizer;
}

async function addOrganizerName(
  ctx: QueryCtx,
  hackathon: Doc<"hackathons">,
) {
  const organizer = await ctx.db.get(hackathon.organizerId);

  return {
    ...hackathon,
    organizerName: organizer?.name ?? "Unknown organizer",
  } satisfies HackathonWithOrganizerName;
}

function filterListings(
  listings: HackathonWithOrganizerName[],
  queryText: string,
  setup: "All" | "Online" | "Onsite" | "Hybrid",
  region: "All" | "Luzon" | "Visayas" | "Mindanao",
) {
  return listings.filter((listing) => {
    const queryMatches =
      queryText.trim() === "" ||
      matchesQuery(listing, listing.organizerName, queryText);
    return (
      queryMatches &&
      matchesSetup(listing, setup) &&
      matchesRegion(listing, region)
    );
  });
}

export function isParticipantVisibleHackathon(
  hackathon: Doc<"hackathons">,
  now: number,
) {
  if (hackathon.status === "published") return true;

  if (hackathon.status !== "cancelled") return false;
  if (!hackathon.cancellationVisibleUntil) return false;

  return now <= hackathon.cancellationVisibleUntil;
}

export async function requireParticipantVisibleHackathon(
  ctx: QueryCtx | MutationCtx,
  hackathonId: Id<"hackathons">,
) {
  const hackathon = await ctx.db.get(hackathonId);

  if (!hackathon) throw new Error("Hackathon is not available.");
  if (!isParticipantVisibleHackathon(hackathon, Date.now())) {
    throw new Error("Hackathon is not available.");
  }

  return hackathon;
}

async function getParticipantVisibleHackathons(ctx: QueryCtx, limit: number) {
  const [publishedHackathons, cancelledHackathons] = await Promise.all([
    ctx.db
      .query("hackathons")
      .withIndex("by_status", (index) => index.eq("status", "published"))
      .take(limit),
    ctx.db
      .query("hackathons")
      .withIndex("by_status", (index) => index.eq("status", "cancelled"))
      .take(limit),
  ]);
  const now = Date.now();

  return [...publishedHackathons, ...cancelledHackathons].filter((hackathon) =>
    isParticipantVisibleHackathon(hackathon, now),
  );
}

export const listPublished = query({
  args: {
    queryText: v.optional(v.string()),
    limit: v.optional(v.number()),
    setup: v.optional(setupArgument),
    region: v.optional(
      v.union(
        v.literal("All"),
        v.literal("Luzon"),
        v.literal("Visayas"),
        v.literal("Mindanao"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const limit = getBoundedLimit(args.limit);
    const participantVisibleHackathons = await getParticipantVisibleHackathons(ctx, limit);
    const listingsWithOrganizerNames = await Promise.all(
      participantVisibleHackathons.map((hackathon) =>
        addOrganizerName(ctx, hackathon),
      ),
    );
    const filteredListings = filterListings(
      listingsWithOrganizerNames,
      args.queryText ?? "",
      args.setup ?? "All",
      args.region ?? "All",
    ).slice(0, limit);

    return Promise.all(
      filteredListings.map((hackathon) => addOrganizerAndCounts(ctx, hackathon)),
    );
  },
});

export const featuredPublished = query({
  args: {},
  handler: async (ctx) => {
    const participantVisibleHackathons = await getParticipantVisibleHackathons(
      ctx,
      defaultListingLimit,
    );
    const firstVisibleHackathon = participantVisibleHackathons[0];

    if (!firstVisibleHackathon) return null;

    const listingWithOrganizerName = await addOrganizerName(ctx, firstVisibleHackathon);

    return addOrganizerAndCounts(ctx, listingWithOrganizerName);
  },
});

export const getPlatformStats = query({
  args: {},
  handler: async (ctx) => {
    const [publishedHackathons, users, teams] = await Promise.all([
      ctx.db
        .query("hackathons")
        .withIndex("by_status", (index) => index.eq("status", "published"))
        .collect(),
      ctx.db.query("users").collect(),
      ctx.db.query("teams").collect(),
    ]);

    return {
      hackathonsListed: publishedHackathons.length,
      activeBuilders: users.filter((user) => user.role === "participant").length,
      teamsFormed: teams.length,
    };
  },
});

export const getById = query({
  args: {
    hackathonId: v.id("hackathons"),
  },
  handler: async (ctx, args) => {
    const hackathon = await ctx.db.get(args.hackathonId);

    if (!hackathon) return null;
    if (!isParticipantVisibleHackathon(hackathon, Date.now())) return null;

    const listingWithOrganizerName = await addOrganizerName(ctx, hackathon);

    return addOrganizerAndCounts(ctx, listingWithOrganizerName);
  },
});

export const listByOrganizer = query({
  args: {
    organizerId: v.id("organizers"),
  },
  handler: async (ctx, args) => {
    const organizerHackathons = await ctx.db
      .query("hackathons")
      .withIndex("by_organizer", (index) =>
        index.eq("organizerId", args.organizerId),
      )
      .collect();

    return Promise.all(
      organizerHackathons.map((hackathon) =>
        addOrganizerName(ctx, hackathon).then((listingWithOrganizerName) =>
          addOrganizerAndCounts(ctx, listingWithOrganizerName),
        ),
      ),
    );
  },
});

export const saveListing = mutation({
  args: {
    hackathonId: v.id("hackathons"),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    await requireParticipantVisibleHackathon(ctx, args.hackathonId);

    const existingSave = await ctx.db
      .query("savedHackathons")
      .withIndex("by_user_and_hackathon", (index) =>
        index.eq("userId", currentUser._id).eq("hackathonId", args.hackathonId),
      )
      .unique();

    if (existingSave) return existingSave._id;

    return ctx.db.insert("savedHackathons", {
      userId: currentUser._id,
      hackathonId: args.hackathonId,
    });
  },
});

export const unsaveListing = mutation({
  args: {
    hackathonId: v.id("hackathons"),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    await requireParticipantVisibleHackathon(ctx, args.hackathonId);

    const existingSave = await ctx.db
      .query("savedHackathons")
      .withIndex("by_user_and_hackathon", (index) =>
        index.eq("userId", currentUser._id).eq("hackathonId", args.hackathonId),
      )
      .unique();

    if (!existingSave) return null;

    await ctx.db.delete(existingSave._id);
    return existingSave._id;
  },
});

export const markInterested = mutation({
  args: {
    hackathonId: v.id("hackathons"),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    await requireParticipantVisibleHackathon(ctx, args.hackathonId);

    const existingSignal = await ctx.db
      .query("listingSignals")
      .withIndex("by_user_hackathon_and_type", (index) =>
        index
          .eq("userId", currentUser._id)
          .eq("hackathonId", args.hackathonId)
          .eq("type", "interest"),
      )
      .unique();

    if (existingSignal) return existingSignal._id;

    return ctx.db.insert("listingSignals", {
      userId: currentUser._id,
      hackathonId: args.hackathonId,
      type: "interest",
    });
  },
});

export const recordLftClick = mutation({
  args: {
    hackathonId: v.id("hackathons"),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    await requireParticipantVisibleHackathon(ctx, args.hackathonId);

    return ctx.db.insert("listingSignals", {
      userId: currentUser._id,
      hackathonId: args.hackathonId,
      type: "lft_click",
    });
  },
});

export const recordExternalRegistrationClick = mutation({
  args: {
    hackathonId: v.id("hackathons"),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    await requireParticipantVisibleHackathon(ctx, args.hackathonId);

    return ctx.db.insert("listingSignals", {
      userId: currentUser._id,
      hackathonId: args.hackathonId,
      type: "external_registration_click",
    });
  },
});
