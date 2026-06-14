import { useState } from "react";
import { Archive, CheckCircle2, ClipboardCheck, Edit3, FileText, Plus, Users } from "lucide-react";
import { hackathons } from "@/lib/sample-data";
import type {
  CreateListingFormValues,
  OrganizerTab,
  UiHackathon,
} from "@/components/shared/types";
import { SectionTitle, StatCard, statusClass } from "@/components/shared/primitives";
import { CreateListingView } from "@/components/organizers/create-listing-view";
import { OrganizerInsightsView } from "@/components/organizers/insights-view";
import {
  canArchiveOrganizerListing,
  canCancelOrganizerListing,
  canEditOrganizerListing,
  isValidCancellationReason,
  getInitialListingFormValues,
} from "@/lib/organizer-workflow";

export function OrganizerView({
  activeTab,
  setActiveTab,
  listings = hackathons,
  stats,
  insights,
  onSaveDraft,
  onSubmitForReview,
  onArchiveListing,
  onCancelListing,
}: {
  activeTab: OrganizerTab;
  setActiveTab: (tab: OrganizerTab) => void;
  listings?: UiHackathon[];
  stats?: {
    published: number;
    pendingReview: number;
    drafts?: number;
    interestedParticipants: number;
  };
  insights?: {
    savedCount: number;
    lftClickCount: number;
    externalRegistrationClickCount: number;
  };
  onSaveDraft?: (values: CreateListingFormValues) => Promise<void> | void;
  onSubmitForReview?: (
    values: CreateListingFormValues,
  ) => Promise<void> | void;
  onArchiveListing?: (hackathonId: NonNullable<UiHackathon["convexId"]>) => Promise<void> | void;
  onCancelListing?: (
    hackathonId: NonNullable<UiHackathon["convexId"]>,
    reason: string,
  ) => Promise<void> | void;
}) {
  const [editingListing, setEditingListing] = useState<UiHackathon | null>(null);
  const [cancellingListing, setCancellingListing] = useState<UiHackathon | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [cancellationError, setCancellationError] = useState("");
  const clearEditingListing = () => {
    setEditingListing(null);
    setActiveTab("listings");
  };

  const startCancellation = (listing: UiHackathon) => {
    setCancellingListing(listing);
    setCancellationReason("");
    setCancellationError("");
  };

  const cancelCancellation = () => {
    setCancellingListing(null);
    setCancellationReason("");
    setCancellationError("");
  };

  const confirmCancellation = async () => {
    const listingId = cancellingListing?.convexId;

    if (!listingId) return;

    if (!isValidCancellationReason(cancellationReason)) {
      setCancellationError("Explain the cancellation in at least 20 characters.");
      return;
    }

    await onCancelListing?.(listingId, cancellationReason);
    cancelCancellation();
  };
  if (activeTab === "create") {
    return (
      <CreateListingView
        initialValues={editingListing ? getInitialListingFormValues(editingListing) : undefined}
        onBack={clearEditingListing}
        onSaveDraft={onSaveDraft}
        onSubmitForReview={onSubmitForReview}
      />
    );
  }
  if (activeTab === "insights") {
    return (
      <div className="space-y-6">
        <OrganizerTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        <OrganizerInsightsView totals={insights} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <OrganizerTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <SectionTitle
        eyebrow="Organizer mode"
        title="Manage your hackathon listings only"
        action={
          <button
            onClick={() => {
              setEditingListing(null);
              setActiveTab("create");
            }}
            className="inline-flex h-10 items-center gap-2 rounded-md bg-[#00a7e8] px-4 text-sm font-black text-zinc-950 shadow-[3px_3px_0_#111]"
          >
            <Plus className="size-4" /> New listing
          </button>
        }
      />
      <section className="grid gap-4 lg:grid-cols-4">
        <StatCard
          label="Published"
          value={stats ? String(stats.published) : "3"}
          icon={CheckCircle2}
        />
        <StatCard
          label="Pending review"
          value={stats ? String(stats.pendingReview) : "1"}
          icon={ClipboardCheck}
        />
        <StatCard
          label="Drafts"
          value={stats ? String(stats.drafts ?? 0) : "0"}
          icon={FileText}
        />
        <StatCard
          label="Interested participants"
          value={stats ? String(stats.interestedParticipants) : "705"}
          icon={Users}
        />
      </section>

      {cancellingListing ? (
        <section className="rounded-lg border-2 border-red-700 bg-red-50 p-4 shadow-[4px_4px_0_#111]">
          <p className="font-black text-red-900">
            Cancel {cancellingListing.name}
          </p>
          <p className="mt-1 text-sm font-bold leading-6 text-red-800">
            Participants will see this explanation for 3 days before the listing is removed from discovery.
          </p>
          <textarea
            value={cancellationReason}
            onChange={(event) => {
              setCancellationReason(event.target.value);
              setCancellationError("");
            }}
            className="mt-3 min-h-24 w-full rounded-md border-2 border-red-200 bg-white p-3 text-sm font-bold text-zinc-900 focus:border-red-700 focus:outline-none"
            placeholder="Explain why this hackathon is being cancelled."
          />
          {cancellationError ? (
            <p className="mt-2 text-sm font-black text-red-700">
              {cancellationError}
            </p>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => void confirmCancellation()}
              className="h-10 rounded-md bg-red-700 px-4 text-sm font-black text-white"
            >
              Confirm cancellation
            </button>
            <button
              onClick={cancelCancellation}
              className="h-10 rounded-md border-2 border-zinc-950 px-4 text-sm font-black text-zinc-950"
            >
              Keep listing
            </button>
          </div>
        </section>
      ) : null}
      <section className="rounded-lg border-2 border-zinc-950 bg-white shadow-[5px_5px_0_#111]">
        {listings.map((item) => (
          <div
            key={item.id}
            className="flex flex-col gap-3 border-t-2 border-zinc-100 p-4 first:border-t-0 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-black text-zinc-950">{item.name}</p>
              <p className="text-sm font-bold text-zinc-500">
                {item.date} · {item.setup} · {item.interested} interested · {item.lftCount} LFT
              </p>
              {item.status === "Needs edits" && item.reviewNote ? (
                <p className="mt-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
                  Staff note: {item.reviewNote}
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <span
                className={`w-fit rounded-full border px-2.5 py-1 text-xs font-black ${statusClass(item.status)}`}
              >
                {item.status}
              </span>
              {canEditOrganizerListing(item.status) ? (
                <button
                  onClick={() => {
                    setEditingListing(item);
                    setActiveTab("create");
                  }}
                  className="grid size-8 place-items-center rounded-md border-2 border-zinc-950"
                  title="Edit listing"
                >
                  <Edit3 className="size-4" />
                </button>
              ) : null}
              {item.convexId && canArchiveOrganizerListing(item.status) ? (
                <button
                  onClick={() => {
                    if (!item.convexId) return;

                    void onArchiveListing?.(item.convexId);
                  }}
                  className="grid size-8 place-items-center rounded-md border-2 border-zinc-950 text-zinc-700"
                  title="Archive listing"
                >
                  <Archive className="size-4" />
                </button>
              ) : null}
              {item.convexId && canCancelOrganizerListing(item.status) ? (
                <button
                  onClick={() => startCancellation(item)}
                  className="rounded-md border-2 border-red-700 px-3 text-xs font-black text-red-700"
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

function OrganizerTabs({
  activeTab,
  setActiveTab,
}: {
  activeTab: OrganizerTab;
  setActiveTab: (tab: OrganizerTab) => void;
}) {
  const tabs: { label: string; value: OrganizerTab }[] = [
    { label: "Listings", value: "listings" },
    { label: "Create", value: "create" },
    { label: "Insights", value: "insights" },
  ];

  return (
    <div className="flex w-fit rounded-lg border-2 border-zinc-950 bg-white p-1 shadow-[3px_3px_0_#111]">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => setActiveTab(tab.value)}
          className={`h-9 rounded-md px-4 text-sm font-black ${
            activeTab === tab.value
              ? "bg-zinc-950 text-white"
              : "text-zinc-600 hover:bg-zinc-100"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
