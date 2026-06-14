import { Medal, Trophy, Users } from "lucide-react";
import type { LeaderboardRow } from "@/components/shared/types";
import { EmptyState, PanelCard, SectionTitle, StatCard } from "@/components/shared/primitives";
import { BackToExploreButton } from "@/components/participants/back-to-explore-button";

function getRankStyle(index: number) {
  if (index === 0) return "bg-[#ffd21f] text-zinc-950";
  if (index === 1) return "bg-zinc-200 text-zinc-950";
  if (index === 2) return "bg-[#00a7e8]/20 text-[#006c9c]";
  return "bg-zinc-100 text-zinc-600";
}

export function LeaderboardView({
  rows = [],
  onBack,
}: {
  rows?: LeaderboardRow[];
  onBack: () => void;
}) {
  const topBuilder = rows[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-5">
        <BackToExploreButton onBack={onBack} />
        <SectionTitle
          eyebrow="Community"
          title="Hackathon leaderboard"
          action={
            topBuilder ? (
              <span className="rounded-md border-2 border-zinc-950 bg-[#ffd21f] px-3 py-2 text-xs font-black text-zinc-950 shadow-[3px_3px_0_#111]">
                Top builder: {topBuilder.displayName}
              </span>
            ) : null
          }
        />
      </div>
      <section className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Ranked Builders" value={String(rows.length)} icon={Users} />
        <StatCard label="Top Score" value={String(topBuilder?.score ?? 0)} icon={Trophy} />
        <StatCard
          label="Wins Counted"
          value={String(rows.reduce((total, row) => total + row.wins, 0))}
          icon={Medal}
        />
      </section>
      <PanelCard>
        <div className="space-y-3">
          {rows.map((row, index) => (
            <div
              key={row.userId}
              className="grid gap-3 rounded-md border-2 border-zinc-100 p-3 sm:grid-cols-[auto_1fr_auto] sm:items-center"
            >
              <div className={`grid size-10 place-items-center rounded-md text-sm font-black ${getRankStyle(index)}`}>
                #{index + 1}
              </div>
              <div className="flex min-w-0 items-center gap-3">
                <div className="grid size-10 place-items-center rounded-md bg-zinc-950 text-sm font-black text-white">
                  {row.initials}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-black text-zinc-950">{row.displayName}</p>
                  <p className="text-xs font-bold text-zinc-500">
                    {row.participations} joined · {row.finals} finals · {row.wins} wins · {row.teamsFormed} teams
                  </p>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-2xl font-black text-zinc-950">{row.score}</p>
                <p className="text-xs font-black uppercase text-zinc-400">points</p>
              </div>
            </div>
          ))}
        </div>
        {rows.length === 0 ? (
          <div className="mt-4">
            <EmptyState message="No leaderboard entries yet. Add portfolio entries or create teams to appear here." />
          </div>
        ) : null}
      </PanelCard>
    </div>
  );
}
