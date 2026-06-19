import { describe, expect, test } from "vitest";
import { isParticipantVisibleHackathon } from "../convex/hackathons";

const currentTimestamp = Date.UTC(2026, 5, 19, 0, 0, 0);

function getPublishedHackathon(overrides: Record<string, unknown> = {}) {
  return {
    _id: "hackathon_1",
    _creationTime: 1,
    organizerId: "organizer_1",
    name: "Joinable Hackathon",
    dateLabel: "Jun 20-21, 2026",
    registrationDeadlineLabel: "Closes Jun 20, 2026",
    setup: "Online",
    location: "Online",
    region: "Philippines-wide",
    eligibility: ["Remote builders"],
    teamSize: "1-4",
    prize: "See official page",
    status: "published",
    difficulty: "Open",
    summary: "Build something useful.",
    ...overrides,
  } as never;
}

describe("participant hackathon visibility", () => {
  test("keeps organic published listings visible without machine dates", () => {
    expect(
      isParticipantVisibleHackathon(
        getPublishedHackathon(),
        currentTimestamp,
      ),
    ).toBe(true);
  });

  test("hides imported listings after the registration deadline", () => {
    expect(
      isParticipantVisibleHackathon(
        getPublishedHackathon({
          sourceKey: "devpost:expired",
          registrationDeadlineAt: Date.UTC(2026, 5, 18, 23, 59, 59, 999),
        }),
        currentTimestamp,
      ),
    ).toBe(false);
  });

  test("hides imported listings after the event end date", () => {
    expect(
      isParticipantVisibleHackathon(
        getPublishedHackathon({
          sourceKey: "devpost:past-event",
          eventEndAt: Date.UTC(2026, 5, 18, 23, 59, 59, 999),
        }),
        currentTimestamp,
      ),
    ).toBe(false);
  });
});
