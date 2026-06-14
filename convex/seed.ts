import { v } from "convex/values";
import { mutation } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";

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
] as const;

const demoHackathons = [
  {
    name: "PH AI Build Weekend",
    organizer: "DevCon Manila",
    dateLabel: "Jul 19-21, 2026",
    registrationDeadlineLabel: "Closes Jul 10",
    setup: "Hybrid",
    location: "BGC, Taguig",
    region: "Luzon",
    eligibility: ["Students", "Professionals", "Beginner-friendly"],
    teamSize: "2-4",
    prize: "PHP 120k pool",
    difficulty: "Beginner",
    interested: 348,
    lftCount: 62,
    summary:
      "Build practical AI tools for local government services, education, and community response workflows.",
  },
  {
    name: "Fintech Campus Cup",
    organizer: "PayLab PH",
    dateLabel: "Aug 3-4, 2026",
    registrationDeadlineLabel: "Closes Jul 24",
    setup: "Online",
    location: "Philippines-wide",
    region: "Philippines-wide",
    eligibility: ["Students", "Open to all schools"],
    teamSize: "3-5",
    prize: "Internship + grants",
    difficulty: "Intermediate",
    interested: 221,
    lftCount: 41,
    summary:
      "Create inclusive payment, budgeting, or financial-literacy products for young Filipinos.",
  },
  {
    name: "Climate Hack Cebu",
    organizer: "Cebu Tech Council",
    dateLabel: "Sep 12-13, 2026",
    registrationDeadlineLabel: "Closes Aug 29",
    setup: "Onsite",
    location: "Cebu City",
    region: "Visayas",
    eligibility: ["Students", "Professionals"],
    teamSize: "2-4",
    prize: "PHP 80k pool",
    difficulty: "Open",
    interested: 156,
    lftCount: 29,
    summary:
      "Prototype climate resilience dashboards, reporting tools, and community preparedness apps.",
  },
  {
    name: "Mindanao Game Jam",
    organizer: "Davao Indie Collective",
    dateLabel: "Oct 2-4, 2026",
    registrationDeadlineLabel: "Closes Sep 18",
    setup: "Hybrid",
    location: "Davao City",
    region: "Mindanao",
    eligibility: ["Open to all", "Beginner-friendly"],
    teamSize: "1-4",
    prize: "Showcase slots",
    difficulty: "Beginner",
    interested: 184,
    lftCount: 53,
    summary:
      "Design small but polished games rooted in Filipino stories, places, and everyday experiences.",
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
    goal: "Looking for backend or AI teammate for PH AI Build Weekend.",
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
    teamName: "AI Public Servants",
    leadDisplayName: "Mika Reyes",
    hackathonName: "PH AI Build Weekend",
    goal: "Build a barangay request triage assistant for common citizen services.",
    missingRoles: ["AI/ML", "Backend"],
    currentSize: 2,
    targetSize: 4,
    status: "recruiting",
  },
  {
    teamName: "PayItForward",
    leadDisplayName: "Andre Santos",
    hackathonName: "Fintech Campus Cup",
    goal: "Prototype a student budgeting app with transparent savings nudges.",
    missingRoles: ["Frontend", "Pitch"],
    currentSize: 2,
    targetSize: 5,
    status: "recruiting",
  },
  {
    teamName: "Research Relay",
    leadDisplayName: "Gia Lim",
    hackathonName: "Climate Hack Cebu",
    goal: "Turn community climate reports into clear responder dashboards.",
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
      const hackathonId = createdHackathonIds.get("PH AI Build Weekend");

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

    const savedHackathonId = createdHackathonIds.get("PH AI Build Weekend");
    const interestedHackathonId = createdHackathonIds.get("Fintech Campus Cup");
    const lftHackathonId = createdHackathonIds.get("Climate Hack Cebu");

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
    return seedDemoDataHandler(ctx, args);
  },
});

export const resetAndSeedDemoData = mutation({
  args: {
    includeLargeInterestCounts: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    return seedDemoDataHandler(ctx, {
      includeLargeInterestCounts: args.includeLargeInterestCounts,
      reset: true,
    });
  },
});
