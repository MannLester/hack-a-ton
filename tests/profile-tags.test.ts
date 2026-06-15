import { describe, expect, test } from "vitest";
import {
  getClerkPortfolioProfile,
  getProfileTags,
} from "../components/data/adapters";
import { toPublicPortfolioUser } from "../convex/portfolio";

describe("profile tags", () => {
  test("uses onboarding tech stack and domains as deduped profile tags", () => {
    expect(
      getProfileTags({
        onboardingTechStack: ["Frontend", "Backend", "Frontend", " "],
        onboardingDomains: ["AI/ML", "Backend"],
      }),
    ).toEqual(["Frontend", "Backend", "AI/ML"]);
  });

  test("builds a signed-in profile fallback from Clerk identity", () => {
    expect(
      getClerkPortfolioProfile({
        clerkUserId: "user_1",
        displayName: "Clarenz Mauro",
        initials: "CM",
        schoolOrCompany: "BatStateU",
      }),
    ).toMatchObject({
      displayName: "Clarenz Mauro",
      initials: "CM",
      meta: "BatStateU",
      bio: "No bio yet.",
      entries: [],
    });
  });

  test("omits internal identity fields from public portfolio users", () => {
    const publicUser = toPublicPortfolioUser({
      _id: "user_1",
      displayName: "Clarenz Mauro",
      initials: "CM",
      schoolOrCompany: "BatStateU",
      location: "Batangas",
      bio: "Builder",
      onboardingDomains: ["AI/ML"],
      onboardingTechStack: ["React"],
      githubUrl: "https://github.com/example",
      linkedinUrl: "https://linkedin.com/in/example",
      portfolioUrl: "https://example.com",
      clerkUserId: "clerk_user_1",
      role: "participant",
    } as never);

    expect(publicUser).toMatchObject({
      displayName: "Clarenz Mauro",
      onboardingDomains: ["AI/ML"],
      onboardingTechStack: ["React"],
    });
    expect("clerkUserId" in publicUser).toBe(false);
    expect("role" in publicUser).toBe(false);
  });
});
