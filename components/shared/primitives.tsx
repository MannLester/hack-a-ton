import { Trophy, type LucideIcon } from "lucide-react";
import type { Hackathon } from "@/lib/sample-data";

export function statusClass(status: Hackathon["status"]) {
  if (status === "Closing soon")
    return "border-[#ffd21f]/50 bg-[#ffd21f]/15 text-[#8a6200]";
  if (status === "Open")
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (status === "Draft")
    return "border-zinc-200 bg-zinc-100 text-zinc-700";
  if (status === "Pending review")
    return "border-[#00a7e8]/30 bg-[#00a7e8]/10 text-[#006c9c]";
  if (status === "Needs edits")
    return "border-red-200 bg-red-50 text-red-700";
  return "border-[#00a7e8]/30 bg-[#00a7e8]/10 text-[#006c9c]";
}

export function SectionTitle({
  eyebrow,
  title,
  action,
  size = "default",
}: {
  eyebrow: string;
  title: string;
  action?: React.ReactNode;
  size?: "default" | "lg";
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className={`${size === "lg" ? "text-sm" : "text-xs"} font-black uppercase tracking-[0.22em] text-[#00a7e8]`}>
          {eyebrow}
        </p>
        <h2 className={`mt-1 font-black tracking-tight text-zinc-950 ${size === "lg" ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl"}`}>
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}

export function FeaturePanel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`relative overflow-hidden rounded-lg border-2 border-zinc-950 bg-white shadow-[6px_6px_0_#111] ${className}`}
    >
      <div className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-[#ffd21f]/30 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-12 left-8 size-36 rounded-full bg-[#00a7e8]/20 blur-2xl" />
      <div className="relative">{children}</div>
    </section>
  );
}

export function PanelCard({
  children,
  className = "",
  hover = false,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}) {
  const hoverClass = hover
    ? "transition hover:-translate-y-0.5 hover:shadow-[7px_7px_0_#111]"
    : "";
  return (
    <article
      className={`rounded-lg border-2 border-zinc-950 bg-white p-5 shadow-[5px_5px_0_#111] ${hoverClass} ${className}`}
    >
      {children}
    </article>
  );
}

export function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Trophy;
}) {
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

export function StatusPill({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-xs font-black ${className}`}
    >
      {children}
    </span>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <p className="rounded-lg border-2 border-dashed border-zinc-300 bg-white p-5 text-sm font-bold text-zinc-500">
      {message}
    </p>
  );
}
