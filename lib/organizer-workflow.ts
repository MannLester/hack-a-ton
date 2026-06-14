import { differenceInCalendarDays, isBefore, isValid, parse } from "date-fns";
import type { CreateListingFormValues, UiHackathon } from "@/components/shared/types";

export type ListingQualityCheck = {
  label: string;
  isComplete: boolean;
};

type ReviewNote = {
  note?: string;
  reviewedAt?: number;
};

function hasText(value: string | undefined) {
  return Boolean(value?.trim());
}

function hasKeyword(text: string, keywords: string[]) {
  const normalizedText = text.toLowerCase();

  return keywords.some((keyword) => normalizedText.includes(keyword));
}

export function canSaveOrganizerDraft(values: CreateListingFormValues) {
  return hasText(values.listingName) && hasText(values.organizerName);
}

export function canSubmitOrganizerListing(values: CreateListingFormValues) {
  const requiredValues = [
    values.listingName,
    values.organizerName,
    values.dateLabel,
    values.registrationDeadlineLabel,
    values.location,
    values.eligibilityText,
    values.teamSize,
    values.prize,
    values.description,
  ];

  return requiredValues.every(hasText);
}

export function getInitialListingFormValues(
  listing: UiHackathon,
): CreateListingFormValues {
  return {
    listingId: listing.convexId,
    listingStatus: listing.status,
    listingName: listing.name,
    organizerName: listing.organizer,
    dateLabel: listing.date,
    registrationDeadlineLabel: listing.deadline,
    setup: listing.setup,
    location: listing.location,
    region: listing.region,
    eligibilityText: listing.eligibility.join(", "),
    teamSize: listing.teamSize,
    prize: listing.prize,
    difficulty: listing.difficulty,
    registrationUrl: listing.registrationUrl ?? "",
    coverImageUrl: listing.coverImageUrl ?? "",
    description: listing.summary,
  };
}

export function getListingQualityChecks(
  values: CreateListingFormValues,
): ListingQualityCheck[] {
  const description = values.description;

  return [
    {
      label: "Theme or problem statement",
      isComplete: hasKeyword(description, ["theme", "problem", "challenge"]),
    },
    {
      label: "Schedule or timeline",
      isComplete: hasKeyword(description, ["schedule", "timeline", "day"]),
    },
    {
      label: "Judging criteria",
      isComplete: hasKeyword(description, ["judging", "criteria", "rubric"]),
    },
    {
      label: "Deliverables",
      isComplete: hasKeyword(description, ["deliverable", "prototype", "pitch"]),
    },
    {
      label: "Contact or support channel",
      isComplete: hasKeyword(description, ["contact", "email", "discord"]),
    },
  ];
}

export function getLatestReviewNote(reviews: ReviewNote[]) {
  const meaningfulReviews = reviews.filter((review) => hasText(review.note));
  const latestReview = meaningfulReviews.sort(
    (firstReview, secondReview) =>
      (secondReview.reviewedAt ?? 0) - (firstReview.reviewedAt ?? 0),
  )[0];

  return latestReview?.note?.trim();
}


function parsePickerDate(value: string) {
  const normalizedValue = value.replace(/^Closes\s+/, "").trim();
  const date = parse(normalizedValue, "MMM d, yyyy", new Date());

  return isValid(date) ? date : null;
}

function getEventStartLabel(dateLabel: string) {
  const trimmedDateLabel = dateLabel.trim();
  const sameMonthRangeMatch = trimmedDateLabel.match(
    /^([A-Za-z]{3})\s+(\d{1,2})-\d{1,2},\s+(\d{4})$/,
  );

  if (sameMonthRangeMatch) {
    return `${sameMonthRangeMatch[1]} ${sameMonthRangeMatch[2]}, ${sameMonthRangeMatch[3]}`;
  }

  const crossMonthRangeMatch = trimmedDateLabel.match(
    /^([A-Za-z]{3})\s+(\d{1,2})\s+-\s+[A-Za-z]{3}\s+\d{1,2},\s+(\d{4})$/,
  );

  if (crossMonthRangeMatch) {
    return `${crossMonthRangeMatch[1]} ${crossMonthRangeMatch[2]}, ${crossMonthRangeMatch[3]}`;
  }

  return trimmedDateLabel;
}

export function getListingDateValidationMessage(
  values: CreateListingFormValues,
) {
  const eventStartDate = parsePickerDate(getEventStartLabel(values.dateLabel));
  const registrationDeadlineDate = parsePickerDate(
    values.registrationDeadlineLabel,
  );

  if (!eventStartDate || !registrationDeadlineDate) {
    return null;
  }

  if (isBefore(eventStartDate, registrationDeadlineDate)) {
    return "Registration deadline must be before the event starts.";
  }

  return null;
}

export function getAutosaveStorageKey(listingId?: string) {
  return `hackaton-organizer-listing-${listingId || "new"}`;
}

export function canArchiveOrganizerListing(status: UiHackathon["status"]) {
  return ["Draft", "Needs edits", "Pending review", "Open"].includes(status);
}


const cancellationVisibilityWindowMs = 3 * 24 * 60 * 60 * 1000;

export function canEditOrganizerListing(status: UiHackathon["status"]) {
  return ["Draft", "Needs edits", "Upcoming", "Open", "Happening now"].includes(
    status,
  );
}

export function canCancelOrganizerListing(status: UiHackathon["status"]) {
  return ["Upcoming", "Open", "Happening now"].includes(status);
}

export function isValidCancellationReason(reason: string) {
  return reason.trim().length >= 20;
}

export function getCancellationVisibilityUntil(cancelledAt: number) {
  return cancelledAt + cancellationVisibilityWindowMs;
}

export function isCancellationVisibleToParticipants({
  status,
  cancellationVisibleUntil,
  now,
}: {
  status: UiHackathon["status"];
  cancellationVisibleUntil?: number;
  now: number;
}) {
  if (status !== "Cancelled") return true;
  if (!cancellationVisibleUntil) return false;

  return now <= cancellationVisibleUntil;
}

export function getListingUpdateLabel({
  updatedAt,
  now,
}: {
  updatedAt?: number;
  now: number;
}) {
  if (!updatedAt) return null;

  const daysAgo = differenceInCalendarDays(new Date(now), new Date(updatedAt));

  if (daysAgo <= 0) return "Updated today";
  if (daysAgo === 1) return "Updated yesterday";

  return `Updated ${daysAgo} days ago`;
}
