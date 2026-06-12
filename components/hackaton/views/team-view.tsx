import type { Teammate } from "../types";
import { TeammateCard } from "../cards";
import { EmptyState, FeaturePanel, SectionTitle } from "../ui";

export function TeamView({
  visibleTeammates,
  likedTeammates,
  showMatches,
  setShowMatches,
  onDismissTeammate,
  onLikeTeammate,
}: {
  visibleTeammates: Teammate[];
  likedTeammates: Teammate[];
  showMatches: boolean;
  setShowMatches: (showMatches: boolean) => void;
  onDismissTeammate: (teammateName: string) => void;
  onLikeTeammate: (teammate: Teammate) => void;
}) {
  const listedTeammates = showMatches ? likedTeammates : visibleTeammates;
  const emptyMessage = showMatches
    ? "No liked teammates yet."
    : "No more teammate cards right now.";

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Participant / Team Up"
        title="Find teammates for a specific hackathon"
      />
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <section className="grid gap-4">
          {listedTeammates.map((person) => (
            <TeammateCard
              key={person.name}
              teammate={person}
              onDismiss={onDismissTeammate}
              onLike={onLikeTeammate}
            />
          ))}
          {listedTeammates.length === 0 ? (
            <EmptyState message={emptyMessage} />
          ) : null}
        </section>
        <FeaturePanel className="p-5">
          <h3 className="text-lg font-black">Your LFT card</h3>
          <p className="mt-2 text-sm font-medium leading-6 text-zinc-600">
            Frontend developer · React · available weekends · looking for
            backend and pitch support.
          </p>
          <div className="mt-5 space-y-3">
            <button className="h-10 w-full rounded-md bg-zinc-950 text-sm font-black text-white">
              Edit card
            </button>
            <button
              onClick={() => setShowMatches(!showMatches)}
              className="h-10 w-full rounded-md border-2 border-zinc-950 text-sm font-black text-zinc-800"
            >
              {showMatches ? "View cards" : "View matches"}
            </button>
          </div>
        </FeaturePanel>
      </div>
    </div>
  );
}
