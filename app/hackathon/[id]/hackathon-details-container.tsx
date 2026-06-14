"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { getUiHackathon } from "@/components/data/adapters";
import { hackathons } from "@/lib/sample-data";
import { getListingDataSourceItems } from "@/lib/listing-data-source";
import { ExploreView } from "./explore-view";

export function HackathonDetailsContainer({ id }: { id: string }) {
  const sampleHackathon = hackathons.find((hackathon) => hackathon.id === id);
  const convexHackathon = useQuery(
    api.hackathons.getById,
    sampleHackathon ? "skip" : { hackathonId: id as Id<"hackathons"> },
  );
  const convexHackathons = useQuery(api.hackathons.listPublished, {});
  const teams = useQuery(
    api.teams.listByHackathon,
    convexHackathon?._id
      ? { hackathonId: convexHackathon._id }
      : "skip",
  );

  if (sampleHackathon) {
    return (
      <ExploreView
        id={id}
        hackathon={sampleHackathon}
        allHackathons={hackathons}
      />
    );
  }

  if (convexHackathon === undefined) {
    return (
      <div className="min-h-screen bg-[#f5f3ef] p-8 text-sm font-black text-zinc-500">
        Loading hackathon...
      </div>
    );
  }

  if (convexHackathon === null) {
    return (
      <div className="min-h-screen bg-[#f5f3ef] p-8 text-sm font-black text-zinc-500">
        Hackathon not found.
      </div>
    );
  }

  const allHackathons = getListingDataSourceItems({
    isConvexEnabled: Boolean(process.env.NEXT_PUBLIC_CONVEX_URL),
    convexItems: convexHackathons?.map(getUiHackathon),
    fallbackItems: hackathons,
  });

  return (
    <ExploreView
      id={id}
      hackathon={getUiHackathon(convexHackathon)}
      allHackathons={allHackathons}
      teams={teams ?? []}
    />
  );
}
