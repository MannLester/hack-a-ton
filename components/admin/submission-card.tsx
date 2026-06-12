import type { Hackathon } from "@/lib/sample-data";
import { PanelCard } from "@/components/shared/primitives";

export function ReviewCard({
  hackathon,
  onRemovePendingReview,
  onRequestEdits,
  onApprove,
}: {
  hackathon: Hackathon;
  onRemovePendingReview: (hackathonId: string) => void;
  onRequestEdits?: (hackathonId: string) => void;
  onApprove?: (hackathonId: string) => void;
}) {
  return (
    <PanelCard>
      <span className="rounded-full bg-[#ffd21f]/25 px-3 py-1 text-xs font-black text-[#7a5700]">
        Pending first listing review
      </span>
      <h3 className="mt-4 text-lg font-black">{hackathon.name}</h3>
      <p className="mt-2 text-sm font-bold text-zinc-500">
        {hackathon.organizer} · {hackathon.location}
      </p>
      <p className="mt-3 text-sm font-medium leading-6 text-zinc-600">
        {hackathon.summary}
      </p>
      <div className="mt-5 flex gap-2">
        <button
          onClick={() =>
            (onRequestEdits ?? onRemovePendingReview)(hackathon.id)
          }
          className="h-10 flex-1 rounded-md border-2 border-zinc-950 text-sm font-black text-zinc-800"
        >
          Needs edits
        </button>
        <button
          onClick={() => (onApprove ?? onRemovePendingReview)(hackathon.id)}
          className="h-10 flex-1 rounded-md bg-zinc-950 text-sm font-black text-white"
        >
          Approve
        </button>
      </div>
    </PanelCard>
  );
}
