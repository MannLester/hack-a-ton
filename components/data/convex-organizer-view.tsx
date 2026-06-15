"use client";

import { useMutation, useQuery } from "convex/react";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useOptionalClerkUser } from "@/components/shared/convex-provider";
import {
  getUiOrganizerHackathon,
  type OrganizerDashboard,
  type OrganizerInsights,
} from "@/components/data/adapters";
import type {
  CreateListingFormValues,
  OrganizerResultBoard,
  OrganizerTab,
  TeamResultPlacement,
} from "@/components/shared/types";
import { OrganizerView } from "@/components/organizers/dashboard-view";
import { getOrganizerListingDataSourceItems } from "@/lib/listing-data-source";
import {
  getClerkIdentity,
  getListingMutationInput,
} from "@/components/data/convex-shared";

type OrganizerAccount = {
  userId: Id<"users">;
  organizerId: Id<"organizers">;
};

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
    organizerAccount ? {} : "skip",
  ) as OrganizerDashboard | undefined;
  const insights = useQuery(
    api.organizers.getInsights,
    organizerAccount ? {} : "skip",
  ) as OrganizerInsights | undefined;
  const resultBoards = useQuery(
    api.results.listOrganizerResultBoards,
    organizerAccount ? {} : "skip",
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

  const ensureOrganizerForListing = async (values: CreateListingFormValues) => {
    if (!clerkIdentity) throw new Error("Sign in before creating listings.");

    const account = await ensureOrganizerAccount({
      ...clerkIdentity,
      organizerName: values.organizerName.trim(),
    });
    setOrganizerAccount(account);
  };

  const saveDraft = async (values: CreateListingFormValues) => {
    await ensureOrganizerForListing(values);
    const listingInput = getListingMutationInput(values);

    if (values.listingId) {
      await updateDraftListing({
        hackathonId: values.listingId,
        ...listingInput,
      });
      return values.listingId;
    }

    return createDraftListing({
      ...listingInput,
    });
  };

  const submitForReview = async (values: CreateListingFormValues) => {
    await ensureOrganizerForListing(values);
    const listingInput = getListingMutationInput(values);
    const hackathonId = values.listingId ??
      (await createDraftListing({
        ...listingInput,
      }));

    if (values.listingId) {
      await updateDraftListing({
        hackathonId,
        ...listingInput,
      });
    }

    await submitListingForReview({
      hackathonId,
    });
  };

  const archiveOrganizerListing = async (hackathonId: Id<"hackathons">) => {
    if (!organizerAccount) return;

    await archiveListing({
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
    if (!organizerAccount) return;

    await submitTeamResults({
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
    if (!organizerAccount) return;

    await cancelListing({
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
