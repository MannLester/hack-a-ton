import { describe, expect, test } from "vitest";
import { isParticipantVisibleHackathon } from "../convex/hackathons";
import {
  getAuthenticatedClerkSubject,
  getCurrentUserOrRequestedClerkUser,
  getResolvedAuthenticatedClerkUserId,
  getResolvedOnboardingClerkUserId,
  getResolvedOnboardingPersona,
  requireCurrentOrganizer,
  requireCurrentStaffUser,
} from "../convex/users";

const visibleHackathonTime = Date.UTC(2026, 5, 15, 12, 0, 0);

function createHackathonWithStatus({
  status,
  cancellationVisibleUntil,
}: {
  status: "archived" | "draft" | "published" | "cancelled";
  cancellationVisibleUntil?: number;
}) {
  return {
    status,
    cancellationVisibleUntil,
  };
}

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

  test("ignores requested Clerk IDs on protected user lookups", async () => {
    const ctx = createAuthContext({
      subject: "auth_user",
      user: { _id: "auth_user", clerkUserId: "auth_user", role: "participant" },
    });

    await expect(
      getCurrentUserOrRequestedClerkUser(ctx as never, "requested_user"),
    ).resolves.toMatchObject({
      clerkUserId: "auth_user",
    });
  });

  test("does not trust requested onboarding identity without authentication", () => {
    expect(
      getResolvedOnboardingClerkUserId({
        requestedClerkUserId: "requested_user",
      }),
    ).toBeNull();
  });

  test("strict identity resolution returns the authenticated subject", () => {
    expect(
      getResolvedAuthenticatedClerkUserId("auth_user", "requested_user"),
    ).toBe("auth_user");
  });

  test("strict identity resolution never falls back to requested identity", () => {
    expect(
      getResolvedAuthenticatedClerkUserId(undefined, "requested_user"),
    ).toBeNull();
  });

  test("uses stored onboarding persona when available", () => {
    expect(
      getResolvedOnboardingPersona({
        role: "participant",
        onboardingPersona: "organizer",
      } as never),
    ).toBe("organizer");
  });

  test("falls back to organizer role for organizer onboarding access", () => {
    expect(
      getResolvedOnboardingPersona({
        role: "organizer",
      } as never),
    ).toBe("organizer");
  });

  test("does not infer organizer access for participant users", () => {
    expect(
      getResolvedOnboardingPersona({
        role: "participant",
      } as never),
    ).toBeNull();
  });
});

describe("participant-visible hackathon predicate", () => {
  test("shows published hackathons to participants", () => {
    expect(
      isParticipantVisibleHackathon(
        createHackathonWithStatus({ status: "published" }) as never,
        visibleHackathonTime,
      ),
    ).toBe(true);
  });

  test("hides draft hackathons from participants", () => {
    expect(
      isParticipantVisibleHackathon(
        createHackathonWithStatus({ status: "draft" }) as never,
        visibleHackathonTime,
      ),
    ).toBe(false);
  });

  test("hides archived hackathons from participants", () => {
    expect(
      isParticipantVisibleHackathon(
        createHackathonWithStatus({ status: "archived" }) as never,
        visibleHackathonTime,
      ),
    ).toBe(false);
  });

  test("hides cancelled hackathons without a participant visibility window", () => {
    expect(
      isParticipantVisibleHackathon(
        createHackathonWithStatus({ status: "cancelled" }) as never,
        visibleHackathonTime,
      ),
    ).toBe(false);
  });

  test("shows cancelled hackathons inside the participant visibility window", () => {
    expect(
      isParticipantVisibleHackathon(
        createHackathonWithStatus({
          status: "cancelled",
          cancellationVisibleUntil: visibleHackathonTime + 1,
        }) as never,
        visibleHackathonTime,
      ),
    ).toBe(true);
  });

  test("hides cancelled hackathons after the participant visibility window", () => {
    expect(
      isParticipantVisibleHackathon(
        createHackathonWithStatus({
          status: "cancelled",
          cancellationVisibleUntil: visibleHackathonTime - 1,
        }) as never,
        visibleHackathonTime,
      ),
    ).toBe(false);
  });
});
