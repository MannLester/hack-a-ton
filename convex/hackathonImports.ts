import { v, type Infer } from "convex/values";
import { internalMutation } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { hackathonAdminListerName } from "../lib/hackathon-scraper/joinability";

const staleImportWindowMs = 14 * 24 * 60 * 60 * 1000;

const hackathonImportValidator = v.object({
  importStatus: v.union(v.literal("published"), v.literal("pending_review")),
  reviewNote: v.optional(v.string()),
  organizerName: v.string(),
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
  externalRegistrationUrl: v.string(),
  listedByName: v.string(),
  realOrganizerName: v.string(),
  sourceName: v.string(),
  sourceUrl: v.string(),
  sourceKey: v.string(),
  sourceAdapter: v.string(),
  registrationDeadlineAt: v.optional(v.number()),
  eventStartAt: v.optional(v.number()),
  eventEndAt: v.optional(v.number()),
  lastVerifiedAt: v.number(),
  lastSeenAt: v.number(),
  coverImageUrl: v.optional(v.string()),
});

type HackathonImport = Infer<typeof hackathonImportValidator>;

async function getUserByDisplayName(ctx: MutationCtx, displayName: string) {
  const users = await ctx.db.query("users").collect();

  return users.find((user) => user.displayName === displayName) ?? null;
}

async function getOrCreateAdminUser(ctx: MutationCtx) {
  const existingUser = await getUserByDisplayName(ctx, hackathonAdminListerName);

  if (existingUser) return existingUser._id;

  return ctx.db.insert("users", {
    displayName: hackathonAdminListerName,
    initials: "HA",
    role: "staff",
  });
}

async function getOrganizerByName(ctx: MutationCtx, name: string) {
  const organizers = await ctx.db.query("organizers").collect();

  return organizers.find((organizer) => organizer.name === name) ?? null;
}

async function getOrCreateAdminOrganizer(ctx: MutationCtx) {
  const existingOrganizer = await getOrganizerByName(
    ctx,
    hackathonAdminListerName,
  );

  if (existingOrganizer) return existingOrganizer._id;

  const ownerUserId = await getOrCreateAdminUser(ctx);

  return ctx.db.insert("organizers", {
    ownerUserId,
    name: hackathonAdminListerName,
    verifiedAt: Date.now(),
  });
}

async function getHackathonBySourceKey(ctx: MutationCtx, sourceKey: string) {
  return ctx.db
    .query("hackathons")
    .withIndex("by_source_key", (index) => index.eq("sourceKey", sourceKey))
    .first();
}

async function getPendingReview(ctx: MutationCtx, hackathonId: Id<"hackathons">) {
  return ctx.db
    .query("listingReviews")
    .withIndex("by_hackathon", (index) => index.eq("hackathonId", hackathonId))
    .filter((queryBuilder) =>
      queryBuilder.eq(queryBuilder.field("status"), "pending"),
    )
    .first();
}

async function ensurePendingReview({
  ctx,
  hackathonId,
  note,
}: {
  ctx: MutationCtx;
  hackathonId: Id<"hackathons">;
  note?: string;
}) {
  const pendingReview = await getPendingReview(ctx, hackathonId);

  if (pendingReview) {
    await ctx.db.patch(pendingReview._id, { note });
    return;
  }

  await ctx.db.insert("listingReviews", {
    hackathonId,
    status: "pending",
    note,
  });
}

function getPublishedAt(
  importedHackathon: HackathonImport,
  existingHackathon: Doc<"hackathons"> | null,
  now: number,
) {
  if (importedHackathon.importStatus !== "published") return undefined;

  return existingHackathon?.publishedAt ?? now;
}

function getImportedHackathonFields({
  importedHackathon,
  organizerId,
  now,
  existingHackathon,
}: {
  importedHackathon: HackathonImport;
  organizerId: Id<"organizers">;
  now: number;
  existingHackathon: Doc<"hackathons"> | null;
}) {
  return {
    organizerId,
    name: importedHackathon.name,
    dateLabel: importedHackathon.dateLabel,
    registrationDeadlineLabel: importedHackathon.registrationDeadlineLabel,
    setup: importedHackathon.setup,
    location: importedHackathon.location,
    region: importedHackathon.region,
    eligibility: importedHackathon.eligibility,
    teamSize: importedHackathon.teamSize,
    prize: importedHackathon.prize,
    status: importedHackathon.importStatus,
    difficulty: importedHackathon.difficulty,
    summary: importedHackathon.summary,
    externalRegistrationUrl: importedHackathon.externalRegistrationUrl,
    listedByName: importedHackathon.listedByName,
    realOrganizerName: importedHackathon.realOrganizerName,
    sourceName: importedHackathon.sourceName,
    sourceUrl: importedHackathon.sourceUrl,
    sourceKey: importedHackathon.sourceKey,
    sourceAdapter: importedHackathon.sourceAdapter,
    registrationDeadlineAt: importedHackathon.registrationDeadlineAt,
    eventStartAt: importedHackathon.eventStartAt,
    eventEndAt: importedHackathon.eventEndAt,
    lastVerifiedAt: importedHackathon.lastVerifiedAt,
    lastSeenAt: importedHackathon.lastSeenAt,
    coverImageUrl: importedHackathon.coverImageUrl,
    updatedAt: now,
    publishedAt: getPublishedAt(importedHackathon, existingHackathon, now),
  };
}

async function upsertImportedHackathon({
  ctx,
  importedHackathon,
  organizerId,
  now,
}: {
  ctx: MutationCtx;
  importedHackathon: HackathonImport;
  organizerId: Id<"organizers">;
  now: number;
}) {
  const existingHackathon = await getHackathonBySourceKey(
    ctx,
    importedHackathon.sourceKey,
  );
  const hackathonFields = getImportedHackathonFields({
    importedHackathon,
    organizerId,
    now,
    existingHackathon,
  });

  if (existingHackathon) {
    await ctx.db.patch(existingHackathon._id, hackathonFields);
    return { hackathonId: existingHackathon._id, created: false };
  }

  const hackathonId = await ctx.db.insert("hackathons", hackathonFields);

  return { hackathonId, created: true };
}

function isActiveImportedHackathon(hackathon: Doc<"hackathons">) {
  if (!hackathon.sourceAdapter) return false;
  if (hackathon.status === "published") return true;

  return hackathon.status === "pending_review";
}

function hasTimestampPassed(timestamp: number | undefined, now: number) {
  return timestamp !== undefined && timestamp < now;
}

function isStaleImportedHackathon(hackathon: Doc<"hackathons">, now: number) {
  if (!hackathon.lastSeenAt) return false;

  return hackathon.lastSeenAt + staleImportWindowMs < now;
}

function shouldArchiveImportedHackathon({
  hackathon,
  now,
  sourceAdapters,
}: {
  hackathon: Doc<"hackathons">;
  now: number;
  sourceAdapters: string[];
}) {
  const sourceAdapter = hackathon.sourceAdapter;

  if (!isActiveImportedHackathon(hackathon)) return false;
  if (!sourceAdapter) return false;
  if (!sourceAdapters.includes(sourceAdapter)) return false;
  if (hasTimestampPassed(hackathon.registrationDeadlineAt, now)) return true;
  if (hasTimestampPassed(hackathon.eventEndAt, now)) return true;

  return isStaleImportedHackathon(hackathon, now);
}

async function archiveExpiredImportedHackathons({
  ctx,
  now,
  sourceAdapters,
}: {
  ctx: MutationCtx;
  now: number;
  sourceAdapters: string[];
}) {
  const hackathons = await ctx.db.query("hackathons").collect();
  const archiveableHackathons = hackathons.filter((hackathon) =>
    shouldArchiveImportedHackathon({ hackathon, now, sourceAdapters }),
  );

  for (const hackathon of archiveableHackathons) {
    await ctx.db.patch(hackathon._id, {
      status: "archived",
      updatedAt: now,
    });
  }

  return archiveableHackathons.length;
}

export const startScrapeRun = internalMutation({
  args: {
    startedAt: v.number(),
  },
  handler: async (ctx, args) =>
    ctx.db.insert("scrapeRuns", {
      startedAt: args.startedAt,
      status: "running",
      importedCount: 0,
      updatedCount: 0,
      archivedCount: 0,
      reviewCount: 0,
      rejectedCount: 0,
    }),
});

export const failScrapeRun = internalMutation({
  args: {
    runId: v.id("scrapeRuns"),
    errorMessage: v.string(),
    finishedAt: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.runId, {
      status: "failed",
      errorMessage: args.errorMessage,
      finishedAt: args.finishedAt,
    });
  },
});

export const upsertImportedHackathons = internalMutation({
  args: {
    runId: v.id("scrapeRuns"),
    imports: v.array(hackathonImportValidator),
    sourceAdapters: v.array(v.string()),
    rejectedCount: v.number(),
    now: v.number(),
  },
  handler: async (ctx, args) => {
    const organizerId = await getOrCreateAdminOrganizer(ctx);
    const results = [];

    for (const importedHackathon of args.imports) {
      const result = await upsertImportedHackathon({
        ctx,
        importedHackathon,
        organizerId,
        now: args.now,
      });

      results.push({ ...result, importedHackathon });

      if (importedHackathon.importStatus === "pending_review") {
        await ensurePendingReview({
          ctx,
          hackathonId: result.hackathonId,
          note: importedHackathon.reviewNote,
        });
      }
    }

    const archivedCount = await archiveExpiredImportedHackathons({
      ctx,
      now: args.now,
      sourceAdapters: args.sourceAdapters,
    });
    const importedCount = results.filter((result) => result.created).length;
    const reviewCount = results.filter(
      (result) => result.importedHackathon.importStatus === "pending_review",
    ).length;
    const updatedCount = results.length - importedCount;

    await ctx.db.patch(args.runId, {
      status: "succeeded",
      finishedAt: Date.now(),
      importedCount,
      updatedCount,
      archivedCount,
      reviewCount,
      rejectedCount: args.rejectedCount,
    });

    return {
      importedCount,
      updatedCount,
      archivedCount,
      reviewCount,
      rejectedCount: args.rejectedCount,
    };
  },
});
