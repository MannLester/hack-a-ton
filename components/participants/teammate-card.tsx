import { Heart, X } from "lucide-react";
import type { Teammate } from "@/components/shared/types";
import { PanelCard } from "@/components/shared/ui";

export function TeammateCard({
  teammate,
  onDismiss,
  onLike,
}: {
  teammate: Teammate;
  onDismiss: (teammateName: string) => void;
  onLike: (teammate: Teammate) => void;
}) {
  return (
    <PanelCard>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-lg font-black text-zinc-950">{teammate.name}</p>
          <p className="text-sm font-bold text-zinc-500">{teammate.school}</p>
        </div>
        <span className="rounded-full bg-[#00a7e8]/15 px-3 py-1 text-xs font-black text-[#006c9c]">
          {teammate.match} match
        </span>
      </div>
      <p className="mt-4 text-sm font-black text-zinc-800">{teammate.role}</p>
      <p className="mt-2 text-sm font-medium leading-6 text-zinc-600">
        {teammate.goal}
      </p>
      <div className="mt-4 grid gap-2 text-sm font-bold text-zinc-600 sm:grid-cols-2">
        <span>{teammate.stack}</span>
        <span>{teammate.availability}</span>
      </div>
      <div className="mt-5 flex gap-2">
        <button
          onClick={() => onDismiss(teammate.name)}
          className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md border-2 border-zinc-950 bg-white text-sm font-black text-zinc-800"
        >
          <X className="size-4" /> Pass
        </button>
        <button
          onClick={() => onLike(teammate)}
          className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md bg-[#ffd21f] text-sm font-black text-zinc-950"
        >
          <Heart className="size-4" /> Like
        </button>
      </div>
    </PanelCard>
  );
}
