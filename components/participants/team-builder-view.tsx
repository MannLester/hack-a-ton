import { useState } from "react";
import {
  ArrowLeft,
  Check,
  FileText,
  Plus,
  UserPlus,
  Users,
} from "lucide-react";
import type { Teammate } from "@/components/shared/types";
import type { Hackathon } from "@/lib/sample-data";
import { teamsLooking } from "@/lib/sample-data";
import { AuthActionButton } from "@/components/shared/auth-controls";
import { FeaturePanel, SectionTitle } from "@/components/shared/primitives";
import { SwipeStack } from "@/components/participants/teammate-swipe-stack";
import { TeamSwipeStack } from "@/components/participants/team-lookup-swipe-stack";

const ALL_ROLES = ["Front-End", "Back-End", "UI/UX", "AI/ML", "DevOps", "Pitch"];

export function TeamView({
  visibleTeammates,
  likedTeammates,
  showMatches,
  setShowMatches,
  onDismissTeammate,
  onLikeTeammate,
  hackathons,
  onBack,
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
  initialPhase?: "solo_swiping" | "creating_card";
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
  const [lftCard, setLftCard] = useState({
    teamName: "",
    hackathon: "",
    goal: "",
    missingRoles: [] as string[],
  });
  const toggleLftMissingRole = (role: string) => {
    setLftCard((prev) => ({
      ...prev,
      missingRoles: prev.missingRoles.includes(role)
        ? prev.missingRoles.filter((r) => r !== role)
        : [...prev.missingRoles, role],
    }));
  };

  const toggleRole = (role: string) => {
    setSelectedMissingRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );
  };

  const listedTeammates = showMatches ? likedTeammates : visibleTeammates;

  const soloOnly =
    teamPhase === "team_recruiting"
      ? visibleTeammates.filter((t) =>
          selectedMissingRoles.length === 0
            ? true
            : selectedMissingRoles.some(
                (role) =>
                  t.role.toLowerCase().includes(role.toLowerCase()) ||
                  t.stack.toLowerCase().includes(role.toLowerCase()),
              ),
        )
      : listedTeammates;

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
              Create your LFT Card
            </h2>
          </div>
        </div>
        <div className="mx-auto max-w-lg">
          <FeaturePanel className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-[#ffd21f] text-sm font-black text-zinc-950">
                <FileText className="size-5" />
              </div>
              <div>
                <h3 className="text-lg font-black">Your LFT Card</h3>
                <p className="text-xs font-bold text-zinc-500">
                  Tell others what you bring to the table
                </p>
              </div>
            </div>
            <div className="mt-5 space-y-4">
              <div>
                <label className="text-xs font-black text-zinc-700">
                  Team Name
                </label>
                <input
                  value={lftCard.teamName}
                  onChange={(e) =>
                    setLftCard((prev) => ({
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
                  value={lftCard.hackathon}
                  onChange={(e) =>
                    setLftCard((prev) => ({
                      ...prev,
                      hackathon: e.target.value,
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
              </div>
              <div>
                <label className="text-xs font-black text-zinc-700">
                  Goal
                </label>
                <textarea
                  value={lftCard.goal}
                  onChange={(e) =>
                    setLftCard((prev) => ({ ...prev, goal: e.target.value }))
                  }
                  placeholder="e.g. Looking for backend or AI teammates for a hackathon..."
                  rows={3}
                  className="mt-1 w-full rounded-md border-2 border-zinc-200 bg-white px-3 py-2 text-sm font-medium outline-none focus:border-[#00a7e8]"
                />
              </div>
              <div>
                <label className="text-xs font-black text-zinc-700">
                  What roles is your team missing?
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {ALL_ROLES.map((role) => {
                    const active = lftCard.missingRoles.includes(role);
                    return (
                      <button
                        key={role}
                        onClick={() => toggleLftMissingRole(role)}
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
                onAuthorizedClick={() => setTeamPhase("solo_swiping")}
                disabled={!lftCard.teamName || !lftCard.hackathon || !lftCard.goal}
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md border-2 border-zinc-950 bg-[#ffd21f] text-sm font-black text-zinc-950 shadow-[3px_3px_0_#111] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#111] disabled:opacity-40 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[3px_3px_0_#111]"
                signedOutLabel={
                  <>
                    <Plus className="size-4" /> Log in to create
                  </>
                }
              >
                <Plus className="size-4" /> Create Card
              </AuthActionButton>
            </div>
          </FeaturePanel>
        </div>
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
    return (
      <div className="space-y-6">
        <SectionTitle
          eyebrow="Participant / Team Up"
          title="Build your squad"
        />
        <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <SwipeStack
            teammates={soloOnly}
            onDismiss={onDismissTeammate}
            onLike={onLikeTeammate}
            emptyMessage="No solo players match your missing roles."
          />

          <div className="space-y-4">
            <FeaturePanel className="p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black">Team Roster</h3>
                <span className="rounded-full bg-[#00a7e8]/15 px-2.5 py-1 text-xs font-black text-[#006c9c]">
                  2 / 4
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
                      Backend + data
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-md border-2 border-zinc-950 bg-white p-3 shadow-[3px_3px_0_#111]">
                  <div className="flex size-10 items-center justify-center rounded-full bg-[#00a7e8] text-sm font-black text-white">
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
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-md border-2 border-dashed border-zinc-300 bg-white p-3 text-center">
                  <Users className="mx-auto size-4 text-zinc-400" />
                  <p className="mt-1 text-xs font-black text-zinc-400">
                    Slot 3
                  </p>
                </div>
                <div className="rounded-md border-2 border-dashed border-zinc-300 bg-white p-3 text-center">
                  <Users className="mx-auto size-4 text-zinc-400" />
                  <p className="mt-1 text-xs font-black text-zinc-400">
                    Slot 4
                  </p>
                </div>
              </div>
            </FeaturePanel>

            <FeaturePanel className="p-5">
              <h3 className="text-sm font-black text-zinc-950">
                What roles are you missing?
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {ALL_ROLES.map((role) => {
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
