import type {
  HackathonRegion,
  HackathonSetup,
  ScrapedHackathonCandidate,
} from "./types";

const remotePattern = /\b(online|remote|virtual|global|worldwide)\b/i;
const luzonPattern =
  /\b(luzon|manila|makati|taguig|quezon city|pasig|mandaluyong|laguna|cavite|batangas|baguio|pampanga|bulacan|iloilo)\b/i;
const visayasPattern = /\b(visayas|cebu|bacolod|iloilo|leyte|tacloban)\b/i;
const mindanaoPattern = /\b(mindanao|davao|cagayan de oro|general santos|zamboanga)\b/i;
const philippinesPattern =
  /\b(philippines|philippine|filipino|manila|makati|taguig|quezon city|cebu|davao|iloilo|bacolod|laguna|luzon|visayas|mindanao)\b/i;

function getCandidateScopeText(candidate: ScrapedHackathonCandidate) {
  return [
    candidate.location,
    candidate.sourceName,
    candidate.organizerName,
    candidate.summary,
    ...(candidate.tags ?? []),
  ]
    .filter(Boolean)
    .join(" ");
}

export function isRemoteCandidate(candidate: ScrapedHackathonCandidate) {
  const location = candidate.location ?? "";

  if (candidate.setup === "Online") return true;

  return remotePattern.test(location);
}

export function isPhilippinesCandidate(candidate: ScrapedHackathonCandidate) {
  return philippinesPattern.test(getCandidateScopeText(candidate));
}

export function isRemoteOrPhilippinesCandidate(
  candidate: ScrapedHackathonCandidate,
) {
  if (isRemoteCandidate(candidate)) return true;

  return isPhilippinesCandidate(candidate);
}

export function getSetupFromLocation(location: string): HackathonSetup {
  if (remotePattern.test(location)) return "Online";
  if (/\bhybrid\b/i.test(location)) return "Hybrid";

  return "Onsite";
}

export function getRegionFromLocation(location: string): HackathonRegion {
  if (remotePattern.test(location)) return "Philippines-wide";
  if (visayasPattern.test(location)) return "Visayas";
  if (mindanaoPattern.test(location)) return "Mindanao";
  if (luzonPattern.test(location)) return "Luzon";
  if (philippinesPattern.test(location)) return "Philippines-wide";

  return "Philippines-wide";
}
