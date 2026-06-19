import { v } from "convex/values";
import { mutation } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { requireCurrentStaffUser } from "./users";

const resettableTables = [
  "organizers",
  "hackathons",
  "savedHackathons",
  "listingSignals",
  "lftProfiles",
  "teamDecisions",
  "teamMatches",
  "teams",
  "badges",
  "userBadges",
  "portfolioEntries",
  "listingReviews",
  "scrapeRuns",
] as const;

const adminListerName = "Hack-A-Ton Admin";
const seedVerifiedAt = 1781654400000;

function getSeedDateStart(year: number, monthIndex: number, day: number) {
  return Date.UTC(year, monthIndex, day, 0, 0, 0, 0);
}

function getSeedDateEnd(year: number, monthIndex: number, day: number) {
  return Date.UTC(year, monthIndex, day, 23, 59, 59, 999);
}

export function canRunDemoSeedMutation({
  isProduction,
  isStaff,
}: {
  isProduction: boolean;
  isStaff: boolean;
}) {
  if (isProduction) return false;

  return isStaff;
}

async function requireDemoSeedAccess(ctx: MutationCtx) {
  const staffUser = await requireCurrentStaffUser(ctx);
  const isProduction = process.env.NODE_ENV === "production";
  const canRunSeed = canRunDemoSeedMutation({
    isProduction,
    isStaff: Boolean(staffUser),
  });

  if (!canRunSeed) {
    throw new Error("Demo seed access is not available.");
  }
}

const demoHackathons = [
  {
    name: "Build with Gemini XPRIZE",
    organizer: adminListerName,
    realOrganizerName: "XPRIZE",
    sourceName: "Devpost",
    sourceUrl: "https://xprize.devpost.com/",
    sourceKey: "devpost:29541",
    sourceAdapter: "devpost",
    externalRegistrationUrl:
      "https://xprize.devpost.com/challenges/start_a_submission",
    dateLabel: "May 19 - Aug 17, 2026",
    registrationDeadlineLabel: "Submissions close Aug 17, 2026",
    registrationDeadlineAt: getSeedDateEnd(2026, 7, 17),
    eventStartAt: getSeedDateStart(2026, 4, 19),
    eventEndAt: getSeedDateEnd(2026, 7, 17),
    setup: "Online",
    location: "Online",
    region: "Philippines-wide",
    eligibility: ["Remote builders"],
    teamSize: "See official page",
    prize: "USD 2,000,000",
    difficulty: "Open",
    interested: 348,
    lftCount: 62,
    summary:
      "Build AI-powered projects for education, productivity, and real-world impact in an open online Devpost challenge.",
  },
  {
    name: "H0: Hack the Zero Stack with Vercel v0 and AWS Databases",
    organizer: adminListerName,
    realOrganizerName: "Amazon",
    sourceName: "Devpost",
    sourceUrl: "https://h01.devpost.com/",
    sourceKey: "devpost:29812",
    sourceAdapter: "devpost",
    externalRegistrationUrl:
      "https://h01.devpost.com/challenges/start_a_submission",
    dateLabel: "May 27 - Jun 29, 2026",
    registrationDeadlineLabel: "Submissions close Jun 29, 2026",
    registrationDeadlineAt: getSeedDateEnd(2026, 5, 29),
    eventStartAt: getSeedDateStart(2026, 4, 27),
    eventEndAt: getSeedDateEnd(2026, 5, 29),
    setup: "Online",
    location: "Online",
    region: "Philippines-wide",
    eligibility: ["Remote builders"],
    teamSize: "See official page",
    prize: "USD 80,000",
    difficulty: "Open",
    interested: 221,
    lftCount: 41,
    summary:
      "Build web apps using Vercel v0 and AWS databases for an online Devpost challenge.",
  },
  {
    name: "Global AI Hackathon Series with Qwen Cloud",
    organizer: adminListerName,
    realOrganizerName: "Alibaba Cloud",
    sourceName: "Devpost",
    sourceUrl: "https://qwencloud-hackathon.devpost.com/",
    sourceKey: "devpost:29966",
    sourceAdapter: "devpost",
    externalRegistrationUrl:
      "https://qwencloud-hackathon.devpost.com/challenges/start_a_submission",
    dateLabel: "May 26 - Jul 09, 2026",
    registrationDeadlineLabel: "Submissions close Jul 09, 2026",
    registrationDeadlineAt: getSeedDateEnd(2026, 6, 9),
    eventStartAt: getSeedDateStart(2026, 4, 26),
    eventEndAt: getSeedDateEnd(2026, 6, 9),
    setup: "Online",
    location: "Online",
    region: "Philippines-wide",
    eligibility: ["Remote builders"],
    teamSize: "See official page",
    prize: "USD 45,000",
    difficulty: "Open",
    interested: 156,
    lftCount: 29,
    summary:
      "Create AI products with Qwen Cloud in a remote Devpost challenge focused on AI, design, and productivity.",
  },
  {
    name: "Slack Agent Builder Challenge",
    organizer: adminListerName,
    realOrganizerName: "Salesforce",
    sourceName: "Devpost",
    sourceUrl: "https://slackhack.devpost.com/",
    sourceKey: "devpost:29843",
    sourceAdapter: "devpost",
    externalRegistrationUrl:
      "https://slackhack.devpost.com/challenges/start_a_submission",
    dateLabel: "May 20 - Jul 13, 2026",
    registrationDeadlineLabel: "Submissions close Jul 13, 2026",
    registrationDeadlineAt: getSeedDateEnd(2026, 6, 13),
    eventStartAt: getSeedDateStart(2026, 4, 20),
    eventEndAt: getSeedDateEnd(2026, 6, 13),
    setup: "Online",
    location: "Online",
    region: "Philippines-wide",
    eligibility: ["Remote builders"],
    teamSize: "See official page",
    prize: "USD 42,000",
    difficulty: "Open",
    interested: 184,
    lftCount: 53,
    summary:
      "Build Slack agents and low-code workflows in a beginner-friendly online challenge.",
  },
] as const;

const demoParticipants = [
  {
    displayName: "Juan Ramos",
    initials: "JR",
    schoolOrCompany: "Student builder",
    location: "Manila",
    bio: "Builds civic tech prototypes, dashboards, and product demos. Looking for practical hackathons with real community use.",
  },
  {
    displayName: "Mika Reyes",
    initials: "MR",
    schoolOrCompany: "UP Diliman",
    role: "Frontend + pitch deck",
    stack: ["React", "Figma", "Tailwind"],
    availability: "Weeknights, weekends",
    goal: "Looking for backend or AI teammate for a remote AI hackathon.",
  },
  {
    displayName: "Andre Santos",
    initials: "AS",
    schoolOrCompany: "DLSU",
    role: "Backend + data",
    stack: ["Node", "Python", "PostgreSQL"],
    availability: "After 6 PM",
    goal: "Wants a product-minded team for fintech or civic tech builds.",
  },
  {
    displayName: "Gia Lim",
    initials: "GL",
    schoolOrCompany: "Ateneo",
    role: "UX researcher",
    stack: ["Figma", "user interviews", "Notion"],
    availability: "Saturday full day",
    goal: "Can validate problem statements and build presentation flow.",
  },
] as const;

const demoTeams = [
  {
    teamName: "Gemini Builders",
    leadDisplayName: "Mika Reyes",
    hackathonName: "Build with Gemini XPRIZE",
    goal: "Build an AI assistant for learning and public-service discovery.",
    missingRoles: ["AI/ML", "Backend"],
    currentSize: 2,
    targetSize: 4,
    status: "recruiting",
  },
  {
    teamName: "Zero Stack Crew",
    leadDisplayName: "Andre Santos",
    hackathonName: "H0: Hack the Zero Stack with Vercel v0 and AWS Databases",
    goal: "Prototype a fast full-stack app with Vercel v0 and AWS databases.",
    missingRoles: ["Frontend", "Pitch"],
    currentSize: 2,
    targetSize: 5,
    status: "recruiting",
  },
  {
    teamName: "Qwen Cloud Crew",
    leadDisplayName: "Gia Lim",
    hackathonName: "Global AI Hackathon Series with Qwen Cloud",
    goal: "Design and build an AI workflow for research teams.",
    missingRoles: ["Data", "Backend"],
    currentSize: 1,
    targetSize: 4,
    status: "recruiting",
  },
] as const;

const demoBadges = [
  "First Hackathon",
  "Team Builder",
  "AI Track",
  "Finalist",
  "Verified Participation",
] as const;

const demoPortfolioEntries = [
  {
    hackathonName: "PH AI Build Weekend",
    result: "finalist",
    source: "verified",
  },
  {
    hackathonName: "Fintech Campus Cup",
    result: "participant",
    source: "self_reported",
  },
  {
    hackathonName: "Climate Hack Cebu",
    result: "participant",
    source: "self_reported",
  },
  { hackathonName: "Mindanao Game Jam", result: "winner", source: "verified" },
  {
    hackathonName: "Campus App Sprint",
    result: "finalist",
    source: "self_reported",
  },
  {
    hackathonName: "Open Data Challenge",
    result: "finalist",
    source: "verified",
  },
  {
    hackathonName: "Student Startup Weekend",
    result: "participant",
    source: "self_reported",
  },
] as const;

const demoReviewListings = [
  {
    name: "Campus Health Sprint",
    organizer: "Student Builders PH",
    dateLabel: "Nov 7-8, 2026",
    registrationDeadlineLabel: "Closes Oct 25",
    setup: "Hybrid",
    location: "Quezon City",
    region: "Luzon",
    eligibility: ["Students", "Health-tech builders"],
    teamSize: "2-5",
    prize: "Mentorship + grants",
    difficulty: "Intermediate",
    summary:
      "Build practical tools for student health access, clinic queues, and wellness follow-ups.",
    status: "pending_review",
  },
  {
    name: "Open Gov Data Jam",
    organizer: "Civic Data Lab",
    dateLabel: "Dec 5-6, 2026",
    registrationDeadlineLabel: "Closes Nov 20",
    setup: "Online",
    location: "Philippines-wide",
    region: "Philippines-wide",
    eligibility: ["Open to all", "Data teams"],
    teamSize: "1-4",
    prize: "PHP 60k pool",
    difficulty: "Open",
    summary:
      "Create searchable public-service datasets, maps, and accountability dashboards.",
    status: "pending_review",
  },
] as const;

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

async function clearTable(
  ctx: MutationCtx,
  tableName: (typeof resettableTables)[number],
) {
  const documents = await ctx.db.query(tableName).collect();

  for (const document of documents) {
    await ctx.db.delete(document._id);
  }
}

async function clearDemoData(ctx: MutationCtx) {
  for (const tableName of resettableTables) {
    await clearTable(ctx, tableName);
  }
}

async function getUserByDisplayName(ctx: MutationCtx, displayName: string) {
  const users = await ctx.db.query("users").collect();

  return users.find((user) => user.displayName === displayName) ?? null;
}

async function getOrCreateUser(
  ctx: MutationCtx,
  user: {
    displayName: string;
    initials: string;
    schoolOrCompany?: string;
    location?: string;
    bio?: string;
  },
) {
  const existingUser = await getUserByDisplayName(ctx, user.displayName);

  if (existingUser) return existingUser._id;

  return ctx.db.insert("users", {
    displayName: user.displayName,
    initials: user.initials,
    role: "participant",
    schoolOrCompany: user.schoolOrCompany,
    location: user.location,
    bio: user.bio,
  });
}

async function getOrCreateOrganizer(
  ctx: MutationCtx,
  name: string,
  ownerUserId: Id<"users">,
) {
  const organizers = await ctx.db.query("organizers").collect();
  const existingOrganizer = organizers.find(
    (organizer) => organizer.name === name,
  );

  if (existingOrganizer) return existingOrganizer._id;

  return ctx.db.insert("organizers", {
    ownerUserId,
    name,
    verifiedAt: Date.now(),
  });
}

async function getHackathonByNameAndOrganizer(
  ctx: MutationCtx,
  name: string,
  organizerId: Id<"organizers">,
) {
  const hackathons = await ctx.db
    .query("hackathons")
    .withIndex("by_organizer", (index) => index.eq("organizerId", organizerId))
    .collect();

  return hackathons.find((hackathon) => hackathon.name === name) ?? null;
}

async function getOrCreateHackathon(
  ctx: MutationCtx,
  hackathon: (typeof demoHackathons)[number],
  organizerId: Id<"organizers">,
) {
  const existingHackathon = await getHackathonByNameAndOrganizer(
    ctx,
    hackathon.name,
    organizerId,
  );

  if (existingHackathon) return existingHackathon._id;

  return ctx.db.insert("hackathons", {
    organizerId,
    name: hackathon.name,
    dateLabel: hackathon.dateLabel,
    registrationDeadlineLabel: hackathon.registrationDeadlineLabel,
    setup: hackathon.setup,
    location: hackathon.location,
    region: hackathon.region,
    eligibility: [...hackathon.eligibility],
    teamSize: hackathon.teamSize,
    prize: hackathon.prize,
    status: "published",
    difficulty: hackathon.difficulty,
    summary: hackathon.summary,
    externalRegistrationUrl: hackathon.externalRegistrationUrl,
    listedByName: hackathon.organizer,
    realOrganizerName: hackathon.realOrganizerName,
    sourceName: hackathon.sourceName,
    sourceUrl: hackathon.sourceUrl,
    sourceKey: hackathon.sourceKey,
    sourceAdapter: hackathon.sourceAdapter,
    registrationDeadlineAt: hackathon.registrationDeadlineAt,
    eventStartAt: hackathon.eventStartAt,
    eventEndAt: hackathon.eventEndAt,
    lastVerifiedAt: seedVerifiedAt,
    lastSeenAt: seedVerifiedAt,
    publishedAt: Date.now(),
  });
}

async function getOrCreateBadge(ctx: MutationCtx, name: string) {
  const existingBadge = await ctx.db
    .query("badges")
    .withIndex("by_name", (index) => index.eq("name", name))
    .unique();

  if (existingBadge) return existingBadge._id;

  return ctx.db.insert("badges", { name });
}

async function awardBadgeIfMissing(
  ctx: MutationCtx,
  userId: Id<"users">,
  badgeId: Id<"badges">,
) {
  const existingBadge = await ctx.db
    .query("userBadges")
    .withIndex("by_user_and_badge", (index) =>
      index.eq("userId", userId).eq("badgeId", badgeId),
    )
    .unique();

  if (existingBadge) return;

  await ctx.db.insert("userBadges", { userId, badgeId });
}

async function upsertLftProfile(
  ctx: MutationCtx,
  userId: Id<"users">,
  participant: (typeof demoParticipants)[number],
  hackathonId?: Id<"hackathons">,
) {
  if (!("role" in participant)) return;

  const existingProfile = await ctx.db
    .query("lftProfiles")
    .withIndex("by_user", (index) => index.eq("userId", userId))
    .first();
  const profileFields = {
    hackathonId,
    role: participant.role,
    stack: [...participant.stack],
    availability: participant.availability,
    goal: participant.goal,
    isActive: true,
  };

  if (!existingProfile) {
    await ctx.db.insert("lftProfiles", { userId, ...profileFields });
    return;
  }

  await ctx.db.patch(existingProfile._id, profileFields);
}

async function seedTeam(
  ctx: MutationCtx,
  team: (typeof demoTeams)[number],
  userIdsByName: Map<string, Id<"users">>,
  hackathonIdsByName: Map<string, Id<"hackathons">>,
) {
  const leadUserId = userIdsByName.get(team.leadDisplayName);
  const hackathonId = hackathonIdsByName.get(team.hackathonName);

  if (!leadUserId) throw new Error(`Missing team lead ${team.leadDisplayName}`);
  if (!hackathonId) throw new Error(`Missing hackathon ${team.hackathonName}`);

  await ctx.db.insert("teams", {
    hackathonId,
    teamName: team.teamName,
    goal: team.goal,
    members: [leadUserId],
    currentSize: team.currentSize,
    targetSize: team.targetSize,
    missingRoles: [...team.missingRoles],
    status: team.status,
  });
}

async function seedSavedHackathon(
  ctx: MutationCtx,
  userId: Id<"users">,
  hackathonId: Id<"hackathons">,
) {
  await ctx.db.insert("savedHackathons", {
    userId,
    hackathonId,
  });
}

async function seedListingSignal(
  ctx: MutationCtx,
  userId: Id<"users">,
  hackathonId: Id<"hackathons">,
  type: "interest" | "lft_click" | "external_registration_click",
) {
  await ctx.db.insert("listingSignals", {
    userId,
    hackathonId,
    type,
  });
}

async function seedPendingReview(
  ctx: MutationCtx,
  listing: (typeof demoReviewListings)[number],
) {
  const ownerUserId = await getOrCreateUser(ctx, {
    displayName: `${listing.organizer} Owner`,
    initials: getInitials(listing.organizer),
    schoolOrCompany: listing.organizer,
  });
  const organizerId = await getOrCreateOrganizer(
    ctx,
    listing.organizer,
    ownerUserId,
  );
  const hackathonId = await ctx.db.insert("hackathons", {
    organizerId,
    name: listing.name,
    dateLabel: listing.dateLabel,
    registrationDeadlineLabel: listing.registrationDeadlineLabel,
    setup: listing.setup,
    location: listing.location,
    region: listing.region,
    eligibility: [...listing.eligibility],
    teamSize: listing.teamSize,
    prize: listing.prize,
    status: listing.status,
    difficulty: listing.difficulty,
    summary: listing.summary,
  });

  await ctx.db.insert("listingReviews", {
    hackathonId,
    status: "pending",
  });
}

async function seedPortfolioEntry(
  ctx: MutationCtx,
  userId: Id<"users">,
  entry: (typeof demoPortfolioEntries)[number],
) {
  const existingEntries = await ctx.db
    .query("portfolioEntries")
    .withIndex("by_user", (index) => index.eq("userId", userId))
    .collect();
  const existingEntry = existingEntries.find(
    (currentEntry) =>
      currentEntry.hackathonName === entry.hackathonName &&
      currentEntry.result === entry.result,
  );

  if (existingEntry) return;

  await ctx.db.insert("portfolioEntries", {
    userId,
    hackathonName: entry.hackathonName,
    result: entry.result,
    source: entry.source,
  });
}

async function seedInterestSignals(
  ctx: MutationCtx,
  hackathonId: Id<"hackathons">,
  count: number,
) {
  const existingSignals = await ctx.db
    .query("listingSignals")
    .withIndex("by_hackathon_and_type", (index) =>
      index.eq("hackathonId", hackathonId).eq("type", "interest"),
    )
    .collect();

  if (existingSignals.length > 0) return;

  for (let index = 0; index < count; index += 1) {
    const userId = await getOrCreateUser(ctx, {
      displayName: `Demo Interested User ${index + 1}`,
      initials: `D${index + 1}`,
    });

    await ctx.db.insert("listingSignals", {
      userId,
      hackathonId,
      type: "interest",
    });
  }
}

async function seedDemoDataHandler(
  ctx: MutationCtx,
  args: {
    includeLargeInterestCounts?: boolean;
    reset?: boolean;
  },
) {
    const createdUserIds = new Map<string, Id<"users">>();
    const createdOrganizerIds = new Map<string, Id<"organizers">>();
    const createdHackathonIds = new Map<string, Id<"hackathons">>();

    if (args.reset) {
      await clearDemoData(ctx);
    }

    for (const participant of demoParticipants) {
      const userId = await getOrCreateUser(ctx, participant);
      createdUserIds.set(participant.displayName, userId);
    }

    const juanUserId = createdUserIds.get("Juan Ramos");

    if (!juanUserId) throw new Error("Demo participant was not created.");

    for (const hackathon of demoHackathons) {
      const ownerUserId = await getOrCreateUser(ctx, {
        displayName: `${hackathon.organizer} Owner`,
        initials: getInitials(hackathon.organizer),
        schoolOrCompany: hackathon.organizer,
      });
      const organizerId = await getOrCreateOrganizer(
        ctx,
        hackathon.organizer,
        ownerUserId,
      );
      const hackathonId = await getOrCreateHackathon(
        ctx,
        hackathon,
        organizerId,
      );

      createdOrganizerIds.set(hackathon.organizer, organizerId);
      createdHackathonIds.set(hackathon.name, hackathonId);

      if (args.includeLargeInterestCounts) {
        await seedInterestSignals(ctx, hackathonId, hackathon.interested);
      }
    }

    for (const participant of demoParticipants) {
      const userId = createdUserIds.get(participant.displayName);
      const hackathonId = createdHackathonIds.get("Build with Gemini XPRIZE");

      if (!userId) throw new Error(`Missing participant ${participant.displayName}`);

      await upsertLftProfile(ctx, userId, participant, hackathonId);
    }

    for (const team of demoTeams) {
      await seedTeam(ctx, team, createdUserIds, createdHackathonIds);
    }

    for (const badgeName of demoBadges) {
      const badgeId = await getOrCreateBadge(ctx, badgeName);
      await awardBadgeIfMissing(ctx, juanUserId, badgeId);
    }

    for (const entry of demoPortfolioEntries) {
      await seedPortfolioEntry(ctx, juanUserId, entry);
    }

    const savedHackathonId = createdHackathonIds.get("Build with Gemini XPRIZE");
    const interestedHackathonId = createdHackathonIds.get(
      "H0: Hack the Zero Stack with Vercel v0 and AWS Databases",
    );
    const lftHackathonId = createdHackathonIds.get(
      "Global AI Hackathon Series with Qwen Cloud",
    );

    if (savedHackathonId) await seedSavedHackathon(ctx, juanUserId, savedHackathonId);
    if (interestedHackathonId)
      await seedListingSignal(ctx, juanUserId, interestedHackathonId, "interest");
    if (lftHackathonId)
      await seedListingSignal(ctx, juanUserId, lftHackathonId, "lft_click");

    for (const listing of demoReviewListings) {
      await seedPendingReview(ctx, listing);
    }

  return {
    users: createdUserIds.size,
    organizers: createdOrganizerIds.size,
    hackathons: createdHackathonIds.size,
    teams: demoTeams.length,
    badges: demoBadges.length,
    portfolioEntries: demoPortfolioEntries.length,
    reviewListings: demoReviewListings.length,
  };
}

export const seedDemoData = mutation({
  args: {
    includeLargeInterestCounts: v.optional(v.boolean()),
    reset: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireDemoSeedAccess(ctx);

    return seedDemoDataHandler(ctx, args);
  },
});

export const resetAndSeedDemoData = mutation({
  args: {
    includeLargeInterestCounts: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireDemoSeedAccess(ctx);

    return seedDemoDataHandler(ctx, {
      includeLargeInterestCounts: args.includeLargeInterestCounts,
      reset: true,
    });
  },
});
