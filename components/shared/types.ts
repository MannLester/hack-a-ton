import type { Doc, Id } from "@/convex/_generated/dataModel";
import { teammates, type Hackathon, type TeamLooking } from "@/lib/sample-data";

export type Persona = "participant" | "organizer";
export type ParticipantTab = "explore" | "team" | "portfolio" | "leaderboard";
export type OrganizerTab = "listings" | "create" | "insights";
export type Teammate = (typeof teammates)[number] & {
  convexUserId?: Id<"users">;
  convexHackathonId?: Id<"hackathons">;
};
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
export type ConvexRecruitingTeam = Doc<"teams"> & {
  leadUserId: Id<"users">;
  hackathonName: string;
  hackathonLocation: string;
};
export type UiTeamLooking = TeamLooking;
export type TeamInterestedUser = {
  userId: Id<"users">;
  hackathonId?: Id<"hackathons">;
  displayName: string;
  initials: string;
  meta: string;
  bio: string;
};
export type TeamMemberProfile = {
  userId: Id<"users">;
  displayName: string;
  initials: string;
  meta: string | null;
  isLead: boolean;
};
export type MyTeam = Doc<"teams"> & {
  memberProfiles: TeamMemberProfile[];
};
export type PortfolioEntry = {
  id?: Id<"portfolioEntries">;
  hackathonName: string;
  result: "participant" | "finalist" | "winner";
  source: "self_reported" | "verified";
};
export type LeaderboardRow = {
  userId: string;
  displayName: string;
  initials: string;
  score: number;
  participations: number;
  finals: number;
  wins: number;
  verified: number;
  teamsFormed: number;
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
export type LandingStats = {
  hackathonsListed: number;
  activeBuilders: number;
  teamsFormed: number;
};
export type CreateListingStatus =
  | "idle"
  | "saving"
  | "submitting"
  | "draft-saved"
  | "submitted"
  | "missing-fields"
  | "failed";

export type CreateListingFormValues = {
  listingId?: Id<"hackathons">;
  listingName: string;
  organizerName: string;
  dateLabel: string;
  registrationDeadlineLabel: string;
  setup: "Online" | "Onsite" | "Hybrid";
  location: string;
  region: "Luzon" | "Visayas" | "Mindanao" | "Philippines-wide";
  eligibilityText: string;
  teamSize: string;
  prize: string;
  difficulty: "Beginner" | "Intermediate" | "Open";
  registrationUrl: string;
  description: string;
};

export const demoUserId = process.env.NEXT_PUBLIC_DEMO_USER_ID as
  | Id<"users">
  | undefined;
export const demoOrganizerId = process.env.NEXT_PUBLIC_DEMO_ORGANIZER_ID as
  | Id<"organizers">
  | undefined;
export const demoStaffUserId = process.env.NEXT_PUBLIC_DEMO_STAFF_USER_ID as
  | Id<"users">
  | undefined;
