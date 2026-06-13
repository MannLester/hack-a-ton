import { describe, expect, it } from "vitest";
import {
  canAccessPersona,
  getActionAuthRequirement,
  canAccessStaffView,
  getDefaultPersonaAfterSignIn,
} from "../lib/auth-persona";

describe("auth persona policy", () => {
  it("allows guests to browse as participants", () => {
    expect(canAccessPersona("participant", false)).toBe(true);
  });

  it("requires login before accessing organizer mode", () => {
    expect(canAccessPersona("organizer", false)).toBe(false);
    expect(canAccessPersona("organizer", true)).toBe(true);
  });

  it("requires login for participant actions, not viewing", () => {
    expect(getActionAuthRequirement("view_hackathons")).toBe("public");
    expect(getActionAuthRequirement("save_hackathon")).toBe("auth_required");
    expect(getActionAuthRequirement("create_lft_card")).toBe("auth_required");
    expect(getActionAuthRequirement("edit_portfolio")).toBe("auth_required");
  });

  it("requires both login and staff capability before staff view access", () => {
    expect(canAccessStaffView(false, false)).toBe(false);
    expect(canAccessStaffView(true, false)).toBe(false);
    expect(canAccessStaffView(true, true)).toBe(true);
  });

  it("keeps explicit persona choice after sign in", () => {
    expect(getDefaultPersonaAfterSignIn("organizer")).toBe("organizer");
    expect(getDefaultPersonaAfterSignIn("participant")).toBe("participant");
    expect(getDefaultPersonaAfterSignIn(null)).toBe("participant");
  });
});
