"use client";

import { SignInButton, SignUpButton, useAuth } from "@clerk/nextjs";
import { LockKeyhole, UserPlus } from "lucide-react";
import type { AuthAction } from "@/lib/auth-persona";
import { getActionAuthRequirement } from "@/lib/auth-persona";
import { FeaturePanel } from "@/components/shared/primitives";

type ButtonProps = {
  action: AuthAction;
  children: React.ReactNode;
  className: string;
  onAuthorizedClick?: () => void;
  disabled?: boolean;
  signedOutLabel?: React.ReactNode;
};

export function AuthActionButton({
  action,
  children,
  className,
  onAuthorizedClick,
  disabled = false,
  signedOutLabel,
}: ButtonProps) {
  const { isLoaded, isSignedIn } = useAuth();
  const requiresAuth = getActionAuthRequirement(action) === "auth_required";

  if (!requiresAuth || isSignedIn) {
    return (
      <button onClick={onAuthorizedClick} disabled={disabled || !isLoaded} className={className}>
        {children}
      </button>
    );
  }

  return (
    <SignInButton mode="modal">
      <button disabled={disabled || !isLoaded} className={className}>
        {signedOutLabel ?? children}
      </button>
    </SignInButton>
  );
}

export function OrganizerAuthGate() {
  return (
    <div className="mx-auto max-w-3xl pt-8">
      <FeaturePanel className="p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="grid size-14 shrink-0 place-items-center rounded-lg bg-[#00a7e8]/15 text-[#006c9c]">
            <LockKeyhole className="size-7" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#00a7e8]">
              Organizer access
            </p>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-zinc-950 sm:text-4xl">
              Sign in to create and manage hackathon listings.
            </h1>
            <p className="mt-3 text-sm font-medium leading-6 text-zinc-600">
              Participants can browse hackathons without an account. Organizers need an account so listings can be reviewed, attributed, edited, and trusted over time.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <SignInButton mode="modal">
                <button className="inline-flex h-11 items-center justify-center rounded-md bg-zinc-950 px-5 text-sm font-black text-white">
                  Log in as organizer
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="inline-flex h-11 items-center justify-center gap-2 rounded-md border-2 border-zinc-950 bg-[#00a7e8] px-5 text-sm font-black text-zinc-950 shadow-[3px_3px_0_#111]">
                  <UserPlus className="size-4" /> Create organizer account
                </button>
              </SignUpButton>
            </div>
          </div>
        </div>
      </FeaturePanel>
    </div>
  );
}
