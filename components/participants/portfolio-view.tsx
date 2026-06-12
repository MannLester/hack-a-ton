import { Trophy } from "lucide-react";
import { badges, hackathons, portfolioStats } from "@/lib/sample-data";
import type { PortfolioProfile } from "@/components/shared/types";
import { FeaturePanel, PanelCard, SectionTitle, StatCard } from "@/components/shared/ui";

export function PortfolioView({ profile }: { profile?: PortfolioProfile }) {
  const displayBadges = profile?.badges ?? badges;
  const displayStats = profile?.stats ?? portfolioStats;
  const displayEntries =
    profile?.entries ??
    hackathons.slice(0, 3).map((hackathon, index) => ({
      hackathonName: hackathon.name,
      result: index === 0 ? "finalist" : "participant",
      source: index === 0 ? "verified" : "self_reported",
    }));

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Participant / Portfolio"
        title="Your hackathon identity"
      />
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
              {displayEntries.slice(0, 3).map((item, index) => (
                <div
                  key={`${item.hackathonName}-${item.result}`}
                  className="flex items-start gap-3 border-t-2 border-zinc-100 pt-4 first:border-t-0 first:pt-0"
                >
                  <span className="grid size-9 place-items-center rounded-md bg-zinc-100 text-sm font-black text-zinc-600">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-black text-zinc-950">
                      {item.hackathonName}
                    </p>
                    <p className="text-sm font-bold text-zinc-500">
                      {`${item.result === "finalist" ? "Finalist" : item.result === "winner" ? "Winner" : "Participant"} · ${item.source === "verified" ? "verified" : "self-reported"}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </PanelCard>
        </div>
      </section>
    </div>
  );
}
