import { describe, expect, test } from "vitest";
import { canRenderOnboardingFlow } from "../lib/onboarding-runtime";

describe("onboarding runtime policy", () => {
  test("requires Convex before rendering the onboarding flow", () => {
    expect(canRenderOnboardingFlow({ hasConvexUrl: true })).toBe(true);
    expect(canRenderOnboardingFlow({ hasConvexUrl: false })).toBe(false);
  });
});
