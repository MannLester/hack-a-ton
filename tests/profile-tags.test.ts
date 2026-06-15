import { describe, expect, test } from "vitest";
import { getProfileTags } from "../components/data/adapters";

describe("profile tags", () => {
  test("uses onboarding tech stack and domains as deduped profile tags", () => {
    expect(
      getProfileTags({
        onboardingTechStack: ["Frontend", "Backend", "Frontend", " "],
        onboardingDomains: ["AI/ML", "Backend"],
      }),
    ).toEqual(["Frontend", "Backend", "AI/ML"]);
  });
});
