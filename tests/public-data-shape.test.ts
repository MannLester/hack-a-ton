import { describe, expect, test } from "vitest";
import { toPublicHackathonListing } from "../convex/hackathons";
import { toPublicTeamSummary } from "../convex/teams";

describe("public data mappers", () => {
  test("omits internal hackathon ownership and storage fields", () => {
    const publicListing = toPublicHackathonListing({
      hackathon: {
        _id: "hackathon_1",
        _creationTime: 1,
        organizerId: "organizer_1",
        name: "Secure Hack",
        dateLabel: "Jul 1, 2026",
        registrationDeadlineLabel: "Closes Jun 20",
        setup: "Online",
        location: "Philippines-wide",
        region: "Philippines-wide",
        eligibility: ["Students"],
        teamSize: "2-4",
        prize: "PHP 10k",
        status: "published",
        difficulty: "Beginner",
        summary: "Build securely.",
        externalRegistrationUrl: "https://example.com",
        coverImageUrl: "https://example.com/cover.png",
        coverImageStorageId: "storage_1",
        updatedAt: 1,
      },
      organizerName: "Secure Org",
      interestedCount: 2,
      lftCount: 3,
      savedCount: 4,
      coverImageUrl: "https://example.com/cover.png",
    } as never);

    expect(publicListing).toMatchObject({
      _id: "hackathon_1",
      organizerName: "Secure Org",
      interestedCount: 2,
    });
    expect("organizerId" in publicListing).toBe(false);
    expect("coverImageStorageId" in publicListing).toBe(false);
  });

  test("omits raw team member ids from public team summaries", () => {
    const publicTeam = toPublicTeamSummary({
      team: {
        _id: "team_1",
        _creationTime: 1,
        hackathonId: "hackathon_1",
        teamName: "Secure Team",
        goal: "Win safely",
        members: ["user_1", "user_2"],
        currentSize: 2,
        targetSize: 4,
        missingRoles: ["Backend"],
        status: "recruiting",
      },
      memberProfiles: [
        { userId: "user_1", displayName: "A", initials: "A", meta: null, isLead: true },
      ],
    } as never);

    expect(publicTeam).toMatchObject({
      _id: "team_1",
      currentSize: 2,
      memberProfiles: [{ userId: "user_1" }],
    });
    expect("members" in publicTeam).toBe(false);
  });
});
