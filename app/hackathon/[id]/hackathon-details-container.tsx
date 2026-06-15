"use client";

import { useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { api } from "@/convex/_generated/api";
import { getUiHackathon } from "@/components/data/adapters";
import { NotFoundView } from "@/components/shared/not-found-view";
import { getListingDataSourceItems } from "@/lib/listing-data-source";
import { ExploreView } from "./explore-view";

const hackathonLookupTimeoutMs = 8000;

export function HackathonDetailsContainer({ id }: { id: string }) {
  const [hasLookupTimedOut, setHasLookupTimedOut] = useState(false);
  const convexHackathons = useQuery(api.hackathons.listPublished, {});
  const convexHackathon = convexHackathons?.find(
    (hackathon) => hackathon._id === id,
  );
  const teams = useQuery(
    api.teams.listByHackathon,
    convexHackathon?._id
      ? { hackathonId: convexHackathon._id }
      : "skip",
  );

  useEffect(() => {
    setHasLookupTimedOut(false);

    if (convexHackathons !== undefined) return;

    const lookupTimeout = window.setTimeout(() => {
      setHasLookupTimedOut(true);
    }, hackathonLookupTimeoutMs);

    return () => window.clearTimeout(lookupTimeout);
  }, [convexHackathons, id]);

  if (convexHackathons === undefined && !hasLookupTimedOut) {
    return (
      <div className="min-h-screen bg-[#f5f3ef] p-8 text-sm font-black text-zinc-500">
        Loading hackathon...
      </div>
    );
  }

  if (!convexHackathon) {
    return (
      <NotFoundView
        title="Hackathon not found"
        message="This hackathon is unavailable, unpublished, or no longer visible to participants."
      />
    );
  }

  const allHackathons = getListingDataSourceItems({
    convexItems: convexHackathons?.map(getUiHackathon),
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
