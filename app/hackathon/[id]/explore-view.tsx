import Link from "next/link";
import {
  Award,
  ArrowLeft,
  CalendarDays,
  Clock,
  MapPin,
  Users,
} from "lucide-react";
import type { Hackathon } from "@/lib/sample-data";
import type { HackathonTeam } from "@/components/shared/types";
import { PanelCard, StatusPill, statusClass } from "@/components/shared/primitives";
import { DetailPageNav } from "@/components/shared/detail-page-nav";

export function ExploreView({
  id,
  hackathon,
  allHackathons,
  teams = [],
}: {
  id: string;
  hackathon: Hackathon;
  allHackathons: Hackathon[];
  teams?: HackathonTeam[];
}) {
  return (
    <div className="min-h-screen bg-[#f5f3ef]">
      <DetailPageNav />
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="flex items-center gap-5">
            <Link
              href="/explore"
              aria-label="Back to Explore"
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-md border-2 border-zinc-950 bg-white text-zinc-800 shadow-[3px_3px_0_#111] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#111]"
            >
              <ArrowLeft className="size-4" />
            </Link>
            <div>
              <h1 className="text-4xl font-black tracking-tight text-zinc-950 sm:text-5xl">
                Explore Hackathons
              </h1>
              <p className="mt-2 max-w-2xl text-base font-medium leading-7 text-zinc-500">
                Find your next hackathon, discover teammates, and build together.
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            <aside className="order-2 lg:order-1 lg:sticky lg:top-6 lg:self-start">
              <h2 className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-[#00a7e8]">
                All Hackathons
              </h2>
              <div className="space-y-2">
                {allHackathons.map((h) => {
                  const isSelected = h.id === id;
                  return (
                    <Link
                      key={h.id}
                      href={`/hackathon/${h.id}`}
                      className={`block rounded-lg border-2 p-3 transition-all ${
                        isSelected
                          ? "border-[#00a7e8] bg-[#00a7e8]/5 shadow-[3px_3px_0_#00a7e8]"
                          : "border-zinc-200 bg-white hover:border-zinc-950 hover:shadow-[3px_3px_0_#111]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <StatusPill className={statusClass(h.status)}>
                          {h.status}
                        </StatusPill>
                        {isSelected && (
                          <span className="text-[10px] font-black uppercase tracking-wider text-[#00a7e8]">
                            Viewing
                          </span>
                        )}
                      </div>
                      <h3 className="mt-2 text-sm font-black text-zinc-950">
                        {h.name}
                      </h3>
                      <div className="mt-1.5 flex flex-wrap gap-1.5 text-[11px] font-bold text-zinc-500">
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays className="size-3 text-[#00a7e8]" />
                          {h.date}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="size-3 text-[#00a7e8]" />
                          {h.setup}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </aside>

            <main className="order-1 space-y-6 lg:order-2 lg:pt-7">
              <PanelCard className="border-zinc-950 p-6">
                <div className="flex flex-wrap items-center gap-3">
                  <StatusPill className={statusClass(hackathon.status)}>
                    {hackathon.status}
                  </StatusPill>
                  <span className="rounded-md border-2 border-zinc-950 bg-zinc-100 px-2.5 py-1 text-xs font-black text-zinc-700">
                    {hackathon.difficulty}
                  </span>
                </div>

                <h1 className="mt-4 text-3xl font-black tracking-tight text-zinc-950 sm:text-4xl">
                  {hackathon.name}
                </h1>
                <p className="mt-2 text-lg font-bold text-zinc-500">
                  {hackathon.organizer}
                </p>

                <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-600">
                  {hackathon.summary}
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full border-2 border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-bold text-zinc-700">
                    <CalendarDays className="size-4 text-[#00a7e8]" />
                    {hackathon.date}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border-2 border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-bold text-zinc-700">
                    <MapPin className="size-4 text-[#00a7e8]" />
                    {hackathon.setup} · {hackathon.location}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border-2 border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-bold text-zinc-700">
                    <Users className="size-4 text-[#00a7e8]" />
                    Team {hackathon.teamSize}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border-2 border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-bold text-zinc-700">
                    <Award className="size-4 text-[#00a7e8]" />
                    {hackathon.prize}
                  </span>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  {hackathon.eligibility.map((item) => (
                    <span
                      key={item}
                      className="rounded-md border border-[#ffd21f]/30 bg-[#ffd21f]/20 px-3 py-1.5 text-sm font-black text-[#7a5700]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </PanelCard>

              <PanelCard className="border-zinc-950 p-6">
                <h2 className="text-lg font-black text-zinc-950">Stats</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-lg border-2 border-zinc-200 bg-zinc-50 p-4 text-center">
                    <p className="text-2xl font-black text-zinc-950">
                      {hackathon.interested}
                    </p>
                    <p className="mt-1 text-sm font-bold text-zinc-500">Interested</p>
                  </div>
                  <div className="rounded-lg border-2 border-zinc-200 bg-zinc-50 p-4 text-center">
                    <p className="text-2xl font-black text-zinc-950">
                      {hackathon.lftCount}
                    </p>
                    <p className="mt-1 text-sm font-bold text-zinc-500">
                      Looking for Teammates
                    </p>
                  </div>
                  <div className="rounded-lg border-2 border-zinc-200 bg-zinc-50 p-4 text-center">
                    <p className="inline-flex items-center gap-2 text-2xl font-black text-zinc-950">
                      <Clock className="size-5 text-[#00a7e8]" />
                      {hackathon.deadline}
                    </p>
                    <p className="mt-1 text-sm font-bold text-zinc-500">Deadline</p>
                  </div>
                </div>
              </PanelCard>

              <PanelCard className="border-zinc-950 p-6">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-black text-zinc-950">
                    Teams for this hackathon
                  </h2>
                  <span className="rounded-full bg-[#00a7e8]/15 px-2.5 py-1 text-xs font-black text-[#006c9c]">
                    {teams.length} teams
                  </span>
                </div>
                {teams.length > 0 ? (
                  <div className="mt-4 grid gap-3">
                    {teams.map((team) => (
                      <div
                        key={team._id}
                        className="rounded-lg border-2 border-zinc-950 bg-white p-4 shadow-[3px_3px_0_#111]"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h3 className="text-base font-black text-zinc-950">
                              {team.teamName}
                            </h3>
                            {team.goal && (
                              <p className="mt-1 text-sm font-medium leading-6 text-zinc-600">
                                {team.goal}
                              </p>
                            )}
                          </div>
                          <span className="rounded-full bg-[#ffd21f]/25 px-2.5 py-1 text-xs font-black text-[#7a5700]">
                            {team.members.length} / {team.targetSize}
                          </span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {team.memberProfiles.map((member) => (
                            <span
                              key={member.userId}
                              className="inline-flex items-center gap-2 rounded-full border-2 border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-black text-zinc-700"
                            >
                              <span className="flex size-6 items-center justify-center rounded-full bg-[#00a7e8]/15 text-[10px] text-[#006c9c]">
                                {member.initials}
                              </span>
                              {member.displayName}
                              {member.isLead && (
                                <span className="text-[#7a5700]">Lead</span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50 p-5 text-sm font-bold text-zinc-500">
                    No teams are connected to this hackathon yet.
                  </div>
                )}
              </PanelCard>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
