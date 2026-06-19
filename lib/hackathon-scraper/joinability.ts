import {
  getRegionFromLocation,
  getSetupFromLocation,
  isRemoteOrPhilippinesCandidate,
} from "./scope";
import { getAbsoluteHttpsUrl, getNonEmptyArray } from "./text";
import type {
  HackathonImportStatus,
  JoinabilityDecision,
  NormalizedHackathonImport,
  ScrapedHackathonCandidate,
} from "./types";

export const hackathonAdminListerName = "Hack-A-Ton Admin";

const closedStatusPattern =
  /\b(closed|ended|past|complete|completed|cancelled|canceled)\b/i;
const openStatusPattern =
  /\b(open|accepting|active|live|registration_open|submissions_open)\b/i;

function getCandidateStatus(candidate: ScrapedHackathonCandidate) {
  return candidate.sourceStatus?.trim() ?? "";
}

function hasClosedStatus(candidate: ScrapedHackathonCandidate) {
  return closedStatusPattern.test(getCandidateStatus(candidate));
}

function hasOpenStatus(candidate: ScrapedHackathonCandidate) {
  return openStatusPattern.test(getCandidateStatus(candidate));
}

function getExternalRegistrationUrl(candidate: ScrapedHackathonCandidate) {
  return (
    getAbsoluteHttpsUrl(candidate.registrationUrl) ??
    getAbsoluteHttpsUrl(candidate.sourceUrl)
  );
}

function hasExpiredRegistrationDeadline(
  candidate: ScrapedHackathonCandidate,
  now: number,
) {
  return (
    candidate.registrationDeadlineAt !== undefined &&
    candidate.registrationDeadlineAt < now
  );
}

function hasEndedEvent(candidate: ScrapedHackathonCandidate, now: number) {
  return candidate.eventEndAt !== undefined && candidate.eventEndAt < now;
}

function getReviewDecision(reason: string): JoinabilityDecision {
  return { kind: "review", reason };
}

function getRejectDecision(reason: string): JoinabilityDecision {
  return { kind: "reject", reason };
}

function getPublishDecision(reason: string): JoinabilityDecision {
  return { kind: "publish", reason };
}

export function getJoinabilityDecision(
  candidate: ScrapedHackathonCandidate,
  now: number,
): JoinabilityDecision {
  if (!getExternalRegistrationUrl(candidate)) {
    return getRejectDecision("Listing has no usable external registration link.");
  }

  if (candidate.inviteOnly) {
    return getRejectDecision("Invite-only hackathons are not joinable publicly.");
  }

  if (!isRemoteOrPhilippinesCandidate(candidate)) {
    return getRejectDecision("Hackathon is not remote or Philippines-based.");
  }

  if (hasClosedStatus(candidate)) {
    return getRejectDecision("Source reports that registration is closed.");
  }

  if (hasExpiredRegistrationDeadline(candidate, now)) {
    return getRejectDecision("Registration deadline has already passed.");
  }

  if (hasEndedEvent(candidate, now)) {
    return getRejectDecision("Hackathon event has already ended.");
  }

  if (!hasOpenStatus(candidate)) {
    return getReviewDecision("Source does not clearly report an open status.");
  }

  if (candidate.registrationDeadlineAt === undefined) {
    return getReviewDecision("Open listing has no machine-readable deadline.");
  }

  return getPublishDecision(
    "Open remote or Philippines-based hackathon with a future deadline.",
  );
}

function getImportStatus(decision: JoinabilityDecision): HackathonImportStatus {
  if (decision.kind === "publish") return "published";

  return "pending_review";
}

function getNormalizedSummary(candidate: ScrapedHackathonCandidate) {
  const summary = candidate.summary?.trim();

  if (summary) return summary;

  return `Imported from ${candidate.sourceName}. Check the official page for full rules, schedule, prizes, and registration details.`;
}

function getNormalizedLocation(candidate: ScrapedHackathonCandidate) {
  return candidate.location?.trim() || "Online";
}

function getNormalizedEligibility(candidate: ScrapedHackathonCandidate) {
  const eligibility = getNonEmptyArray(candidate.eligibility);

  if (eligibility.length > 0) return eligibility;

  return ["Remote builders"];
}

export function getNormalizedHackathonImport(
  candidate: ScrapedHackathonCandidate,
  now: number,
): NormalizedHackathonImport | null {
  const decision = getJoinabilityDecision(candidate, now);
  const externalRegistrationUrl = getExternalRegistrationUrl(candidate);

  if (decision.kind === "reject") return null;
  if (!externalRegistrationUrl) return null;

  const location = getNormalizedLocation(candidate);
  const organizerName = candidate.organizerName?.trim() || candidate.sourceName;

  return {
    importStatus: getImportStatus(decision),
    reviewNote: decision.kind === "review" ? decision.reason : undefined,
    organizerName: hackathonAdminListerName,
    name: candidate.name.trim(),
    dateLabel: candidate.dateLabel?.trim() || "See official page",
    registrationDeadlineLabel:
      candidate.registrationDeadlineLabel?.trim() || "See official page",
    setup: candidate.setup ?? getSetupFromLocation(location),
    location,
    region: getRegionFromLocation(location),
    eligibility: getNormalizedEligibility(candidate),
    teamSize: candidate.teamSize?.trim() || "See official page",
    prize: candidate.prize?.trim() || "See official page",
    difficulty: candidate.difficulty ?? "Open",
    summary: getNormalizedSummary(candidate),
    externalRegistrationUrl,
    listedByName: hackathonAdminListerName,
    realOrganizerName: organizerName,
    sourceName: candidate.sourceName,
    sourceUrl: candidate.sourceUrl,
    sourceKey: candidate.sourceKey,
    sourceAdapter: candidate.sourceAdapter,
    registrationDeadlineAt: candidate.registrationDeadlineAt,
    eventStartAt: candidate.eventStartAt,
    eventEndAt: candidate.eventEndAt,
    lastVerifiedAt: now,
    lastSeenAt: now,
    coverImageUrl: getAbsoluteHttpsUrl(candidate.coverImageUrl),
  };
}
