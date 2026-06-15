"use client";

import Link from "next/link";
import { Compass, Home, SearchX } from "lucide-react";

type NotFoundViewProps = {
  title?: string;
  message?: string;
};

export function NotFoundView({
  title = "Page not found",
  message = "The page you are looking for does not exist or is no longer available.",
}: NotFoundViewProps) {
  return (
    <main className="min-h-screen bg-[#f5f3ef] px-4 py-8 text-zinc-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-4xl flex-col justify-center">
        <div className="max-w-2xl">
          <div className="inline-flex size-14 items-center justify-center rounded-lg border-2 border-zinc-950 bg-white shadow-[4px_4px_0_#111]">
            <SearchX className="size-7 text-[#ff6b35]" />
          </div>
          <p className="mt-8 text-xs font-black uppercase tracking-[0.24em] text-[#00a7e8]">
            404
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-zinc-950 sm:text-6xl">
            {title}
          </h1>
          <p className="mt-4 max-w-xl text-base font-bold leading-7 text-zinc-600 sm:text-lg">
            {message}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-md border-2 border-zinc-950 bg-[#ffd23f] px-4 py-3 text-sm font-black text-zinc-950 shadow-[3px_3px_0_#111] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#111]"
            >
              <Home className="size-4" />
              Back Home
            </Link>
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 rounded-md border-2 border-zinc-950 bg-white px-4 py-3 text-sm font-black text-zinc-950 shadow-[3px_3px_0_#111] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#111]"
            >
              <Compass className="size-4" />
              Explore Hackathons
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
