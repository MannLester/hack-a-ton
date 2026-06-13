import { CheckCircle2, ClipboardCheck, Edit3, FileText, Plus, Users } from "lucide-react";
import { hackathons, type Hackathon } from "@/lib/sample-data";
import type {
  CreateListingFormValues,
  OrganizerTab,
} from "@/components/shared/types";
import { SectionTitle, StatCard, statusClass } from "@/components/shared/primitives";
import { CreateListingView } from "@/components/organizers/create-listing-view";
import { OrganizerInsightsView } from "@/components/organizers/insights-view";

export function OrganizerView({
  activeTab,
  setActiveTab,
  listings = hackathons,
  stats,
  insights,
  onSaveDraft,
  onSubmitForReview,
}: {
  activeTab: OrganizerTab;
  setActiveTab: (tab: OrganizerTab) => void;
  listings?: Hackathon[];
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
}) {
  if (activeTab === "create") {
    return (
      <CreateListingView
        onBack={() => setActiveTab("listings")}
        onSaveDraft={onSaveDraft}
        onSubmitForReview={onSubmitForReview}
      />
    );
  }
  if (activeTab === "insights")
    return <OrganizerInsightsView totals={insights} />;
  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Organizer mode"
        title="Manage your hackathon listings only"
        action={
          <button
            onClick={() => setActiveTab("create")}
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
            </div>
            <div className="flex gap-2">
              <span
                className={`w-fit rounded-full border px-2.5 py-1 text-xs font-black ${statusClass(item.status)}`}
              >
                {item.status}
              </span>
              <button className="grid size-8 place-items-center rounded-md border-2 border-zinc-950">
                <Edit3 className="size-4" />
              </button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
