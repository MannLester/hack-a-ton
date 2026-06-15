"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { ArrowLeft, Filter, Search } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { getUiHackathon } from "@/components/data/adapters";
import { getListingDataSourceItems } from "@/lib/listing-data-source";
import { HackathonCard } from "@/components/participants/hackathon-card";
import { AppNavigation } from "@/components/shared/app-navigation";
import { setup, statuses, difficulties, locations } from "@/components/shared/config";
import type { Persona, UiHackathon } from "@/components/shared/types";

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
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
      <span className="text-xs font-black uppercase tracking-wider text-zinc-500">
        {label}
      </span>
      <div className="flex flex-wrap gap-1 sm:gap-1.5">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onSelect(option)}
            className={`rounded-full border-2 px-2.5 py-0.5 text-[11px] font-black transition-all sm:px-3 sm:py-1 sm:text-xs ${
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

function filterHackathons({
  hackathonsToFilter,
  query,
  setupFilter,
  statusFilter,
  difficultyFilter,
  locationFilter,
}: {
  hackathonsToFilter: UiHackathon[];
  query: string;
  setupFilter: (typeof setup)[number];
  statusFilter: (typeof statuses)[number];
  difficultyFilter: (typeof difficulties)[number];
  locationFilter: (typeof locations)[number];
}) {
  return hackathonsToFilter.filter((hackathon) => {
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
    const matchesLocation =
      locationFilter === "All" ||
      hackathon.region === locationFilter ||
      hackathon.region === "Philippines-wide";

    return matchesQuery && matchesSetup && matchesStatus && matchesDifficulty && matchesLocation;
  });
}

function ExploreContent({
  sourceHackathons,
  isLoading,
}: {
  sourceHackathons: UiHackathon[];
  isLoading: boolean;
}) {
  const [persona, setPersona] = useState<Persona>("participant");
  const [query, setQuery] = useState("");
  const [setupFilter, setSetupFilter] = useState<(typeof setup)[number]>("All");
  const [statusFilter, setStatusFilter] = useState<(typeof statuses)[number]>("All");
  const [difficultyFilter, setDifficultyFilter] = useState<(typeof difficulties)[number]>("All");
  const [locationFilter, setLocationFilter] = useState<(typeof locations)[number]>("All");
  const [showFilters, setShowFilters] = useState(false);

  const filteredHackathons = useMemo(
    () =>
      filterHackathons({
        hackathonsToFilter: sourceHackathons,
        query,
        setupFilter,
        statusFilter,
        difficultyFilter,
        locationFilter,
      }),
    [query, setupFilter, statusFilter, difficultyFilter, locationFilter, sourceHackathons],
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
          <div className="flex items-center gap-3 sm:gap-5">
            <Link
              href="/"
              aria-label="Back to home"
              className="hidden shrink-0 items-center justify-center rounded-md border-2 border-zinc-950 bg-white text-zinc-800 shadow-[3px_3px_0_#111] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#111] sm:inline-flex sm:size-10"
            >
              <ArrowLeft className="size-4" />
            </Link>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-zinc-950 sm:text-4xl lg:text-5xl">
                Explore Hackathons
              </h1>
              <p className="mt-2 max-w-2xl text-base font-medium leading-7 text-zinc-500">
                Browse all upcoming hackathons, discover opportunities, and find
                your next build.
              </p>
            </div>
          </div>

          <section className="rounded-lg border-2 border-zinc-950 bg-white p-3 shadow-[5px_5px_0_#111] sm:p-4">
            <div className="flex gap-3">
              <label className="relative block flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search by name, organizer, location, or eligibility"
                  className="h-10 w-full rounded-md border-2 border-zinc-200 bg-white pl-10 pr-3 text-sm font-medium outline-none focus:border-[#00a7e8] sm:h-11"
                />
              </label>
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex size-10 shrink-0 items-center justify-center rounded-md border-2 border-zinc-950 shadow-[3px_3px_0_#111] transition-all hover:shadow-[1px_1px_0_#111] hover:translate-x-[2px] hover:translate-y-[2px] sm:size-11 ${
                  showFilters ? "bg-zinc-950 text-white" : "bg-white"
                }`}
              >
                <Filter className="size-4" />
              </button>
            </div>
            {showFilters ? (
              <div className="mt-3 space-y-1.5 border-t-2 border-zinc-100 pt-3 sm:mt-4 sm:space-y-2 sm:pt-4">
                <FilterChips label="Setup" options={setup} selected={setupFilter} onSelect={setSetupFilter} />
                <FilterChips label="Status" options={statuses} selected={statusFilter} onSelect={setStatusFilter} />
                <FilterChips label="Difficulty" options={difficulties} selected={difficultyFilter} onSelect={setDifficultyFilter} />
                <FilterChips label="Location" options={locations} selected={locationFilter} onSelect={setLocationFilter} />
              </div>
            ) : null}
          </section>

          <section className="grid gap-3 sm:grid-cols-2 sm:gap-4">
            {filteredHackathons.map((hackathon) => (
              <HackathonCard key={hackathon.id} hackathon={hackathon} />
            ))}
          </section>
          {!isLoading && filteredHackathons.length === 0 ? (
            <section className="rounded-lg border-2 border-zinc-950 bg-white p-6 shadow-[5px_5px_0_#111]">
              <p className="font-black text-zinc-950">No hackathons found</p>
              <p className="mt-1 text-sm font-bold leading-6 text-zinc-500">
                Try adjusting the filters or check again when organizers publish new listings.
              </p>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ConvexAllHackathonsView() {
  const convexHackathons = useQuery(api.hackathons.listPublished, {});
  const sourceHackathons = getListingDataSourceItems({
    convexItems: convexHackathons?.map(getUiHackathon),
  });

  return (
    <ExploreContent
      sourceHackathons={sourceHackathons}
      isLoading={convexHackathons === undefined}
    />
  );
}

export function AllHackathonsView() {
  if (process.env.NEXT_PUBLIC_CONVEX_URL) return <ConvexAllHackathonsView />;

  return <ExploreContent sourceHackathons={[]} isLoading={false} />;
}
