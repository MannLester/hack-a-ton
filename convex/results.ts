import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { requireCurrentOrganizer } from "./users";

const placementValidator = v.union(
  v.literal("first"),
  v.literal("second"),
  v.literal("third"),
  v.literal("participant"),
);

type Placement = "first" | "second" | "third" | "participant";

type TeamMemberProfile = {
  userId: Id<"users">;
  displayName: string;
  initials: string;
  meta: string | null;
  isLead: boolean;
};

function getMonthIndex(monthLabel: string) {
  return [
    "jan",
    "feb",
    "mar",
    "apr",
    "may",
    "jun",
    "jul",
    "aug",
    "sep",
    "oct",
    "nov",
    "dec",
  ].indexOf(monthLabel.slice(0, 3).toLowerCase());
}

function getEventEndTimestamp(dateLabel: string) {
  const sameMonthRangeMatch = dateLabel.match(
    /^([A-Za-z]{3,9})\s+\d{1,2}-(\d{1,2}),\s+(\d{4})$/,
  );
  const crossMonthRangeMatch = dateLabel.match(
    /^[A-Za-z]{3,9}\s+\d{1,2}\s+-\s+([A-Za-z]{3,9})\s+(\d{1,2}),\s+(\d{4})$/,
  );
  const singleDateMatch = dateLabel.match(
    /^([A-Za-z]{3,9})\s+(\d{1,2}),\s+(\d{4})$/,
  );

  const monthLabel =
    sameMonthRangeMatch?.[1] ?? crossMonthRangeMatch?.[1] ?? singleDateMatch?.[1];
  const dayLabel =
    sameMonthRangeMatch?.[2] ?? crossMonthRangeMatch?.[2] ?? singleDateMatch?.[2];
  const yearLabel =
    sameMonthRangeMatch?.[3] ?? crossMonthRangeMatch?.[3] ?? singleDateMatch?.[3];

  if (!monthLabel || !dayLabel || !yearLabel) return null;

  const monthIndex = getMonthIndex(monthLabel);

  if (monthIndex < 0) return null;

  return new Date(
    Number(yearLabel),
    monthIndex,
    Number(dayLabel),
    23,
    59,
    59,
  ).getTime();
}

function canSubmitResultsForDateLabel(dateLabel: string, now: number) {
  const eventEndTimestamp = getEventEndTimestamp(dateLabel);

  if (!eventEndTimestamp) return false;

  return now > eventEndTimestamp;
}

async function requireOrganizerHackathon(
  ctx: MutationCtx,
  organizerId: Id<"organizers">,
  hackathonId: Id<"hackathons">,
) {
  const hackathon = await ctx.db.get(hackathonId);

  if (!hackathon || hackathon.organizerId !== organizerId) {
    throw new Error("Hackathon not found for organizer.");
  }

  return hackathon;
}

async function getMemberProfile(
  ctx: QueryCtx,
  userId: Id<"users">,
  leadUserId: Id<"users">,
) {
  const user = await ctx.db.get(userId);

  return {
    userId,
    displayName: user?.displayName ?? "Unknown builder",
    initials: user?.initials ?? "HA",
    meta: [user?.schoolOrCompany, user?.location].filter(Boolean).join(" · ") || null,
    isLead: userId === leadUserId,
  } satisfies TeamMemberProfile;
}

async function getTeamWithMembers(ctx: QueryCtx, team: Doc<"teams">) {
  const leadUserId = team.members[0];
  const memberProfiles = await Promise.all(
    team.members.map((memberId) => getMemberProfile(ctx, memberId, leadUserId)),
  );

  return {
    ...team,
    memberProfiles,
  };
}

async function getExistingTeamResult(
  ctx: QueryCtx | MutationCtx,
  teamId: Id<"teams">,
) {
  return ctx.db
    .query("teamResults")
    .withIndex("by_team", (index) => index.eq("teamId", teamId))
    .unique();
}

export const listOrganizerResultBoards = query({
  args: {},
  handler: async (ctx) => {
    const { organizer } = await requireCurrentOrganizer(ctx);
    const hackathons = await ctx.db
      .query("hackathons")
      .withIndex("by_organizer", (index) =>
        index.eq("organizerId", organizer._id),
      )
      .collect();
    const now = Date.now();

    return Promise.all(
      hackathons.map(async (hackathon) => {
        const teams = await ctx.db
          .query("teams")
          .withIndex("by_hackathon", (index) =>
            index.eq("hackathonId", hackathon._id),
          )
          .collect();
        const resultRows = await Promise.all(
          teams.map(async (team) => {
            const [teamWithMembers, result] = await Promise.all([
              getTeamWithMembers(ctx, team),
              getExistingTeamResult(ctx, team._id),
            ]);

            return {
              team: teamWithMembers,
              placement: result?.placement ?? null,
              resultId: result?._id ?? null,
            };
          }),
        );

        return {
          hackathonId: hackathon._id,
          hackathonName: hackathon.name,
          dateLabel: hackathon.dateLabel,
          status: hackathon.status,
          canSubmitResults: canSubmitResultsForDateLabel(hackathon.dateLabel, now),
          teams: resultRows,
        };
      }),
    );
  },
});

export const submitTeamResults = mutation({
  args: {
    hackathonId: v.id("hackathons"),
    results: v.array(
      v.object({
        teamId: v.id("teams"),
        placement: placementValidator,
      }),
    ),
  },
  handler: async (ctx, args) => {
    const { organizer } = await requireCurrentOrganizer(ctx);
    const hackathon = await requireOrganizerHackathon(
      ctx,
      organizer._id,
      args.hackathonId,
    );

    if (!canSubmitResultsForDateLabel(hackathon.dateLabel, Date.now())) {
      throw new Error("Results can be submitted after the event ends.");
    }

    const now = Date.now();

    await Promise.all(
      args.results.map(async (result) => {
        const team = await ctx.db.get(result.teamId);

        if (!team || team.hackathonId !== args.hackathonId) {
          throw new Error("Team not found for hackathon.");
        }

        const existingResult = await getExistingTeamResult(ctx, result.teamId);
        const resultFields = {
          hackathonId: args.hackathonId,
          teamId: result.teamId,
          organizerId: organizer._id,
          placement: result.placement as Placement,
        };

        if (existingResult) {
          await ctx.db.patch(existingResult._id, {
            ...resultFields,
            updatedAt: now,
          });
          return;
        }

        await ctx.db.insert("teamResults", {
          ...resultFields,
          submittedAt: now,
        });
      }),
    );

    return args.hackathonId;
  },
});
