"use client";

import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import type { Persona } from "@/components/shared/types";

export function AppNavigation({
  persona,
  setPersona,
  setParticipantTab,
}: {
  persona: Persona;
  setPersona: (persona: Persona) => void;
  setParticipantTab: (tab: "explore") => void;
}) {
  return (
    <header className="sticky top-0 z-30 border-b-2 border-zinc-950 bg-zinc-950 text-white shadow-[0_4px_0_#00a7e8]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <button
          onClick={() => {
            setPersona("participant");
            setParticipantTab("explore");
          }}
          className="flex items-center gap-3 text-left"
        >
          <Image
            src="/brand/hack-a-ton-logo.png"
            alt="Hack-A-Ton"
            width={48}
            height={48}
            className="size-12 rounded-md border border-white/20 object-cover"
            priority
          />
          <span>
            <span className="block text-lg font-black leading-5 tracking-tight">
              Hack-A-Ton
            </span>
            <span className="block text-xs font-bold text-[#ffd21f]">
              Discover · Team · Flex
            </span>
          </span>
        </button>

        <div className="hidden rounded-lg border border-white/15 bg-white/10 p-1 sm:flex">
          <button
            onClick={() => setPersona("participant")}
            className={`h-9 rounded-md px-4 text-sm font-black ${persona === "participant" ? "bg-[#ffd21f] text-zinc-950" : "text-white hover:bg-white/10"}`}
          >
            Participant
          </button>
          <button
            onClick={() => setPersona("organizer")}
            className={`h-9 rounded-md px-4 text-sm font-black ${persona === "organizer" ? "bg-[#00a7e8] text-zinc-950" : "text-white hover:bg-white/10"}`}
          >
            Organizer
          </button>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="inline-flex h-10 items-center rounded-md px-4 text-sm font-black text-zinc-200 hover:bg-white/10">
                Log in
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="inline-flex h-10 items-center rounded-md border-2 border-zinc-950 bg-[#ffd21f] px-4 text-sm font-black text-zinc-950 shadow-[3px_3px_0_#111] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#111]">
                Sign up
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-black text-zinc-200">
              Signed in
            </span>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
      <div className="grid grid-cols-2 border-t border-white/10 sm:hidden">
        <button
          onClick={() => setPersona("participant")}
          className={`h-11 text-sm font-black ${persona === "participant" ? "bg-[#ffd21f] text-zinc-950" : "text-white"}`}
        >
          Participant
        </button>
        <button
          onClick={() => setPersona("organizer")}
          className={`h-11 text-sm font-black ${persona === "organizer" ? "bg-[#00a7e8] text-zinc-950" : "text-white"}`}
        >
          Organizer
        </button>
      </div>
    </header>
  );
}
