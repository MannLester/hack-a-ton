import { useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Medal,
  Search,
  Sparkles,
  Users,
  UserPlus,
} from "lucide-react";
import type { Hackathon } from "@/lib/sample-data";
import type { ParticipantTab, PortfolioProfile, Teammate } from "@/components/shared/types";
import { HackathonCard } from "@/components/participants/hackathon-card";
import { FeaturePanel, SectionTitle, StatCard } from "@/components/shared/primitives";
import { PortfolioView } from "@/components/participants/portfolio-view";
import { TeamView } from "@/components/participants/team-builder-view";

export function LandingView({
  activeTab,
  setActiveTab,
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
    <div className="space-y-8">
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
          <h2 className="mt-1.5 text-3xl font-black sm:text-4xl">Team Up Now!</h2>
          <p className="mt-1 text-sm font-medium leading-6 text-zinc-300">
            Connect with builders and form your dream team.
          </p>
          <div className="mt-4 space-y-3">
            <button
              onClick={() => {
                setInitialTeamPhase("creating_card");
                setActiveTab("team");
              }}
              className="flex w-full items-center gap-3 rounded-lg border-2 border-zinc-950 bg-[#00a7e8] px-4 py-6 text-left shadow-[5px_5px_0_#111] transition-all duration-150 hover:shadow-[3px_3px_0_#111] hover:translate-x-[2px] hover:translate-y-[2px]"
            >
              <UserPlus className="size-7 shrink-0 text-zinc-950" strokeWidth={2.5} />
              <div>
                <span className="block text-xl font-black text-zinc-950">Start a Team</span>
                <span className="block text-xs font-bold text-zinc-700">Start a team and recruit your dream crew</span>
              </div>
            </button>
            <button
              onClick={() => {
                setInitialTeamPhase("solo_swiping");
                setActiveTab("team");
              }}
              className="flex w-full items-center gap-3 rounded-lg border-2 border-zinc-950 bg-[#ffd21f] px-4 py-6 text-left shadow-[5px_5px_0_#111] transition-all duration-150 hover:shadow-[3px_3px_0_#111] hover:translate-x-[2px] hover:translate-y-[2px]"
            >
              <Search className="size-7 shrink-0 text-zinc-950" strokeWidth={2.5} />
              <div>
                <span className="block text-xl font-black text-zinc-950">Discover Teams</span>
                <span className="block text-xs font-bold text-zinc-700">Browse open teams looking for builders</span>
              </div>
            </button>
          </div>
        </FeaturePanel>
      </div>

      <SectionTitle
        eyebrow="Explore"
        title="Upcoming Hackathons"
        size="lg"
      />
      <section className="grid gap-4 sm:grid-cols-2 sm:auto-rows-fr">
        {filteredHackathons.map((hackathon) => (
          <HackathonCard
            key={hackathon.id}
            hackathon={hackathon}
          />
        ))}
      </section>
      <div className="flex justify-center">
        <Link
          href="/explore"
          className="inline-flex items-center gap-2 rounded-lg border-2 border-zinc-950 bg-white px-6 py-3 text-sm font-black text-zinc-950 shadow-[5px_5px_0_#111] transition-all duration-150 hover:shadow-[3px_3px_0_#111] hover:translate-x-[2px] hover:translate-y-[2px]"
        >
          Explore More
        </Link>
      </div>
    </div>
  );
}
