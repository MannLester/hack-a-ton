import { useEffect, useMemo, useState } from "react";
import { Award, Save } from "lucide-react";
import type {
  OrganizerResultBoard,
  TeamResultPlacement,
} from "@/components/shared/types";
import { FeaturePanel, SectionTitle } from "@/components/shared/primitives";

const placementOptions: { label: string; value: TeamResultPlacement }[] = [
  { label: "Participant", value: "participant" },
  { label: "3rd place", value: "third" },
  { label: "2nd place", value: "second" },
  { label: "1st place", value: "first" },
];

type PlacementState = Record<string, TeamResultPlacement>;

function getInitialPlacements(board: OrganizerResultBoard) {
  return Object.fromEntries(
    board.teams.map((row) => [row.team._id, row.placement ?? "participant"]),
  ) as PlacementState;
}

function getMemberNames(row: OrganizerResultBoard["teams"][number]) {
  return row.team.memberProfiles
    .map((member) => member.displayName)
    .join(", ");
}

export function ResultsSubmissionView({
  resultBoards = [],
  onSubmitResults,
}: {
  resultBoards?: OrganizerResultBoard[];
  onSubmitResults?: (
    hackathonId: OrganizerResultBoard["hackathonId"],
    results: { teamId: string; placement: TeamResultPlacement }[],
  ) => Promise<void> | void;
}) {
  const boardsWithTeams = useMemo(
    () => resultBoards.filter((board) => board.teams.length > 0),
    [resultBoards],
  );
  const [placementsByHackathon, setPlacementsByHackathon] = useState<
    Record<string, PlacementState>
  >({});
  const [savingHackathonId, setSavingHackathonId] = useState<string | null>(null);

  useEffect(() => {
    setPlacementsByHackathon((currentPlacements) => {
      const nextPlacements = { ...currentPlacements };

      for (const board of boardsWithTeams) {
        if (nextPlacements[board.hackathonId]) continue;

        nextPlacements[board.hackathonId] = getInitialPlacements(board);
      }

      return nextPlacements;
    });
  }, [boardsWithTeams]);

  const updatePlacement = (
    hackathonId: string,
    teamId: string,
    placement: TeamResultPlacement,
  ) => {
    setPlacementsByHackathon((currentPlacements) => ({
      ...currentPlacements,
      [hackathonId]: {
        ...currentPlacements[hackathonId],
        [teamId]: placement,
      },
    }));
  };

  const submitBoardResults = async (board: OrganizerResultBoard) => {
    const placements = placementsByHackathon[board.hackathonId] ??
      getInitialPlacements(board);
    const results = board.teams.map((row) => ({
      teamId: row.team._id,
      placement: placements[row.team._id] ?? "participant",
    }));

    setSavingHackathonId(board.hackathonId);
    await onSubmitResults?.(board.hackathonId, results);
    setSavingHackathonId(null);
  };

  if (boardsWithTeams.length === 0) return null;

  return (
    <section className="space-y-4">
      <SectionTitle
        eyebrow="Organizer results"
        title="Submit team rankings after the event"
      />
      {boardsWithTeams.map((board) => {
        const placements = placementsByHackathon[board.hackathonId] ??
          getInitialPlacements(board);
        const isSaving = savingHackathonId === board.hackathonId;

        return (
          <FeaturePanel key={board.hackathonId} className="p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-black text-zinc-950">{board.hackathonName}</p>
                <p className="mt-1 text-sm font-bold text-zinc-500">
                  {board.dateLabel} · {board.teams.length} Hack-A-Ton teams
                </p>
              </div>
              <button
                onClick={() => void submitBoardResults(board)}
                disabled={!board.canSubmitResults || isSaving}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border-2 border-zinc-950 bg-[#ffd21f] px-4 text-sm font-black text-zinc-950 disabled:cursor-not-allowed disabled:border-zinc-300 disabled:bg-zinc-100 disabled:text-zinc-400"
              >
                <Save className="size-4" /> {isSaving ? "Saving..." : "Save results"}
              </button>
            </div>
            {!board.canSubmitResults ? (
              <p className="mt-3 rounded-md border-2 border-zinc-100 bg-zinc-50 p-3 text-sm font-bold text-zinc-500">
                Ranking unlocks after the event end date. Teams are shown now so organizers can review who joined through Hack-A-Ton.
              </p>
            ) : null}
            <div className="mt-4 divide-y-2 divide-zinc-100 rounded-lg border-2 border-zinc-100 bg-white">
              {board.teams.map((row) => (
                <div
                  key={row.team._id}
                  className="grid gap-3 p-3 md:grid-cols-[1fr_220px] md:items-center"
                >
                  <div className="min-w-0">
                    <p className="inline-flex items-center gap-2 font-black text-zinc-950">
                      <Award className="size-4 text-[#00a7e8]" /> {row.team.teamName}
                    </p>
                    <p className="mt-1 text-sm font-bold leading-6 text-zinc-500">
                      {getMemberNames(row)}
                    </p>
                  </div>
                  <select
                    value={placements[row.team._id] ?? "participant"}
                    onChange={(event) =>
                      updatePlacement(
                        board.hackathonId,
                        row.team._id,
                        event.target.value as TeamResultPlacement,
                      )
                    }
                    disabled={!board.canSubmitResults}
                    className="h-10 rounded-md border-2 border-zinc-200 bg-white px-3 text-sm font-black text-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400"
                  >
                    {placementOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </FeaturePanel>
        );
      })}
    </section>
  );
}
