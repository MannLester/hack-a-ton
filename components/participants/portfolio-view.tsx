import { useEffect, useState } from "react";
import { Edit3, Save, X } from "lucide-react";
import { badges, hackathons } from "@/lib/sample-data";
import type {
  PortfolioEntry,
  PortfolioPlacementStat,
  PortfolioProfile,
} from "@/components/shared/types";
import { AuthActionButton } from "@/components/shared/auth-controls";
import { FeaturePanel, SectionTitle } from "@/components/shared/primitives";
import { BackToExploreButton } from "@/components/participants/back-to-explore-button";
import { PortfolioPlacementSummary } from "@/components/participants/portfolio-placement-summary";

const fallbackProfileTags = ["Frontend", "Backend", "AI/ML", "Pitching"];

const defaultPlacementStats: PortfolioPlacementStat[] = [
  { placement: "first", label: "1st place", count: 0, points: 0 },
  { placement: "second", label: "2nd place", count: 0, points: 0 },
  { placement: "third", label: "3rd place", count: 0, points: 0 },
  { placement: "participant", label: "Participant", count: 0, points: 0 },
];

function getFallbackPlacementStats(): PortfolioPlacementStat[] {
  return [
    { placement: "first", label: "1st place", count: 0, points: 0 },
    { placement: "second", label: "2nd place", count: 0, points: 0 },
    { placement: "third", label: "3rd place", count: 1, points: 50 },
    { placement: "participant", label: "Participant", count: 2, points: 20 },
  ];
}

function getFallbackEntries(): PortfolioEntry[] {
  return hackathons.slice(0, 3).map((hackathon, index) => ({
    hackathonName: hackathon.name,
    result: index === 0 ? "finalist" : "participant",
    source: "verified",
    placement: index === 0 ? "third" : "participant",
    hackathonDate: hackathon.date,
  }));
}

export function PortfolioView({
  profile,
  onSaveBio,
  onBack,
  useSampleFallback = false,
}: {
  profile?: PortfolioProfile;
  onSaveBio?: (bio: string) => Promise<void>;
  onBack: () => void;
  useSampleFallback?: boolean;
}) {
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [bioValue, setBioValue] = useState(profile?.bio ?? "");
  const [statusMessage, setStatusMessage] = useState("");
  const displayBadges = profile?.badges ?? (useSampleFallback ? badges : []);
  const displayProfileTags = profile?.profileTags ??
    (useSampleFallback ? fallbackProfileTags : []);
  const displayPlacementStats = profile?.placementStats ??
    (useSampleFallback ? getFallbackPlacementStats() : defaultPlacementStats);
  const displayEntries = profile?.entries ??
    (useSampleFallback ? getFallbackEntries() : []);
  const displayBio = profile?.bio ??
    (useSampleFallback
      ? "Builds civic tech prototypes, dashboards, and product demos. Looking for practical hackathons with real community use."
      : "No bio yet.");
  const displayInitials = profile?.initials ?? (useSampleFallback ? "JR" : "HA");
  const displayName = profile?.displayName ??
    (useSampleFallback ? "Juan Ramos" : "Hack-A-Ton Builder");
  const displayMeta = profile?.meta ??
    (useSampleFallback ? "Student builder · Manila" : "No profile details yet.");
  useEffect(() => {
    if (isEditingBio) return;

    setBioValue(profile?.bio ?? "");
  }, [isEditingBio, profile?.bio]);

  const startEditingBio = () => {
    setBioValue(profile?.bio === "No bio yet." ? "" : (profile?.bio ?? ""));
    setStatusMessage("");
    setIsEditingBio(true);
  };

  const cancelEditingBio = () => {
    setBioValue(profile?.bio ?? "");
    setIsEditingBio(false);
  };

  const saveBio = async () => {
    setIsSaving(true);
    try {
      await onSaveBio?.(bioValue);
      setStatusMessage("Bio saved.");
      setIsEditingBio(false);
    } catch {
      setStatusMessage("Could not save bio.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-5">
        <BackToExploreButton onBack={onBack} />
        <SectionTitle
          eyebrow="Participant / Portfolio"
          title="Your hackathon identity"
          action={null}
        />
      </div>
      <section className="grid gap-4 lg:grid-cols-[340px_1fr]">
        <FeaturePanel className="p-5">
          <div className="flex items-center gap-4">
            <div className="grid size-16 place-items-center rounded-lg bg-zinc-950 text-xl font-black text-white">
              {displayInitials}
            </div>
            <div>
              <h3 className="text-lg font-black">
                {displayName}
              </h3>
              <p className="text-sm font-bold text-zinc-500">
                {displayMeta}
              </p>
            </div>
          </div>
          <div className="mt-4">
            {isEditingBio ? (
              <div className="space-y-3">
                <textarea
                  value={bioValue}
                  onChange={(event) => setBioValue(event.target.value)}
                  rows={5}
                  maxLength={240}
                  className="w-full rounded-md border-2 border-zinc-200 bg-white px-3 py-2 text-sm font-medium leading-6 text-zinc-700 outline-none focus:border-[#00a7e8]"
                  placeholder="Tell builders what you make, what you care about, or what kind of teams you want."
                />
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-bold text-zinc-400">
                    {bioValue.length}/240
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={cancelEditingBio}
                      disabled={isSaving}
                      className="inline-flex h-9 items-center gap-1.5 rounded-md border-2 border-zinc-950 px-3 text-xs font-black text-zinc-950 disabled:opacity-50"
                    >
                      <X className="size-3.5" /> Cancel
                    </button>
                    <button
                      onClick={saveBio}
                      disabled={isSaving}
                      className="inline-flex h-9 items-center gap-1.5 rounded-md border-2 border-zinc-950 bg-[#ffd21f] px-3 text-xs font-black text-zinc-950 disabled:opacity-50"
                    >
                      <Save className="size-3.5" /> {isSaving ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium leading-6 text-zinc-600">
                  {displayBio}
                </p>
                {displayProfileTags.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {displayProfileTags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md border-2 border-zinc-200 bg-white px-2.5 py-1 text-xs font-black text-zinc-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
                <AuthActionButton
                  action="edit_portfolio"
                  onAuthorizedClick={startEditingBio}
                  className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-md border-2 border-zinc-950 bg-white px-3 text-xs font-black text-zinc-950 shadow-[2px_2px_0_#111]"
                  signedOutLabel={
                    <>
                      <Edit3 className="size-3.5" /> Log in to edit bio
                    </>
                  }
                >
                  <Edit3 className="size-3.5" /> Edit bio
                </AuthActionButton>
              </div>
            )}
          </div>
          {statusMessage ? (
            <p className="mt-3 text-sm font-black text-zinc-500">
              {statusMessage}
            </p>
          ) : null}
          {displayBadges.length > 0 ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {displayBadges.map((badge) => (
                <span
                  key={badge}
                  className="rounded-md bg-[#ffd21f]/25 px-2 py-1 text-xs font-black text-[#7a5700]"
                >
                  {badge}
                </span>
              ))}
            </div>
          ) : null}
        </FeaturePanel>
        <PortfolioPlacementSummary
          entries={displayEntries}
          placementStats={displayPlacementStats}
        />
      </section>
    </div>
  );
}
