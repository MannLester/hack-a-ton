"use client";

import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { hackathons, teammates } from "@/lib/sample-data";
import {
  formats,
  organizerTabs,
  participantTabs,
  themes,
} from "./hackaton/config";
import {
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
        const matchesFormat = format === "All" || hackathon.format === format;
        const matchesTheme =
          theme === "All" || hackathon.themes.includes(theme);

        return matchesQuery && matchesFormat && matchesTheme;
      }),
    [format, query, theme],
  );
  const featuredHackathon = hackathons[0] ?? null;
  const activeTabs =
    persona === "participant" ? participantTabs : organizerTabs;

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
      <header className="sticky top-0 z-30 border-b-2 border-zinc-950 bg-zinc-950 text-white shadow-[0_4px_0_#00a7e8]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <button
            onClick={() => {
              setPersona("participant");
              setParticipantTab("explore");
            }}
            className="flex items-center gap-3 text-left"
          >
            <Image
              src="/brand/hack-a-ton-logo.png"
              alt="Hack-A-Ton"
              width={48}
              height={48}
              className="size-12 rounded-md border border-white/20 object-cover"
              priority
            />
            <span>
              <span className="block text-lg font-black leading-5 tracking-tight">
                Hack-A-Ton
              </span>
              <span className="block text-xs font-bold text-[#ffd21f]">
                Discover · Team · Flex
              </span>
            </span>
          </button>

          <div className="hidden rounded-lg border border-white/15 bg-white/10 p-1 sm:flex">
            <button
              onClick={() => setPersona("participant")}
              className={`h-9 rounded-md px-4 text-sm font-black ${persona === "participant" ? "bg-[#ffd21f] text-zinc-950" : "text-white hover:bg-white/10"}`}
            >
              Participant
            </button>
            <button
              onClick={() => setPersona("organizer")}
              className={`h-9 rounded-md px-4 text-sm font-black ${persona === "organizer" ? "bg-[#00a7e8] text-zinc-950" : "text-white hover:bg-white/10"}`}
            >
              Organizer
            </button>
          </div>

          <nav className="hidden items-center gap-1 lg:flex">
            {activeTabs.map((tab) => {
              const Icon = tab.icon;
              const active =
                persona === "participant"
                  ? participantTab === tab.id
                  : organizerTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() =>
                    persona === "participant"
                      ? setParticipantTab(tab.id as ParticipantTab)
                      : setOrganizerTab(tab.id as OrganizerTab)
                  }
                  className={`inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm font-black ${active ? "bg-white text-zinc-950" : "text-zinc-200 hover:bg-white/10"}`}
                >
                  <Icon className="size-4" /> {tab.label}
                </button>
              );
            })}
          </nav>

          <button
            onClick={() => setShowAdmin((value) => !value)}
            className="hidden h-10 items-center gap-2 rounded-md border border-white/15 px-3 text-sm font-black text-white hover:bg-white/10 md:inline-flex"
          >
            <ShieldCheck className="size-4" /> Staff
          </button>
        </div>
        <div className="grid grid-cols-2 border-t border-white/10 sm:hidden">
          <button
            onClick={() => setPersona("participant")}
            className={`h-11 text-sm font-black ${persona === "participant" ? "bg-[#ffd21f] text-zinc-950" : "text-white"}`}
          >
            Participant
          </button>
          <button
            onClick={() => setPersona("organizer")}
            className={`h-11 text-sm font-black ${persona === "organizer" ? "bg-[#00a7e8] text-zinc-950" : "text-white"}`}
          >
            Organizer
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-12">
        {showAdmin ? (
          <AdminView
            pendingReviewIds={pendingReviewIds}
            onRemovePendingReview={removePendingReview}
          />
        ) : persona === "participant" ? (
          <ParticipantView
            activeTab={participantTab}
            setActiveTab={setParticipantTab}
            query={query}
            setQuery={setQuery}
            format={format}
            setFormat={setFormat}
            theme={theme}
            setTheme={setTheme}
            filteredHackathons={filteredHackathons}
            featuredHackathon={featuredHackathon}
            savedHackathonIds={savedHackathonIds}
            onToggleSave={toggleSavedHackathon}
            visibleTeammates={visibleTeammates}
            likedTeammates={likedTeammates}
            showMatches={showMatches}
            setShowMatches={setShowMatches}
            onDismissTeammate={dismissTeammate}
            onLikeTeammate={likeTeammate}
          />
        ) : (
          <OrganizerView
            activeTab={organizerTab}
            setActiveTab={setOrganizerTab}
          />
        )}
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-zinc-950 bg-white lg:hidden">
        <div className="grid grid-cols-3">
          {activeTabs.map((tab) => {
            const Icon = tab.icon;
            const active =
              persona === "participant"
                ? participantTab === tab.id
                : organizerTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() =>
                  persona === "participant"
                    ? setParticipantTab(tab.id as ParticipantTab)
                    : setOrganizerTab(tab.id as OrganizerTab)
                }
                className={`flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-black ${active ? "text-zinc-950" : "text-zinc-500"}`}
              >
                <Icon className="size-5" /> {tab.label}
              </button>
            );
          })}
        </div>
      </nav>
    </main>
  );
}
