import type { Doc } from "@/convex/_generated/dataModel";
import { type Hackathon } from "@/lib/sample-data";
import type {
  ConvexHackathon,
  ConvexLftProfile,
  ConvexRecruitingTeam,
  PortfolioProfile,
  TeamInterestedUser,
  Teammate,
  UiTeamLooking,
  UiHackathon,
} from "@/components/shared/types";

function getDisplayStatus(
  status: Doc<"hackathons">["status"],
): Hackathon["status"] {
  if (status === "published") return "Open";
  if (status === "draft") return "Draft";
  if (status === "pending_review") return "Pending review";
  if (status === "needs_edits") return "Needs edits";
  if (status === "cancelled") return "Cancelled";
  return "Upcoming";
}

export function getUiHackathon(hackathon: ConvexHackathon): UiHackathon {
  return {
    id: hackathon._id,
    convexId: hackathon._id,
    name: hackathon.name,
    organizer: hackathon.organizerName,
    date: hackathon.dateLabel,
    deadline: hackathon.registrationDeadlineLabel,
    setup: hackathon.setup,
    location: hackathon.location,
    region: hackathon.region,
    eligibility: hackathon.eligibility,
    teamSize: hackathon.teamSize,
    prize: hackathon.prize,
    status: getDisplayStatus(hackathon.status),
    difficulty: hackathon.difficulty,
    interested: hackathon.interestedCount,
    lftCount: hackathon.lftCount,
    savedCount: hackathon.savedCount,
    summary: hackathon.summary,
    registrationUrl: hackathon.externalRegistrationUrl,
    coverImageUrl: hackathon.coverImageUrl,
    updatedAt: hackathon.updatedAt,
    cancellationReason: hackathon.cancellationReason,
    cancelledAt: hackathon.cancelledAt,
    cancellationVisibleUntil: hackathon.cancellationVisibleUntil,
  };
}

export function getUiTeammate(profile: ConvexLftProfile): Teammate {
  return {
    convexUserId: profile.userId,
    convexHackathonId: profile.hackathonId,
    name: profile.displayName,
    role: profile.role,
    school: profile.schoolOrCompany ?? "Independent builder",
    stack: profile.stack.join(", "),
    availability: profile.availability,
    goal: profile.goal,
    match: `${profile.matchPercent}%`,
  };
}

export function getUiTeamLooking(team: ConvexRecruitingTeam): UiTeamLooking {
  return {
    convexTeamId: team._id,
    leadUserId: team.leadUserId,
    convexHackathonId: team.hackathonId,
    teamName: team.teamName,
    missingRoles: team.missingRoles,
    hackathonName: team.hackathonName,
    hackathonLocation: team.hackathonLocation,
  };
}

export function getUiTeamInterestedUser(
  user: Doc<"users"> & {
    teamId?: Doc<"teamDecisions">["teamId"];
    hackathonId?: Doc<"teamDecisions">["hackathonId"];
  },
): TeamInterestedUser {
  return {
    userId: user._id,
    teamId: user.teamId,
    hackathonId: user.hackathonId,
    displayName: user.displayName,
    initials: user.initials,
    meta: [user.schoolOrCompany, user.location].filter(Boolean).join(" · "),
    bio: user.bio ?? "Interested in joining your team.",
  };
}

export type ConvexPortfolioProfile = {
  user: Doc<"users"> | null;
  badges: (Doc<"badges"> & { awardedAt: number })[];
  stats: {
    participations: number;
    finals: number;
    wins: number;
    verified: number;
  };
  entries: Doc<"portfolioEntries">[];
};

export type OrganizerDashboard = {
  stats: {
    published: number;
    pendingReview: number;
    drafts: number;
  };
  hackathons: (Doc<"hackathons"> & { reviewNote?: string })[];
};

export type OrganizerInsights = {
  totals: {
    savedCount: number;
    interestedCount: number;
    lftClickCount: number;
    externalRegistrationClickCount: number;
  };
  listings: {
    hackathonId: string;
    hackathonName: string;
    savedCount: number;
    interestedCount: number;
    lftClickCount: number;
    externalRegistrationClickCount: number;
  }[];
};

export type PendingReview = Doc<"listingReviews"> & {
  hackathon: Doc<"hackathons"> | null;
  organizer: Doc<"organizers"> | null;
};

export function getUiOrganizerHackathon(
  hackathon: Doc<"hackathons"> & { reviewNote?: string },
  interestedCount: number,
): UiHackathon {
  const listing = getUiHackathon({
    ...hackathon,
    organizerName: "Your organizer",
    interestedCount,
    lftCount: 0,
    savedCount: 0,
  });

  return {
    ...listing,
    reviewNote: hackathon.reviewNote,
  };
}

export function getUiReviewHackathon(
  review: PendingReview,
): UiHackathon | null {
  if (!review.hackathon) return null;

  const hackathon = getUiHackathon({
    ...review.hackathon,
    organizerName: review.organizer?.name ?? "Unknown organizer",
    interestedCount: 0,
    lftCount: 0,
    savedCount: 0,
  });

  return {
    ...hackathon,
    id: review._id,
  };
}

export function getUiPortfolioProfile(
  profile: ConvexPortfolioProfile,
): PortfolioProfile | undefined {
  if (!profile.user) return undefined;

  return {
    displayName: profile.user.displayName,
    initials: profile.user.initials,
    meta: [profile.user.schoolOrCompany, profile.user.location]
      .filter(Boolean)
      .join(" · "),
    bio: profile.user.bio ?? "No bio yet.",
    badges: profile.badges.map((badge) => badge.name),
    stats: [
      { label: "Participations", value: String(profile.stats.participations) },
      { label: "Finals", value: String(profile.stats.finals) },
      { label: "Wins", value: String(profile.stats.wins) },
      { label: "Verified", value: String(profile.stats.verified) },
    ],
    entries: profile.entries.map((entry) => ({
      id: entry._id,
      hackathonName: entry.hackathonName,
      result: entry.result,
      source: entry.source,
    })),
  };
}
