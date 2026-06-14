import { describe, expect, test } from "vitest";
import type { CreateListingFormValues, UiHackathon } from "@/components/shared/types";
import {
  canSaveOrganizerDraft,
  canSubmitOrganizerListing,
  canArchiveOrganizerListing,
  canCancelOrganizerListing,
  canEditOrganizerListing,
  getCancellationVisibilityUntil,
  getAutosaveStorageKey,
  getInitialListingFormValues,
  getLatestReviewNote,
  getListingUpdateLabel,
  isCancellationVisibleToParticipants,
  isValidCancellationReason,
  getListingQualityChecks,
  getListingDateValidationMessage,
} from "../lib/organizer-workflow";

const completeFormValues: CreateListingFormValues = {
  listingName: "PH AI Build Weekend",
  organizerName: "Dev Guild Manila",
  dateLabel: "June 20-21, 2026",
  registrationDeadlineLabel: "Closes June 14, 2026",
  setup: "Hybrid",
  location: "BGC, Taguig",
  region: "Luzon",
  eligibilityText: "Students, Beginner-friendly",
  teamSize: "2-4",
  prize: "PHP 100,000",
  difficulty: "Beginner",
  registrationUrl: "https://example.com/register",
  coverImageUrl: "https://example.com/cover.png",
  description:
    "Theme: AI for student services. Schedule: workshops and demo day. Judging: impact, execution, and demo quality. Deliverables: working prototype and pitch deck. Contact: organizers@example.com.",
};

const organizerListing = {
  id: "hackathon-1",
  name: "PH AI Build Weekend",
  organizer: "Dev Guild Manila",
  date: "June 20-21, 2026",
  deadline: "Closes June 14, 2026",
  setup: "Hybrid",
  location: "BGC, Taguig",
  region: "Luzon",
  eligibility: ["Students", "Beginner-friendly"],
  teamSize: "2-4",
  prize: "PHP 100,000",
  status: "Needs edits",
  difficulty: "Beginner",
  interested: 12,
  lftCount: 4,
  summary: "A student-friendly AI hackathon.",
  registrationUrl: "https://example.com/register",
  coverImageUrl: "https://example.com/cover.png",
  reviewNote: "Add clearer judging criteria.",
} satisfies UiHackathon;

describe("organizer workflow", () => {
  test("allows partial draft save after organizer adds identifying information", () => {
    expect(
      canSaveOrganizerDraft({
        ...completeFormValues,
        dateLabel: "",
        location: "",
        prize: "",
        description: "",
      }),
    ).toBe(true);
  });

  test("does not allow draft save without listing name and organizer name", () => {
    expect(
      canSaveOrganizerDraft({
        ...completeFormValues,
        listingName: "",
      }),
    ).toBe(false);
  });

  test("requires complete listing details before submit", () => {
    expect(canSubmitOrganizerListing(completeFormValues)).toBe(true);
    expect(
      canSubmitOrganizerListing({
        ...completeFormValues,
        description: "",
      }),
    ).toBe(false);
  });

  test("preserves registration URL and review note when editing a listing", () => {
    expect(getInitialListingFormValues(organizerListing)).toMatchObject({
      registrationUrl: "https://example.com/register",
      coverImageUrl: "https://example.com/cover.png",
      description: "A student-friendly AI hackathon.",
    });
  });

  test("reports quality checklist completion from description content", () => {
    const checks = getListingQualityChecks(completeFormValues);

    expect(checks.every((check) => check.isComplete)).toBe(true);
  });

  test("selects the latest meaningful review note", () => {
    expect(
      getLatestReviewNote([
        { note: "Old note", reviewedAt: 10 },
        { note: "  ", reviewedAt: 20 },
        { note: "New note", reviewedAt: 30 },
      ]),
    ).toBe("New note");
  });

  test("detects registration deadlines after the event date", () => {
    expect(
      getListingDateValidationMessage({
        ...completeFormValues,
        dateLabel: "Jun 20-21, 2026",
        registrationDeadlineLabel: "Closes Jun 22, 2026",
      }),
    ).toBe("Registration deadline must be before the event starts.");
  });

  test("allows valid event and registration date ordering", () => {
    expect(
      getListingDateValidationMessage({
        ...completeFormValues,
        dateLabel: "Jun 20-21, 2026",
        registrationDeadlineLabel: "Closes Jun 14, 2026",
      }),
    ).toBeNull();
  });

  test("creates stable autosave keys for new and existing listings", () => {
    expect(getAutosaveStorageKey()).toBe("hackaton-organizer-listing-new");
    expect(getAutosaveStorageKey("abc123")).toBe(
      "hackaton-organizer-listing-abc123",
    );
  });

  test("allows organizers to archive active owned listing states", () => {
    expect(canArchiveOrganizerListing("Draft")).toBe(true);
    expect(canArchiveOrganizerListing("Needs edits")).toBe(true);
    expect(canArchiveOrganizerListing("Pending review")).toBe(true);
    expect(canArchiveOrganizerListing("Open")).toBe(true);
    expect(canArchiveOrganizerListing("Upcoming")).toBe(false);
  });

  test("allows editing for active non-closing listings", () => {
    expect(canEditOrganizerListing("Draft")).toBe(true);
    expect(canEditOrganizerListing("Needs edits")).toBe(true);
    expect(canEditOrganizerListing("Upcoming")).toBe(true);
    expect(canEditOrganizerListing("Open")).toBe(true);
    expect(canEditOrganizerListing("Happening now")).toBe(true);
    expect(canEditOrganizerListing("Closing soon")).toBe(false);
    expect(canEditOrganizerListing("Cancelled")).toBe(false);
  });

  test("allows cancellation for participant-visible listings", () => {
    expect(canCancelOrganizerListing("Open")).toBe(true);
    expect(canCancelOrganizerListing("Upcoming")).toBe(true);
    expect(canCancelOrganizerListing("Happening now")).toBe(true);
    expect(canCancelOrganizerListing("Draft")).toBe(false);
    expect(canCancelOrganizerListing("Cancelled")).toBe(false);
  });

  test("requires meaningful cancellation explanations", () => {
    expect(isValidCancellationReason("")).toBe(false);
    expect(isValidCancellationReason("Sorry")).toBe(false);
    expect(
      isValidCancellationReason(
        "Venue partner cancelled the slot, so we need to cancel this run.",
      ),
    ).toBe(true);
  });

  test("keeps cancelled listings visible to participants for three days", () => {
    const cancelledAt = Date.UTC(2026, 5, 14, 0, 0, 0);
    const visibleUntil = getCancellationVisibilityUntil(cancelledAt);

    expect(visibleUntil).toBe(Date.UTC(2026, 5, 17, 0, 0, 0));
    expect(
      isCancellationVisibleToParticipants({
        status: "Cancelled",
        cancellationVisibleUntil: visibleUntil,
        now: Date.UTC(2026, 5, 16, 23, 59, 59),
      }),
    ).toBe(true);
    expect(
      isCancellationVisibleToParticipants({
        status: "Cancelled",
        cancellationVisibleUntil: visibleUntil,
        now: Date.UTC(2026, 5, 17, 0, 0, 1),
      }),
    ).toBe(false);
  });

  test("describes recent organizer updates for participant markers", () => {
    expect(
      getListingUpdateLabel({
        updatedAt: Date.UTC(2026, 5, 14, 8, 0, 0),
        now: Date.UTC(2026, 5, 14, 10, 0, 0),
      }),
    ).toBe("Updated today");
    expect(
      getListingUpdateLabel({
        updatedAt: Date.UTC(2026, 5, 12, 8, 0, 0),
        now: Date.UTC(2026, 5, 14, 10, 0, 0),
      }),
    ).toBe("Updated 2 days ago");
  });
});
