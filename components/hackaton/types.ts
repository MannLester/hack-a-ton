import { teammates, type Hackathon } from "@/lib/sample-data";

export type Persona = "participant" | "organizer";
export type ParticipantTab = "explore" | "team" | "portfolio";
export type OrganizerTab = "listings" | "create" | "insights";
export type Teammate = (typeof teammates)[number];
export type CreateListingStatus =
  | "idle"
  | "draft-saved"
  | "submitted"
  | "missing-fields";
