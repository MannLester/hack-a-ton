import { v } from "convex/values";
import { makeFunctionReference } from "convex/server";
import { internalAction } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import type { ActionCtx } from "./_generated/server";
import {
  getDevpostCandidatesFromApiResponse,
  getDevpostOpenOnlineHackathonsUrl,
  getDevpostPageCountFromApiResponse,
} from "../lib/hackathon-scraper/devpost";
import { getNormalizedHackathonImport } from "../lib/hackathon-scraper/joinability";
import type { NormalizedHackathonImport } from "../lib/hackathon-scraper/types";

const activeSourceAdapters = ["devpost"];
const startScrapeRunReference = makeFunctionReference<
  "mutation",
  { startedAt: number },
  Id<"scrapeRuns">
>("hackathonImports:startScrapeRun");
const failScrapeRunReference = makeFunctionReference<
  "mutation",
  {
    runId: Id<"scrapeRuns">;
    errorMessage: string;
    finishedAt: number;
  },
  null
>("hackathonImports:failScrapeRun");
const upsertImportedHackathonsReference = makeFunctionReference<
  "mutation",
  {
    runId: Id<"scrapeRuns">;
    imports: NormalizedHackathonImport[];
    sourceAdapters: string[];
    rejectedCount: number;
    now: number;
  },
  {
    importedCount: number;
    updatedCount: number;
    archivedCount: number;
    reviewCount: number;
    rejectedCount: number;
  }
>("hackathonImports:upsertImportedHackathons");

type ScrapeResult = {
  normalizedImports: NormalizedHackathonImport[];
  rejectedCount: number;
};

async function getJsonFromUrl(url: string) {
  const response = await fetch(url, {
    headers: {
      accept: "application/json",
      "user-agent": "Hack-A-Ton hackathon opportunity scraper",
    },
  });

  if (!response.ok) {
    throw new Error(`Scraper source returned ${response.status} for ${url}`);
  }

  return response.json();
}

async function getDevpostCandidates() {
  const firstResponse = await getJsonFromUrl(
    getDevpostOpenOnlineHackathonsUrl(1),
  );
  const firstPageCandidates =
    getDevpostCandidatesFromApiResponse(firstResponse);
  const pageCount = getDevpostPageCountFromApiResponse(firstResponse);
  const remainingPages = Array.from(
    { length: Math.max(0, pageCount - 1) },
    (_, index) => index + 2,
  );
  const remainingPageCandidates = await Promise.all(
    remainingPages.map((page) =>
      getJsonFromUrl(getDevpostOpenOnlineHackathonsUrl(page)).then(
        getDevpostCandidatesFromApiResponse,
      ),
    ),
  );

  return [...firstPageCandidates, ...remainingPageCandidates.flat()];
}

function getDefinedImportPayload(importedHackathon: NormalizedHackathonImport) {
  return Object.fromEntries(
    Object.entries(importedHackathon).filter((entry) => entry[1] !== undefined),
  ) as NormalizedHackathonImport;
}

function isNormalizedHackathonImport(
  importedHackathon: NormalizedHackathonImport | null,
): importedHackathon is NormalizedHackathonImport {
  return importedHackathon !== null;
}

function getNormalizedImports(now: number): Promise<ScrapeResult> {
  return getDevpostCandidates().then((candidates) => {
    const normalizedImports = candidates
      .map((candidate) => getNormalizedHackathonImport(candidate, now))
      .filter(isNormalizedHackathonImport)
      .map(getDefinedImportPayload);

    return {
      normalizedImports,
      rejectedCount: candidates.length - normalizedImports.length,
    };
  });
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;

  return "Unknown scraper error.";
}

function recordScrapeRunFailure({
  ctx,
  runId,
  error,
}: {
  ctx: ActionCtx;
  runId: Id<"scrapeRuns">;
  error: unknown;
}) {
  return ctx.runMutation(failScrapeRunReference, {
    runId,
    errorMessage: getErrorMessage(error),
    finishedAt: Date.now(),
  });
}

export const syncJoinableHackathons = internalAction({
  args: {
    now: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = args.now ?? Date.now();
    const runId = await ctx.runMutation(startScrapeRunReference, {
      startedAt: now,
    });

    return getNormalizedImports(now)
      .then(({ normalizedImports, rejectedCount }) =>
        ctx.runMutation(upsertImportedHackathonsReference, {
          runId,
          imports: normalizedImports,
          sourceAdapters: activeSourceAdapters,
          rejectedCount,
          now,
        }),
      )
      .catch((error) =>
        recordScrapeRunFailure({ ctx, runId, error }).then(() =>
          Promise.reject(error),
        ),
      );
  },
});
