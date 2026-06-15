import { describe, expect, test } from "vitest";
import { canRunDemoSeedMutation } from "../convex/seed";

describe("demo seed mutation access", () => {
  test("blocks production access even for staff users", () => {
    expect(
      canRunDemoSeedMutation({
        isProduction: true,
        isStaff: true,
      }),
    ).toBe(false);
  });

  test("blocks anonymous non-production access", () => {
    expect(
      canRunDemoSeedMutation({
        isProduction: false,
        isStaff: false,
      }),
    ).toBe(false);
  });

  test("allows non-production staff access", () => {
    expect(
      canRunDemoSeedMutation({
        isProduction: false,
        isStaff: true,
      }),
    ).toBe(true);
  });
});
