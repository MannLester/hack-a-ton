import { describe, expect, test } from "vitest";
import { resolveClerkJwtIssuerDomain } from "../convex/authIssuer";
import { shouldAllowConvexClient } from "../lib/auth-runtime";

describe("Clerk and Convex auth configuration", () => {
  test("uses the configured Clerk JWT issuer domain", () => {
    expect(
      resolveClerkJwtIssuerDomain({
        CLERK_JWT_ISSUER_DOMAIN: "https://issuer.example.com",
      }),
    ).toBe("https://issuer.example.com");
  });

  test("requires a Clerk JWT issuer when it is missing", () => {
    expect(() => resolveClerkJwtIssuerDomain({})).toThrow(
      "CLERK_JWT_ISSUER_DOMAIN is required.",
    );
  });

  test("rejects authless Convex even when a demo flag is present", () => {
    expect(
      shouldAllowConvexClient({
        hasConvexUrl: true,
        hasClerkPublishableKey: false,
      }),
    ).toBe(false);
  });

  test("allows Convex only when Clerk is configured", () => {
    expect(
      shouldAllowConvexClient({
        hasConvexUrl: true,
        hasClerkPublishableKey: true,
      }),
    ).toBe(true);
  });
});
