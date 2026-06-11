"use client";

import Image from "next/image";
import {
  Award,
  Bookmark,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Edit3,
  Filter,
  Flame,
  Heart,
  MapPin,
  Medal,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { badges, hackathons, portfolioStats, teammates, type Hackathon } from "@/lib/sample-data";

type Persona = "participant" | "organizer";
type ParticipantTab = "explore" | "team" | "portfolio";
type OrganizerTab = "listings" | "create" | "insights";

const participantTabs = [
  { id: "explore", label: "Explore", icon: Search },
  { id: "team", label: "Team Up", icon: Users },
  { id: "portfolio", label: "Portfolio", icon: Trophy },
] as const;

const organizerTabs = [
  { id: "listings", label: "Listings", icon: ClipboardCheck },
  { id: "create", label: "Create", icon: Plus },
  { id: "insights", label: "Insights", icon: Medal },
] as const;

const formats = ["All", "Online", "Onsite", "Hybrid"] as const;
const themes = ["All", "AI", "Fintech", "Civic Tech", "Climate", "Gaming", "Web"] as const;

function statusClass(status: Hackathon["status"]) {
  if (status === "Closing soon") return "border-[#ffd21f]/50 bg-[#ffd21f]/15 text-[#8a6200]";
  if (status === "Open") return "border-emerald-200 bg-emerald-50 text-emerald-800";
  return "border-[#00a7e8]/30 bg-[#00a7e8]/10 text-[#006c9c]";
}

function SectionTitle({ eyebrow, title, action }: { eyebrow: string; title: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#00a7e8]">{eyebrow}</p>
        <h2 className="mt-1 text-2xl font-black tracking-tight text-zinc-950 sm:text-3xl">{title}</h2>
      </div>
      {action}
    </div>
  );
}

function SprayPanel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`relative overflow-hidden rounded-lg border-2 border-zinc-950 bg-white shadow-[6px_6px_0_#111] ${className}`}>
      <div className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-[#ffd21f]/30 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-12 left-8 size-36 rounded-full bg-[#00a7e8]/20 blur-2xl" />
      <div className="relative">{children}</div>
    </section>
  );
}

function StatCard({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Trophy }) {
  return (
    <div className="rounded-lg border-2 border-zinc-900 bg-white p-4 shadow-[4px_4px_0_#111]">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-zinc-600">{label}</p>
        <Icon className="size-4 text-[#00a7e8]" />
      </div>
      <p className="mt-3 text-2xl font-black text-zinc-950">{value}</p>
    </div>
  );
}

function HackathonCard({ hackathon }: { hackathon: Hackathon }) {
  return (
    <article className="rounded-lg border-2 border-zinc-900 bg-white p-4 shadow-[5px_5px_0_#111] transition hover:-translate-y-0.5 hover:shadow-[7px_7px_0_#111]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full border px-2.5 py-1 text-xs font-black ${statusClass(hackathon.status)}`}>{hackathon.status}</span>
            <span className="rounded-full border border-zinc-300 bg-zinc-50 px-2.5 py-1 text-xs font-bold text-zinc-700">{hackathon.difficulty}</span>
          </div>
          <h3 className="mt-3 text-xl font-black text-zinc-950">{hackathon.name}</h3>
          <p className="mt-1 text-sm font-bold text-zinc-600">{hackathon.organizer}</p>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">{hackathon.summary}</p>
          <div className="mt-4 grid gap-2 text-sm font-medium text-zinc-600 sm:grid-cols-2 xl:grid-cols-4">
            <span className="flex items-center gap-2"><CalendarDays className="size-4 text-[#00a7e8]" />{hackathon.date}</span>
            <span className="flex items-center gap-2"><MapPin className="size-4 text-[#00a7e8]" />{hackathon.format} · {hackathon.location}</span>
            <span className="flex items-center gap-2"><Users className="size-4 text-[#00a7e8]" />Team {hackathon.teamSize}</span>
            <span className="flex items-center gap-2"><Award className="size-4 text-[#00a7e8]" />{hackathon.prize}</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {hackathon.themes.map((theme) => <span key={theme} className="rounded-md bg-[#00a7e8]/10 px-2 py-1 text-xs font-black text-[#006c9c]">{theme}</span>)}
            {hackathon.eligibility.slice(0, 2).map((item) => <span key={item} className="rounded-md bg-[#ffd21f]/20 px-2 py-1 text-xs font-black text-[#7a5700]">{item}</span>)}
          </div>
        </div>
        <div className="flex shrink-0 flex-row gap-2 lg:w-44 lg:flex-col">
          <button className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md bg-zinc-950 px-3 text-sm font-black text-white hover:bg-zinc-800">Details <ChevronRight className="size-4" /></button>
          <button className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md border-2 border-zinc-900 bg-white px-3 text-sm font-black text-zinc-800 hover:bg-[#ffd21f]/20"><Bookmark className="size-4" /> Save</button>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3 border-t-2 border-zinc-100 pt-4 text-xs font-bold text-zinc-500">
        <span>{hackathon.deadline}</span><span className="h-1 w-1 rounded-full bg-zinc-300" /><span>{hackathon.interested} interested</span><span className="h-1 w-1 rounded-full bg-zinc-300" /><span>{hackathon.lftCount} looking for teammates</span>
      </div>
    </article>
  );
}

export function HackatonApp() {
  const [persona, setPersona] = useState<Persona>("participant");
  const [participantTab, setParticipantTab] = useState<ParticipantTab>("explore");
  const [organizerTab, setOrganizerTab] = useState<OrganizerTab>("listings");
  const [showAdmin, setShowAdmin] = useState(false);
  const [query, setQuery] = useState("");
  const [format, setFormat] = useState<(typeof formats)[number]>("All");
  const [theme, setTheme] = useState<(typeof themes)[number]>("All");

  const filteredHackathons = useMemo(() => hackathons.filter((hackathon) => {
    const matchesQuery = [hackathon.name, hackathon.organizer, hackathon.location, hackathon.summary].join(" ").toLowerCase().includes(query.toLowerCase());
    const matchesFormat = format === "All" || hackathon.format === format;
    const matchesTheme = theme === "All" || hackathon.themes.includes(theme);
    return matchesQuery && matchesFormat && matchesTheme;
  }), [format, query, theme]);

  const activeTabs = persona === "participant" ? participantTabs : organizerTabs;

  return (
    <main className="min-h-screen bg-[#f5f3ea] text-zinc-950">
      <header className="sticky top-0 z-30 border-b-2 border-zinc-950 bg-zinc-950 text-white shadow-[0_4px_0_#00a7e8]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <button onClick={() => { setPersona("participant"); setParticipantTab("explore"); }} className="flex items-center gap-3 text-left">
            <Image src="/brand/hack-a-ton-logo.png" alt="Hack-A-Ton" width={48} height={48} className="size-12 rounded-md border border-white/20 object-cover" priority />
            <span>
              <span className="block text-lg font-black leading-5 tracking-tight">Hack-A-Ton</span>
              <span className="block text-xs font-bold text-[#ffd21f]">Discover · Team · Flex</span>
            </span>
          </button>

          <div className="hidden rounded-lg border border-white/15 bg-white/10 p-1 sm:flex">
            <button onClick={() => setPersona("participant")} className={`h-9 rounded-md px-4 text-sm font-black ${persona === "participant" ? "bg-[#ffd21f] text-zinc-950" : "text-white hover:bg-white/10"}`}>Participant</button>
            <button onClick={() => setPersona("organizer")} className={`h-9 rounded-md px-4 text-sm font-black ${persona === "organizer" ? "bg-[#00a7e8] text-zinc-950" : "text-white hover:bg-white/10"}`}>Organizer</button>
          </div>

          <nav className="hidden items-center gap-1 lg:flex">
            {activeTabs.map((tab) => {
              const Icon = tab.icon;
              const active = persona === "participant" ? participantTab === tab.id : organizerTab === tab.id;
              return (
                <button key={tab.id} onClick={() => persona === "participant" ? setParticipantTab(tab.id as ParticipantTab) : setOrganizerTab(tab.id as OrganizerTab)} className={`inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm font-black ${active ? "bg-white text-zinc-950" : "text-zinc-200 hover:bg-white/10"}`}>
                  <Icon className="size-4" /> {tab.label}
                </button>
              );
            })}
          </nav>

          <button onClick={() => setShowAdmin((value) => !value)} className="hidden h-10 items-center gap-2 rounded-md border border-white/15 px-3 text-sm font-black text-white hover:bg-white/10 md:inline-flex">
            <ShieldCheck className="size-4" /> Staff
          </button>
        </div>
        <div className="grid grid-cols-2 border-t border-white/10 sm:hidden">
          <button onClick={() => setPersona("participant")} className={`h-11 text-sm font-black ${persona === "participant" ? "bg-[#ffd21f] text-zinc-950" : "text-white"}`}>Participant</button>
          <button onClick={() => setPersona("organizer")} className={`h-11 text-sm font-black ${persona === "organizer" ? "bg-[#00a7e8] text-zinc-950" : "text-white"}`}>Organizer</button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-12">
        {showAdmin ? (
          <AdminView />
        ) : persona === "participant" ? (
          <ParticipantView activeTab={participantTab} setActiveTab={setParticipantTab} query={query} setQuery={setQuery} format={format} setFormat={setFormat} theme={theme} setTheme={setTheme} filteredHackathons={filteredHackathons} />
        ) : (
          <OrganizerView activeTab={organizerTab} />
        )}
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-zinc-950 bg-white lg:hidden">
        <div className={`grid ${persona === "participant" ? "grid-cols-3" : "grid-cols-3"}`}>
          {activeTabs.map((tab) => {
            const Icon = tab.icon;
            const active = persona === "participant" ? participantTab === tab.id : organizerTab === tab.id;
            return (
              <button key={tab.id} onClick={() => persona === "participant" ? setParticipantTab(tab.id as ParticipantTab) : setOrganizerTab(tab.id as OrganizerTab)} className={`flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-black ${active ? "text-zinc-950" : "text-zinc-500"}`}>
                <Icon className="size-5" /> {tab.label}
              </button>
            );
          })}
        </div>
      </nav>
    </main>
  );
}

function ParticipantView({ activeTab, setActiveTab, query, setQuery, format, setFormat, theme, setTheme, filteredHackathons }: { activeTab: ParticipantTab; setActiveTab: (tab: ParticipantTab) => void; query: string; setQuery: (query: string) => void; format: (typeof formats)[number]; setFormat: (format: (typeof formats)[number]) => void; theme: (typeof themes)[number]; setTheme: (theme: (typeof themes)[number]) => void; filteredHackathons: Hackathon[] }) {
  if (activeTab === "team") return <TeamView />;
  if (activeTab === "portfolio") return <PortfolioView />;
  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <SprayPanel className="p-5 sm:p-6">
          <p className="inline-flex items-center gap-2 rounded-full bg-[#ffd21f] px-3 py-1 text-xs font-black text-zinc-950"><Sparkles className="size-3.5" /> Participant mode</p>
          <h1 className="mt-4 max-w-3xl text-3xl font-black tracking-tight text-zinc-950 sm:text-5xl">Find hackathons without waiting for the algorithm.</h1>
          <p className="mt-4 max-w-2xl text-base font-medium leading-7 text-zinc-600">Explore verified Philippine hackathons, save events, find teammates, and turn every build into portfolio proof.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <StatCard label="Open listings" value="24" icon={CalendarDays} />
            <StatCard label="LFT profiles" value="185" icon={Users} />
            <StatCard label="Verified wins" value="73" icon={Medal} />
          </div>
        </SprayPanel>
        <SprayPanel className="bg-zinc-950 p-5 text-white sm:p-6">
          <p className="text-sm font-black text-[#ffd21f]">Featured closing soon</p>
          <h2 className="mt-3 text-2xl font-black">PH AI Build Weekend</h2>
          <p className="mt-3 text-sm font-medium leading-6 text-zinc-300">62 people are looking for teammates. Registration closes Jul 10.</p>
          <div className="mt-6 space-y-3">
            {[
              ["Create teammate card", Users],
              ["Swipe for mutual matches", Heart],
              ["Register externally", ChevronRight],
            ].map(([item, Icon]) => <button key={item as string} onClick={() => item === "Swipe for mutual matches" && setActiveTab("team")} className="flex w-full items-center gap-3 rounded-md bg-white/10 px-3 py-2 text-left text-sm font-bold hover:bg-white/15"><Icon className="size-4 text-[#00a7e8]" /> {item as string}</button>)}
          </div>
        </SprayPanel>
      </div>

      <section className="rounded-lg border-2 border-zinc-950 bg-white p-4 shadow-[5px_5px_0_#111]">
        <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px]">
          <label className="relative block"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name, organizer, location, or theme" className="h-11 w-full rounded-md border-2 border-zinc-200 bg-white pl-10 pr-3 text-sm font-medium outline-none focus:border-[#00a7e8]" /></label>
          <select value={format} onChange={(event) => setFormat(event.target.value as typeof format)} className="h-11 rounded-md border-2 border-zinc-200 bg-white px-3 text-sm font-bold outline-none focus:border-[#00a7e8]">{formats.map((item) => <option key={item}>{item}</option>)}</select>
          <select value={theme} onChange={(event) => setTheme(event.target.value as typeof theme)} className="h-11 rounded-md border-2 border-zinc-200 bg-white px-3 text-sm font-bold outline-none focus:border-[#00a7e8]">{themes.map((item) => <option key={item}>{item}</option>)}</select>
        </div>
      </section>

      <SectionTitle eyebrow="Explore" title={`${filteredHackathons.length} hackathons match your filters`} action={<button className="inline-flex h-10 items-center gap-2 rounded-md border-2 border-zinc-950 bg-white px-3 text-sm font-black text-zinc-800 shadow-[3px_3px_0_#111]"><Filter className="size-4" /> More filters</button>} />
      <section className="grid gap-4">{filteredHackathons.map((hackathon) => <HackathonCard key={hackathon.id} hackathon={hackathon} />)}</section>
    </div>
  );
}

function TeamView() {
  return (
    <div className="space-y-6">
      <SectionTitle eyebrow="Participant / Team Up" title="Find teammates for a specific hackathon" />
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <section className="grid gap-4">
          {teammates.map((person) => (
            <article key={person.name} className="rounded-lg border-2 border-zinc-950 bg-white p-5 shadow-[5px_5px_0_#111]">
              <div className="flex items-start justify-between gap-4"><div><p className="text-lg font-black text-zinc-950">{person.name}</p><p className="text-sm font-bold text-zinc-500">{person.school}</p></div><span className="rounded-full bg-[#00a7e8]/15 px-3 py-1 text-xs font-black text-[#006c9c]">{person.match} match</span></div>
              <p className="mt-4 text-sm font-black text-zinc-800">{person.role}</p><p className="mt-2 text-sm font-medium leading-6 text-zinc-600">{person.goal}</p>
              <div className="mt-4 grid gap-2 text-sm font-bold text-zinc-600 sm:grid-cols-2"><span>{person.stack}</span><span>{person.availability}</span></div>
              <div className="mt-5 flex gap-2"><button className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md border-2 border-zinc-950 bg-white text-sm font-black text-zinc-800"><X className="size-4" /> Pass</button><button className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md bg-[#ffd21f] text-sm font-black text-zinc-950"><Heart className="size-4" /> Like</button></div>
            </article>
          ))}
        </section>
        <SprayPanel className="p-5"><h3 className="text-lg font-black">Your LFT card</h3><p className="mt-2 text-sm font-medium leading-6 text-zinc-600">Frontend developer · React · available weekends · looking for backend and pitch support.</p><div className="mt-5 space-y-3"><button className="h-10 w-full rounded-md bg-zinc-950 text-sm font-black text-white">Edit card</button><button className="h-10 w-full rounded-md border-2 border-zinc-950 text-sm font-black text-zinc-800">View matches</button></div></SprayPanel>
      </div>
    </div>
  );
}

function PortfolioView() {
  return (
    <div className="space-y-6"><SectionTitle eyebrow="Participant / Portfolio" title="Your hackathon identity" /><section className="grid gap-4 lg:grid-cols-[340px_1fr]"><SprayPanel className="p-5"><div className="flex items-center gap-4"><div className="grid size-16 place-items-center rounded-lg bg-zinc-950 text-xl font-black text-white">JR</div><div><h3 className="text-lg font-black">Juan Ramos</h3><p className="text-sm font-bold text-zinc-500">Student builder · Manila</p></div></div><p className="mt-4 text-sm font-medium leading-6 text-zinc-600">Builds civic tech prototypes, dashboards, and product demos. Looking for practical hackathons with real community use.</p><div className="mt-5 flex flex-wrap gap-2">{badges.map((badge) => <span key={badge} className="rounded-md bg-[#ffd21f]/25 px-2 py-1 text-xs font-black text-[#7a5700]">{badge}</span>)}</div></SprayPanel><div className="space-y-4"><div className="grid gap-3 sm:grid-cols-4">{portfolioStats.map((stat) => <StatCard key={stat.label} label={stat.label} value={stat.value} icon={Trophy} />)}</div><article className="rounded-lg border-2 border-zinc-950 bg-white p-5 shadow-[5px_5px_0_#111]"><h3 className="text-lg font-black">Recent participation</h3><div className="mt-4 space-y-4">{hackathons.slice(0, 3).map((item, index) => <div key={item.id} className="flex items-start gap-3 border-t-2 border-zinc-100 pt-4 first:border-t-0 first:pt-0"><span className="grid size-9 place-items-center rounded-md bg-zinc-100 text-sm font-black text-zinc-600">{index + 1}</span><div><p className="font-black text-zinc-950">{item.name}</p><p className="text-sm font-bold text-zinc-500">{index === 0 ? "Finalist · verified" : "Participant · self-reported"}</p></div></div>)}</div></article></div></section></div>
  );
}

function OrganizerView({ activeTab }: { activeTab: OrganizerTab }) {
  if (activeTab === "create") return <CreateListingView />;
  if (activeTab === "insights") return <OrganizerInsightsView />;
  return (
    <div className="space-y-6"><SectionTitle eyebrow="Organizer mode" title="Manage your hackathon listings only" action={<button className="inline-flex h-10 items-center gap-2 rounded-md bg-[#00a7e8] px-4 text-sm font-black text-zinc-950 shadow-[3px_3px_0_#111]"><Plus className="size-4" /> New listing</button>} /><section className="grid gap-4 lg:grid-cols-3"><StatCard label="Published" value="3" icon={CheckCircle2} /><StatCard label="Pending review" value="1" icon={ClipboardCheck} /><StatCard label="Interested participants" value="705" icon={Users} /></section><section className="rounded-lg border-2 border-zinc-950 bg-white shadow-[5px_5px_0_#111]">{hackathons.map((item) => <div key={item.id} className="flex flex-col gap-3 border-t-2 border-zinc-100 p-4 first:border-t-0 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-black text-zinc-950">{item.name}</p><p className="text-sm font-bold text-zinc-500">{item.interested} interested · {item.lftCount} LFT · registration external</p></div><div className="flex gap-2"><span className={`w-fit rounded-full border px-2.5 py-1 text-xs font-black ${statusClass(item.status)}`}>{item.status}</span><button className="grid size-8 place-items-center rounded-md border-2 border-zinc-950"><Edit3 className="size-4" /></button></div></div>)}</section></div>
  );
}

function CreateListingView() {
  return <div className="space-y-6"><SectionTitle eyebrow="Organizer mode" title="Create a listing for participant discovery" /><SprayPanel className="p-5"><div className="grid gap-4 md:grid-cols-2"><input className="h-11 rounded-md border-2 border-zinc-200 px-3 text-sm font-bold" placeholder="Hackathon name" /><input className="h-11 rounded-md border-2 border-zinc-200 px-3 text-sm font-bold" placeholder="Organizer name" /><input className="h-11 rounded-md border-2 border-zinc-200 px-3 text-sm font-bold" placeholder="Location / format" /><input className="h-11 rounded-md border-2 border-zinc-200 px-3 text-sm font-bold" placeholder="External registration URL" /><textarea className="min-h-32 rounded-md border-2 border-zinc-200 p-3 text-sm font-bold md:col-span-2" placeholder="Describe the hackathon, eligibility, team size, prizes, and schedule" /></div><div className="mt-5 flex flex-col gap-2 sm:flex-row"><button className="h-11 rounded-md bg-zinc-950 px-5 text-sm font-black text-white">Submit for review</button><button className="h-11 rounded-md border-2 border-zinc-950 px-5 text-sm font-black text-zinc-950">Save draft</button></div></SprayPanel></div>;
}

function OrganizerInsightsView() {
  return <div className="space-y-6"><SectionTitle eyebrow="Organizer mode" title="Lightweight listing interest signals" /><section className="grid gap-4 lg:grid-cols-3"><StatCard label="Saved listings" value="418" icon={Bookmark} /><StatCard label="LFT clicks" value="185" icon={Users} /><StatCard label="External registrations" value="Not tracked" icon={ChevronRight} /></section><SprayPanel className="p-5"><p className="text-sm font-bold leading-6 text-zinc-600">Hack-A-Ton intentionally does not manage registration or submissions. Organizers get discovery metrics and participant interest signals, then users register through the official external link.</p></SprayPanel></div>;
}

function AdminView() {
  return <div className="space-y-6"><SectionTitle eyebrow="Staff-only" title="Moderate first-time organizer submissions" /><section className="grid gap-4 lg:grid-cols-2">{hackathons.slice(0, 2).map((item) => <article key={item.id} className="rounded-lg border-2 border-zinc-950 bg-white p-5 shadow-[5px_5px_0_#111]"><span className="rounded-full bg-[#ffd21f]/25 px-3 py-1 text-xs font-black text-[#7a5700]">Pending first listing review</span><h3 className="mt-4 text-lg font-black">{item.name}</h3><p className="mt-2 text-sm font-bold text-zinc-500">{item.organizer} · {item.location}</p><p className="mt-3 text-sm font-medium leading-6 text-zinc-600">{item.summary}</p><div className="mt-5 flex gap-2"><button className="h-10 flex-1 rounded-md border-2 border-zinc-950 text-sm font-black text-zinc-800">Needs edits</button><button className="h-10 flex-1 rounded-md bg-zinc-950 text-sm font-black text-white">Approve</button></div></article>)}</section></div>;
}
