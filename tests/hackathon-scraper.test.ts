import { describe, expect, test } from "vitest";
import {
  getHackathonDateRangeFromLabel,
  getTimestampForDateEnd,
} from "../lib/hackathon-scraper/dates";
import {
  getDevpostCandidatesFromApiResponse,
  getDevpostPageCountFromApiResponse,
} from "../lib/hackathon-scraper/devpost";
import {
  getJoinabilityDecision,
  getNormalizedHackathonImport,
} from "../lib/hackathon-scraper/joinability";
import type { ScrapedHackathonCandidate } from "../lib/hackathon-scraper/types";

const currentTimestamp = Date.UTC(2026, 5, 19, 0, 0, 0);

function getCandidate(
  overrides: Partial<ScrapedHackathonCandidate> = {},
): ScrapedHackathonCandidate {
  return {
    sourceAdapter: "devpost",
    sourceKey: "devpost:29812",
    sourceName: "Devpost",
    sourceUrl: "https://h01.devpost.com/",
    registrationUrl: "https://h01.devpost.com/challenges/start_a_submission",
    name: "H0: Hack the Zero Stack",
    organizerName: "Amazon",
    sourceStatus: "open",
    setup: "Online",
    location: "Online",
    dateLabel: "May 27 - Jun 29, 2026",
    registrationDeadlineLabel: "Submissions close Jun 29, 2026",
    registrationDeadlineAt: getTimestampForDateEnd(2026, 5, 29),
    eventStartAt: Date.UTC(2026, 4, 27),
    eventEndAt: getTimestampForDateEnd(2026, 5, 29),
    eligibility: ["Remote builders"],
    teamSize: "See official page",
    prize: "$80,000",
    difficulty: "Open",
    summary: "Build for Databases, Open Ended, Web.",
    inviteOnly: false,
    ...overrides,
  };
}

describe("hackathon scraper date parsing", () => {
  test("parses month-spanning Devpost date ranges", () => {
    expect(getHackathonDateRangeFromLabel("May 27 - Jun 29, 2026")).toEqual({
      startAt: Date.UTC(2026, 4, 27),
      endAt: getTimestampForDateEnd(2026, 5, 29),
    });
  });

  test("parses same-month Devpost date ranges", () => {
    expect(getHackathonDateRangeFromLabel("Jun 14 - 21, 2026")).toEqual({
      startAt: Date.UTC(2026, 5, 14),
      endAt: getTimestampForDateEnd(2026, 5, 21),
    });
  });
});

describe("Devpost scraper adapter", () => {
  test("reads Devpost pagination metadata", () => {
    expect(
      getDevpostPageCountFromApiResponse({
        meta: {
          total_count: 61,
          per_page: 9,
        },
      }),
    ).toBe(7);
  });

  test("maps open online Devpost hackathons into scraper candidates", () => {
    const candidates = getDevpostCandidatesFromApiResponse({
      hackathons: [
        {
          id: 29812,
          title: "H0: Hack the Zero Stack with Vercel v0 and AWS Databases",
          displayed_location: { location: "Online" },
          open_state: "open",
          url: "https://h01.devpost.com/",
          submission_period_dates: "May 27 - Jun 29, 2026",
          themes: [
            { name: "Databases" },
            { name: "Open Ended" },
            { name: "Web" },
          ],
          prize_amount: "$<span data-currency-value>80,000</span>",
          organization_name: "Amazon",
          start_a_submission_url:
            "https://h01.devpost.com/challenges/start_a_submission",
          invite_only: false,
        },
      ],
    });

    expect(candidates).toEqual([
      expect.objectContaining({
        sourceAdapter: "devpost",
        sourceKey: "devpost:29812",
        sourceName: "Devpost",
        name: "H0: Hack the Zero Stack with Vercel v0 and AWS Databases",
        sourceStatus: "open",
        setup: "Online",
        location: "Online",
        registrationUrl:
          "https://h01.devpost.com/challenges/start_a_submission",
        registrationDeadlineAt: getTimestampForDateEnd(2026, 5, 29),
        eventStartAt: Date.UTC(2026, 4, 27),
        eventEndAt: getTimestampForDateEnd(2026, 5, 29),
        prize: "$80,000",
      }),
    ]);
  });
});

describe("hackathon scraper joinability", () => {
  test("auto-publishes open remote hackathons with future deadlines", () => {
    expect(getJoinabilityDecision(getCandidate(), currentTimestamp)).toEqual({
      kind: "publish",
      reason: "Open remote or Philippines-based hackathon with a future deadline.",
    });
  });

  test("routes open hackathons without machine-readable deadlines to review", () => {
    expect(
      getJoinabilityDecision(
        getCandidate({
          registrationDeadlineAt: undefined,
          registrationDeadlineLabel: "See official page",
        }),
        currentTimestamp,
      ),
    ).toEqual({
      kind: "review",
      reason: "Open listing has no machine-readable deadline.",
    });
  });

  test("rejects expired, closed, invite-only, and out-of-scope hackathons", () => {
    const expiredCandidate = getCandidate({
      registrationDeadlineAt: getTimestampForDateEnd(2026, 5, 18),
    });
    const closedCandidate = getCandidate({ sourceStatus: "closed" });
    const inviteOnlyCandidate = getCandidate({ inviteOnly: true });
    const onsiteUsCandidate = getCandidate({
      setup: "Onsite",
      location: "San Francisco, CA",
    });

    expect(
      getJoinabilityDecision(expiredCandidate, currentTimestamp).kind,
    ).toBe("reject");
    expect(getJoinabilityDecision(closedCandidate, currentTimestamp).kind).toBe(
      "reject",
    );
    expect(
      getJoinabilityDecision(inviteOnlyCandidate, currentTimestamp).kind,
    ).toBe("reject");
    expect(
      getJoinabilityDecision(onsiteUsCandidate, currentTimestamp).kind,
    ).toBe("reject");
  });

  test("normalizes publishable candidates for Convex imports", () => {
    expect(getNormalizedHackathonImport(getCandidate(), currentTimestamp)).toEqual(
      expect.objectContaining({
        importStatus: "published",
        listedByName: "Hack-A-Ton Admin",
        realOrganizerName: "Amazon",
        sourceKey: "devpost:29812",
        sourceAdapter: "devpost",
        externalRegistrationUrl:
          "https://h01.devpost.com/challenges/start_a_submission",
        region: "Philippines-wide",
      }),
    );
  });
});
