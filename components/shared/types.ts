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
  registrationUrl?: string;
  coverImageUrl?: string;
  coverImageStorageId?: Id<"_storage">;
  reviewNote?: string;
  updatedAt?: number;
  cancellationReason?: string;
  cancelledAt?: number;
  cancellationVisibleUntil?: number;
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
  teamId?: Id<"teams">;
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
export type HackathonTeam = MyTeam;
export type OrganizerResultTeam = {
  team: MyTeam;
  placement: TeamResultPlacement | null;
  resultId: Id<"teamResults"> | null;
};
export type OrganizerResultBoard = {
  hackathonId: Id<"hackathons">;
  hackathonName: string;
  dateLabel: string;
  status: Doc<"hackathons">["status"];
  canSubmitResults: boolean;
  teams: OrganizerResultTeam[];
};
export type TeamResultPlacement = "first" | "second" | "third" | "participant";

export type PortfolioEntry = {
  id?: Id<"portfolioEntries">;
  hackathonName: string;
  hackathonDate?: string;
  result: "participant" | "finalist" | "winner";
  source: "self_reported" | "verified";
  placement?: TeamResultPlacement;
  teamName?: string;
};

export type PortfolioPlacementStat = {
  placement: TeamResultPlacement;
  label: string;
  count: number;
  points: number;
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
  profileTags: string[];
  stats: { label: string; value: string }[];
  placementStats: PortfolioPlacementStat[];
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
  listingStatus?: UiHackathon["status"];
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
  coverImageUrl: string;
  coverImageStorageId?: Id<"_storage">;
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
