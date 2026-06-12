import {
  CalendarDays,
  ChevronRight,
  Filter,
  Heart,
  Medal,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import { formats, themes } from "../config";
import type { Hackathon } from "@/lib/sample-data";
import type { ParticipantTab, PortfolioProfile, Teammate } from "../types";
import { HackathonCard } from "../cards";
import { FeaturePanel, SectionTitle, StatCard } from "../ui";
import { PortfolioView } from "./portfolio-view";
import { TeamView } from "./team-view";

export function ParticipantView({
  activeTab,
  setActiveTab,
  query,
  setQuery,
  format,
  setFormat,
  theme,
  setTheme,
  filteredHackathons,
  featuredHackathon,
  savedHackathonIds,
  onToggleSave,
  visibleTeammates,
  likedTeammates,
  showMatches,
  setShowMatches,
  onDismissTeammate,
  onLikeTeammate,
  portfolioProfile,
}: {
  activeTab: ParticipantTab;
  setActiveTab: (tab: ParticipantTab) => void;
  query: string;
  setQuery: (query: string) => void;
  format: (typeof formats)[number];
  setFormat: (format: (typeof formats)[number]) => void;
  theme: (typeof themes)[number];
  setTheme: (theme: (typeof themes)[number]) => void;
  filteredHackathons: Hackathon[];
  featuredHackathon: Hackathon | null;
  savedHackathonIds: string[];
  onToggleSave: (hackathonId: string) => void;
  visibleTeammates: Teammate[];
  likedTeammates: Teammate[];
  showMatches: boolean;
  setShowMatches: (showMatches: boolean) => void;
  onDismissTeammate: (teammateName: string) => void;
  onLikeTeammate: (teammate: Teammate) => void;
  portfolioProfile?: PortfolioProfile;
}) {
  if (activeTab === "team")
    return (
      <TeamView
        visibleTeammates={visibleTeammates}
        likedTeammates={likedTeammates}
        showMatches={showMatches}
        setShowMatches={setShowMatches}
        onDismissTeammate={onDismissTeammate}
        onLikeTeammate={onLikeTeammate}
      />
    );
  if (activeTab === "portfolio")
    return <PortfolioView profile={portfolioProfile} />;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <FeaturePanel className="p-5 sm:p-6">
          <p className="inline-flex items-center gap-2 rounded-full bg-[#ffd21f] px-3 py-1 text-xs font-black text-zinc-950">
            <Sparkles className="size-3.5" /> Participant mode
          </p>
          <h1 className="mt-4 max-w-3xl text-3xl font-black tracking-tight text-zinc-950 sm:text-5xl">
            Find hackathons without waiting for the algorithm.
          </h1>
          <p className="mt-4 max-w-2xl text-base font-medium leading-7 text-zinc-600">
            Explore verified Philippine hackathons, save events, find teammates,
            and turn every build into portfolio proof.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <StatCard label="Open listings" value="24" icon={CalendarDays} />
            <StatCard label="LFT profiles" value="185" icon={Users} />
            <StatCard label="Verified wins" value="73" icon={Medal} />
          </div>
        </FeaturePanel>
        <FeaturePanel className="bg-zinc-950 p-5 text-white sm:p-6">
          <p className="text-sm font-black text-[#ffd21f]">
            Featured closing soon
          </p>
          <h2 className="mt-3 text-2xl font-black">
            {featuredHackathon?.name ?? "No featured listing yet"}
          </h2>
          <p className="mt-3 text-sm font-medium leading-6 text-zinc-300">
            {featuredHackathon
              ? `${featuredHackathon.lftCount} people are looking for teammates. ${featuredHackathon.deadline}.`
              : "No featured listing yet."}
          </p>
          <div className="mt-6 space-y-3">
            {[
              ["Create teammate card", Users],
              ["Swipe for mutual matches", Heart],
              ["Register externally", ChevronRight],
            ].map(([item, Icon]) => (
              <button
                key={item as string}
                onClick={() =>
                  (item === "Create teammate card" ||
                    item === "Swipe for mutual matches") &&
                  setActiveTab("team")
                }
                className="flex w-full items-center gap-3 rounded-md bg-white/10 px-3 py-2 text-left text-sm font-bold hover:bg-white/15"
              >
                <Icon className="size-4 text-[#00a7e8]" /> {item as string}
              </button>
            ))}
          </div>
        </FeaturePanel>
      </div>

      <section className="rounded-lg border-2 border-zinc-950 bg-white p-4 shadow-[5px_5px_0_#111]">
        <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px]">
          <label className="relative block">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, organizer, location, or theme"
              className="h-11 w-full rounded-md border-2 border-zinc-200 bg-white pl-10 pr-3 text-sm font-medium outline-none focus:border-[#00a7e8]"
            />
          </label>
          <select
            value={format}
            onChange={(event) => setFormat(event.target.value as typeof format)}
            className="h-11 rounded-md border-2 border-zinc-200 bg-white px-3 text-sm font-bold outline-none focus:border-[#00a7e8]"
          >
            {formats.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <select
            value={theme}
            onChange={(event) => setTheme(event.target.value as typeof theme)}
            className="h-11 rounded-md border-2 border-zinc-200 bg-white px-3 text-sm font-bold outline-none focus:border-[#00a7e8]"
          >
            {themes.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>
      </section>

      <SectionTitle
        eyebrow="Explore"
        title={`${filteredHackathons.length} hackathons match your filters`}
        action={
          <button className="inline-flex h-10 items-center gap-2 rounded-md border-2 border-zinc-950 bg-white px-3 text-sm font-black text-zinc-800 shadow-[3px_3px_0_#111]">
            <Filter className="size-4" /> More filters
          </button>
        }
      />
      <section className="grid gap-4">
        {filteredHackathons.map((hackathon) => (
          <HackathonCard
            key={hackathon.id}
            hackathon={hackathon}
            isSaved={savedHackathonIds.includes(hackathon.id)}
            onToggleSave={onToggleSave}
          />
        ))}
      </section>
    </div>
  );
}
