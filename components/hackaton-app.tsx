"use client";

import { useMemo, useState } from "react";
import { hackathons, teammates } from "@/lib/sample-data";
import { AppNavigation } from "./hackaton/app-navigation";
import { formats, themes } from "./hackaton/config";
import {
  ConvexAdminView,
  ConvexOrganizerView,
  ConvexParticipantView,
} from "./hackaton/convex-views";
import {
  demoOrganizerId,
  demoStaffUserId,
  type OrganizerTab,
  type ParticipantTab,
  type Persona,
  type Teammate,
} from "./hackaton/types";
import { AdminView } from "./hackaton/views/admin-view";
import { OrganizerView } from "./hackaton/views/organizer-view";
import { ParticipantView } from "./hackaton/views/participant-view";

export function HackatonApp() {
  const [persona, setPersona] = useState<Persona>("participant");
  const [participantTab, setParticipantTab] =
    useState<ParticipantTab>("explore");
  const [organizerTab, setOrganizerTab] = useState<OrganizerTab>("listings");
  const [showAdmin, setShowAdmin] = useState(false);
  const [query, setQuery] = useState("");
  const [format, setFormat] = useState<(typeof formats)[number]>("All");
  const [theme, setTheme] = useState<(typeof themes)[number]>("All");
  const [savedHackathonIds, setSavedHackathonIds] = useState<string[]>([]);
  const [visibleTeammates, setVisibleTeammates] = useState(teammates);
  const [likedTeammates, setLikedTeammates] = useState<Teammate[]>([]);
  const [showMatches, setShowMatches] = useState(false);
  const [pendingReviewIds, setPendingReviewIds] = useState(
    hackathons.slice(0, 2).map((hackathon) => hackathon.id),
  );
  const fallbackHackathons = useMemo(
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
        const matchesFormat = format === "All" || hackathon.format === format;
        const matchesTheme =
          theme === "All" || hackathon.themes.includes(theme);

        return matchesQuery && matchesFormat && matchesTheme;
      }),
    [format, query, theme],
  );
  const toggleSavedHackathon = (hackathonId: string) => {
    setSavedHackathonIds((currentIds) =>
      currentIds.includes(hackathonId)
        ? currentIds.filter((id) => id !== hackathonId)
        : [...currentIds, hackathonId],
    );
  };

  const dismissTeammate = (teammateName: string) => {
    setVisibleTeammates((currentTeammates) =>
      currentTeammates.filter((teammate) => teammate.name !== teammateName),
    );
  };

  const likeTeammate = (teammate: Teammate) => {
    setLikedTeammates((currentTeammates) =>
      currentTeammates.some(
        (currentTeammate) => currentTeammate.name === teammate.name,
      )
        ? currentTeammates
        : [...currentTeammates, teammate],
    );
    dismissTeammate(teammate.name);
  };

  const removePendingReview = (hackathonId: string) => {
    setPendingReviewIds((currentIds) =>
      currentIds.filter((id) => id !== hackathonId),
    );
  };

  return (
    <main className="min-h-screen bg-[#f5f3ea] text-zinc-950">
<<<<<<< Updated upstream
      <AppNavigation
        persona={persona}
        participantTab={participantTab}
        organizerTab={organizerTab}
        setPersona={setPersona}
        setParticipantTab={setParticipantTab}
        setOrganizerTab={setOrganizerTab}
        toggleAdmin={() => setShowAdmin((value) => !value)}
      />
=======
      <header className="sticky top-0 z-30 border-b-2 border-zinc-950 bg-zinc-950 text-white shadow-[0_4px_0_#00a7e8]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <button onClick={() => { setPersona("participant"); setParticipantTab("explore"); }} className="flex items-center gap-3 text-left">
            <Image src="/brand/hack-a-ton-logo.png" alt="Hack-A-Ton" width={48} height={48} className="size-12 rounded-md border border-white/20 object-cover" priority />
            <span>
              <span className="block text-lg font-black leading-5 tracking-tight">Hack-A-Ton</span>
              <span className="block text-xs font-bold text-[#ffd21f]">Discover · Team · Flex</span>
            </span>
          </button>

          <nav className="hidden items-center gap-1 lg:flex">
            {activeTabs.map((tab) => {
              const Icon = tab.icon;
              const active = persona === "participant" ? participantTab === tab.id : organizerTab === tab.id;
              return (
                <button key={tab.id} onClick={() => persona === "participant" ? setParticipantTab(tab.id as ParticipantTab) : setOrganizerTab(tab.id as OrganizerTab)} className={`inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm font-black ${active ? "bg-white text-zinc-950" : "text-zinc-200 hover:bg-white/10"}`}>
                  <Icon className="size-4" /> {tab.label}
                </button>
              );
            })}
          </nav>

          <button onClick={() => setShowAdmin((value) => !value)} className="hidden h-10 items-center gap-2 rounded-md border border-white/15 px-3 text-sm font-black text-white hover:bg-white/10 md:inline-flex">
            <ShieldCheck className="size-4" /> Staff
          </button>
        </div>
      </header>
>>>>>>> Stashed changes

      <div className="mx-auto max-w-7xl px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-12">
        {showAdmin ? (
          process.env.NEXT_PUBLIC_CONVEX_URL && demoStaffUserId ? (
            <ConvexAdminView
              pendingReviewIds={pendingReviewIds}
              onRemovePendingReview={removePendingReview}
            />
          ) : (
            <AdminView
              pendingReviewIds={pendingReviewIds}
              onRemovePendingReview={removePendingReview}
            />
          )
        ) : persona === "participant" ? (
          process.env.NEXT_PUBLIC_CONVEX_URL ? (
            <ConvexParticipantView
              activeTab={participantTab}
              setActiveTab={setParticipantTab}
              query={query}
              setQuery={setQuery}
              format={format}
              setFormat={setFormat}
              theme={theme}
              setTheme={setTheme}
              fallbackHackathons={fallbackHackathons}
              savedHackathonIds={savedHackathonIds}
              onToggleLocalSave={toggleSavedHackathon}
              visibleTeammates={visibleTeammates}
              likedTeammates={likedTeammates}
              showMatches={showMatches}
              setShowMatches={setShowMatches}
              onDismissTeammate={dismissTeammate}
              onLikeTeammate={likeTeammate}
            />
          ) : (
            <ParticipantView
              activeTab={participantTab}
              setActiveTab={setParticipantTab}
              query={query}
              setQuery={setQuery}
              format={format}
              setFormat={setFormat}
              theme={theme}
              setTheme={setTheme}
              filteredHackathons={fallbackHackathons}
              featuredHackathon={hackathons[0] ?? null}
              savedHackathonIds={savedHackathonIds}
              onToggleSave={toggleSavedHackathon}
              visibleTeammates={visibleTeammates}
              likedTeammates={likedTeammates}
              showMatches={showMatches}
              setShowMatches={setShowMatches}
              onDismissTeammate={dismissTeammate}
              onLikeTeammate={likeTeammate}
            />
          )
        ) : process.env.NEXT_PUBLIC_CONVEX_URL && demoOrganizerId ? (
          <ConvexOrganizerView
            activeTab={organizerTab}
            setActiveTab={setOrganizerTab}
          />
        ) : (
          <OrganizerView
            activeTab={organizerTab}
            setActiveTab={setOrganizerTab}
          />
        )}
      </div>
    </main>
  );
}
