import { describe, expect, test } from "vitest";
import {
  getClerkPortfolioProfile,
  getProfileTags,
} from "../components/data/adapters";

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
});
