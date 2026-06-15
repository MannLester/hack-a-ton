"use client";

import { useMutation, useQuery } from "convex/react";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  type OptionalClerkUser,
  useOptionalClerkUser,
} from "@/components/shared/convex-provider";
import {
  getUiOrganizerHackathon,
  getUiPortfolioProfile,
  getUiReviewHackathon,
  type OrganizerDashboard,
  type OrganizerInsights,
  type PendingReview,
} from "@/components/data/adapters";
import { setup as setupOptions } from "@/components/shared/config";
import {
  type CreateListingFormValues,
  type OrganizerResultBoard,
  type OrganizerTab,
  type ParticipantTab,
  type TeamResultPlacement,
  type Teammate,
  type UiHackathon,
} from "@/components/shared/types";
import {
  getUiHackathon,
  getUiTeamInterestedUser,
  getUiTeamLooking,
  getUiTeammate,
} from "@/components/data/adapters";
import { AdminView } from "@/components/admin/moderation-view";
import { OrganizerView } from "@/components/organizers/dashboard-view";
import { LandingView } from "@/components/landing/landing-view";
import type { TeamLooking } from "@/lib/sample-data";
import {
  getListingDataSourceItems,
  getOptionalRealtimeItems,
  getOrganizerListingDataSourceItems,
} from "@/lib/listing-data-source";

type ClerkIdentity = {
  clerkUserId: string;
  displayName: string;
  initials: string;
  schoolOrCompany?: string;
  location?: string;
};

type OrganizerAccount = {
  userId: Id<"users">;
  organizerId: Id<"organizers">;
};

function getCommaSeparatedValues(text: string) {
  return text
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function getInitials(displayName: string) {
  return displayName
    .split(" ")
    .map((namePart) => namePart[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getClerkIdentity(user: OptionalClerkUser | null) {
  if (!user) return null;

  const emailName = user.primaryEmailAddress?.emailAddress.split("@")[0];
  const displayName = user.fullName || user.username || emailName || "Hack-A-Ton Builder";

  return {
    clerkUserId: user.id,
    displayName,
    initials: getInitials(displayName) || "HA",
    schoolOrCompany: user.primaryEmailAddress?.emailAddress,
  } satisfies ClerkIdentity;
}

function getListingMutationInput(values: CreateListingFormValues) {
  return {
    name: values.listingName.trim(),
    dateLabel: values.dateLabel.trim(),
    registrationDeadlineLabel: values.registrationDeadlineLabel.trim(),
    setup: values.setup,
    location: values.location.trim(),
    region: values.region,
    eligibility: getCommaSeparatedValues(values.eligibilityText),
    teamSize: values.teamSize.trim(),
    prize: values.prize.trim(),
    difficulty: values.difficulty,
    summary: values.description.trim(),
    externalRegistrationUrl: values.registrationUrl.trim(),
    coverImageUrl: values.coverImageUrl.trim(),
    coverImageStorageId: values.coverImageStorageId,
  };
}

export function ConvexOrganizerView({
  activeTab,
  setActiveTab,
}: {
  activeTab: OrganizerTab;
  setActiveTab: (tab: OrganizerTab) => void;
}) {
  const user = useOptionalClerkUser();
  const clerkIdentity = useMemo(() => getClerkIdentity(user), [user]);
  const [organizerAccount, setOrganizerAccount] =
    useState<OrganizerAccount | null>(null);
  const ensureOrganizerAccount = useMutation(api.users.ensureOrganizerAccount);
  const createDraftListing = useMutation(api.organizers.createDraftListing);
  const updateDraftListing = useMutation(api.organizers.updateDraftListing);
  const submitListingForReview = useMutation(
    api.organizers.submitListingForReview,
  );
  const archiveListing = useMutation(api.organizers.archiveListing);
  const cancelListing = useMutation(api.organizers.cancelListing);
  const submitTeamResults = useMutation(api.results.submitTeamResults);
  const generateCoverImageUploadUrl = useMutation(
    api.files.generateCoverImageUploadUrl,
  );
  const dashboard = useQuery(
    api.organizers.getDashboard,
    organizerAccount ? { organizerId: organizerAccount.organizerId } : "skip",
  ) as OrganizerDashboard | undefined;
  const insights = useQuery(
    api.organizers.getInsights,
    organizerAccount ? { organizerId: organizerAccount.organizerId } : "skip",
  ) as OrganizerInsights | undefined;
  const resultBoards = useQuery(
    api.results.listOrganizerResultBoards,
    organizerAccount ? { organizerId: organizerAccount.organizerId } : "skip",
  ) as OrganizerResultBoard[] | undefined;
  useEffect(() => {
    if (!clerkIdentity) return;

    let isActive = true;

    ensureOrganizerAccount({
      ...clerkIdentity,
      organizerName: clerkIdentity.displayName,
    }).then((account) => {
      if (!isActive) return;

      setOrganizerAccount(account);
    });

    return () => {
      isActive = false;
    };
  }, [clerkIdentity, ensureOrganizerAccount]);

  const interestedByHackathonName = new Map(
    insights?.listings.map((listing) => [
      listing.hackathonName,
      listing.interestedCount,
    ]) ?? [],
  );
  const activeDashboardListings = dashboard?.hackathons.filter(
    (hackathon) => hackathon.status !== "archived",
  );
  const listings = getOrganizerListingDataSourceItems({
    isConvexEnabled: Boolean(process.env.NEXT_PUBLIC_CONVEX_URL),
    dashboardItems: activeDashboardListings?.map((hackathon) =>
      getUiOrganizerHackathon(
        hackathon,
        interestedByHackathonName.get(hackathon.name) ?? 0,
      ),
    ),
    fallbackItems: [],
  });
  const stats = dashboard
    ? {
        published: dashboard.stats.published,
        pendingReview: dashboard.stats.pendingReview,
        drafts: dashboard.stats.drafts,
        interestedParticipants: insights?.totals.interestedCount ?? 0,
      }
    : undefined;

  const getOrganizerIdForListing = async (values: CreateListingFormValues) => {
    if (!clerkIdentity) throw new Error("Sign in before creating listings.");

    const account = await ensureOrganizerAccount({
      ...clerkIdentity,
      organizerName: values.organizerName.trim(),
    });
    setOrganizerAccount(account);

    return account.organizerId;
  };

  const saveDraft = async (values: CreateListingFormValues) => {
    const organizerId = await getOrganizerIdForListing(values);
    const listingInput = getListingMutationInput(values);

    if (values.listingId) {
      await updateDraftListing({
        organizerId,
        hackathonId: values.listingId,
        ...listingInput,
      });
      return values.listingId;
    }

    return createDraftListing({
      organizerId,
      ...listingInput,
    });
  };

  const submitForReview = async (values: CreateListingFormValues) => {
    const organizerId = await getOrganizerIdForListing(values);
    const listingInput = getListingMutationInput(values);
    const hackathonId = values.listingId ??
      (await createDraftListing({
        organizerId,
        ...listingInput,
      }));

    if (values.listingId) {
      await updateDraftListing({
        organizerId,
        hackathonId,
        ...listingInput,
      });
    }

    await submitListingForReview({
      organizerId,
      hackathonId,
    });
  };


  const archiveOrganizerListing = async (hackathonId: Id<"hackathons">) => {
    const organizerId = organizerAccount?.organizerId;

    if (!organizerId) return;

    await archiveListing({
      organizerId,
      hackathonId,
    });
  };

  const uploadCoverImage = async (file: File) => {
    const uploadUrl = await generateCoverImageUploadUrl({});
    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });

    if (!uploadResponse.ok) {
      throw new Error("Cover image upload failed.");
    }

    const { storageId } = await uploadResponse.json();
    return {
      storageId: storageId as Id<"_storage">,
      previewUrl: URL.createObjectURL(file),
    };
  };

  const saveTeamResults = async (
    hackathonId: Id<"hackathons">,
    results: { teamId: string; placement: TeamResultPlacement }[],
  ) => {
    const organizerId = organizerAccount?.organizerId;

    if (!organizerId) return;

    await submitTeamResults({
      organizerId,
      hackathonId,
      results: results.map((result) => ({
        teamId: result.teamId as Id<"teams">,
        placement: result.placement,
      })),
    });
  };

  const cancelOrganizerListing = async (
    hackathonId: Id<"hackathons">,
    reason: string,
  ) => {
    const organizerId = organizerAccount?.organizerId;

    if (!organizerId) return;

    await cancelListing({
      organizerId,
      hackathonId,
      reason,
    });
  };

  return (
    <OrganizerView
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      listings={listings}
      stats={stats}
      insights={insights?.totals}
      resultBoards={resultBoards}
      onSubmitTeamResults={saveTeamResults}
      onSaveDraft={saveDraft}
      onSubmitForReview={submitForReview}
      onRemoteAutosave={saveDraft}
      onUploadCoverImage={uploadCoverImage}
      onArchiveListing={archiveOrganizerListing}
      onCancelListing={cancelOrganizerListing}
    />
  );
}

export function ConvexAdminView({
  pendingReviewIds,
  onRemovePendingReview,
}: {
  pendingReviewIds: string[];
  onRemovePendingReview: (hackathonId: string) => void;
}) {
  const user = useOptionalClerkUser();
  const staffAccess = useQuery(
    api.users.getStaffAccess,
    user?.id ? { clerkUserId: user.id } : "skip",
  );
  const pendingReviews = useQuery(
    api.staff.listPendingReviews,
    staffAccess?.staffUserId ? { staffUserId: staffAccess.staffUserId } : "skip",
  ) as PendingReview[] | undefined;
  const approveListing = useMutation(api.staff.approveListing);
  const requestListingEdits = useMutation(api.staff.requestListingEdits);
  const pendingHackathons = pendingReviews
    ?.map(getUiReviewHackathon)
    .filter((hackathon): hackathon is UiHackathon => hackathon !== null);
  const hasPendingReviews = Boolean(pendingHackathons?.length);

  const approveReview = async (reviewId: string) => {
    onRemovePendingReview(reviewId);
    const staffUserId = staffAccess?.staffUserId;

    if (!staffUserId) return;

    await approveListing({
      staffUserId: staffUserId,
      reviewId: reviewId as Id<"listingReviews">,
    });
  };

  const requestEdits = async (reviewId: string) => {
    onRemovePendingReview(reviewId);
    const staffUserId = staffAccess?.staffUserId;

    if (!staffUserId) return;

    await requestListingEdits({
      staffUserId: staffUserId,
      reviewId: reviewId as Id<"listingReviews">,
      note: "Needs edits from staff review.",
    });
  };

  if (staffAccess && !staffAccess.canAccessStaffView) {
    return (
      <AdminView
        pendingReviewIds={[]}
        onRemovePendingReview={onRemovePendingReview}
        accessMessage="Staff access is required for moderation."
      />
    );
  }

  return (
    <AdminView
      pendingReviewIds={pendingReviewIds}
      onRemovePendingReview={onRemovePendingReview}
      pendingHackathons={hasPendingReviews ? pendingHackathons : undefined}
      onRequestEdits={hasPendingReviews ? requestEdits : undefined}
      onApprove={hasPendingReviews ? approveReview : undefined}
    />
  );
}

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
    if (!clerkIdentity) {
      setParticipantUserId(null);
      return;
    }

    let isActive = true;

    ensureParticipantUser(clerkIdentity).then((userId) => {
      if (!isActive) return;

      setParticipantUserId(userId);
    });

    return () => {
      isActive = false;
    };
  }, [clerkIdentity, ensureParticipantUser]);

  const convexTeammates = useQuery(
    api.teams.listActiveProfiles,
    participantUserId ? { viewerUserId: participantUserId } : "skip",
  );
  const convexTeamListings = useQuery(
    api.teams.listRecruitingTeams,
    participantUserId ? { viewerUserId: participantUserId } : "skip",
  );
  const myTeams = useQuery(
    api.teams.listMyTeams,
    participantUserId ? { userId: participantUserId } : "skip",
  );
  const interestedUsersForMyTeam = useQuery(
    api.teams.listInterestedUsersForMyTeam,
    participantUserId ? { userId: participantUserId } : "skip",
  );
  const hasTeam = Boolean(myTeams?.length);
  const convexPortfolioProfile = useQuery(
    api.portfolio.getProfile,
    participantUserId ? { userId: participantUserId } : "skip",
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
  const displayedPortfolioProfile = convexPortfolioProfile
    ? getUiPortfolioProfile(convexPortfolioProfile)
    : undefined;
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
        userId: participantUserId,
        hackathonId: hackathon.convexId,
      });
      return;
    }

    await saveListing({
      userId: participantUserId,
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
      fromUserId: participantUserId,
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
      fromUserId: participantUserId,
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
      fromUserId: participantUserId,
      toUserId: userId,
      teamId,
      hackathonId,
      decision,
    });
  };

  const saveBio = async (bio: string) => {
    if (!participantUserId) return;

    await updateBio({
      userId: participantUserId,
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
      userId: participantUserId,
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
