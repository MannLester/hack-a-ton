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
] as const;

const adminListerName = "Hack-A-Ton Admin";
const seedVerifiedAt = 1781654400000;

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
    name: "AI Fest PH 2026 AI Hackathon",
    organizer: adminListerName,
    realOrganizerName: "AI Fest Philippines",
    sourceName: "AI Fest PH",
    sourceUrl: "https://aifest.ph/ai-hackathon-2026/",
    externalRegistrationUrl: "https://aifest.ph/ai-hackathon-2026/",
    dateLabel: "Aug 3-5, 2026",
    registrationDeadlineLabel: "See official event page",
    setup: "Onsite",
    location: "Iloilo City",
    region: "Visayas",
    eligibility: ["Students", "Open category"],
    teamSize: "Team size on official page",
    prize: "See official event page",
    difficulty: "Open",
    interested: 348,
    lftCount: 62,
    summary:
      "AI Fest PH's hackathon invites participants to build AI-enabled solutions to real-world problems.",
  },
  {
    name: "Build the Future of Finance Hackathon",
    organizer: adminListerName,
    realOrganizerName: "Stellar Philippines and Rise In",
    sourceName: "Rise In",
    sourceUrl:
      "https://www.risein.com/programs/build-on-stellar-philippines-hackathon",
    externalRegistrationUrl:
      "https://www.risein.com/programs/build-on-stellar-philippines-hackathon",
    dateLabel: "May 18-24, 2026",
    registrationDeadlineLabel: "Registration closed",
    setup: "Online",
    location: "Philippines-wide",
    region: "Philippines-wide",
    eligibility: ["Developers", "Founders", "Student builders"],
    teamSize: "1-5",
    prize: "PHP 60k pool",
    difficulty: "Open",
    interested: 221,
    lftCount: 41,
    summary:
      "A Stellar-focused hackathon for building real-world financial applications and localized finance tools.",
  },
  {
    name: "BrAPI Los Banos Hackathon 2025",
    organizer: adminListerName,
    realOrganizerName: "BrAPI Community",
    sourceName: "BrAPI",
    sourceUrl: "https://brapi.org/events/hackathon?id=hackathon-jun-2025",
    externalRegistrationUrl:
      "https://brapi.org/events/hackathon?id=hackathon-jun-2025",
    dateLabel: "Jun 2-6, 2025",
    registrationDeadlineLabel: "Registration closed",
    setup: "Onsite",
    location: "Los Banos, Laguna",
    region: "Luzon",
    eligibility: ["BrAPI community", "Developers", "Researchers"],
    teamSize: "Open collaboration",
    prize: "Community build week",
    difficulty: "Open",
    interested: 156,
    lftCount: 29,
    summary:
      "A BrAPI community hackathon at IRRI focused on code, prototypes, and crop-data standards collaboration.",
  },
  {
    name: "InnOlympics 2025: GDSC PLM Hackathon",
    organizer: adminListerName,
    realOrganizerName: "Google Developer Groups on Campus PLM",
    sourceName: "Devpost",
    sourceUrl: "https://innolympics-2025-gdsc-plm.devpost.com/",
    externalRegistrationUrl: "https://innolympics-2025-gdsc-plm.devpost.com/",
    dateLabel: "Jan 11-12, 2025",
    registrationDeadlineLabel: "Registration closed",
    setup: "Onsite",
    location: "Makati, Metro Manila",
    region: "Luzon",
    eligibility: ["College students", "Confirmed registered participants"],
    teamSize: "3-4",
    prize: "USD 680 in prizes",
    difficulty: "Beginner",
    interested: 184,
    lftCount: 53,
    summary:
      "A student hackathon challenging teams to build solutions aligned with the UN Sustainable Development Goals.",
  },
  {
    name: "Hack the Future: Technology for a Better World",
    organizer: adminListerName,
    realOrganizerName: "Hyperparameter",
    sourceName: "All Hackathons Philippines",
    sourceUrl:
      "https://ph.allhackathons.com/hackathon/hack-the-future-technology-for-a-better-world/",
    externalRegistrationUrl:
      "https://ph.allhackathons.com/hackathon/hack-the-future-technology-for-a-better-world/",
    dateLabel: "Nov 22, 2024",
    registrationDeadlineLabel: "Registration closed",
    setup: "Onsite",
    location: "Makati, Metro Manila",
    region: "Luzon",
    eligibility: ["Coders", "Designers", "Problem solvers"],
    teamSize: "Team size on source page",
    prize: "No listed prize",
    difficulty: "Beginner",
    interested: 97,
    lftCount: 18,
    summary:
      "A Makati hackathon focused on collaborative technology solutions for social impact.",
  },
  {
    name: "Xircus Draper Hackathon at Manila",
    organizer: adminListerName,
    realOrganizerName: "Xircus Web3 Protocol",
    sourceName: "All Hackathons Philippines",
    sourceUrl:
      "https://ph.allhackathons.com/hackathon/xircus-draper-hackathon-manila/",
    externalRegistrationUrl:
      "https://ph.allhackathons.com/hackathon/xircus-draper-hackathon-manila/",
    dateLabel: "Mar 31-Apr 2, 2023",
    registrationDeadlineLabel: "Registration closed",
    setup: "Onsite",
    location: "Makati, Metro Manila",
    region: "Luzon",
    eligibility: ["No-code builders", "Low-code builders", "Web3 builders"],
    teamSize: "1-4",
    prize: "USD 2k in prizes",
    difficulty: "Beginner",
    interested: 88,
    lftCount: 17,
    summary:
      "An in-person Web3 dApp builder hackathon hosted with Draper Startup House in Manila.",
  },
  {
    name: "ADB-AIM Hackathon 2020: Shaping the New Normal",
    organizer: adminListerName,
    realOrganizerName: "Asian Development Bank and Asian Institute of Management",
    sourceName: "All Hackathons Philippines",
    sourceUrl:
      "https://ph.allhackathons.com/hackathon/adb-aim-hackathon-2020-shaping-the-new-normal-3/",
    externalRegistrationUrl:
      "https://ph.allhackathons.com/hackathon/adb-aim-hackathon-2020-shaping-the-new-normal-3/",
    dateLabel: "Jun 30, 2020",
    registrationDeadlineLabel: "Registration closed",
    setup: "Onsite",
    location: "Manila",
    region: "Luzon",
    eligibility: ["Students", "Professionals", "General public"],
    teamSize: "Team size on source page",
    prize: "USD 10k pilot funding",
    difficulty: "Open",
    interested: 132,
    lftCount: 24,
    summary:
      "A post-COVID recovery hackathon for solutions supporting economic activity in the new normal.",
  },
  {
    name: "Global Game Jam 2020: DLSU Laguna Campus Chill Space",
    organizer: adminListerName,
    realOrganizerName: "Global Game Jam local organizers",
    sourceName: "All Hackathons Philippines",
    sourceUrl:
      "https://ph.allhackathons.com/hackathon/global-game-jam-2020-dlsu-laguna-campus-chill-space/",
    externalRegistrationUrl:
      "https://ph.allhackathons.com/hackathon/global-game-jam-2020-dlsu-laguna-campus-chill-space/",
    dateLabel: "Jan 31-Feb 2, 2020",
    registrationDeadlineLabel: "Registration closed",
    setup: "Onsite",
    location: "Manila",
    region: "Luzon",
    eligibility: ["Game developers", "Students", "Artists"],
    teamSize: "Open collaboration",
    prize: "Game jam showcase",
    difficulty: "Open",
    interested: 119,
    lftCount: 31,
    summary:
      "A Philippine Global Game Jam site where participants collaborated to create games in under 48 hours.",
  },
  {
    name: "DISH 2019",
    organizer: adminListerName,
    realOrganizerName: "EOI Digital",
    sourceName: "All Hackathons Philippines",
    sourceUrl: "https://ph.allhackathons.com/hackathon/dish-2019/",
    externalRegistrationUrl: "https://ph.allhackathons.com/hackathon/dish-2019/",
    dateLabel: "Apr 6-7, 2019",
    registrationDeadlineLabel: "Registration closed",
    setup: "Onsite",
    location: "Makati, Metro Manila",
    region: "Luzon",
    eligibility: ["Fintech builders", "Blockchain builders", "Entrepreneurs"],
    teamSize: "Team size on source page",
    prize: "See source page",
    difficulty: "Open",
    interested: 103,
    lftCount: 21,
    summary:
      "A fintech and blockchain hackathon connected to the Inclusive Prosperity Fintech Summit.",
  },
  {
    name: "U:Hac Manila - Unionbank Hackathon",
    organizer: adminListerName,
    realOrganizerName: "EConnext Ideas and Media",
    sourceName: "All Hackathons Philippines",
    sourceUrl:
      "https://ph.allhackathons.com/hackathon/u-hac-manila-unionbank-hackathon/",
    externalRegistrationUrl:
      "https://ph.allhackathons.com/hackathon/u-hac-manila-unionbank-hackathon/",
    dateLabel: "Aug 27-28, 2016",
    registrationDeadlineLabel: "Registration closed",
    setup: "Onsite",
    location: "Mandaluyong, Metro Manila",
    region: "Luzon",
    eligibility: ["College students", "Developers", "Designers"],
    teamSize: "Team size on source page",
    prize: "PHP 80k",
    difficulty: "Open",
    interested: 115,
    lftCount: 26,
    summary:
      "A UnionBank-themed hackathon for apps and prototypes across fintech, games, VR, IoT, and robotics.",
  },
  {
    name: "1st Masskara Hackathon",
    organizer: adminListerName,
    realOrganizerName: "BNeFIT, HyBrain Development Corporation, and Horsepower.ph",
    sourceName: "All Hackathons Philippines",
    sourceUrl: "https://ph.allhackathons.com/hackathon/1st-masskara-hackathon/",
    externalRegistrationUrl:
      "https://ph.allhackathons.com/hackathon/1st-masskara-hackathon/",
    dateLabel: "Oct 17-18, 2016",
    registrationDeadlineLabel: "Registration closed",
    setup: "Onsite",
    location: "Bacolod City",
    region: "Visayas",
    eligibility: ["Developers", "Healthcare innovators", "IoT builders"],
    teamSize: "Team size on source page",
    prize: "Seed funding package",
    difficulty: "Open",
    interested: 94,
    lftCount: 19,
    summary:
      "A Bacolod hackathon for IoT, healthcare, and medical tourism technology concepts.",
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
    teamName: "AI Iloilo Builders",
    leadDisplayName: "Mika Reyes",
    hackathonName: "AI Fest PH 2026 AI Hackathon",
    goal: "Build an AI assistant for local tourism and public-service discovery.",
    missingRoles: ["AI/ML", "Backend"],
    currentSize: 2,
    targetSize: 4,
    status: "recruiting",
  },
  {
    teamName: "Peso Rails",
    leadDisplayName: "Andre Santos",
    hackathonName: "Build the Future of Finance Hackathon",
    goal: "Prototype low-cost payment workflows for Filipino micro-merchants.",
    missingRoles: ["Frontend", "Pitch"],
    currentSize: 2,
    targetSize: 5,
    status: "recruiting",
  },
  {
    teamName: "Crop Data Crew",
    leadDisplayName: "Gia Lim",
    hackathonName: "BrAPI Los Banos Hackathon 2025",
    goal: "Design friendlier crop-data import flows for field researchers.",
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
    lastVerifiedAt: seedVerifiedAt,
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
      const hackathonId = createdHackathonIds.get("AI Fest PH 2026 AI Hackathon");

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

    const savedHackathonId = createdHackathonIds.get("AI Fest PH 2026 AI Hackathon");
    const interestedHackathonId = createdHackathonIds.get(
      "Build the Future of Finance Hackathon",
    );
    const lftHackathonId = createdHackathonIds.get(
      "BrAPI Los Banos Hackathon 2025",
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
