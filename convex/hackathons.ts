import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";

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

async function addOrganizerAndCounts(
  ctx: QueryCtx,
  hackathon: Doc<"hackathons">,
) {
  const organizer = await ctx.db.get(hackathon.organizerId);
  const counts = await getListingCounts(ctx, hackathon._id);

  return {
    ...hackathon,
    ...counts,
    organizerName: organizer?.name ?? "Unknown organizer",
  } satisfies HackathonWithOrganizer;
}

function filterListings(
  listings: HackathonWithOrganizer[],
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

export const listPublished = query({
  args: {
    queryText: v.optional(v.string()),
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
    const publishedHackathons = await ctx.db
      .query("hackathons")
      .withIndex("by_status", (index) => index.eq("status", "published"))
      .collect();
    const listings = await Promise.all(
      publishedHackathons.map((hackathon) =>
        addOrganizerAndCounts(ctx, hackathon),
      ),
    );

    return filterListings(
      listings,
      args.queryText ?? "",
      args.setup ?? "All",
      args.region ?? "All",
    );
  },
});

export const featuredPublished = query({
  args: {},
  handler: async (ctx) => {
    const publishedHackathons = await ctx.db
      .query("hackathons")
      .withIndex("by_status", (index) => index.eq("status", "published"))
      .collect();
    const listings = await Promise.all(
      publishedHackathons.map((hackathon) =>
        addOrganizerAndCounts(ctx, hackathon),
      ),
    );

    return listings[0] ?? null;
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
        addOrganizerAndCounts(ctx, hackathon),
      ),
    );
  },
});

export const saveListing = mutation({
  args: {
    userId: v.id("users"),
    hackathonId: v.id("hackathons"),
  },
  handler: async (ctx, args) => {
    const existingSave = await ctx.db
      .query("savedHackathons")
      .withIndex("by_user_and_hackathon", (index) =>
        index.eq("userId", args.userId).eq("hackathonId", args.hackathonId),
      )
      .unique();

    if (existingSave) return existingSave._id;

    return ctx.db.insert("savedHackathons", {
      userId: args.userId,
      hackathonId: args.hackathonId,
    });
  },
});

export const unsaveListing = mutation({
  args: {
    userId: v.id("users"),
    hackathonId: v.id("hackathons"),
  },
  handler: async (ctx, args) => {
    const existingSave = await ctx.db
      .query("savedHackathons")
      .withIndex("by_user_and_hackathon", (index) =>
        index.eq("userId", args.userId).eq("hackathonId", args.hackathonId),
      )
      .unique();

    if (!existingSave) return null;

    await ctx.db.delete(existingSave._id);
    return existingSave._id;
  },
});

export const markInterested = mutation({
  args: {
    userId: v.id("users"),
    hackathonId: v.id("hackathons"),
  },
  handler: async (ctx, args) => {
    const existingSignal = await ctx.db
      .query("listingSignals")
      .withIndex("by_user_hackathon_and_type", (index) =>
        index
          .eq("userId", args.userId)
          .eq("hackathonId", args.hackathonId)
          .eq("type", "interest"),
      )
      .unique();

    if (existingSignal) return existingSignal._id;

    return ctx.db.insert("listingSignals", {
      userId: args.userId,
      hackathonId: args.hackathonId,
      type: "interest",
    });
  },
});

export const recordLftClick = mutation({
  args: {
    userId: v.id("users"),
    hackathonId: v.id("hackathons"),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("listingSignals", {
      userId: args.userId,
      hackathonId: args.hackathonId,
      type: "lft_click",
    });
  },
});

export const recordExternalRegistrationClick = mutation({
  args: {
    userId: v.id("users"),
    hackathonId: v.id("hackathons"),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("listingSignals", {
      userId: args.userId,
      hackathonId: args.hackathonId,
      type: "external_registration_click",
    });
  },
});
