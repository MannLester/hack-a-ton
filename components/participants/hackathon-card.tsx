import Link from "next/link";
import {
  Award,
  CalendarDays,
  Clock,
  Heart,
  MapPin,
  Users,
} from "lucide-react";
import type { Hackathon } from "@/lib/sample-data";
import { PanelCard, StatusPill, statusClass } from "@/components/shared/primitives";

export function HackathonCard({
  hackathon,
}: {
  hackathon: Hackathon;
}) {
  return (
    <Link href={`/hackathon/${hackathon.id}`} className="block h-full">
      <PanelCard className="flex h-full flex-col cursor-pointer border-zinc-950 p-5" hover>
        <div className="flex flex-col gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill className={statusClass(hackathon.status)}>
                {hackathon.status}
              </StatusPill>
              <span className="rounded-md border-2 border-zinc-950 bg-zinc-100 px-2.5 py-1 text-xs font-black text-zinc-700">
                {hackathon.difficulty}
              </span>
            </div>
            <h3 className="mt-3 text-xl font-black tracking-tight text-zinc-950">
              {hackathon.name}
            </h3>
            <p className="mt-1 text-sm font-bold text-zinc-500">
              {hackathon.organizer}
            </p>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600 line-clamp-2">
              {hackathon.summary}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-bold text-zinc-700">
                <CalendarDays className="size-3.5 text-[#00a7e8]" />
                {hackathon.date}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-bold text-zinc-700">
                <MapPin className="size-3.5 text-[#00a7e8]" />
                {hackathon.setup} · {hackathon.location}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-bold text-zinc-700">
                <Users className="size-3.5 text-[#00a7e8]" />
                Team {hackathon.teamSize}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-bold text-zinc-700">
                <Award className="size-3.5 text-[#00a7e8]" />
                {hackathon.prize}
              </span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 line-clamp-1">
              {hackathon.eligibility.slice(0, 2).map((item) => (
                <span
                  key={item}
                  className="rounded-md border border-[#ffd21f]/30 bg-[#ffd21f]/20 px-2 py-1 text-xs font-black text-[#7a5700]"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-auto flex flex-wrap items-center gap-4 border-t-2 border-zinc-100 pt-4 text-xs font-bold text-zinc-500">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-3.5" />
            {hackathon.deadline}
          </span>
          <span className="h-1 w-1 rounded-full bg-zinc-300" />
          <span className="inline-flex items-center gap-1.5">
            <Heart className="size-3.5" />
            {hackathon.interested} interested
          </span>
          <span className="h-1 w-1 rounded-full bg-zinc-300" />
          <span className="inline-flex items-center gap-1.5">
            <Users className="size-3.5" />
            {hackathon.lftCount} looking for teammates
          </span>
        </div>
      </PanelCard>
    </Link>
  );
}
