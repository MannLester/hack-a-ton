"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useOptionalClerkUser } from "@/components/shared/convex-provider";
import {
  getUiReviewHackathon,
  type PendingReview,
} from "@/components/data/adapters";
import type { UiHackathon } from "@/components/shared/types";
import { AdminView } from "@/components/admin/moderation-view";

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
    user?.id ? {} : "skip",
  );
  const pendingReviews = useQuery(
    api.staff.listPendingReviews,
    staffAccess?.canAccessStaffView ? {} : "skip",
  ) as PendingReview[] | undefined;
  const approveListing = useMutation(api.staff.approveListing);
  const requestListingEdits = useMutation(api.staff.requestListingEdits);
  const pendingHackathons = pendingReviews
    ?.map(getUiReviewHackathon)
    .filter((hackathon): hackathon is UiHackathon => hackathon !== null);
  const hasPendingReviews = Boolean(pendingHackathons?.length);

  const approveReview = async (reviewId: string) => {
    onRemovePendingReview(reviewId);

    if (!staffAccess?.canAccessStaffView) return;

    await approveListing({
      reviewId: reviewId as Id<"listingReviews">,
    });
  };

  const requestEdits = async (reviewId: string) => {
    onRemovePendingReview(reviewId);

    if (!staffAccess?.canAccessStaffView) return;

    await requestListingEdits({
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
