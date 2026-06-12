"use client";

import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  getUiOrganizerHackathon,
  getUiPortfolioProfile,
  getUiReviewHackathon,
  type OrganizerDashboard,
  type OrganizerInsights,
  type PendingReview,
} from "@/components/data/adapters";
import { formats, themes } from "@/components/shared/config";
import {
  demoOrganizerId,
  demoStaffUserId,
  demoUserId,
  getUiHackathon,
  getUiTeammate,
  type OrganizerTab,
  type ParticipantTab,
  type Teammate,
  type UiHackathon,
} from "@/components/shared/types";
import { AdminView } from "@/components/admin/admin-view";
import { OrganizerView } from "@/components/organizers/organizer-view";
import { ParticipantView } from "@/components/participants/participant-view";

export function ConvexOrganizerView({
  activeTab,
  setActiveTab,
}: {
  activeTab: OrganizerTab;
  setActiveTab: (tab: OrganizerTab) => void;
}) {
  const dashboard = useQuery(
    api.organizers.getDashboard,
    demoOrganizerId ? { organizerId: demoOrganizerId } : "skip",
  ) as OrganizerDashboard | undefined;
  const insights = useQuery(
    api.organizers.getInsights,
    demoOrganizerId ? { organizerId: demoOrganizerId } : "skip",
  ) as OrganizerInsights | undefined;
  const interestedByHackathonName = new Map(
    insights?.listings.map((listing) => [
      listing.hackathonName,
      listing.interestedCount,
    ]) ?? [],
  );
  const listings =
    dashboard?.hackathons && dashboard.hackathons.length > 0
      ? dashboard.hackathons.map((hackathon) =>
          getUiOrganizerHackathon(
            hackathon,
            interestedByHackathonName.get(hackathon.name) ?? 0,
          ),
        )
      : undefined;
  const stats = dashboard
    ? {
        published: dashboard.stats.published,
        pendingReview: dashboard.stats.pendingReview,
        interestedParticipants: insights?.totals.interestedCount ?? 0,
      }
    : undefined;

  return (
    <OrganizerView
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      listings={listings}
      stats={stats}
      insights={insights?.totals}
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
  const pendingReviews = useQuery(api.staff.listPendingReviews, {}) as
    | PendingReview[]
    | undefined;
  const approveListing = useMutation(api.staff.approveListing);
  const requestListingEdits = useMutation(api.staff.requestListingEdits);
  const pendingHackathons = pendingReviews
    ?.map(getUiReviewHackathon)
    .filter((hackathon): hackathon is UiHackathon => hackathon !== null);
  const hasPendingReviews = Boolean(pendingHackathons?.length);

  const approveReview = async (reviewId: string) => {
    onRemovePendingReview(reviewId);

    if (!demoStaffUserId) return;

    await approveListing({
      staffUserId: demoStaffUserId,
      reviewId: reviewId as Id<"listingReviews">,
    });
  };

  const requestEdits = async (reviewId: string) => {
    onRemovePendingReview(reviewId);

    if (!demoStaffUserId) return;

    await requestListingEdits({
      staffUserId: demoStaffUserId,
      reviewId: reviewId as Id<"listingReviews">,
      note: "Needs edits from staff review.",
    });
  };

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
  format,
  setFormat,
  theme,
  setTheme,
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
  format: (typeof formats)[number];
  setFormat: (format: (typeof formats)[number]) => void;
  theme: (typeof themes)[number];
  setTheme: (theme: (typeof themes)[number]) => void;
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
  const [hiddenConvexTeammateNames, setHiddenConvexTeammateNames] = useState<
    string[]
  >([]);
  const convexHackathons = useQuery(api.hackathons.listPublished, {
    queryText: query,
    format,
    theme,
  });
  const featuredHackathon = useQuery(api.hackathons.featuredPublished, {});
  const convexTeammates = useQuery(
    api.teams.listActiveProfiles,
    demoUserId ? { viewerUserId: demoUserId } : "skip",
  );
  const convexPortfolioProfile = useQuery(
    api.portfolio.getProfile,
    demoUserId ? { userId: demoUserId } : "skip",
  );
  const saveListing = useMutation(api.hackathons.saveListing);
  const unsaveListing = useMutation(api.hackathons.unsaveListing);
  const displayedHackathons =
    convexHackathons && convexHackathons.length > 0
      ? convexHackathons.map(getUiHackathon)
      : fallbackHackathons;
  const displayedTeammates =
    convexTeammates && convexTeammates.length > 0
      ? convexTeammates
          .map(getUiTeammate)
          .filter(
            (teammate) => !hiddenConvexTeammateNames.includes(teammate.name),
          )
      : visibleTeammates;
  const displayedPortfolioProfile = convexPortfolioProfile
    ? getUiPortfolioProfile(convexPortfolioProfile)
    : undefined;
  const displayedFeaturedHackathon = featuredHackathon
    ? getUiHackathon(featuredHackathon)
    : (fallbackHackathons[0] ?? null);

  const toggleSavedHackathon = async (hackathonId: string) => {
    const isSaved = savedHackathonIds.includes(hackathonId);
    onToggleLocalSave(hackathonId);

    if (!demoUserId) return;

    const hackathon = displayedHackathons.find(
      (item) => item.id === hackathonId,
    );

    if (!hackathon?.convexId) return;

    if (isSaved) {
      await unsaveListing({
        userId: demoUserId,
        hackathonId: hackathon.convexId,
      });
      return;
    }

    await saveListing({ userId: demoUserId, hackathonId: hackathon.convexId });
  };

  const dismissTeammate = (teammateName: string) => {
    setHiddenConvexTeammateNames((currentNames) =>
      currentNames.includes(teammateName)
        ? currentNames
        : [...currentNames, teammateName],
    );
    onDismissTeammate(teammateName);
  };

  const likeTeammate = (teammate: Teammate) => {
    setHiddenConvexTeammateNames((currentNames) =>
      currentNames.includes(teammate.name)
        ? currentNames
        : [...currentNames, teammate.name],
    );
    onLikeTeammate(teammate);
  };

  return (
    <ParticipantView
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      query={query}
      setQuery={setQuery}
      format={format}
      setFormat={setFormat}
      theme={theme}
      setTheme={setTheme}
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
    />
  );
}
