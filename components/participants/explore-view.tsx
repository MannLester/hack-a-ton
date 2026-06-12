import { useState } from "react";
import {
  CalendarDays,
  Filter,
  Heart,
  Medal,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import { formats, themes } from "@/components/shared/config";
import type { Hackathon } from "@/lib/sample-data";
import type { ParticipantTab, PortfolioProfile, Teammate } from "@/components/shared/types";
import { HackathonCard } from "@/components/participants/hackathon-card";
import { FeaturePanel, SectionTitle, StatCard } from "@/components/shared/primitives";
import { PortfolioView } from "@/components/participants/portfolio-view";
import { TeamView } from "@/components/participants/team-builder-view";

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
  const [initialTeamPhase, setInitialTeamPhase] = useState<
    "solo_swiping" | "creating_card"
  >("solo_swiping");

  if (activeTab === "team")
    return (
      <TeamView
        visibleTeammates={visibleTeammates}
        likedTeammates={likedTeammates}
        showMatches={showMatches}
        setShowMatches={setShowMatches}
        onDismissTeammate={onDismissTeammate}
        onLikeTeammate={onLikeTeammate}
        hackathons={filteredHackathons}
        onBack={() => setActiveTab("explore")}
        initialPhase={initialTeamPhase}
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
        <FeaturePanel className="bg-zinc-950 p-4 text-white sm:p-5">
          <p className="text-sm font-black text-[#ffd21f]">
            Start building together
          </p>
          <h2 className="mt-2 text-2xl font-black">Team Up Now</h2>
          <p className="mt-1.5 text-sm font-medium leading-6 text-zinc-300">
            Connect with builders and form your dream team.
          </p>
          <div className="mt-5 space-y-2.5">
            <button
              onClick={() => {
                setInitialTeamPhase("creating_card");
                setActiveTab("team");
              }}
              className="flex w-full items-center gap-3 rounded-lg bg-gradient-to-r from-[#00a7e8] to-[#0090c8] px-4 py-5 text-left shadow-lg shadow-[#00a7e8]/30 transition-all duration-200 hover:from-[#0090c8] hover:to-[#007ab0] hover:shadow-xl hover:shadow-[#00a7e8]/40"
            >
              <Users className="size-5 shrink-0 text-white" />
              <div>
                <span className="block text-base font-bold text-white">Create Card</span>
                <span className="block text-xs font-medium text-white/80">Build your LFT profile</span>
              </div>
            </button>
            <button
              onClick={() => {
                setInitialTeamPhase("solo_swiping");
                setActiveTab("team");
              }}
              className="flex w-full items-center gap-3 rounded-lg border-2 border-[#00a7e8] px-4 py-5 text-left shadow-lg shadow-[#00a7e8]/20 transition-all duration-200 hover:bg-gradient-to-r hover:from-[#00a7e8]/10 hover:to-[#00a7e8]/5 hover:shadow-xl hover:shadow-[#00a7e8]/30"
            >
              <Heart className="size-5 shrink-0 text-[#00a7e8]" />
              <div>
                <span className="block text-base font-bold text-[#00a7e8]">Find Team</span>
                <span className="block text-xs font-medium text-[#00a7e8]/80">Swipe to match with teams</span>
              </div>
            </button>
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
