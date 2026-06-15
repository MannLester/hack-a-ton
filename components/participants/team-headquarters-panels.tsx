import { Check, X } from "lucide-react";
import type { MyTeam, TeamInterestedUser } from "@/components/shared/types";
import { FeaturePanel } from "@/components/shared/primitives";

type TeamMemberProfile = NonNullable<MyTeam["memberProfiles"]>[number];

export function InterestedBuildersPanel({
  interestedUsers,
  onRespondToInterestedUser,
}: {
  interestedUsers: TeamInterestedUser[];
  onRespondToInterestedUser?: (
    userId: TeamInterestedUser["userId"],
    teamId: TeamInterestedUser["teamId"],
    hackathonId: TeamInterestedUser["hackathonId"],
    decision: "like" | "pass",
  ) => Promise<void>;
}) {
  if (interestedUsers.length === 0) return null;

  return (
    <FeaturePanel className="p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-black">Interested Builders</h3>
        <span className="rounded-full bg-[#ffd21f]/25 px-2.5 py-1 text-xs font-black text-[#7a5700]">
          {interestedUsers.length} pending
        </span>
      </div>
      <div className="mt-4 space-y-3">
        {interestedUsers.map((user) => (
          <div
            key={user.userId}
            className="grid gap-3 rounded-md border-2 border-zinc-950 bg-white p-3 shadow-[3px_3px_0_#111] sm:grid-cols-[1fr_auto]"
          >
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#00a7e8]/15 text-sm font-black text-[#006c9c]">
                {user.initials}
              </div>
              <div>
                <p className="text-sm font-black text-zinc-950">
                  {user.displayName}
                </p>
                {user.meta && (
                  <p className="text-xs font-bold text-zinc-500">
                    {user.meta}
                  </p>
                )}
                <p className="mt-1 text-xs font-medium leading-5 text-zinc-600">
                  {user.bio}
                </p>
              </div>
            </div>
            <div className="flex gap-2 sm:items-center">
              <button
                onClick={() =>
                  void onRespondToInterestedUser?.(
                    user.userId,
                    user.teamId,
                    user.hackathonId,
                    "pass",
                  )
                }
                className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md border-2 border-zinc-950 bg-white px-4 text-xs font-black text-zinc-800 sm:flex-none"
              >
                <X className="size-3.5" /> Pass
              </button>
              <button
                onClick={() =>
                  void onRespondToInterestedUser?.(
                    user.userId,
                    user.teamId,
                    user.hackathonId,
                    "like",
                  )
                }
                className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md border-2 border-zinc-950 bg-[#ffd21f] px-4 text-xs font-black text-zinc-950 sm:flex-none"
              >
                <Check className="size-3.5" /> Accept
              </button>
            </div>
          </div>
        ))}
      </div>
    </FeaturePanel>
  );
}

export function TeamRosterPanel({
  members,
  memberCount,
  targetSize,
}: {
  members: TeamMemberProfile[];
  memberCount: number;
  targetSize: number;
}) {
  return (
    <FeaturePanel className="p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black">Team Roster</h3>
        <span className="rounded-full bg-[#00a7e8]/15 px-2.5 py-1 text-xs font-black text-[#006c9c]">
          {memberCount} / {targetSize}
        </span>
      </div>
      <div className="mt-4 space-y-3">
        {members.map((member) => (
          <div
            key={member.userId}
            className="flex items-center gap-3 rounded-md border-2 border-zinc-950 bg-white p-3 shadow-[3px_3px_0_#111]"
          >
            <div
              className={`flex size-10 items-center justify-center rounded-full text-sm font-black ${
                member.isLead
                  ? "bg-[#ffd21f] text-zinc-950"
                  : "bg-[#00a7e8]/15 text-[#006c9c]"
              }`}
            >
              {member.initials}
            </div>
            <div>
              <p className="text-sm font-black text-zinc-950">
                {member.displayName}
              </p>
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-zinc-500">
                <span>{member.isLead ? "Team Lead" : "Member"}</span>
                {member.meta && <span>{member.meta}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </FeaturePanel>
  );
}
