import { cronJobs, makeFunctionReference } from "convex/server";

const syncJoinableHackathonsReference = makeFunctionReference<
  "action",
  { now?: number },
  unknown
>("hackathonScraper:syncJoinableHackathons");

const crons = cronJobs();

crons.daily(
  "sync joinable hackathons",
  {
    hourUTC: 18,
    minuteUTC: 0,
  },
  syncJoinableHackathonsReference,
  {},
);

export default crons;
