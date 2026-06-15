import type { OptionalClerkUser } from "@/components/shared/convex-provider";
import type { CreateListingFormValues } from "@/components/shared/types";

export type ClerkIdentity = {
  clerkUserId: string;
  displayName: string;
  initials: string;
  schoolOrCompany?: string;
  location?: string;
};

export function getCommaSeparatedValues(text: string) {
  return text
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function getInitials(displayName: string) {
  return displayName
    .split(" ")
    .map((namePart) => namePart[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function getClerkIdentity(user: OptionalClerkUser | null) {
  if (!user) return null;

  const emailName = user.primaryEmailAddress?.emailAddress.split("@")[0];
  const displayName = user.fullName || user.username || emailName || "Hack-A-Ton Builder";

  return {
    clerkUserId: user.id,
    displayName,
    initials: getInitials(displayName) || "HA",
    schoolOrCompany: user.primaryEmailAddress?.emailAddress,
  } satisfies ClerkIdentity;
}

export function getUserProfileMutationInput(identity: ClerkIdentity) {
  return {
    displayName: identity.displayName,
    initials: identity.initials,
    schoolOrCompany: identity.schoolOrCompany,
    location: identity.location,
  };
}

export function getListingMutationInput(values: CreateListingFormValues) {
  return {
    name: values.listingName.trim(),
    dateLabel: values.dateLabel.trim(),
    registrationDeadlineLabel: values.registrationDeadlineLabel.trim(),
    setup: values.setup,
    location: values.location.trim(),
    region: values.region,
    eligibility: getCommaSeparatedValues(values.eligibilityText),
    teamSize: values.teamSize.trim(),
    prize: values.prize.trim(),
    difficulty: values.difficulty,
    summary: values.description.trim(),
    externalRegistrationUrl: values.registrationUrl.trim(),
    coverImageUrl: values.coverImageUrl.trim(),
    coverImageStorageId: values.coverImageStorageId,
  };
}
