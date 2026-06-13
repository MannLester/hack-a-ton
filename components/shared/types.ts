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
  | "saving"
  | "submitting"
  | "draft-saved"
  | "submitted"
  | "missing-fields"
  | "failed";

export type CreateListingFormValues = {
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
