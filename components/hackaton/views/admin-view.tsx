import { hackathons, type Hackathon } from "@/lib/sample-data";
import { ReviewCard } from "../cards";
import { EmptyState, SectionTitle } from "../ui";

export function AdminView({
  pendingReviewIds,
  onRemovePendingReview,
  pendingHackathons: pendingHackathonsOverride,
  onRequestEdits,
  onApprove,
}: {
  pendingReviewIds: string[];
  onRemovePendingReview: (hackathonId: string) => void;
  pendingHackathons?: Hackathon[];
  onRequestEdits?: (hackathonId: string) => void;
  onApprove?: (hackathonId: string) => void;
}) {
  const pendingHackathons =
    pendingHackathonsOverride ??
    hackathons.filter((hackathon) => pendingReviewIds.includes(hackathon.id));
  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Staff-only"
        title="Moderate first-time organizer submissions"
      />
      <section className="grid gap-4 lg:grid-cols-2">
        {pendingHackathons.map((item) => (
          <ReviewCard
            key={item.id}
            hackathon={item}
            onRemovePendingReview={onRemovePendingReview}
            onRequestEdits={onRequestEdits}
            onApprove={onApprove}
          />
        ))}
      </section>
      {pendingHackathons.length === 0 ? (
        <EmptyState message="No pending organizer submissions." />
      ) : null}
    </div>
  );
}
