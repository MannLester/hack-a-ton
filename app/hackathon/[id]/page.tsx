import { HackathonDetailsContainer } from "./hackathon-details-container";


export default async function HackathonDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <HackathonDetailsContainer id={id} />;
}
