import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const hackathonSetup = v.union(
  v.literal("Online"),
  v.literal("Onsite"),
  v.literal("Hybrid"),
);
const hackathonStatus = v.union(
  v.literal("draft"),
  v.literal("pending_review"),
  v.literal("published"),
  v.literal("needs_edits"),
  v.literal("archived"),
  v.literal("cancelled"),
);
const listingSignalType = v.union(
  v.literal("interest"),
  v.literal("lft_click"),
  v.literal("external_registration_click"),
);
const portfolioResult = v.union(
  v.literal("participant"),
  v.literal("finalist"),
  v.literal("winner"),
);
const reportSource = v.union(v.literal("self_reported"), v.literal("verified"));
const teamDecision = v.union(v.literal("like"), v.literal("pass"));
const teamMatchStatus = v.union(v.literal("active"), v.literal("archived"));
const teamStatus = v.union(v.literal("recruiting"), v.literal("full"));

export default defineSchema({
  users: defineTable({
    clerkUserId: v.optional(v.string()),
    displayName: v.string(),
    initials: v.string(),
    role: v.union(
      v.literal("participant"),
      v.literal("organizer"),
      v.literal("staff"),
    ),
    schoolOrCompany: v.optional(v.string()),
    location: v.optional(v.string()),
    bio: v.optional(v.string()),
    onboardingCompletedAt: v.optional(v.number()),
    onboardingPersona: v.optional(v.union(v.literal("participant"), v.literal("organizer"))),
    onboardingDomains: v.optional(v.array(v.string())),
    onboardingTechStack: v.optional(v.array(v.string())),
    onboardingLocationStrategy: v.optional(
      v.union(v.literal("local"), v.literal("global")),
    ),
    onboardingExperienceLevel: v.optional(
      v.union(
        v.literal("first-timer"),
        v.literal("frequent-hacker"),
        v.literal("veteran"),
      ),
    ),
    githubUrl: v.optional(v.string()),
    linkedinUrl: v.optional(v.string()),
    portfolioUrl: v.optional(v.string()),
  }).index("by_clerk_user_id", ["clerkUserId"]),

  organizers: defineTable({
    ownerUserId: v.id("users"),
    name: v.string(),
    websiteUrl: v.optional(v.string()),
    verifiedAt: v.optional(v.number()),
  }).index("by_owner", ["ownerUserId"]),

  hackathons: defineTable({
    organizerId: v.id("organizers"),
    name: v.string(),
    dateLabel: v.string(),
    registrationDeadlineLabel: v.string(),
    setup: hackathonSetup,
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
    status: hackathonStatus,
    difficulty: v.union(
      v.literal("Beginner"),
      v.literal("Intermediate"),
      v.literal("Open"),
    ),
    summary: v.string(),
    externalRegistrationUrl: v.optional(v.string()),
    coverImageUrl: v.optional(v.string()),
    coverImageStorageId: v.optional(v.id("_storage")),
    publishedAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
    cancellationReason: v.optional(v.string()),
    cancelledAt: v.optional(v.number()),
    cancellationVisibleUntil: v.optional(v.number()),
  })
    .index("by_organizer", ["organizerId"])
    .index("by_status", ["status"])
    .searchIndex("search_listing_text", {
      searchField: "summary",
      filterFields: ["status", "setup"],
    }),

  savedHackathons: defineTable({
    userId: v.id("users"),
    hackathonId: v.id("hackathons"),
  })
    .index("by_user", ["userId"])
    .index("by_hackathon", ["hackathonId"])
    .index("by_user_and_hackathon", ["userId", "hackathonId"]),

  listingSignals: defineTable({
    userId: v.id("users"),
    hackathonId: v.id("hackathons"),
    type: listingSignalType,
  })
    .index("by_hackathon_and_type", ["hackathonId", "type"])
    .index("by_user_hackathon_and_type", ["userId", "hackathonId", "type"]),

  lftProfiles: defineTable({
    userId: v.id("users"),
    hackathonId: v.optional(v.id("hackathons")),
    role: v.string(),
    stack: v.array(v.string()),
    availability: v.string(),
    goal: v.string(),
    isActive: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_hackathon", ["hackathonId"])
    .index("by_active", ["isActive"]),

  teamDecisions: defineTable({
    fromUserId: v.id("users"),
    toUserId: v.id("users"),
    teamId: v.optional(v.id("teams")),
    hackathonId: v.optional(v.id("hackathons")),
    decision: teamDecision,
  })
    .index("by_from_user", ["fromUserId"])
    .index("by_pair", ["fromUserId", "toUserId"])
    .index("by_team", ["teamId"]),

  teamMatches: defineTable({
    firstUserId: v.id("users"),
    secondUserId: v.id("users"),
    hackathonId: v.optional(v.id("hackathons")),
    status: teamMatchStatus,
  })
    .index("by_first_user", ["firstUserId"])
    .index("by_second_user", ["secondUserId"]),

  teams: defineTable({
    hackathonId: v.id("hackathons"),
    teamName: v.string(),
    goal: v.optional(v.string()),
    members: v.array(v.id("users")),
    currentSize: v.number(),
    targetSize: v.number(),
    missingRoles: v.array(v.string()),
    status: teamStatus,
  })
    .index("by_hackathon", ["hackathonId"])
    .index("by_status", ["status"]),

  badges: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
  }).index("by_name", ["name"]),

  userBadges: defineTable({
    userId: v.id("users"),
    badgeId: v.id("badges"),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_badge", ["userId", "badgeId"]),

  portfolioEntries: defineTable({
    userId: v.id("users"),
    hackathonId: v.optional(v.id("hackathons")),
    hackathonName: v.string(),
    result: portfolioResult,
    source: reportSource,
  }).index("by_user", ["userId"]),

  listingReviews: defineTable({
    hackathonId: v.id("hackathons"),
    reviewerUserId: v.optional(v.id("users")),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("needs_edits"),
    ),
    note: v.optional(v.string()),
    reviewedAt: v.optional(v.number()),
  })
    .index("by_hackathon", ["hackathonId"])
    .index("by_status", ["status"]),
});
