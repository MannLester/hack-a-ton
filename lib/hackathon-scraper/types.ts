export type ScraperSourceAdapter =
  | "devpost"
  | "rise-in"
  | "devfolio"
  | "eventbrite";

export type HackathonSetup = "Online" | "Onsite" | "Hybrid";
export type HackathonRegion =
  | "Luzon"
  | "Visayas"
  | "Mindanao"
  | "Philippines-wide";
export type HackathonDifficulty = "Beginner" | "Intermediate" | "Open";
export type HackathonImportStatus = "published" | "pending_review";

export type HackathonDateRange = {
  startAt: number;
  endAt: number;
};

export type ScrapedHackathonCandidate = {
  sourceAdapter: ScraperSourceAdapter;
  sourceKey: string;
  sourceName: string;
  sourceUrl: string;
  registrationUrl?: string;
  name: string;
  organizerName?: string;
  sourceStatus?: string;
  setup?: HackathonSetup;
  location?: string;
  dateLabel?: string;
  registrationDeadlineLabel?: string;
  registrationDeadlineAt?: number;
  eventStartAt?: number;
  eventEndAt?: number;
  eligibility?: string[];
  teamSize?: string;
  prize?: string;
  difficulty?: HackathonDifficulty;
  summary?: string;
  tags?: string[];
  coverImageUrl?: string;
  inviteOnly?: boolean;
};

export type JoinabilityDecision = {
  kind: "publish" | "review" | "reject";
  reason: string;
};

export type NormalizedHackathonImport = {
  importStatus: HackathonImportStatus;
  reviewNote?: string;
  organizerName: string;
  name: string;
  dateLabel: string;
  registrationDeadlineLabel: string;
  setup: HackathonSetup;
  location: string;
  region: HackathonRegion;
  eligibility: string[];
  teamSize: string;
  prize: string;
  difficulty: HackathonDifficulty;
  summary: string;
  externalRegistrationUrl: string;
  listedByName: string;
  realOrganizerName: string;
  sourceName: string;
  sourceUrl: string;
  sourceKey: string;
  sourceAdapter: ScraperSourceAdapter;
  registrationDeadlineAt?: number;
  eventStartAt?: number;
  eventEndAt?: number;
  lastVerifiedAt: number;
  lastSeenAt: number;
  coverImageUrl?: string;
};
