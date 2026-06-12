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
            <Sparkles className="size-3.5" /> Discover & Connect
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-tight text-zinc-950 sm:text-6xl">
            Hack-a-Ton,<br />Win-a-Ton
          </h1>
          <p className="mt-4 max-w-2xl text-base font-medium leading-7 text-zinc-600">
            Discover hackathons, find teammates, and build your portfolio.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <StatCard label="Hackathons Listed" value="24" icon={CalendarDays} />
            <StatCard label="Active Builders" value="185" icon={Users} />
            <StatCard label="Teams Formed" value="73" icon={Medal} />
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
          <div className="mt-5 space-y-4">
            <button
              onClick={() => {
                setInitialTeamPhase("creating_card");
                setActiveTab("team");
              }}
              className="flex w-full items-center gap-3 rounded-lg bg-gradient-to-r from-[#00a7e8] to-[#0090c8] px-4 py-6 text-left shadow-lg shadow-[#00a7e8]/30 transition-all duration-200 hover:from-[#0090c8] hover:to-[#007ab0] hover:shadow-xl hover:shadow-[#00a7e8]/40"
            >
              <Users className="size-7 shrink-0 text-white" strokeWidth={2.5} />
              <div>
                <span className="block text-lg font-extrabold tracking-wide text-white">Create Card</span>
                <span className="block text-xs font-medium uppercase tracking-wider text-white/60">Build your LFT profile</span>
              </div>
            </button>
            <button
              onClick={() => {
                setInitialTeamPhase("solo_swiping");
                setActiveTab("team");
              }}
              className="flex w-full items-center gap-3 rounded-lg border-2 border-[#ffd21f] px-4 py-6 text-left shadow-lg shadow-[#ffd21f]/20 transition-all duration-200 hover:bg-gradient-to-r hover:from-[#ffd21f]/10 hover:to-[#ffd21f]/5 hover:shadow-xl hover:shadow-[#ffd21f]/30"
            >
              <Heart className="size-7 shrink-0 text-[#ffd21f]" strokeWidth={2.5} />
              <div>
                <span className="block text-lg font-extrabold tracking-wide text-[#ffd21f]">Find Team</span>
                <span className="block text-xs font-medium uppercase tracking-wider text-[#ffd21f]/60">Swipe to match with teams</span>
              </div>
            </button>
          </div>
        </FeaturePanel>
      </div>

      <SectionTitle
        eyebrow="Explore"
        title={`${filteredHackathons.length} hackathons match your filters`}
      />
      <section className="rounded-lg border-2 border-zinc-950 bg-white p-4 shadow-[5px_5px_0_#111]">
        <div className="flex gap-3">
          <label className="relative block flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, organizer, location, or theme"
              className="h-11 w-full rounded-md border-2 border-zinc-200 bg-white pl-10 pr-3 text-sm font-medium outline-none focus:border-[#00a7e8]"
            />
          </label>
          <button
            type="button"
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-md border-2 border-zinc-950 bg-white shadow-[3px_3px_0_#111] transition-all hover:shadow-[1px_1px_0_#111] hover:translate-x-[2px] hover:translate-y-[2px]"
          >
            <Filter className="size-4" />
          </button>
        </div>
      </section>
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
