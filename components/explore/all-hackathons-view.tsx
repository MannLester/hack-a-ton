"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Filter, Search } from "lucide-react";
import { hackathons } from "@/lib/sample-data";
import { HackathonCard } from "@/components/participants/hackathon-card";
import { AppNavigation } from "@/components/shared/app-navigation";
import { setup, statuses, difficulties, locations } from "@/components/shared/config";
import type { Persona } from "@/components/shared/types";

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

export function AllHackathonsView() {
  const [persona, setPersona] = useState<Persona>("participant");
  const [query, setQuery] = useState("");
  const [setupFilter, setSetupFilter] = useState<(typeof setup)[number]>("All");
  const [statusFilter, setStatusFilter] = useState<(typeof statuses)[number]>("All");
  const [difficultyFilter, setDifficultyFilter] = useState<(typeof difficulties)[number]>("All");
  const [locationFilter, setLocationFilter] = useState<(typeof locations)[number]>("All");
  const [showFilters, setShowFilters] = useState(false);

  const filteredHackathons = useMemo(
    () =>
      hackathons.filter((hackathon) => {
        const matchesQuery = [
          hackathon.name,
          hackathon.organizer,
          hackathon.location,
          hackathon.summary,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase());
        const matchesSetup = setupFilter === "All" || hackathon.setup === setupFilter;
        const matchesStatus = statusFilter === "All" || hackathon.status === statusFilter;
        const matchesDifficulty = difficultyFilter === "All" || hackathon.difficulty === difficultyFilter;
        const matchesLocation = locationFilter === "All" || hackathon.region === locationFilter || hackathon.region === "Philippines-wide";

        return matchesQuery && matchesSetup && matchesStatus && matchesDifficulty && matchesLocation;
      }),
    [query, setupFilter, statusFilter, difficultyFilter, locationFilter],
  );

  return (
    <div className="min-h-screen bg-[#f5f3ef]">
      <AppNavigation
        persona={persona}
        setPersona={setPersona}
        setParticipantTab={() => {}}
      />
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <nav className="flex items-center gap-2 text-sm font-bold text-zinc-600">
            <Link href="/" className="hover:text-zinc-950">
              Home
            </Link>
            <span>/</span>
            <span className="text-zinc-950">Explore</span>
          </nav>

          <div>
            <h1 className="text-4xl font-black tracking-tight text-zinc-950 sm:text-5xl">
              Explore Hackathons
            </h1>
            <p className="mt-2 max-w-2xl text-base font-medium leading-7 text-zinc-500">
              Browse all upcoming hackathons, discover opportunities, and find
              your next build.
            </p>
          </div>

          <section className="rounded-lg border-2 border-zinc-950 bg-white p-4 shadow-[5px_5px_0_#111]">
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
                <FilterChips
                  label="Setup"
                  options={setup}
                  selected={setupFilter}
                  onSelect={setSetupFilter}
                />
                <FilterChips
                  label="Status"
                  options={statuses}
                  selected={statusFilter}
                  onSelect={setStatusFilter}
                />
                <FilterChips
                  label="Difficulty"
                  options={difficulties}
                  selected={difficultyFilter}
                  onSelect={setDifficultyFilter}
                />
                <FilterChips
                  label="Location"
                  options={locations}
                  selected={locationFilter}
                  onSelect={setLocationFilter}
                />
              </div>
            )}
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            {filteredHackathons.map((hackathon) => (
              <HackathonCard key={hackathon.id} hackathon={hackathon} />
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}
