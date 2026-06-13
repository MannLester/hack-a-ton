import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Award,
  CalendarDays,
  Clock,
  MapPin,
  Users,
} from "lucide-react";
import { hackathons } from "@/lib/sample-data";
import { PanelCard, StatusPill, statusClass } from "@/components/shared/primitives";

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

  return (
    <div className="min-h-screen bg-[#f5f3ef] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-zinc-600 hover:text-zinc-950"
        >
          <ArrowLeft className="size-4" />
          Back to Explore
        </Link>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="order-2 lg:order-1 lg:sticky lg:top-6 lg:self-start">
            <h2 className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-[#00a7e8]">
              All Hackathons
            </h2>
            <div className="space-y-2">
              {hackathons.map((h) => {
                const isSelected = h.id === id;
                return (
                  <Link
                    key={h.id}
                    href={`/hackathon/${h.id}`}
                    className={`block rounded-lg border-2 p-3 transition-all ${
                      isSelected
                        ? "border-[#00a7e8] bg-[#00a7e8]/5 shadow-[3px_3px_0_#00a7e8]"
                        : "border-zinc-200 bg-white hover:border-zinc-950 hover:shadow-[3px_3px_0_#111]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <StatusPill className={statusClass(h.status)}>
                        {h.status}
                      </StatusPill>
                      {isSelected && (
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#00a7e8]">
                          Viewing
                        </span>
                      )}
                    </div>
                    <h3 className="mt-2 text-sm font-black text-zinc-950">
                      {h.name}
                    </h3>
                    <div className="mt-1.5 flex flex-wrap gap-1.5 text-[11px] font-bold text-zinc-500">
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="size-3 text-[#00a7e8]" />
                        {h.date}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="size-3 text-[#00a7e8]" />
                        {h.format}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </aside>

          <main className="order-1 space-y-6 lg:order-2">
            <PanelCard className="border-zinc-950 p-6">
              <div className="flex flex-wrap items-center gap-3">
                <StatusPill className={statusClass(hackathon.status)}>
                  {hackathon.status}
                </StatusPill>
                <span className="rounded-md border-2 border-zinc-950 bg-zinc-100 px-2.5 py-1 text-xs font-black text-zinc-700">
                  {hackathon.difficulty}
                </span>
              </div>

              <h1 className="mt-4 text-3xl font-black tracking-tight text-zinc-950 sm:text-4xl">
                {hackathon.name}
              </h1>
              <p className="mt-2 text-lg font-bold text-zinc-500">
                {hackathon.organizer}
              </p>

              <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-600">
                {hackathon.summary}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border-2 border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-bold text-zinc-700">
                  <CalendarDays className="size-4 text-[#00a7e8]" />
                  {hackathon.date}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border-2 border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-bold text-zinc-700">
                  <MapPin className="size-4 text-[#00a7e8]" />
                  {hackathon.format} · {hackathon.location}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border-2 border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-bold text-zinc-700">
                  <Users className="size-4 text-[#00a7e8]" />
                  Team {hackathon.teamSize}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border-2 border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-bold text-zinc-700">
                  <Award className="size-4 text-[#00a7e8]" />
                  {hackathon.prize}
                </span>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {hackathon.themes.map((theme) => (
                  <span
                    key={theme}
                    className="rounded-md border border-[#00a7e8]/20 bg-[#00a7e8]/10 px-3 py-1.5 text-sm font-black text-[#006c9c]"
                  >
                    {theme}
                  </span>
                ))}
                {hackathon.eligibility.map((item) => (
                  <span
                    key={item}
                    className="rounded-md border border-[#ffd21f]/30 bg-[#ffd21f]/20 px-3 py-1.5 text-sm font-black text-[#7a5700]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </PanelCard>

            <PanelCard className="border-zinc-950 p-6">
              <h2 className="text-lg font-black text-zinc-950">Stats</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border-2 border-zinc-200 bg-zinc-50 p-4 text-center">
                  <p className="text-2xl font-black text-zinc-950">
                    {hackathon.interested}
                  </p>
                  <p className="mt-1 text-sm font-bold text-zinc-500">Interested</p>
                </div>
                <div className="rounded-lg border-2 border-zinc-200 bg-zinc-50 p-4 text-center">
                  <p className="text-2xl font-black text-zinc-950">
                    {hackathon.lftCount}
                  </p>
                  <p className="mt-1 text-sm font-bold text-zinc-500">
                    Looking for Teammates
                  </p>
                </div>
                <div className="rounded-lg border-2 border-zinc-200 bg-zinc-50 p-4 text-center">
                  <p className="inline-flex items-center gap-2 text-2xl font-black text-zinc-950">
                    <Clock className="size-5 text-[#00a7e8]" />
                    {hackathon.deadline}
                  </p>
                  <p className="mt-1 text-sm font-bold text-zinc-500">Deadline</p>
                </div>
              </div>
            </PanelCard>
          </main>
        </div>
      </div>
    </div>
  );
}
