import { notFound } from "next/navigation";
import { hackathons } from "@/lib/sample-data";
import { ExploreView } from "./explore-view";

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
  const hackathon = hackathons.find((h) => h.id === id);

  if (!hackathon) {
    notFound();
  }

  return <ExploreView id={id} hackathon={hackathon} allHackathons={hackathons} />;
}
