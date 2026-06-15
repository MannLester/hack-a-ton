import { HackathonDetailsContainer } from "./hackathon-details-container";
import { NotFoundView } from "@/components/shared/not-found-view";
import { hackathons } from "@/lib/sample-data";

const convexHackathonIdPattern = /^j[0-9a-z]{31}$/;

function canResolveHackathonId(id: string) {
  const isSampleHackathon = hackathons.some((hackathon) => hackathon.id === id);

  if (isSampleHackathon) return true;

  return convexHackathonIdPattern.test(id);
}


export default async function HackathonDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!canResolveHackathonId(id)) {
    return (
      <NotFoundView
        title="Hackathon not found"
        message="This hackathon is unavailable, unpublished, or no longer visible to participants."
      />
    );
  }

  return <HackathonDetailsContainer id={id} />;
}
