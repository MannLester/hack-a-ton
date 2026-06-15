import type { Id } from "@/convex/_generated/dataModel";

export type Hackathon = {
  id: string;
  name: string;
  organizer: string;
  date: string;
  deadline: string;
  setup: "Online" | "Onsite" | "Hybrid";
  location: string;
  region: "Luzon" | "Visayas" | "Mindanao" | "Philippines-wide";
  eligibility: string[];
  teamSize: string;
  prize: string;
  status:
    | "Open"
    | "Closing soon"
    | "Upcoming"
    | "Happening now"
    | "Draft"
    | "Pending review"
    | "Needs edits"
    | "Cancelled";
  difficulty: "Beginner" | "Intermediate" | "Open";
  interested: number;
  lftCount: number;
  summary: string;
  updatedAt?: number;
  cancellationReason?: string;
  cancelledAt?: number;
  cancellationVisibleUntil?: number;
};

export type TeamLooking = {
  convexTeamId?: Id<"teams">;
  leadUserId?: Id<"users">;
  convexHackathonId?: Id<"hackathons">;
  teamName: string;
  missingRoles: string[];
  hackathonName: string;
  hackathonLocation: string;
};
