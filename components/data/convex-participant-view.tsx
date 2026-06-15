"use client";

import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useOptionalClerkUser } from "@/components/shared/convex-provider";
import { setup as setupOptions } from "@/components/shared/config";
import type {
  ParticipantTab,
  Teammate,
  UiHackathon,
} from "@/components/shared/types";
import {
  getClerkPortfolioProfile,
  getUiHackathon,
  getUiPortfolioProfile,
  getUiTeamInterestedUser,
  getUiTeamLooking,
  getUiTeammate,
} from "@/components/data/adapters";
import { LandingView } from "@/components/landing/landing-view";
import type { TeamLooking } from "@/lib/sample-data";
import {
  getListingDataSourceItems,
  getOptionalRealtimeItems,
} from "@/lib/listing-data-source";
import {
  getClerkIdentity,
  getUserProfileMutationInput,
} from "@/components/data/convex-shared";

export function ConvexParticipantView({
  activeTab,
  setActiveTab,
  query,
  setQuery,
  setup,
  setSetup,
  fallbackHackathons,
  savedHackathonIds,
  onToggleLocalSave,
  visibleTeammates,
  likedTeammates,
  showMatches,
  setShowMatches,
  onDismissTeammate,
  onLikeTeammate,
}: {
  activeTab: ParticipantTab;
  setActiveTab: (tab: ParticipantTab) => void;
  query: string;
  setQuery: (query: string) => void;
  setup: (typeof setupOptions)[number];
  setSetup: (setup: (typeof setupOptions)[number]) => void;
  fallbackHackathons: UiHackathon[];
  savedHackathonIds: string[];
  onToggleLocalSave: (hackathonId: string) => void;
  visibleTeammates: Teammate[];
  likedTeammates: Teammate[];
  showMatches: boolean;
  setShowMatches: (showMatches: boolean) => void;
  onDismissTeammate: (teammateName: string) => void;
  onLikeTeammate: (teammate: Teammate) => void;
}) {
  const user = useOptionalClerkUser();
  const { isAuthenticated } = useConvexAuth();
  const clerkIdentity = useMemo(() => getClerkIdentity(user), [user]);
  const [participantUserId, setParticipantUserId] =
    useState<Id<"users"> | null>(null);
  const [hiddenConvexTeammateNames, setHiddenConvexTeammateNames] = useState<
    string[]
  >([]);
  const ensureParticipantUser = useMutation(api.users.ensureParticipantUser);
  const convexHackathons = useQuery(api.hackathons.listPublished, {
    queryText: query,
    setup,
  });
  const featuredHackathon = useQuery(api.hackathons.featuredPublished, {});
  const landingStats = useQuery(api.hackathons.getPlatformStats, {});

  useEffect(() => {
    if (!clerkIdentity || !isAuthenticated) {
      setParticipantUserId(null);
      return;
    }

    let isActive = true;

    ensureParticipantUser(getUserProfileMutationInput(clerkIdentity)).then((userId) => {
      if (!isActive) return;

      setParticipantUserId(userId);
    });

    return () => {
      isActive = false;
    };
  }, [clerkIdentity, ensureParticipantUser, isAuthenticated]);

  const convexTeammates = useQuery(
    api.teams.listActiveProfiles,
    participantUserId ? {} : "skip",
  );
  const convexTeamListings = useQuery(
    api.teams.listRecruitingTeams,
    participantUserId ? {} : "skip",
  );
  const myTeams = useQuery(
    api.teams.listMyTeams,
    participantUserId ? {} : "skip",
  );
  const interestedUsersForMyTeam = useQuery(
    api.teams.listInterestedUsersForMyTeam,
    participantUserId ? {} : "skip",
  );
  const hasTeam = Boolean(myTeams?.length);
  const convexPortfolioProfile = useQuery(
    api.portfolio.getProfile,
    participantUserId ? {} : "skip",
  );
  const leaderboardRows = useQuery(api.leaderboards.listTopBuilders, {});
  const saveListing = useMutation(api.hackathons.saveListing);
  const unsaveListing = useMutation(api.hackathons.unsaveListing);
  const createTeamMutation = useMutation(api.teams.createTeam);
  const decideOnProfile = useMutation(api.teams.decideOnProfile);
  const updateBio = useMutation(api.users.updateBio);
  const displayedHackathons = getListingDataSourceItems({
    isConvexEnabled: Boolean(process.env.NEXT_PUBLIC_CONVEX_URL),
    convexItems: convexHackathons?.map(getUiHackathon),
    fallbackItems: fallbackHackathons,
  });
  const displayedTeammates =
    convexTeammates && convexTeammates.length > 0
      ? convexTeammates
          .map(getUiTeammate)
          .filter(
            (teammate) => !hiddenConvexTeammateNames.includes(teammate.name),
          )
      : visibleTeammates;
  const displayedTeamListings = getOptionalRealtimeItems({
    isConvexEnabled: Boolean(process.env.NEXT_PUBLIC_CONVEX_URL),
    realtimeItems: convexTeamListings?.map(getUiTeamLooking),
    fallbackItems: [],
  });
  const displayedInterestedUsers =
    interestedUsersForMyTeam?.map(getUiTeamInterestedUser) ?? [];
  const clerkPortfolioProfile = clerkIdentity
    ? getClerkPortfolioProfile(clerkIdentity)
    : undefined;
  const displayedPortfolioProfile =
    (convexPortfolioProfile
      ? getUiPortfolioProfile(convexPortfolioProfile)
      : undefined) ?? clerkPortfolioProfile;
  const displayedFeaturedHackathon = featuredHackathon
    ? getUiHackathon(featuredHackathon)
    : (displayedHackathons[0] ?? null);

  const toggleSavedHackathon = async (hackathonId: string) => {
    const isSaved = savedHackathonIds.includes(hackathonId);
    onToggleLocalSave(hackathonId);

    if (!participantUserId) return;

    const hackathon = displayedHackathons.find(
      (item) => item.id === hackathonId,
    );

    if (!hackathon?.convexId) return;

    if (isSaved) {
      await unsaveListing({
        hackathonId: hackathon.convexId,
      });
      return;
    }

    await saveListing({
      hackathonId: hackathon.convexId,
    });
  };

  const saveProfileDecision = async (
    teammate: Teammate,
    decision: "like" | "pass",
  ) => {
    if (!participantUserId) return;
    if (!teammate.convexUserId) return;

    await decideOnProfile({
      toUserId: teammate.convexUserId,
      hackathonId: teammate.convexHackathonId,
      decision,
    });
  };

  const saveTeamDecision = async (
    team: TeamLooking,
    decision: "like" | "pass",
  ) => {
    if (!participantUserId) return;
    if (!team.leadUserId) return;

    await decideOnProfile({
      toUserId: team.leadUserId,
      teamId: team.convexTeamId,
      hackathonId: team.convexHackathonId,
      decision,
    });
  };

  const dismissTeammate = (teammateName: string) => {
    setHiddenConvexTeammateNames((currentNames) =>
      currentNames.includes(teammateName)
        ? currentNames
        : [...currentNames, teammateName],
    );
    const teammate = displayedTeammates.find((item) => item.name === teammateName);

    if (teammate) void saveProfileDecision(teammate, "pass");
    if (!teammate) onDismissTeammate(teammateName);
  };

  const likeTeammate = (teammate: Teammate) => {
    setHiddenConvexTeammateNames((currentNames) =>
      currentNames.includes(teammate.name)
        ? currentNames
        : [...currentNames, teammate.name],
    );
    void saveProfileDecision(teammate, "like");
    onLikeTeammate(teammate);
  };

  const dismissTeam = (team: TeamLooking) => {
    void saveTeamDecision(team, "pass");
  };

  const likeTeam = (team: TeamLooking) => {
    void saveTeamDecision(team, "like");
  };

  const respondToInterestedUser = async (
    userId: Id<"users">,
    teamId: Id<"teams"> | undefined,
    hackathonId: Id<"hackathons"> | undefined,
    decision: "like" | "pass",
  ) => {
    if (!participantUserId) return;

    await decideOnProfile({
      toUserId: userId,
      teamId,
      hackathonId,
      decision,
    });
  };

  const saveBio = async (bio: string) => {
    if (!participantUserId) return;

    await updateBio({
      bio,
    });
  };

  const createTeam = async (teamData: {
    teamName: string;
    hackathonId: string;
    goal: string;
    roles: string[];
    targetSize: number;
  }) => {
    if (!participantUserId) return;
    await createTeamMutation({
      teamName: teamData.teamName,
      hackathonId: teamData.hackathonId as Id<"hackathons">,
      goal: teamData.goal,
      roles: teamData.roles,
      targetSize: teamData.targetSize,
    });
  };

  return (
    <LandingView
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      filteredHackathons={displayedHackathons}
      featuredHackathon={displayedFeaturedHackathon}
      savedHackathonIds={savedHackathonIds}
      onToggleSave={toggleSavedHackathon}
      visibleTeammates={displayedTeammates}
      likedTeammates={likedTeammates}
      showMatches={showMatches}
      setShowMatches={setShowMatches}
      onDismissTeammate={dismissTeammate}
      onLikeTeammate={likeTeammate}
      portfolioProfile={displayedPortfolioProfile}
      leaderboardRows={leaderboardRows}
      landingStats={landingStats}
      onSaveBio={saveBio}
      hasTeam={hasTeam}
      onCreateTeam={createTeam}
      myTeams={myTeams}
      teamListings={displayedTeamListings}
      onDismissTeam={dismissTeam}
      onLikeTeam={likeTeam}
      interestedUsers={displayedInterestedUsers}
      onRespondToInterestedUser={respondToInterestedUser}
    />
  );
}
