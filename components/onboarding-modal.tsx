"use client";

import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  Code2,
  Figma,
  FlaskConical,
  Globe,
  Link as LinkIcon,
  MapPin,
  Megaphone,
  Smartphone,
  Wrench,
} from "lucide-react";
import { useState } from "react";

type Persona = "participant" | "organizer";
type Step = 1 | 2 | 3 | 4 | 5;

const domainsList = [
  { id: "front-end", label: "Front-End", icon: Code2 },
  { id: "back-end", label: "Back-End", icon: FlaskConical },
  { id: "ui-ux", label: "UI/UX Design", icon: Figma },
  { id: "data-science", label: "Data Science", icon: FlaskConical },
  { id: "mobile-dev", label: "Mobile Dev", icon: Smartphone },
] as const;

const techOptions = [
  "React",
  "Tailwind",
  "Node.js",
  "Figma",
  "Python",
  "TypeScript",
  "Go",
  "Rust",
  "Swift",
  "Kotlin",
  "Docker",
  "AWS",
] as const;

const experienceLevels = [
  { id: "first-timer", label: "First-Timer" },
  { id: "frequent-hacker", label: "Frequent Hacker" },
  { id: "veteran", label: "Veteran" },
] as const;

export interface OnboardingData {
  domains: string[];
  techStack: string[];
  locationStrategy: "local" | "global";
  experienceLevel: "first-timer" | "frequent-hacker" | "veteran";
  githubUrl: string;
  portfolioUrl: string;
  orgName: string;
  orgBio: string;
}

export function OnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [persona, setPersona] = useState<Persona | null>(null);
  const [domains, setDomains] = useState<string[]>([]);
  const [domainPhase, setDomainPhase] = useState<"primary" | "secondary">("primary");
  const [techStack, setTechStack] = useState<string[]>([]);
  const [locationStrategy, setLocationStrategy] = useState<"local" | "global" | null>(null);
  const [experienceLevel, setExperienceLevel] = useState<"first-timer" | "frequent-hacker" | "veteran" | null>(null);
  const [githubUrl, setGithubUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [orgName, setOrgName] = useState("");
  const [orgBio, setOrgBio] = useState("");

  const totalSteps = 5;
  const isOrganizer = persona === "organizer";

  function handlePersonaSelect(selected: Persona) {
    setPersona(selected);
    if (selected === "organizer") {
      setStep(2);
    } else {
      setStep(2);
    }
  }

  function handleDomainSelect(selected: string) {
    if (domainPhase === "primary") {
      setDomains([selected]);
      setDomainPhase("secondary");
    } else {
      setDomains((prev) =>
        prev.includes(selected)
          ? prev.filter((d) => d !== selected)
          : [...prev, selected]
      );
    }
  }

  function toggleTech(tech: string) {
    setTechStack((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    );
  }

  function handleLocationSelect(selected: "local" | "global") {
    setLocationStrategy(selected);
    setStep(5);
  }

  function handleSubmit() {
    localStorage.setItem("hackaton-onboarding-v2", "true");
    localStorage.setItem("hackaton-persona", isOrganizer ? "organizer" : "participant");
    router.push("/");
  }

  function progressPercent() {
    if (isOrganizer) {
      return step === 1 ? 50 : 100;
    }
    return Math.round((step / totalSteps) * 100);
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#f5f3ea] p-4">
      <div className="pointer-events-none absolute -left-32 -top-32 size-96 rounded-full bg-[#ffd21f]/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 size-[500px] rounded-full bg-[#00a7e8]/15 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 size-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ffd21f]/10 blur-3xl" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{ backgroundImage: "radial-gradient(circle, #111 1px, transparent 1px)", backgroundSize: "24px 24px" }}
      />
      <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-lg border-2 border-zinc-950 bg-white shadow-[8px_8px_0_#111]">
        {/* Progress bar */}
        <div className="h-2 w-full bg-zinc-200">
          <div
            className="h-full bg-[#ffd21f] transition-all duration-300"
            style={{ width: `${progressPercent()}%` }}
          />
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-between border-b-2 border-zinc-100 px-6 py-3">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#00a7e8]">
            {isOrganizer ? `Step ${step} of 2` : `Step ${step} of ${totalSteps}`}
          </p>
          <p className="text-xs font-bold text-zinc-400">
            {progressPercent()}% complete
          </p>
        </div>

        <div className="px-6 py-8 sm:px-8">
          {/* Step 1: Persona Split */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-zinc-950 sm:text-3xl">
                  Welcome to Hack-A-Ton
                </h2>
                <p className="mt-2 text-sm font-medium leading-6 text-zinc-600">
                  Let&apos;s set up your profile. First, what brings you here?
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <button
                  onClick={() => handlePersonaSelect("participant")}
                  className="group flex flex-col items-start rounded-lg border-2 border-zinc-950 bg-white p-6 text-left shadow-[5px_5px_0_#111] transition hover:-translate-y-0.5 hover:shadow-[7px_7px_0_#111]"
                >
                  <div className="grid size-12 place-items-center rounded-lg bg-[#ffd21f]/20 text-[#7a5700]">
                    <Wrench className="size-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-black text-zinc-950">
                    I&apos;m here to Build
                  </h3>
                  <p className="mt-2 text-sm font-medium leading-6 text-zinc-600">
                    Find hackathons, join teams, and grow your portfolio as a
                    participant.
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-black text-[#00a7e8]">
                    Join as Participant{" "}
                    <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                  </span>
                </button>

                <button
                  onClick={() => handlePersonaSelect("organizer")}
                  className="group flex flex-col items-start rounded-lg border-2 border-zinc-950 bg-white p-6 text-left shadow-[5px_5px_0_#111] transition hover:-translate-y-0.5 hover:shadow-[7px_7px_0_#111]"
                >
                  <div className="grid size-12 place-items-center rounded-lg bg-[#00a7e8]/15 text-[#006c9c]">
                    <Megaphone className="size-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-black text-zinc-950">
                    I&apos;m here to Host
                  </h3>
                  <p className="mt-2 text-sm font-medium leading-6 text-zinc-600">
                    Post hackathons, attract participants, and manage your
                    events.
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-black text-[#00a7e8]">
                    Join as Organizer{" "}
                    <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Step 2a: Primary Domain */}
          {step === 2 && !isOrganizer && domainPhase === "primary" && (
            <div className="space-y-6">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-[#00a7e8]">
                  Core Identity
                </p>
                <h2 className="mt-1 text-2xl font-black tracking-tight text-zinc-950 sm:text-3xl">
                  What&apos;s your primary domain?
                </h2>
                <p className="mt-2 text-sm font-medium leading-6 text-zinc-600">
                  Pick the area where you contribute best.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {domainsList.map((d) => {
                  const Icon = d.icon;
                  return (
                    <button
                      key={d.id}
                      onClick={() => handleDomainSelect(d.id)}
                      className="group flex items-center gap-4 rounded-lg border-2 border-zinc-950 bg-white p-4 text-left shadow-[4px_4px_0_#111] transition hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#111]"
                    >
                      <div className="grid size-10 place-items-center rounded-md bg-zinc-100 text-zinc-600 group-hover:bg-[#00a7e8] group-hover:text-white">
                        <Icon className="size-5" />
                      </div>
                      <span className="text-sm font-black text-zinc-950">
                        {d.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2b: Secondary Domains */}
          {step === 2 && !isOrganizer && domainPhase === "secondary" && (
            <div className="space-y-6">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-[#00a7e8]">
                  Core Identity
                </p>
                <h2 className="mt-1 text-2xl font-black tracking-tight text-zinc-950 sm:text-3xl">
                  Any secondary domains?
                </h2>
                <p className="mt-2 text-sm font-medium leading-6 text-zinc-600">
                  Select additional areas you also work in, or skip to continue.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {domainsList.map((d) => {
                  const Icon = d.icon;
                  const isPrimary = domains[0] === d.id;
                  const isSelected = domains.includes(d.id);
                  return (
                    <button
                      key={d.id}
                      onClick={() => !isPrimary && handleDomainSelect(d.id)}
                      disabled={isPrimary}
                      className={`group flex items-center gap-4 rounded-lg border-2 border-zinc-950 p-4 text-left shadow-[4px_4px_0_#111] transition hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#111] ${
                        isPrimary
                          ? "border-[#00a7e8] bg-[#00a7e8]/10 cursor-not-allowed hover:translate-y-0 hover:shadow-[4px_4px_0_#111]"
                          : isSelected
                            ? "border-[#00a7e8] bg-[#00a7e8]/10"
                            : "bg-white"
                      }`}
                    >
                      <div
                        className={`grid size-10 place-items-center rounded-md ${
                          isPrimary || isSelected
                            ? "bg-[#00a7e8] text-white"
                            : "bg-zinc-100 text-zinc-600"
                        }`}
                      >
                        <Icon className="size-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-zinc-950">
                          {d.label}
                        </span>
                        {isPrimary && (
                          <span className="mt-0.5 text-xs font-black text-[#00a7e8]">
                            Primary
                          </span>
                        )}
                      </div>
                      {!isPrimary && isSelected && (
                        <Check className="ml-auto size-4 text-[#00a7e8]" />
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(3)}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-md border-2 border-zinc-950 bg-white px-6 text-sm font-black text-zinc-800 shadow-[3px_3px_0_#111] transition hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#111]"
                >
                  Skip
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-zinc-950 px-6 text-sm font-black text-white shadow-[3px_3px_0_#111] transition hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#111]"
                >
                  Continue <ArrowRight className="size-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Organizer Setup */}
          {step === 2 && isOrganizer && (
            <div className="space-y-6">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-[#00a7e8]">
                  Organizer Setup
                </p>
                <h2 className="mt-1 text-2xl font-black tracking-tight text-zinc-950 sm:text-3xl">
                  Tell us about yourself
                </h2>
                <p className="mt-2 text-sm font-medium leading-6 text-zinc-600">
                  We&apos;ll use this to set up your organizer profile.
                </p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-zinc-500">
                    Organization Name
                  </label>
                  <input
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="e.g. TechUp Philippines"
                    className="h-11 w-full rounded-md border-2 border-zinc-200 bg-white px-3 text-sm font-bold outline-none focus:border-[#00a7e8]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-zinc-500">
                    Tell us about your event
                  </label>
                  <textarea
                    value={orgBio}
                    onChange={(e) => setOrgBio(e.target.value)}
                    placeholder="What kind of hackathons do you organize? What's your mission?"
                    rows={4}
                    className="w-full rounded-md border-2 border-zinc-200 bg-white p-3 text-sm font-bold outline-none focus:border-[#00a7e8]"
                  />
                </div>
              </div>
              <button
                onClick={handleSubmit}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#ffd21f] px-6 text-sm font-black text-zinc-950 shadow-[3px_3px_0_#111] transition hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#111]"
              >
                Go to Dashboard <ArrowRight className="size-4" />
              </button>
            </div>
          )}

          {/* Step 3: The Toolkit */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-[#00a7e8]">
                  The Toolkit
                </p>
                <h2 className="mt-1 text-2xl font-black tracking-tight text-zinc-950 sm:text-3xl">
                  What&apos;s in your stack?
                </h2>
                <p className="mt-2 text-sm font-medium leading-6 text-zinc-600">
                  Select all the technologies you work with.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {techOptions.map((tech) => {
                  const selected = techStack.includes(tech);
                  return (
                    <button
                      key={tech}
                      onClick={() => toggleTech(tech)}
                      className={`inline-flex items-center gap-2 rounded-full border-2 border-zinc-950 px-4 py-2 text-sm font-black transition hover:-translate-y-0.5 ${
                        selected
                          ? "bg-[#00a7e8] text-white shadow-[3px_3px_0_#111]"
                          : "bg-white text-zinc-800 shadow-[2px_2px_0_#111] hover:shadow-[4px_4px_0_#111]"
                      }`}
                    >
                      {selected && <Check className="size-3.5" />}
                      {tech}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setStep(4)}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-zinc-950 px-6 text-sm font-black text-white shadow-[3px_3px_0_#111] transition hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#111]"
              >
                Continue <ArrowRight className="size-4" />
              </button>
            </div>
          )}

          {/* Step 4: Location Strategy */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-[#00a7e8]">
                  Location Strategy
                </p>
                <h2 className="mt-1 text-2xl font-black tracking-tight text-zinc-950 sm:text-3xl">
                  How do you want to compete?
                </h2>
                <p className="mt-2 text-sm font-medium leading-6 text-zinc-600">
                  Choose your preferred hackathon format.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <button
                  onClick={() => handleLocationSelect("local")}
                  className="group flex flex-col items-start rounded-lg border-2 border-zinc-950 bg-white p-6 text-left shadow-[5px_5px_0_#111] transition hover:-translate-y-0.5 hover:shadow-[7px_7px_0_#111]"
                >
                  <div className="grid size-12 place-items-center rounded-lg bg-[#ffd21f]/20 text-[#7a5700]">
                    <MapPin className="size-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-black text-zinc-950">
                    Local / Onsite
                  </h3>
                  <p className="mt-2 text-sm font-medium leading-6 text-zinc-600">
                    I want to compete in-person in the Philippines.
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-black text-[#00a7e8]">
                    Select{" "}
                    <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                  </span>
                </button>

                <button
                  onClick={() => handleLocationSelect("global")}
                  className="group flex flex-col items-start rounded-lg border-2 border-zinc-950 bg-white p-6 text-left shadow-[5px_5px_0_#111] transition hover:-translate-y-0.5 hover:shadow-[7px_7px_0_#111]"
                >
                  <div className="grid size-12 place-items-center rounded-lg bg-[#00a7e8]/15 text-[#006c9c]">
                    <Globe className="size-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-black text-zinc-950">
                    Global / Remote
                  </h3>
                  <p className="mt-2 text-sm font-medium leading-6 text-zinc-600">
                    I am open to virtual teams worldwide.
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-black text-[#00a7e8]">
                    Select{" "}
                    <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Step 5: The Proof (participant) */}
          {step === 5 && !isOrganizer && (
            <div className="space-y-6">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-[#00a7e8]">
                  The Proof
                </p>
                <h2 className="mt-1 text-2xl font-black tracking-tight text-zinc-950 sm:text-3xl">
                  Credentials & experience
                </h2>
                <p className="mt-2 text-sm font-medium leading-6 text-zinc-600">
                  Help others understand your background.
                </p>
              </div>

              {/* Experience toggle */}
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-wider text-zinc-500">
                  Experience Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {experienceLevels.map((level) => (
                    <button
                      key={level.id}
                      onClick={() =>
                        setExperienceLevel(
                          level.id as "first-timer" | "frequent-hacker" | "veteran"
                        )
                      }
                      className={`rounded-lg border-2 border-zinc-950 px-3 py-3 text-sm font-black shadow-[3px_3px_0_#111] transition hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#111] ${
                        experienceLevel === level.id
                          ? "border-[#00a7e8] bg-[#00a7e8] text-white"
                          : "bg-white text-zinc-800"
                      }`}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* URL inputs */}
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-zinc-500">
                    GitHub Profile Link
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                      <svg
                        className="size-4"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                    </span>
                    <input
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="https://github.com/yourname"
                      className="h-11 w-full rounded-md border-2 border-zinc-200 bg-white pl-10 pr-3 text-sm font-bold outline-none focus:border-[#00a7e8]"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-zinc-500">
                    Figma / Portfolio Link
                  </label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                    <input
                      value={portfolioUrl}
                      onChange={(e) => setPortfolioUrl(e.target.value)}
                      placeholder="https://figma.com/@you or your portfolio URL"
                      className="h-11 w-full rounded-md border-2 border-zinc-200 bg-white pl-10 pr-3 text-sm font-bold outline-none focus:border-[#00a7e8]"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!experienceLevel}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#ffd21f] px-6 text-sm font-black text-zinc-950 shadow-[3px_3px_0_#111] transition hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#111] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-[3px_3px_0_#111]"
              >
                Complete Profile <Check className="size-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
