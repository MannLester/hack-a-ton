"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Award,
  ArrowLeft,
  CalendarDays,
  Clock,
  Filter,
  MapPin,
  Search,
  Users,
} from "lucide-react";
import type { Hackathon } from "@/lib/sample-data";
import { getListingUpdateLabel } from "@/lib/organizer-workflow";
import { setup, statuses, difficulties, locations } from "@/components/shared/config";
import type { HackathonTeam } from "@/components/shared/types";
import { PanelCard, StatusPill, statusClass } from "@/components/shared/primitives";
import { DetailPageNav } from "@/components/shared/detail-page-nav";

function FilterChips<T extends string>({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string;
  readonly options: readonly T[];
  selected: T;
  onSelect: (value: T) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-black uppercase tracking-wider text-zinc-500">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onSelect(option)}
            className={`rounded-full border-2 px-3 py-1 text-xs font-black transition-all ${
              selected === option
                ? "border-zinc-950 bg-zinc-950 text-white"
                : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-950"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

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
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [setupFilter, setSetupFilter] = useState<(typeof setup)[number]>("All");
  const [statusFilter, setStatusFilter] = useState<(typeof statuses)[number]>("All");
  const [difficultyFilter, setDifficultyFilter] = useState<(typeof difficulties)[number]>("All");
  const [locationFilter, setLocationFilter] = useState<(typeof locations)[number]>("All");

  const filteredHackathons = useMemo(
    () =>
      allHackathons.filter((h) => {
        const matchesQuery = [h.name, h.organizer, h.location, h.summary]
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase());
        const matchesSetup = setupFilter === "All" || h.setup === setupFilter;
        const matchesStatus = statusFilter === "All" || h.status === statusFilter;
        const matchesDifficulty = difficultyFilter === "All" || h.difficulty === difficultyFilter;
        const matchesLocation = locationFilter === "All" || h.region === locationFilter || h.region === "Philippines-wide";
        return matchesQuery && matchesSetup && matchesStatus && matchesDifficulty && matchesLocation;
      }),
    [allHackathons, query, setupFilter, statusFilter, difficultyFilter, locationFilter],
  );

  const updateLabel = getListingUpdateLabel({
    updatedAt: hackathon.updatedAt,
    now: Date.now(),
  });

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
            <div className="hidden lg:block">
              <h1 className="text-4xl font-black tracking-tight text-zinc-950 sm:text-5xl">
                Explore Hackathons
              </h1>
              <p className="mt-2 max-w-2xl text-base font-medium leading-7 text-zinc-500">
                Find your next hackathon, discover teammates, and build together.
              </p>
            </div>
          </div>

          <section className="hidden lg:block rounded-lg border-2 border-zinc-950 bg-white p-4 shadow-[5px_5px_0_#111]">
            <div className="flex gap-3">
              <label className="relative block flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search by name, organizer, location, or eligibility"
                  className="h-11 w-full rounded-md border-2 border-zinc-200 bg-white pl-10 pr-3 text-sm font-medium outline-none focus:border-[#00a7e8]"
                />
              </label>
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex size-11 shrink-0 items-center justify-center rounded-md border-2 border-zinc-950 shadow-[3px_3px_0_#111] transition-all hover:shadow-[1px_1px_0_#111] hover:translate-x-[2px] hover:translate-y-[2px] ${
                  showFilters ? "bg-zinc-950 text-white" : "bg-white"
                }`}
              >
                <Filter className="size-4" />
              </button>
            </div>
            {showFilters && (
              <div className="mt-4 space-y-3 border-t-2 border-zinc-100 pt-4">
                <FilterChips label="Setup" options={setup} selected={setupFilter} onSelect={setSetupFilter} />
                <FilterChips label="Status" options={statuses} selected={statusFilter} onSelect={setStatusFilter} />
                <FilterChips label="Difficulty" options={difficulties} selected={difficultyFilter} onSelect={setDifficultyFilter} />
                <FilterChips label="Location" options={locations} selected={locationFilter} onSelect={setLocationFilter} />
              </div>
            )}
          </section>

          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            <aside className="hidden order-2 lg:block lg:order-1 lg:sticky lg:top-6 lg:self-start">
              <h2 className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-[#00a7e8]">
                All Hackathons
              </h2>
              <div className="space-y-2">
                {filteredHackathons.map((h) => {
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
                  {updateLabel && hackathon.status !== "Cancelled" ? (
                    <span className="rounded-md border-2 border-[#00a7e8]/30 bg-[#00a7e8]/10 px-2.5 py-1 text-xs font-black text-[#006c9c]">
                      {updateLabel}
                    </span>
                  ) : null}
                </div>

                <h1 className="mt-4 text-3xl font-black tracking-tight text-zinc-950 sm:text-4xl">
                  {hackathon.name}
                </h1>
                <p className="mt-2 text-lg font-bold text-zinc-500">
                  {hackathon.organizer}
                </p>

                {hackathon.status === "Cancelled" && hackathon.cancellationReason ? (
                  <div className="mt-5 rounded-lg border-2 border-red-300 bg-red-50 p-4 text-red-900">
                    <p className="inline-flex items-center gap-2 font-black">
                      <AlertTriangle className="size-5" /> Cancelled by organizer
                    </p>
                    <p className="mt-2 text-sm font-bold leading-6">
                      {hackathon.cancellationReason}
                    </p>
                  </div>
                ) : null}

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
                  <div className="rounded-lg border-2 border-zinc-950 bg-white p-5 text-center shadow-[4px_4px_0_#111]">
                    <p className="text-3xl font-black text-zinc-950">
                      {hackathon.interested}
                    </p>
                    <p className="mt-1 text-sm font-bold text-zinc-500">Interested</p>
                  </div>
                  <div className="rounded-lg border-2 border-zinc-950 bg-white p-5 text-center shadow-[4px_4px_0_#111]">
                    <p className="text-3xl font-black text-zinc-950">
                      {hackathon.lftCount}
                    </p>
                    <p className="mt-1 text-sm font-bold text-zinc-500">
                      Looking for Teammates
                    </p>
                  </div>
                  <div className="rounded-lg border-2 border-zinc-950 bg-white p-5 text-center shadow-[4px_4px_0_#111]">
                    <p className="text-3xl font-black text-zinc-950">
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
                            {team.currentSize} / {team.targetSize}
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
