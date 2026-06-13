"use client";

import Link from "next/link";
import { useState } from "react";
import { hackathons } from "@/lib/sample-data";
import { HackathonCard } from "@/components/participants/hackathon-card";
import { AppNavigation } from "@/components/shared/app-navigation";
import type { Persona } from "@/components/shared/types";

export function AllHackathonsView() {
  const [persona, setPersona] = useState<Persona>("participant");

  return (
    <div className="min-h-screen bg-[#f5f3ef]">
      <AppNavigation
        persona={persona}
        setPersona={setPersona}
        setParticipantTab={() => {}}
      />
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <nav className="flex items-center gap-2 text-sm font-bold text-zinc-600">
            <Link href="/" className="hover:text-zinc-950">
              Home
            </Link>
            <span>/</span>
            <span className="text-zinc-950">Explore</span>
          </nav>

          <div>
            <h1 className="text-4xl font-black tracking-tight text-zinc-950 sm:text-5xl">
              Explore Hackathons
            </h1>
            <p className="mt-2 max-w-2xl text-base font-medium leading-7 text-zinc-500">
              Browse all upcoming hackathons, discover opportunities, and find
              your next build.
            </p>
          </div>

          <section className="grid gap-4 sm:grid-cols-2">
            {hackathons.map((hackathon) => (
              <HackathonCard key={hackathon.id} hackathon={hackathon} />
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}
