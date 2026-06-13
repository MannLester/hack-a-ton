import { useState } from "react";
import { Edit3, Plus, Save, Trophy, X } from "lucide-react";
import { badges, hackathons, portfolioStats } from "@/lib/sample-data";
import type { PortfolioEntry, PortfolioProfile } from "@/components/shared/types";
import { AuthActionButton } from "@/components/shared/auth-controls";
import { FeaturePanel, PanelCard, SectionTitle, StatCard } from "@/components/shared/primitives";

type PortfolioEntryFormValues = {
  entryId?: PortfolioEntry["id"];
  hackathonName: string;
  result: PortfolioEntry["result"];
};

const emptyEntryForm: PortfolioEntryFormValues = {
  hackathonName: "",
  result: "participant",
};

function getFallbackEntries(): PortfolioEntry[] {
  return hackathons.slice(0, 3).map((hackathon, index) => ({
    hackathonName: hackathon.name,
    result: index === 0 ? "finalist" : "participant",
    source: index === 0 ? "verified" : "self_reported",
  }));
}

function getResultLabel(result: PortfolioEntry["result"]) {
  if (result === "winner") return "Winner";
  if (result === "finalist") return "Finalist";
  return "Participant";
}

export function PortfolioView({
  profile,
  onSaveEntry,
  onDeleteEntry,
}: {
  profile?: PortfolioProfile;
  onSaveEntry?: (values: PortfolioEntryFormValues) => Promise<void>;
  onDeleteEntry?: (entryId: NonNullable<PortfolioEntry["id"]>) => Promise<void>;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formValues, setFormValues] = useState(emptyEntryForm);
  const [statusMessage, setStatusMessage] = useState("");
  const displayBadges = profile?.badges ?? badges;
  const displayStats = profile?.stats ?? portfolioStats;
  const displayEntries = profile?.entries ?? getFallbackEntries();

  const startNewEntry = () => {
    setFormValues(emptyEntryForm);
    setStatusMessage("");
    setIsEditing(true);
  };

  const startEditingEntry = (entry: PortfolioEntry) => {
    setFormValues({
      entryId: entry.id,
      hackathonName: entry.hackathonName,
      result: entry.result,
    });
    setStatusMessage("");
    setIsEditing(true);
  };

  const saveEntry = async () => {
    if (!formValues.hackathonName.trim()) {
      setStatusMessage("Add a hackathon name first.");
      return;
    }

    setIsSaving(true);
    try {
      await onSaveEntry?.({
        ...formValues,
        hackathonName: formValues.hackathonName.trim(),
      });
      setStatusMessage("Portfolio entry saved.");
      setFormValues(emptyEntryForm);
      setIsEditing(false);
    } catch {
      setStatusMessage("Could not save portfolio entry.");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteEntry = async (entryId: NonNullable<PortfolioEntry["id"]>) => {
    setIsSaving(true);
    try {
      await onDeleteEntry?.(entryId);
      setStatusMessage("Portfolio entry removed.");
      setIsEditing(false);
    } catch {
      setStatusMessage("Could not remove portfolio entry.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Participant / Portfolio"
        title="Your hackathon identity"
        action={
          <AuthActionButton
            action="edit_portfolio"
            onAuthorizedClick={startNewEntry}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border-2 border-zinc-950 bg-[#ffd21f] px-4 text-sm font-black text-zinc-950 shadow-[3px_3px_0_#111]"
            signedOutLabel={
              <>
                <Edit3 className="size-4" /> Log in to edit
              </>
            }
          >
            <Plus className="size-4" /> Add entry
          </AuthActionButton>
        }
      />
      {isEditing ? (
        <FeaturePanel className="p-5">
          <div className="grid gap-3 md:grid-cols-[1fr_180px_auto] md:items-end">
            <div>
              <label className="text-xs font-black text-zinc-700">Hackathon</label>
              <input
                value={formValues.hackathonName}
                onChange={(event) =>
                  setFormValues((currentValues) => ({
                    ...currentValues,
                    hackathonName: event.target.value,
                  }))
                }
                className="mt-1 h-11 w-full rounded-md border-2 border-zinc-200 px-3 text-sm font-bold outline-none focus:border-[#00a7e8]"
                placeholder="e.g. PH AI Build Weekend"
              />
            </div>
            <div>
              <label className="text-xs font-black text-zinc-700">Result</label>
              <select
                value={formValues.result}
                onChange={(event) =>
                  setFormValues((currentValues) => ({
                    ...currentValues,
                    result: event.target.value as PortfolioEntry["result"],
                  }))
                }
                className="mt-1 h-11 w-full rounded-md border-2 border-zinc-200 bg-white px-3 text-sm font-bold outline-none focus:border-[#00a7e8]"
              >
                <option value="participant">Participant</option>
                <option value="finalist">Finalist</option>
                <option value="winner">Winner</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={saveEntry}
                disabled={isSaving}
                className="inline-flex h-11 items-center gap-2 rounded-md bg-zinc-950 px-4 text-sm font-black text-white disabled:opacity-50"
              >
                <Save className="size-4" /> Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
                className="inline-flex h-11 items-center gap-2 rounded-md border-2 border-zinc-950 px-4 text-sm font-black text-zinc-950 disabled:opacity-50"
              >
                <X className="size-4" /> Cancel
              </button>
            </div>
          </div>
          {statusMessage ? (
            <p className="mt-3 text-sm font-black text-zinc-500">{statusMessage}</p>
          ) : null}
        </FeaturePanel>
      ) : null}
      <section className="grid gap-4 lg:grid-cols-[340px_1fr]">
        <FeaturePanel className="p-5">
          <div className="flex items-center gap-4">
            <div className="grid size-16 place-items-center rounded-lg bg-zinc-950 text-xl font-black text-white">
              {profile?.initials ?? "JR"}
            </div>
            <div>
              <h3 className="text-lg font-black">
                {profile?.displayName ?? "Juan Ramos"}
              </h3>
              <p className="text-sm font-bold text-zinc-500">
                {profile?.meta ?? "Student builder · Manila"}
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm font-medium leading-6 text-zinc-600">
            {profile?.bio ??
              "Builds civic tech prototypes, dashboards, and product demos. Looking for practical hackathons with real community use."}
          </p>
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
        </FeaturePanel>
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-4">
            {displayStats.map((stat) => (
              <StatCard
                key={stat.label}
                label={stat.label}
                value={stat.value}
                icon={Trophy}
              />
            ))}
          </div>
          <PanelCard>
            <h3 className="text-lg font-black">Recent participation</h3>
            <div className="mt-4 space-y-4">
              {displayEntries.slice(0, 6).map((item, index) => (
                <div
                  key={`${item.hackathonName}-${item.result}-${index}`}
                  className="flex items-start justify-between gap-3 border-t-2 border-zinc-100 pt-4 first:border-t-0 first:pt-0"
                >
                  <div className="flex items-start gap-3">
                    <span className="grid size-9 place-items-center rounded-md bg-zinc-100 text-sm font-black text-zinc-600">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-black text-zinc-950">
                        {item.hackathonName}
                      </p>
                      <p className="text-sm font-bold text-zinc-500">
                        {`${getResultLabel(item.result)} · ${item.source === "verified" ? "verified" : "self-reported"}`}
                      </p>
                    </div>
                  </div>
                  {item.source === "self_reported" && item.id ? (
                    <div className="flex gap-1">
                      <button
                        onClick={() => startEditingEntry(item)}
                        className="grid size-8 place-items-center rounded-md border-2 border-zinc-950 text-zinc-950"
                      >
                        <Edit3 className="size-4" />
                      </button>
                      <button
                        onClick={() => deleteEntry(item.id!)}
                        disabled={isSaving}
                        className="grid size-8 place-items-center rounded-md border-2 border-zinc-950 text-zinc-950 disabled:opacity-50"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </PanelCard>
        </div>
      </section>
    </div>
  );
}
