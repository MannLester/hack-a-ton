"use client";

import { useState } from "react";
import { SignInButton, SignOutButton, SignUpButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import { ChevronDown, LogOut, Medal, Trophy } from "lucide-react";
import type { ParticipantTab, Persona } from "@/components/shared/types";
import {
  isClerkConfigured,
  useClerkAuthState,
} from "@/components/shared/convex-provider";
import { Modal } from "@/components/shared/modal";

function SignedOutActions() {
  return (
    <>
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
    </>
  );
}

function SignedInActions({ onPortfolioClick }: { onPortfolioClick?: () => void }) {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-md p-1 hover:bg-white/10 transition"
      >
        {user?.imageUrl ? (
          <img
            src={user.imageUrl}
            alt="Profile"
            className="size-9 rounded-full object-cover"
          />
        ) : (
          <div className="grid size-9 place-items-center rounded-full bg-[#ffd21f] text-sm font-black text-zinc-950">
            {user?.firstName?.[0] ?? "U"}
          </div>
        )}
        <ChevronDown className={`size-4 text-zinc-400 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-lg border-2 border-zinc-950 bg-white shadow-[5px_5px_0_#111]">
            <button
              onClick={() => {
                setOpen(false);
                onPortfolioClick?.();
              }}
              className="flex w-full items-center gap-3 px-4 py-3 text-sm font-black text-zinc-950 hover:bg-zinc-100"
            >
              <Trophy className="size-4" /> View Profile
            </button>
            <div className="border-t-2 border-zinc-100" />
            <button
              onClick={() => {
                setOpen(false);
                setShowSignOutModal(true);
              }}
              className="flex w-full items-center gap-3 px-4 py-3 text-sm font-black text-zinc-950 hover:bg-zinc-100"
            >
              <LogOut className="size-4" /> Sign out
            </button>
          </div>
        </>
      )}

      <Modal
        open={showSignOutModal}
        onClose={() => setShowSignOutModal(false)}
        title="Sign out?"
      >
        <p className="text-sm font-medium text-zinc-600">
          Are you sure you want to sign out of your account?
        </p>
        <div className="mt-5 flex gap-3">
          <button
            onClick={() => setShowSignOutModal(false)}
            className="h-11 flex-1 rounded-md border-2 border-zinc-950 text-sm font-black text-zinc-800"
          >
            Cancel
          </button>
          <SignOutButton redirectUrl="/">
            <button className="h-11 flex-1 rounded-md bg-[#ffd21f] text-sm font-black text-zinc-950 shadow-[3px_3px_0_#111]">
              Sign out
            </button>
          </SignOutButton>
        </div>
      </Modal>
    </div>
  );
}

function AuthNavigationActions({ onPortfolioClick }: { onPortfolioClick?: () => void }) {
  const { isSignedIn } = useClerkAuthState();

  if (!isClerkConfigured()) return null;
  if (isSignedIn) return <SignedInActions onPortfolioClick={onPortfolioClick} />;
  return <SignedOutActions />;
}

export function AppNavigation({
  persona,
  setPersona,
  setParticipantTab,
  activeTab,
}: {
  persona: Persona;
  setPersona: (persona: Persona) => void;
  setParticipantTab: (tab: ParticipantTab) => void;
  activeTab?: ParticipantTab;
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
            onClick={() => {
              setPersona("participant");
            }}
            className={`h-9 rounded-md px-4 text-sm font-black ${persona === "participant" ? "bg-[#ffd21f] text-zinc-950" : "text-white hover:bg-white/10"}`}
          >
            Participant
          </button>
          <button
            onClick={() => {
              setPersona("organizer");
            }}
            className={`h-9 rounded-md px-4 text-sm font-black ${persona === "organizer" ? "bg-[#00a7e8] text-zinc-950" : "text-white hover:bg-white/10"}`}
          >
            Organizer
          </button>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {persona === "participant" && (
            <button
              onClick={() => setParticipantTab("leaderboard")}
              className="inline-flex items-center gap-2 rounded-full bg-[#ffd21f] px-4 py-2 text-sm font-black text-zinc-950 shadow-[3px_3px_0_#111] transition hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#111]"
            >
              <Medal className="size-4" />
              Leaderboard
            </button>
          )}
          <AuthNavigationActions onPortfolioClick={() => setParticipantTab("portfolio")} />
        </div>
      </div>
      <div className="grid grid-cols-2 border-t border-white/10 sm:hidden">
        <button
          onClick={() => {
            setPersona("participant");
          }}
          className={`h-11 text-sm font-black ${persona === "participant" ? "bg-[#ffd21f] text-zinc-950" : "text-white"}`}
        >
          Participant
        </button>
        <button
          onClick={() => {
            setPersona("organizer");
          }}
          className={`h-11 text-sm font-black ${persona === "organizer" ? "bg-[#00a7e8] text-zinc-950" : "text-white"}`}
        >
          Organizer
        </button>
      </div>
    </header>
  );
}
