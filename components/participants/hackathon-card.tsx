import {
  Award,
  Bookmark,
  CalendarDays,
  ChevronRight,
  MapPin,
  Users,
} from "lucide-react";
import type { Hackathon } from "@/lib/sample-data";
import { PanelCard, StatusPill, statusClass } from "@/components/shared/primitives";

export function HackathonCard({
  hackathon,
  isSaved,
  onToggleSave,
}: {
  hackathon: Hackathon;
  isSaved: boolean;
  onToggleSave: (hackathonId: string) => void;
}) {
  return (
    <PanelCard className="border-zinc-900 p-4" hover>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill className={statusClass(hackathon.status)}>
              {hackathon.status}
            </StatusPill>
            <span className="rounded-full border border-zinc-300 bg-zinc-50 px-2.5 py-1 text-xs font-bold text-zinc-700">
              {hackathon.difficulty}
            </span>
          </div>
          <h3 className="mt-3 text-xl font-black text-zinc-950">
            {hackathon.name}
          </h3>
          <p className="mt-1 text-sm font-bold text-zinc-600">
            {hackathon.organizer}
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
            {hackathon.summary}
          </p>
          <div className="mt-4 grid gap-2 text-sm font-medium text-zinc-600 sm:grid-cols-2 xl:grid-cols-4">
            <span className="flex items-center gap-2">
              <CalendarDays className="size-4 text-[#00a7e8]" />
              {hackathon.date}
            </span>
            <span className="flex items-center gap-2">
              <MapPin className="size-4 text-[#00a7e8]" />
              {hackathon.format} · {hackathon.location}
            </span>
            <span className="flex items-center gap-2">
              <Users className="size-4 text-[#00a7e8]" />
              Team {hackathon.teamSize}
            </span>
            <span className="flex items-center gap-2">
              <Award className="size-4 text-[#00a7e8]" />
              {hackathon.prize}
            </span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {hackathon.themes.map((theme) => (
              <span
                key={theme}
                className="rounded-md bg-[#00a7e8]/10 px-2 py-1 text-xs font-black text-[#006c9c]"
              >
                {theme}
              </span>
            ))}
            {hackathon.eligibility.slice(0, 2).map((item) => (
              <span
                key={item}
                className="rounded-md bg-[#ffd21f]/20 px-2 py-1 text-xs font-black text-[#7a5700]"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="flex shrink-0 flex-row gap-2 lg:w-44 lg:flex-col">
          <button className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md bg-zinc-950 px-3 text-sm font-black text-white hover:bg-zinc-800">
            Details <ChevronRight className="size-4" />
          </button>
          <button
            onClick={() => onToggleSave(hackathon.id)}
            className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md border-2 border-zinc-900 bg-white px-3 text-sm font-black text-zinc-800 hover:bg-[#ffd21f]/20"
          >
            <Bookmark className="size-4" /> {isSaved ? "Saved" : "Save"}
          </button>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3 border-t-2 border-zinc-100 pt-4 text-xs font-bold text-zinc-500">
        <span>{hackathon.deadline}</span>
        <span className="h-1 w-1 rounded-full bg-zinc-300" />
        <span>{hackathon.interested} interested</span>
        <span className="h-1 w-1 rounded-full bg-zinc-300" />
        <span>{hackathon.lftCount} looking for teammates</span>
      </div>
    </PanelCard>
  );
}
