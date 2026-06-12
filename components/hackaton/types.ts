import type { Doc, Id } from "@/convex/_generated/dataModel";
import { teammates, type Hackathon } from "@/lib/sample-data";

export type Persona = "participant" | "organizer";
export type ParticipantTab = "explore" | "team" | "portfolio";
export type OrganizerTab = "listings" | "create" | "insights";
export type Teammate = (typeof teammates)[number];
export type ConvexHackathon = Doc<"hackathons"> & {
  organizerName: string;
  interestedCount: number;
  lftCount: number;
  savedCount: number;
};
export type UiHackathon = Hackathon & {
  convexId?: Id<"hackathons">;
  savedCount?: number;
};
export type ConvexLftProfile = Doc<"lftProfiles"> & {
  displayName: string;
  schoolOrCompany: string | null;
  matchPercent: number;
};
export type PortfolioEntry = {
  hackathonName: string;
  result: "participant" | "finalist" | "winner";
  source: "self_reported" | "verified";
};
export type PortfolioProfile = {
  displayName: string;
  initials: string;
  meta: string;
  bio: string;
  badges: string[];
  stats: { label: string; value: string }[];
  entries: PortfolioEntry[];
};
export type CreateListingStatus =
  | "idle"
  | "draft-saved"
  | "submitted"
  | "missing-fields";

export const demoUserId = process.env.NEXT_PUBLIC_DEMO_USER_ID as
  | Id<"users">
  | undefined;

function getDisplayStatus(
  status: Doc<"hackathons">["status"],
): Hackathon["status"] {
  if (status === "published") return "Open";
  if (status === "needs_edits") return "Closing soon";
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
    format: hackathon.format,
    location: hackathon.location,
    eligibility: hackathon.eligibility,
    themes: hackathon.themes,
    teamSize: hackathon.teamSize,
    prize: hackathon.prize,
    status: getDisplayStatus(hackathon.status),
    difficulty: hackathon.difficulty,
    interested: hackathon.interestedCount,
    lftCount: hackathon.lftCount,
    savedCount: hackathon.savedCount,
    summary: hackathon.summary,
  };
}

export function getUiTeammate(profile: ConvexLftProfile): Teammate {
  return {
    name: profile.displayName,
    role: profile.role,
    school: profile.schoolOrCompany ?? "Independent builder",
    stack: profile.stack.join(", "),
    availability: profile.availability,
    goal: profile.goal,
    match: `${profile.matchPercent}%`,
  };
}
