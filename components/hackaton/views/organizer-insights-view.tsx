import { Bookmark, ChevronRight, Users } from "lucide-react";
import { FeaturePanel, SectionTitle, StatCard } from "../ui";

export function OrganizerInsightsView({
  totals,
}: {
  totals?: {
    savedCount: number;
    lftClickCount: number;
    externalRegistrationClickCount: number;
  };
}) {
  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Organizer mode"
        title="Lightweight listing interest signals"
      />
      <section className="grid gap-4 lg:grid-cols-3">
        <StatCard
          label="Saved listings"
          value={totals ? String(totals.savedCount) : "418"}
          icon={Bookmark}
        />
        <StatCard
          label="LFT clicks"
          value={totals ? String(totals.lftClickCount) : "185"}
          icon={Users}
        />
        <StatCard
          label="External registrations"
          value={
            totals
              ? String(totals.externalRegistrationClickCount)
              : "Not tracked"
          }
          icon={ChevronRight}
        />
      </section>
      <FeaturePanel className="p-5">
        <p className="text-sm font-bold leading-6 text-zinc-600">
          Hack-A-Ton intentionally does not manage registration or submissions.
          Organizers get discovery metrics and participant interest signals,
          then users register through the official external link.
        </p>
      </FeaturePanel>
    </div>
  );
}
