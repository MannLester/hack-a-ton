import { getHackathonDateRangeFromLabel } from "./dates";
import {
  getAbsoluteHttpsUrl,
  getPlainTextFromHtml,
  getTrimmedText,
} from "./text";
import type { ScrapedHackathonCandidate } from "./types";

const devpostOpenOnlineHackathonsBaseUrl =
  "https://devpost.com/api/hackathons?challenge_type%5B%5D=online&status%5B%5D=open";

export const devpostOpenOnlineHackathonsUrl =
  getDevpostOpenOnlineHackathonsUrl(1);

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getRecordValue(record: UnknownRecord, key: string) {
  return record[key];
}

function getStringValue(record: UnknownRecord, key: string) {
  return getTrimmedText(getRecordValue(record, key));
}

function getBooleanValue(record: UnknownRecord, key: string) {
  const value = getRecordValue(record, key);

  return typeof value === "boolean" ? value : undefined;
}

function getNumberValue(record: UnknownRecord, key: string) {
  const value = getRecordValue(record, key);

  return typeof value === "number" ? value : undefined;
}

function getNumericId(record: UnknownRecord) {
  const value = getRecordValue(record, "id");

  if (typeof value === "number") return String(value);
  if (typeof value === "string" && value.trim()) return value.trim();

  return undefined;
}

function getDisplayedLocation(record: UnknownRecord) {
  const displayedLocation = getRecordValue(record, "displayed_location");

  if (!isRecord(displayedLocation)) return undefined;

  return getStringValue(displayedLocation, "location");
}

function getDevpostMeta(response: UnknownRecord) {
  const meta = getRecordValue(response, "meta");

  return isRecord(meta) ? meta : undefined;
}

function getThemes(record: UnknownRecord) {
  const themes = getRecordValue(record, "themes");

  if (!Array.isArray(themes)) return [];

  return themes
    .filter(isRecord)
    .map((theme) => getStringValue(theme, "name"))
    .filter(Boolean) as string[];
}

function getPrizeAmount(record: UnknownRecord) {
  const prizeAmount = getStringValue(record, "prize_amount");

  return prizeAmount ? getPlainTextFromHtml(prizeAmount) : undefined;
}

function getCoverImageUrl(record: UnknownRecord) {
  return getAbsoluteHttpsUrl(getStringValue(record, "thumbnail_url"));
}

function getRegistrationUrl(record: UnknownRecord, sourceUrl: string) {
  return getAbsoluteHttpsUrl(getStringValue(record, "start_a_submission_url")) ?? sourceUrl;
}

function getSourceKey(record: UnknownRecord, sourceUrl: string) {
  const numericId = getNumericId(record);

  return numericId ? `devpost:${numericId}` : `devpost:${sourceUrl}`;
}

function getCandidateSummary(tags: string[]) {
  if (tags.length === 0) return "Open online hackathon listed on Devpost.";

  return `Build for ${tags.join(", ")}.`;
}

function getDevpostCandidateFromRecord(
  record: UnknownRecord,
): ScrapedHackathonCandidate | null {
  const name = getStringValue(record, "title");
  const sourceUrl = getAbsoluteHttpsUrl(getStringValue(record, "url"));

  if (!name) return null;
  if (!sourceUrl) return null;

  const dateLabel = getStringValue(record, "submission_period_dates");
  const dateRange = dateLabel
    ? getHackathonDateRangeFromLabel(dateLabel)
    : null;
  const themes = getThemes(record);

  return {
    sourceAdapter: "devpost",
    sourceKey: getSourceKey(record, sourceUrl),
    sourceName: "Devpost",
    sourceUrl,
    registrationUrl: getRegistrationUrl(record, sourceUrl),
    name,
    organizerName: getStringValue(record, "organization_name"),
    sourceStatus: getStringValue(record, "open_state"),
    setup: "Online",
    location: getDisplayedLocation(record) ?? "Online",
    dateLabel,
    registrationDeadlineLabel: dateRange
      ? `Submissions close ${dateLabel}`
      : getStringValue(record, "time_left_to_submission"),
    registrationDeadlineAt: dateRange?.endAt,
    eventStartAt: dateRange?.startAt,
    eventEndAt: dateRange?.endAt,
    eligibility: ["Remote builders"],
    teamSize: "See official page",
    prize: getPrizeAmount(record),
    difficulty: "Open",
    summary: getCandidateSummary(themes),
    tags: themes,
    coverImageUrl: getCoverImageUrl(record),
    inviteOnly: getBooleanValue(record, "invite_only"),
  };
}

export function getDevpostCandidatesFromApiResponse(response: unknown) {
  if (!isRecord(response)) return [];

  const hackathons = getRecordValue(response, "hackathons");

  if (!Array.isArray(hackathons)) return [];

  return hackathons
    .filter(isRecord)
    .map(getDevpostCandidateFromRecord)
    .filter(Boolean) as ScrapedHackathonCandidate[];
}

export function getDevpostOpenOnlineHackathonsUrl(page: number) {
  return `${devpostOpenOnlineHackathonsBaseUrl}&page=${page}`;
}

export function getDevpostPageCountFromApiResponse(response: unknown) {
  if (!isRecord(response)) return 1;

  const meta = getDevpostMeta(response);

  if (!meta) return 1;

  const totalCount = getNumberValue(meta, "total_count");
  const perPage = getNumberValue(meta, "per_page");

  if (!totalCount) return 1;
  if (!perPage) return 1;

  return Math.max(1, Math.ceil(totalCount / perPage));
}
