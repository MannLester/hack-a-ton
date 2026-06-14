import { hackathons } from "@/lib/sample-data";
import { HackathonDetailsContainer } from "./hackathon-details-container";

export function generateStaticParams() {
  return hackathons.map((hackathon) => ({
    id: hackathon.id,
  }));
}

export default async function HackathonDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <HackathonDetailsContainer id={id} />;
}
