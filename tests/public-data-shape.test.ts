import { describe, expect, test } from "vitest";
import { getUiHackathon } from "../components/data/adapters";
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

  test("includes source-backed listing provenance for curated hackathons", () => {
    const publicListing = toPublicHackathonListing({
      hackathon: {
        _id: "hackathon_1",
        _creationTime: 1,
        organizerId: "organizer_1",
        name: "AI Fest PH Hackathon",
        dateLabel: "Aug 3-5, 2026",
        registrationDeadlineLabel: "Closes Jun 15, 2026",
        setup: "Onsite",
        location: "Iloilo City",
        region: "Visayas",
        eligibility: ["Students", "Open category"],
        teamSize: "3+",
        prize: "PHP 40k champion prizes",
        status: "published",
        difficulty: "Open",
        summary: "Build AI-enabled solutions to real-world problems.",
        externalRegistrationUrl: "https://aifest.ph/ai-hackathon-2026/",
        listedByName: "Hack-A-Ton Admin",
        realOrganizerName: "AI Fest Philippines",
        sourceName: "AI Fest PH",
        sourceUrl: "https://aifest.ph/ai-hackathon-2026/",
        lastVerifiedAt: 1781654400000,
      },
      organizerName: "Hack-A-Ton Admin",
      interestedCount: 2,
      lftCount: 3,
      savedCount: 4,
    } as never);

    expect(publicListing).toMatchObject({
      organizerName: "Hack-A-Ton Admin",
      externalRegistrationUrl: "https://aifest.ph/ai-hackathon-2026/",
      listedByName: "Hack-A-Ton Admin",
      realOrganizerName: "AI Fest Philippines",
      sourceName: "AI Fest PH",
      sourceUrl: "https://aifest.ph/ai-hackathon-2026/",
      lastVerifiedAt: 1781654400000,
    });
  });

  test("maps official registration and provenance fields into UI hackathons", () => {
    const uiHackathon = getUiHackathon({
      _id: "hackathon_1",
      name: "Build on Stellar Philippines Hackathon",
      dateLabel: "May 18-24, 2026",
      registrationDeadlineLabel: "Closes May 24, 2026",
      setup: "Online",
      location: "Philippines-wide",
      region: "Philippines-wide",
      eligibility: ["Open to all"],
      teamSize: "1-5",
      prize: "PHP 60k pool",
      status: "published",
      difficulty: "Open",
      summary: "Build financial solutions for Filipinos on Stellar.",
      externalRegistrationUrl:
        "https://www.risein.com/programs/build-on-stellar-philippines-hackathon",
      listedByName: "Hack-A-Ton Admin",
      realOrganizerName: "Stellar",
      sourceName: "Rise In",
      sourceUrl:
        "https://www.risein.com/programs/build-on-stellar-philippines-hackathon",
      lastVerifiedAt: 1781654400000,
      organizerName: "Hack-A-Ton Admin",
      interestedCount: 0,
      lftCount: 0,
      savedCount: 0,
    } as never);

    expect(uiHackathon).toMatchObject({
      organizer: "Hack-A-Ton Admin",
      registrationUrl:
        "https://www.risein.com/programs/build-on-stellar-philippines-hackathon",
      listedByName: "Hack-A-Ton Admin",
      realOrganizerName: "Stellar",
      sourceName: "Rise In",
      sourceUrl:
        "https://www.risein.com/programs/build-on-stellar-philippines-hackathon",
      lastVerifiedAt: 1781654400000,
    });
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
