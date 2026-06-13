import { useState } from "react";
import {
  ArrowLeft,
  Check,
  Plus,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import type { Teammate } from "@/components/shared/types";
import type { Hackathon } from "@/lib/sample-data";
import { teamsLooking } from "@/lib/sample-data";
import { AuthActionButton } from "@/components/shared/auth-controls";
import { Modal } from "@/components/shared/modal";
import { FeaturePanel, SectionTitle } from "@/components/shared/primitives";
import { TeamSwipeStack } from "@/components/participants/team-lookup-swipe-stack";

const ALL_ROLES = ["Front-End", "Back-End", "UI/UX", "AI/ML", "DevOps", "Pitch"];

export function TeamView({
  visibleTeammates: _visibleTeammates,
  likedTeammates: _likedTeammates,
  showMatches: _showMatches,
  setShowMatches: _setShowMatches,
  onDismissTeammate: _onDismissTeammate,
  onLikeTeammate: _onLikeTeammate,
  hackathons,
  onBack,
  onCreateTeam,
  myTeam,
  initialPhase = "solo_swiping",
}: {
  visibleTeammates: Teammate[];
  likedTeammates: Teammate[];
  showMatches: boolean;
  setShowMatches: (showMatches: boolean) => void;
  onDismissTeammate: (teammateName: string) => void;
  onLikeTeammate: (teammate: Teammate) => void;
  hackathons: Hackathon[];
  onBack: () => void;
  onCreateTeam?: (teamData: {
    teamName: string;
    hackathonId: string;
    goal: string;
    roles: string[];
    targetSize: number;
  }) => Promise<void>;
  myTeam?: Doc<"teams"> | null;
  initialPhase?: "solo_swiping" | "creating_card" | "team_recruiting";
}) {
  const [teamPhase, setTeamPhase] = useState<
    "creating_card" | "solo_swiping" | "matched_duo" | "team_recruiting"
  >(initialPhase);
  const [matchedUser] = useState({
    name: "Mika Reyes",
    role: "Frontend + pitch deck",
    school: "UP Diliman",
  });
  const [selectedMissingRoles, setSelectedMissingRoles] = useState<string[]>(
    [],
  );
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [teamLobby, setTeamLobby] = useState({
    teamName: "",
    hackathon: "",
    goal: "",
    roles: [] as string[],
  });

  const selectedHackathon = hackathons.find(
    (h) => h.id === teamLobby.hackathon,
  );
  const teamSizeLabel = selectedHackathon?.teamSize ?? "2-4";
  const [minStr, maxStr] = teamSizeLabel.split("-");
  const minMembers = parseInt(minStr, 10);
  const maxMembers = parseInt(maxStr, 10);
  const atCapacity = teamLobby.roles.length >= maxMembers;
  const belowMin = teamLobby.roles.length < minMembers;

  const addRole = (role: string) => {
    if (atCapacity || teamLobby.roles.includes(role)) return;
    setTeamLobby((prev) => ({ ...prev, roles: [...prev.roles, role] }));
  };

  const removeRole = (role: string) => {
    setTeamLobby((prev) => ({
      ...prev,
      roles: prev.roles.filter((r) => r !== role),
    }));
  };

  const toggleRole = (role: string) => {
    setSelectedMissingRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );
  };

  if (teamPhase === "creating_card") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-5">
          <button
            onClick={onBack}
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-md border-2 border-zinc-950 bg-white text-zinc-800 shadow-[3px_3px_0_#111] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#111]"
          >
            <ArrowLeft className="size-4" />
          </button>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#00a7e8]">
              TEAM UP
            </p>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-zinc-950 sm:text-3xl">
              Create Your Team
            </h2>
          </div>
        </div>
        <div className="mx-auto max-w-lg">
          <FeaturePanel className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-[#ffd21f] text-sm font-black text-zinc-950">
                <Users className="size-5" />
              </div>
              <div>
                <h3 className="text-lg font-black">Team Lobby</h3>
                <p className="text-xs font-bold text-zinc-500">
                  Set up your team and define what roles you need
                </p>
              </div>
            </div>
            <div className="mt-5 space-y-4">
              <div>
                <label className="text-xs font-black text-zinc-700">
                  Team Name
                </label>
                <input
                  value={teamLobby.teamName}
                  onChange={(e) =>
                    setTeamLobby((prev) => ({
                      ...prev,
                      teamName: e.target.value,
                    }))
                  }
                  placeholder="e.g. Byte Builders"
                  className="mt-1 h-11 w-full rounded-md border-2 border-zinc-200 bg-white px-3 text-sm font-medium outline-none focus:border-[#00a7e8]"
                />
              </div>
              <div>
                <label className="text-xs font-black text-zinc-700">
                  Hackathon
                </label>
                <select
                  value={teamLobby.hackathon}
                  onChange={(e) =>
                    setTeamLobby((prev) => ({
                      ...prev,
                      hackathon: e.target.value,
                      roles: [],
                    }))
                  }
                  className="mt-1 h-11 w-full rounded-md border-2 border-zinc-200 bg-white pl-3 pr-10 text-sm font-bold outline-none focus:border-[#00a7e8]"
                >
                  <option disabled value="">
                    Select a hackathon...
                  </option>
                  {hackathons.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} · {h.date}
                    </option>
                  ))}
                </select>
                {selectedHackathon && (
                  <p className="mt-1.5 text-xs font-bold text-zinc-500">
                    Team size: {teamSizeLabel} members
                  </p>
                )}
              </div>
              <div>
                <label className="text-xs font-black text-zinc-700">
                  Goal
                </label>
                <textarea
                  value={teamLobby.goal}
                  onChange={(e) =>
                    setTeamLobby((prev) => ({ ...prev, goal: e.target.value }))
                  }
                  placeholder="e.g. Building an AI-powered civic tech app..."
                  rows={3}
                  className="mt-1 w-full rounded-md border-2 border-zinc-200 bg-white px-3 py-2 text-sm font-medium outline-none focus:border-[#00a7e8]"
                />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-zinc-700">
                    Team Composition
                  </label>
                  {selectedHackathon && (
                    <span
                      className={`rounded-full border-2 px-2.5 py-0.5 text-xs font-black ${
                        belowMin && teamLobby.roles.length > 0
                          ? "border-amber-400 bg-amber-50 text-amber-700"
                          : atCapacity
                            ? "border-[#00a7e8] bg-[#00a7e8]/15 text-[#006c9c]"
                            : "border-zinc-200 bg-zinc-100 text-zinc-500"
                      }`}
                    >
                      {teamLobby.roles.length} / {maxMembers} roles
                    </span>
                  )}
                </div>
                {selectedHackathon && (
                  <p className="mt-1 text-xs font-medium text-zinc-500">
                    Pick {minMembers}–{maxMembers} roles for your team
                  </p>
                )}
                <div className="mt-2 flex flex-wrap gap-2">
                  {ALL_ROLES.map((role) => {
                    const selected = teamLobby.roles.includes(role);
                    const disabled =
                      !selectedHackathon || (!selected && atCapacity);
                    return (
                      <button
                        key={role}
                        onClick={() =>
                          selected ? removeRole(role) : addRole(role)
                        }
                        disabled={disabled}
                        className={`inline-flex items-center gap-1.5 rounded-full border-2 px-3 py-1.5 text-xs font-black transition ${
                          selected
                            ? "border-[#00a7e8] bg-[#00a7e8] text-white"
                            : "border-zinc-950 bg-white text-zinc-800 hover:bg-zinc-100"
                        } disabled:cursor-not-allowed disabled:opacity-40`}
                      >
                        {selected ? (
                          <X className="size-3" />
                        ) : (
                          <Plus className="size-3" />
                        )}
                        {role}
                      </button>
                    );
                  })}
                </div>
                {teamLobby.roles.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {teamLobby.roles.map((role) => (
                      <span
                        key={role}
                        className="inline-flex items-center gap-1 rounded-full border-2 border-zinc-950 bg-[#ffd21f]/20 px-2.5 py-1 text-xs font-black text-[#7a5700]"
                      >
                        {role}
                        <button
                          onClick={() => removeRole(role)}
                          className="ml-0.5 inline-flex size-3.5 items-center justify-center rounded-full bg-zinc-950 text-white hover:bg-zinc-700"
                        >
                          <X className="size-2.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setTeamPhase("solo_swiping")}
                className="h-11 flex-1 rounded-md border-2 border-zinc-950 text-sm font-black text-zinc-800"
              >
                Cancel
              </button>
              <AuthActionButton
                action="create_lft_card"
                onAuthorizedClick={async () => {
                  if (!selectedHackathon || !onCreateTeam) {
                    setShowConfirmModal(true);
                    return;
                  }
                  setCreating(true);
                  try {
                    await onCreateTeam({
                      teamName: teamLobby.teamName,
                      hackathonId: selectedHackathon.id,
                      goal: teamLobby.goal,
                      roles: teamLobby.roles,
                      targetSize: maxMembers,
                    });
                    setShowConfirmModal(true);
                  } finally {
                    setCreating(false);
                  }
                }}
                disabled={
                  creating ||
                  !teamLobby.teamName ||
                  !teamLobby.hackathon ||
                  !teamLobby.goal ||
                  belowMin
                }
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md border-2 border-zinc-950 bg-[#ffd21f] text-sm font-black text-zinc-950 shadow-[3px_3px_0_#111] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#111] disabled:opacity-40 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[3px_3px_0_#111]"
                signedOutLabel={
                  <>
                    <Plus className="size-4" /> Log in to create
                  </>
                }
              >
                <Plus className="size-4" /> {creating ? "Creating..." : "Create Team"}
              </AuthActionButton>
            </div>
          </FeaturePanel>
        </div>
        <Modal
          open={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          title="Team Created!"
        >
          <p className="text-sm font-medium text-zinc-600">
            Your team lobby is live. Players can now see your team and request
            to join.
          </p>
          <button
            onClick={() => {
              setShowConfirmModal(false);
              setTeamPhase("team_recruiting");
            }}
            className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border-2 border-zinc-950 bg-[#ffd21f] text-sm font-black text-zinc-950 shadow-[3px_3px_0_#111] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#111]"
          >
            <Users className="size-4" /> Go to Team
          </button>
        </Modal>
      </div>
    );
  }

  if (teamPhase === "matched_duo") {
    return (
      <div className="space-y-6">
        <SectionTitle
          eyebrow="Participant / Team Up"
          title="Match found! Ready to team up?"
        />
        <div className="mx-auto max-w-lg">
          <FeaturePanel className="p-5">
            <h3 className="text-lg font-black">Your Match</h3>
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3 rounded-md border-2 border-zinc-950 bg-white p-3 shadow-[3px_3px_0_#111]">
                <div className="flex size-10 items-center justify-center rounded-full bg-[#ffd21f] text-sm font-black text-zinc-950">
                  {matchedUser.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-black text-zinc-950">
                    {matchedUser.name}
                  </p>
                  <p className="text-xs font-bold text-zinc-500">
                    {matchedUser.role}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-md border-2 border-zinc-900 bg-zinc-50 p-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-zinc-200 text-sm font-black text-zinc-600">
                  Y
                </div>
                <div>
                  <p className="text-sm font-black text-zinc-950">You</p>
                  <p className="text-xs font-bold text-zinc-500">
                    Backend + data
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setTeamPhase("team_recruiting")}
              className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border-2 border-zinc-950 bg-[#ffd21f] px-4 text-sm font-black text-zinc-950 shadow-[3px_3px_0_#111] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#111]"
            >
              <UserPlus className="size-4" /> Form Team
            </button>
          </FeaturePanel>
        </div>
      </div>
    );
  }

  if (teamPhase === "team_recruiting") {
    if (!myTeam) {
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-5">
            <button
              onClick={onBack}
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-md border-2 border-zinc-950 bg-white text-zinc-800 shadow-[3px_3px_0_#111] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#111]"
            >
              <ArrowLeft className="size-4" />
            </button>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#00a7e8]">
                MY TEAM
              </p>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-zinc-950 sm:text-3xl">
                Team Headquarters
              </h2>
            </div>
          </div>
          <FeaturePanel className="flex flex-col items-center p-8 text-center">
            <Users className="size-12 text-zinc-300" />
            <h3 className="mt-4 text-lg font-black text-zinc-950">
              You have not joined a team yet
            </h3>
            <p className="mt-1 text-sm font-medium text-zinc-500">
              Create a team to start recruiting members.
            </p>
            <button
              onClick={() => setTeamPhase("creating_card")}
              className="mt-5 inline-flex h-11 items-center gap-2 rounded-md border-2 border-zinc-950 bg-[#ffd21f] px-6 text-sm font-black text-zinc-950 shadow-[3px_3px_0_#111] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#111]"
            >
              <Plus className="size-4" /> Create a Team
            </button>
          </FeaturePanel>
        </div>
      );
    }

    const displayRoles = myTeam.missingRoles ?? teamLobby.roles;
    const displayTeamName = myTeam.teamName ?? teamLobby.teamName;
    const displayTargetSize = myTeam.targetSize ?? (1 + teamLobby.roles.length);
    const displayMembers = myTeam.members?.length ?? 1;
    const selectedHackathonForTeam = hackathons.find(
      (h) => h.id === myTeam.hackathonId,
    );
    return (
      <div className="space-y-6">
        <SectionTitle
          eyebrow="Participant / Team Up"
          title={displayTeamName ? `Your team: ${displayTeamName}` : "Build your squad"}
        />
        {selectedHackathonForTeam && (
          <p className="text-sm font-medium text-zinc-500">
            {selectedHackathonForTeam.name} · {selectedHackathonForTeam.date}
          </p>
        )}
        <div className="space-y-4">
          <FeaturePanel className="p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black">Team Roster</h3>
              <span className="rounded-full bg-[#00a7e8]/15 px-2.5 py-1 text-xs font-black text-[#006c9c]">
                {displayMembers} / {displayTargetSize}
              </span>
            </div>
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3 rounded-md border-2 border-zinc-950 bg-white p-3 shadow-[3px_3px_0_#111]">
                <div className="flex size-10 items-center justify-center rounded-full bg-[#ffd21f] text-sm font-black text-zinc-950">
                  Y
                </div>
                <div>
                  <p className="text-sm font-black text-zinc-950">You</p>
                  <p className="text-xs font-bold text-zinc-500">
                    Team Lead
                  </p>
                </div>
              </div>
              {displayRoles.map((role) => (
                <div
                  key={role}
                  className="flex items-center gap-3 rounded-md border-2 border-dashed border-zinc-300 bg-white p-3"
                >
                  <div className="flex size-10 items-center justify-center rounded-full bg-zinc-100 text-sm font-black text-zinc-400">
                    <Users className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-zinc-400">
                      {role}
                    </p>
                    <p className="text-xs font-bold text-zinc-400">
                      Open slot
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </FeaturePanel>

          <FeaturePanel className="p-5">
            <h3 className="text-sm font-black text-zinc-950">
              What roles are you missing?
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {displayRoles.map((role) => {
                const active = selectedMissingRoles.includes(role);
                return (
                  <button
                    key={role}
                    onClick={() => toggleRole(role)}
                    className={`inline-flex items-center gap-1.5 rounded-full border-2 px-3 py-1.5 text-xs font-black transition ${
                      active
                        ? "border-[#00a7e8] bg-[#00a7e8] text-white"
                        : "border-zinc-950 bg-white text-zinc-800 hover:bg-zinc-100"
                    }`}
                  >
                    {active && <Check className="size-3" />}
                    {role}
                  </button>
                );
              })}
            </div>
          </FeaturePanel>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col">
      <div className="flex items-center gap-5">
        <button
          onClick={onBack}
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-md border-2 border-zinc-950 bg-white text-zinc-800 shadow-[3px_3px_0_#111] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#111]"
        >
          <ArrowLeft className="size-4" />
        </button>
        <SectionTitle
          eyebrow="JOIN A TEAM"
          title="Swipe to find your next hackathon team"
        />
      </div>
      <div className="flex flex-1 items-center justify-center py-6">
        <TeamSwipeStack
          teams={teamsLooking}
          onDismiss={() => {}}
          onLike={() => {}}
          emptyMessage="No teams looking for teammates right now."
        />
      </div>
    </div>
  );
}
