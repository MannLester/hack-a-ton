import { ArrowLeft } from "lucide-react";

export function BackToExploreButton({ onBack }: { onBack: () => void }) {
  return (
    <button
      onClick={onBack}
      aria-label="Back to explore"
      className="inline-flex size-10 shrink-0 items-center justify-center rounded-md border-2 border-zinc-950 bg-white text-zinc-800 shadow-[3px_3px_0_#111] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#111]"
    >
      <ArrowLeft className="size-4" />
    </button>
  );
}
