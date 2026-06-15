import { useState } from "react";
import { ArrowLeft, Trophy } from "lucide-react";
import type {
  PortfolioEntry,
  PortfolioPlacementStat,
  TeamResultPlacement,
} from "@/components/shared/types";
import { PanelCard } from "@/components/shared/primitives";

function getResultLabel(
  result: PortfolioEntry["result"],
  placement?: PortfolioEntry["placement"],
) {
  if (placement === "first") return "1st place";
  if (placement === "second") return "2nd place";
  if (placement === "third") return "3rd place";
  if (result === "winner") return "Winner";
  if (result === "finalist") return "Finalist";

  return "Participant";
}

function getPlacementEntries(
  entries: PortfolioEntry[],
  placement: TeamResultPlacement | null,
) {
  if (!placement) return [];

  return entries.filter((entry) => entry.placement === placement);
}

function getPlacementResultKey(item: PortfolioEntry) {
  return [item.hackathonName, item.hackathonDate ?? "date", item.teamName ?? "team"].join("-");
}

function getParticipationSummary(item: PortfolioEntry) {
  const resultLabel = getResultLabel(item.result, item.placement);

  if (!item.teamName) return `${resultLabel} · verified`;

  return `${resultLabel} · verified · ${item.teamName}`;
}

export function PortfolioPlacementSummary({
  placementStats,
  entries,
}: {
  placementStats: PortfolioPlacementStat[];
  entries: PortfolioEntry[];
}) {
  const [selectedPlacement, setSelectedPlacement] = useState<TeamResultPlacement | null>(null);
  const selectedPlacementStat = placementStats.find(
    (stat) => stat.placement === selectedPlacement,
  );
  const selectedPlacementEntries = getPlacementEntries(entries, selectedPlacement);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-4">
        {placementStats.map((stat) => (
          <button
            key={stat.placement}
            type="button"
            onClick={() => setSelectedPlacement(stat.placement)}
            className="rounded-lg border-2 border-zinc-950 bg-white p-4 text-left shadow-[4px_4px_0_#111] transition hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#111]"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-zinc-500">
                {stat.label}
              </p>
              <Trophy className="size-4 text-[#00a7e8]" />
            </div>
            <p className="mt-2 text-3xl font-black text-zinc-950">
              {stat.count}
            </p>
            <p className="mt-1 text-xs font-black text-[#006c9c]">
              {stat.points} points
            </p>
          </button>
        ))}
      </div>
      {selectedPlacement ? (
        <PanelCard>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-black">
                {selectedPlacementStat?.label ?? "Placement"} results
              </h3>
              <p className="mt-1 text-sm font-bold text-zinc-500">
                {selectedPlacementStat?.points ?? 0} points from {selectedPlacementStat?.count ?? 0} hackathons
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedPlacement(null)}
              className="inline-flex h-9 items-center gap-2 rounded-md border-2 border-zinc-950 px-3 text-xs font-black text-zinc-950"
            >
              <ArrowLeft className="size-3.5" /> Back to profile
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {selectedPlacementEntries.length === 0 ? (
              <p className="rounded-md border-2 border-zinc-100 bg-zinc-50 p-4 text-sm font-bold text-zinc-500">
                No hackathons found for this placement yet.
              </p>
            ) : null}
            {selectedPlacementEntries.map((item) => (
              <div
                key={getPlacementResultKey(item)}
                className="rounded-md border-2 border-zinc-100 bg-zinc-50 p-4"
              >
                <p className="font-black text-zinc-950">{item.hackathonName}</p>
                <p className="mt-1 text-sm font-bold text-zinc-500">
                  {item.hackathonDate ?? "Date unavailable"}
                </p>
              </div>
            ))}
          </div>
        </PanelCard>
      ) : (
        <PanelCard>
          <h3 className="text-lg font-black">Recent participation</h3>
          <div className="mt-4 space-y-4">
            {entries.length === 0 ? (
              <p className="rounded-md border-2 border-zinc-100 bg-zinc-50 p-4 text-sm font-bold text-zinc-500">
                No verified hackathon results yet. Results appear here after organizers submit team rankings.
              </p>
            ) : null}
            {entries.slice(0, 6).map((item, index) => (
              <div
                key={[item.hackathonName, item.result, index].join("-")}
                className="flex items-start justify-between gap-3 border-t-2 border-zinc-100 pt-4 first:border-t-0 first:pt-0"
              >
                <div className="flex items-start gap-3">
                  <span className="grid size-9 place-items-center rounded-md bg-zinc-100 text-sm font-black text-zinc-600">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-black text-zinc-950">
                      {item.hackathonName}
                    </p>
                    <p className="text-sm font-bold text-zinc-500">
                      {getParticipationSummary(item)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </PanelCard>
      )}
    </div>
  );
}
