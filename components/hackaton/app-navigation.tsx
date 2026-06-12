import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import { organizerTabs, participantTabs } from "./config";
import type { OrganizerTab, ParticipantTab, Persona } from "./types";

export function AppNavigation({
  persona,
  participantTab,
  organizerTab,
  setPersona,
  setParticipantTab,
  setOrganizerTab,
  toggleAdmin,
}: {
  persona: Persona;
  participantTab: ParticipantTab;
  organizerTab: OrganizerTab;
  setPersona: (persona: Persona) => void;
  setParticipantTab: (tab: ParticipantTab) => void;
  setOrganizerTab: (tab: OrganizerTab) => void;
  toggleAdmin: () => void;
}) {
  const activeTabs =
    persona === "participant" ? participantTabs : organizerTabs;

  return (
    <>
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

          <nav className="hidden items-center gap-1 lg:flex">
            {activeTabs.map((tab) => {
              const Icon = tab.icon;
              const active =
                persona === "participant"
                  ? participantTab === tab.id
                  : organizerTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() =>
                    persona === "participant"
                      ? setParticipantTab(tab.id as ParticipantTab)
                      : setOrganizerTab(tab.id as OrganizerTab)
                  }
                  className={`inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm font-black ${active ? "bg-white text-zinc-950" : "text-zinc-200 hover:bg-white/10"}`}
                >
                  <Icon className="size-4" /> {tab.label}
                </button>
              );
            })}
          </nav>

          <button
            onClick={toggleAdmin}
            className="hidden h-10 items-center gap-2 rounded-md border border-white/15 px-3 text-sm font-black text-white hover:bg-white/10 md:inline-flex"
          >
            <ShieldCheck className="size-4" /> Staff
          </button>
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

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-zinc-950 bg-white lg:hidden">
        <div className="grid grid-cols-3">
          {activeTabs.map((tab) => {
            const Icon = tab.icon;
            const active =
              persona === "participant"
                ? participantTab === tab.id
                : organizerTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() =>
                  persona === "participant"
                    ? setParticipantTab(tab.id as ParticipantTab)
                    : setOrganizerTab(tab.id as OrganizerTab)
                }
                className={`flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-black ${active ? "text-zinc-950" : "text-zinc-500"}`}
              >
                <Icon className="size-5" /> {tab.label}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
