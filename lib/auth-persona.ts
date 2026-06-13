export type AuthPersona = "participant" | "organizer";

export type AuthAction =
  | "view_hackathons"
  | "save_hackathon"
  | "create_lft_card"
  | "like_teammate"
  | "edit_portfolio"
  | "create_listing"
  | "manage_listing";

export type AuthRequirement = "public" | "auth_required";

const authRequiredActions = new Set<AuthAction>([
  "save_hackathon",
  "create_lft_card",
  "like_teammate",
  "edit_portfolio",
  "create_listing",
  "manage_listing",
]);

export function canAccessPersona(
  persona: AuthPersona,
  isSignedIn: boolean,
): boolean {
  if (persona === "participant") return true;
  return isSignedIn;
}

export function getActionAuthRequirement(
  action: AuthAction,
): AuthRequirement {
  return authRequiredActions.has(action) ? "auth_required" : "public";
}

export function canAccessStaffView(
  isSignedIn: boolean,
  hasStaffCapability: boolean,
): boolean {
  return isSignedIn && hasStaffCapability;
}

export function getDefaultPersonaAfterSignIn(
  preferredPersona: AuthPersona | null,
): AuthPersona {
  return preferredPersona ?? "participant";
}
