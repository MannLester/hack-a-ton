import type { HackathonDateRange } from "./types";

const monthIndexesByName = new Map([
  ["jan", 0],
  ["january", 0],
  ["feb", 1],
  ["february", 1],
  ["mar", 2],
  ["march", 2],
  ["apr", 3],
  ["april", 3],
  ["may", 4],
  ["jun", 5],
  ["june", 5],
  ["jul", 6],
  ["july", 6],
  ["aug", 7],
  ["august", 7],
  ["sep", 8],
  ["sept", 8],
  ["september", 8],
  ["oct", 9],
  ["october", 9],
  ["nov", 10],
  ["november", 10],
  ["dec", 11],
  ["december", 11],
]);

type DateParts = {
  year: number;
  monthIndex: number;
  day: number;
};

export function getTimestampForDateStart(
  year: number,
  monthIndex: number,
  day: number,
) {
  return Date.UTC(year, monthIndex, day, 0, 0, 0, 0);
}

export function getTimestampForDateEnd(
  year: number,
  monthIndex: number,
  day: number,
) {
  return Date.UTC(year, monthIndex, day, 23, 59, 59, 999);
}

function getNormalizedDateLabel(label: string) {
  return label.replace(/[–—]/g, "-").replace(/\s+/g, " ").trim();
}

function getYearFromSegment(segment: string) {
  const yearMatch = segment.match(/\b(20\d{2})\b/);
  const yearValue = yearMatch?.[1];

  return yearValue ? Number(yearValue) : undefined;
}

function getMonthIndexFromSegment(segment: string) {
  const monthMatch = segment.match(/[A-Za-z]+/);
  const monthText = monthMatch?.[0].toLowerCase();

  return monthText ? monthIndexesByName.get(monthText) : undefined;
}

function getIsoDateParts(segment: string): DateParts | null {
  const isoDateMatch = segment.match(/\b(20\d{2})-(\d{1,2})-(\d{1,2})\b/);

  if (!isoDateMatch) return null;

  return {
    year: Number(isoDateMatch[1]),
    monthIndex: Number(isoDateMatch[2]) - 1,
    day: Number(isoDateMatch[3]),
  };
}

function getDayFromSegment(segment: string) {
  const numberMatches = Array.from(segment.matchAll(/\b(\d{1,2})\b/g));
  const dayMatch = numberMatches.find((match) => Number(match[1]) <= 31);

  return dayMatch ? Number(dayMatch[1]) : undefined;
}

function getDatePartsFromSegment({
  segment,
  fallbackYear,
  fallbackMonthIndex,
}: {
  segment: string;
  fallbackYear?: number;
  fallbackMonthIndex?: number;
}): DateParts | null {
  const isoDateParts = getIsoDateParts(segment);

  if (isoDateParts) return isoDateParts;

  const year = getYearFromSegment(segment) ?? fallbackYear;
  const monthIndex = getMonthIndexFromSegment(segment) ?? fallbackMonthIndex;
  const day = getDayFromSegment(segment);

  if (year === undefined) return null;
  if (monthIndex === undefined) return null;
  if (day === undefined) return null;

  return { year, monthIndex, day };
}

function getRangeSegments(label: string) {
  const normalizedLabel = getNormalizedDateLabel(label);
  const [startSegment, endSegment] = normalizedLabel.split(/\s+-\s+/, 2);

  return {
    startSegment,
    endSegment,
  };
}

function getDateRangeFromSingleSegment(segment: string): HackathonDateRange | null {
  const dateParts = getDatePartsFromSegment({ segment });

  if (!dateParts) return null;

  return {
    startAt: getTimestampForDateStart(
      dateParts.year,
      dateParts.monthIndex,
      dateParts.day,
    ),
    endAt: getTimestampForDateEnd(
      dateParts.year,
      dateParts.monthIndex,
      dateParts.day,
    ),
  };
}

export function getHackathonDateRangeFromLabel(
  label: string,
): HackathonDateRange | null {
  const { startSegment, endSegment } = getRangeSegments(label);

  if (!startSegment) return null;
  if (!endSegment) return getDateRangeFromSingleSegment(startSegment);

  const endYear = getYearFromSegment(endSegment) ?? getYearFromSegment(startSegment);
  const startMonthIndex = getMonthIndexFromSegment(startSegment);
  const endMonthIndex = getMonthIndexFromSegment(endSegment) ?? startMonthIndex;
  const startParts = getDatePartsFromSegment({
    segment: startSegment,
    fallbackYear: endYear,
  });
  const endParts = getDatePartsFromSegment({
    segment: endSegment,
    fallbackYear: endYear,
    fallbackMonthIndex: endMonthIndex,
  });

  if (!startParts) return null;
  if (!endParts) return null;

  return {
    startAt: getTimestampForDateStart(
      startParts.year,
      startParts.monthIndex,
      startParts.day,
    ),
    endAt: getTimestampForDateEnd(
      endParts.year,
      endParts.monthIndex,
      endParts.day,
    ),
  };
}
