import { describe, expect, test } from "vitest";
import {
  getAuthenticatedClerkSubject,
  getResolvedOnboardingClerkUserId,
  requireCurrentOrganizer,
  requireCurrentStaffUser,
} from "../convex/users";

function createAuthContext({
  subject,
  user,
  organizer,
}: {
  subject?: string;
  user?: { _id: string; clerkUserId: string; role: string };
  organizer?: { _id: string; ownerUserId: string };
}) {
  return {
    auth: {
      getUserIdentity: async () => subject ? { subject } : null,
    },
    db: {
      query: (tableName: string) => ({
        withIndex: () => ({
          unique: async () => {
            if (tableName === "users") return user ?? null;
            if (tableName === "organizers") return organizer ?? null;

            return null;
          },
        }),
      }),
    },
  };
}

describe("Convex auth helpers", () => {
  test("rejects unauthenticated sensitive paths", async () => {
    const ctx = createAuthContext({});

    await expect(getAuthenticatedClerkSubject(ctx as never)).rejects.toThrow(
      "Authentication is required.",
    );
  });

  test("requires staff role for staff helpers", async () => {
    const ctx = createAuthContext({
      subject: "user_1",
      user: { _id: "user_1", clerkUserId: "user_1", role: "participant" },
    });

    await expect(requireCurrentStaffUser(ctx as never)).rejects.toThrow(
      "Staff access is required.",
    );
  });

  test("requires an organizer account owned by the current user", async () => {
    const ctx = createAuthContext({
      subject: "user_1",
      user: { _id: "user_1", clerkUserId: "user_1", role: "organizer" },
    });

    await expect(requireCurrentOrganizer(ctx as never)).rejects.toThrow(
      "Organizer account is required.",
    );
  });

  test("returns current organizer when owned by authenticated user", async () => {
    const ctx = createAuthContext({
      subject: "user_1",
      user: { _id: "user_1", clerkUserId: "user_1", role: "organizer" },
      organizer: { _id: "organizer_1", ownerUserId: "user_1" },
    });

    await expect(requireCurrentOrganizer(ctx as never)).resolves.toMatchObject({
      currentUser: { _id: "user_1" },
      organizer: { _id: "organizer_1" },
    });
  });

  test("prefers authenticated onboarding identity over requested fallback", () => {
    expect(
      getResolvedOnboardingClerkUserId({
        authenticatedSubject: "auth_user",
        requestedClerkUserId: "requested_user",
      }),
    ).toBe("auth_user");
  });

  test("uses requested onboarding identity when auth identity is unavailable", () => {
    expect(
      getResolvedOnboardingClerkUserId({
        requestedClerkUserId: "requested_user",
      }),
    ).toBe("requested_user");
  });
});
