"use client";

import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { AdminView } from "@/components/admin/moderation-view";
import {
  ConvexAdminView,
  ConvexOrganizerView,
  ConvexParticipantView,
} from "@/components/data/convex-containers";
import { OrganizerView } from "@/components/organizers/dashboard-view";
import { ParticipantView } from "@/components/participants/explore-view";
import { OrganizerAuthGate } from "@/components/shared/auth-controls";
import { formats, themes } from "@/components/shared/config";
import { useClerkAuthState } from "@/components/shared/convex-provider";
import {
  demoOrganizerId,
  demoStaffUserId,
  type OrganizerTab,
  type ParticipantTab,
  type Persona,
  type Teammate,
} from "@/components/shared/types";
import { canAccessPersona, getDefaultPersonaAfterSignIn } from "@/lib/auth-persona";
import { hackathons, teammates } from "@/lib/sample-data";

function AppNavigation({
  persona,
  setPersona,
  setParticipantTab,
}: {
  persona: Persona;
  setPersona: (persona: Persona) => void;
  setParticipantTab: (tab: "explore") => void;
}) {
  return (
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

        <div className="hidden items-center gap-2 md:flex">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="inline-flex h-10 items-center rounded-md px-4 text-sm font-black text-zinc-200 hover:bg-white/10">
                Log in
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="inline-flex h-10 items-center rounded-md border-2 border-zinc-950 bg-[#ffd21f] px-4 text-sm font-black text-zinc-950 shadow-[3px_3px_0_#111] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#111]">
                Sign up
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-black text-zinc-200">
              Signed in
            </span>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
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
  );
}

export function HackatonApp() {
  const { isAuthLoaded, isSignedIn } = useClerkAuthState();
  const [persona, setPersonaState] = useState<Persona>("participant");
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

  useEffect(() => {
    const storedPersona = window.localStorage.getItem("hackaton-persona");
    if (storedPersona === "participant" || storedPersona === "organizer") {
      setPersonaState(getDefaultPersonaAfterSignIn(storedPersona));
    }
  }, []);

  const setPersona = (nextPersona: Persona) => {
    setPersonaState(nextPersona);
    window.localStorage.setItem("hackaton-persona", nextPersona);
  };

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

  const canUseOrganizerMode = canAccessPersona("organizer", isSignedIn);

  return (
    <main className="min-h-screen bg-[#f5f3ea] text-zinc-950">
      <AppNavigation
        persona={persona}
        setPersona={setPersona}
        setParticipantTab={setParticipantTab}
      />

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
        ) : !isAuthLoaded || !canUseOrganizerMode ? (
          <OrganizerAuthGate />
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
