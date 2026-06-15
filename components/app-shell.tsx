"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminView } from "@/components/admin/moderation-view";
import {
  ConvexAdminView,
  ConvexOrganizerView,
  ConvexParticipantView,
} from "@/components/data/convex-containers";
import { OrganizerView } from "@/components/organizers/dashboard-view";
import { LandingView } from "@/components/landing/landing-view";
import { OrganizerAuthGate } from "@/components/shared/auth-controls";
import { setup } from "@/components/shared/config";
import { useClerkAuthState } from "@/components/shared/convex-provider";
import {
  demoStaffUserId,
  type OrganizerTab,
  type ParticipantTab,
  type Persona,
  type Teammate,
} from "@/components/shared/types";
import { canAccessPersona, canAccessStaffView, getDefaultPersonaAfterSignIn } from "@/lib/auth-persona";
import { hackathons, teammates } from "@/lib/sample-data";
import { AppNavigation } from "@/components/shared/app-navigation";

export function HackatonApp() {
  const { isAuthLoaded, isSignedIn } = useClerkAuthState();
  const [persona, setPersonaState] = useState<Persona>("participant");
  const [participantTab, setParticipantTab] =
    useState<ParticipantTab>("explore");
  const [organizerTab, setOrganizerTab] = useState<OrganizerTab>("listings");
  const [showAdmin, setShowAdmin] = useState(false);
  const [query, setQuery] = useState("");
  const [setupFilter, setSetupFilter] = useState<(typeof setup)[number]>("All");
  const [savedHackathonIds, setSavedHackathonIds] = useState<string[]>([]);
  const [visibleTeammates, setVisibleTeammates] = useState(teammates);
  const [likedTeammates, setLikedTeammates] = useState<Teammate[]>([]);
  const [showMatches, setShowMatches] = useState(false);
  const [pendingReviewIds, setPendingReviewIds] = useState(
    hackathons.slice(0, 2).map((hackathon) => hackathon.id),
  );
  const [hasTeam, setHasTeam] = useState(false);

  useEffect(() => {
    const storedPersona = window.localStorage.getItem("hackaton-persona");
    if (storedPersona === "participant" || storedPersona === "organizer") {
      setPersonaState(getDefaultPersonaAfterSignIn(storedPersona));
    }

    const searchParams = new URLSearchParams(window.location.search);
    setShowAdmin(searchParams.get("staff") === "1");
  }, []);

  const setPersona = (nextPersona: Persona) => {
    setShowAdmin(false);
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
        const matchesSetup = setupFilter === "All" || hackathon.setup === setupFilter;

        return matchesQuery && matchesSetup;
      }),
    [setupFilter, query],
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
  const hasStaffAccessSource = process.env.NEXT_PUBLIC_CONVEX_URL
    ? true
    : Boolean(demoStaffUserId);
  const canUseStaffMode = canAccessStaffView(isSignedIn, hasStaffAccessSource);

  return (
    <main className="min-h-screen bg-[#f5f3ea] text-zinc-950">
      <AppNavigation
        persona={persona}
        setPersona={setPersona}
        setParticipantTab={setParticipantTab}
        onLeaveStaffView={() => setShowAdmin(false)}
      />

      <div className="mx-auto max-w-7xl px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-12">
        {showAdmin && canUseStaffMode ? (
          process.env.NEXT_PUBLIC_CONVEX_URL ? (
            <ConvexAdminView
              pendingReviewIds={pendingReviewIds}
              onRemovePendingReview={removePendingReview}
            />
          ) : (
            <AdminView
              pendingReviewIds={pendingReviewIds}
              onRemovePendingReview={removePendingReview}
              useSampleFallback
            />
          )
        ) : persona === "participant" ? (
          process.env.NEXT_PUBLIC_CONVEX_URL ? (
            <ConvexParticipantView
              activeTab={participantTab}
              setActiveTab={setParticipantTab}
              query={query}
              setQuery={setQuery}
              setup={setupFilter}
              setSetup={setSetupFilter}
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
            <LandingView
              activeTab={participantTab}
              setActiveTab={setParticipantTab}
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
              hasTeam={hasTeam}
              onCreateTeam={async () => null}
              useSamplePortfolioFallback
            />
          )
        ) : !isAuthLoaded || !canUseOrganizerMode ? (
          <OrganizerAuthGate />
        ) : process.env.NEXT_PUBLIC_CONVEX_URL ? (
          <ConvexOrganizerView
            activeTab={organizerTab}
            setActiveTab={setOrganizerTab}
          />
        ) : (
          <OrganizerView
            activeTab={organizerTab}
            setActiveTab={setOrganizerTab}
            listings={hackathons}
          />
        )}
      </div>
    </main>
  );
}
