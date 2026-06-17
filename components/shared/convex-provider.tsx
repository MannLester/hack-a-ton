"use client";

import { ClerkProvider, useAuth as useClerkAuth, useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import {
  ConvexProvider,
  ConvexProviderWithAuth,
  ConvexReactClient,
  useConvexAuth,
} from "convex/react";
import { useQuery } from "convex/react";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";
import { createContext, useContext, useState } from "react";
import { shouldAllowConvexClient } from "@/lib/auth-runtime";

export interface OptionalClerkUser {
  id: string;
  fullName: string | null;
  username: string | null;
  primaryEmailAddress: {
    emailAddress: string;
  } | null;
}

interface AuthState {
  isAuthLoaded: boolean;
  isSignedIn: boolean;
  onboardingPersona: "participant" | "organizer" | null;
}

const defaultAuthState: AuthState = {
  isAuthLoaded: true,
  isSignedIn: false,
  onboardingPersona: null,
};

const AuthStateContext = createContext<AuthState>(defaultAuthState);
const ClerkUserContext = createContext<OptionalClerkUser | null>(null);
const clerkJwtTemplate =
  process.env.NEXT_PUBLIC_CLERK_JWT_TEMPLATE ?? "convex-hackathon";

export function isClerkConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
}

function canUseConvexClient() {
  return shouldAllowConvexClient({
    hasConvexUrl: Boolean(process.env.NEXT_PUBLIC_CONVEX_URL),
    hasClerkPublishableKey: isClerkConfigured(),
  });
}

function useConvexClerkAuth() {
  const { getToken, isLoaded, isSignedIn } = useClerkAuth();
  const fetchAccessToken = useCallback(
    ({ forceRefreshToken }: { forceRefreshToken: boolean }) =>
      getToken({
        skipCache: forceRefreshToken,
        template: clerkJwtTemplate,
      }).catch(() => null),
    [getToken],
  );

  return useMemo(
    () => ({
      fetchAccessToken,
      isAuthenticated: Boolean(isSignedIn),
      isLoading: !isLoaded,
    }),
    [fetchAccessToken, isLoaded, isSignedIn],
  );
}

function ConvexProviderMaybe({ children }: { children: React.ReactNode }) {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  const [convex] = useState(() =>
    convexUrl ? new ConvexReactClient(convexUrl) : null,
  );

  if (!convex) return children;
  if (isClerkConfigured()) {
    return (
      <ConvexProviderWithAuth client={convex} useAuth={useConvexClerkAuth}>
        {children}
      </ConvexProviderWithAuth>
    );
  }

  if (canUseConvexClient()) {
    return <ConvexProvider client={convex}>{children}</ConvexProvider>;
  }

  throw new Error(
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is required when Convex is configured.",
  );
}

function ClerkAuthStateProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useClerkAuth();
  const { user } = useUser();
  const authState = {
    isAuthLoaded: isLoaded,
    isSignedIn: Boolean(isSignedIn),
    onboardingPersona: null,
  };

  return (
    <AuthStateContext.Provider value={authState}>
      <ClerkUserContext.Provider value={user ?? null}>
        {children}
      </ClerkUserContext.Provider>
    </AuthStateContext.Provider>
  );
}

function OnboardingRedirect({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useClerkAuth();
  const { isAuthenticated } = useConvexAuth();
  const pathname = usePathname();
  const router = useRouter();
  const onboardingStatus = useQuery(
    api.users.getOnboardingStatus,
    isAuthenticated ? {} : "skip",
  );

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    if (!isAuthenticated) return;
    if (pathname === "/onboarding") return;
    if (!onboardingStatus) return;
    if (onboardingStatus.isComplete) return;

    router.replace("/onboarding");
  }, [isAuthenticated, isLoaded, isSignedIn, onboardingStatus, pathname, router]);

  return children;
}

function OnboardingRedirectMaybe({ children }: { children: React.ReactNode }) {
  if (!isClerkConfigured()) return children;

  return <OnboardingRedirect>{children}</OnboardingRedirect>;
}

function OnboardingStatusProvider({ children }: { children: React.ReactNode }) {
  const authState = useContext(AuthStateContext);
  const { isAuthenticated } = useConvexAuth();
  const onboardingStatus = useQuery(
    api.users.getOnboardingStatus,
    isAuthenticated ? {} : "skip",
  );
  const nextAuthState = {
    ...authState,
    onboardingPersona: onboardingStatus?.onboardingPersona ?? null,
  };

  return (
    <AuthStateContext.Provider value={nextAuthState}>
      {children}
    </AuthStateContext.Provider>
  );
}

function OnboardingStatusProviderMaybe({ children }: { children: React.ReactNode }) {
  if (!process.env.NEXT_PUBLIC_CONVEX_URL || !isClerkConfigured()) return children;

  return <OnboardingStatusProvider>{children}</OnboardingStatusProvider>;
}

function ClerkProviderMaybe({ children }: { children: React.ReactNode }) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";

  if (!isClerkConfigured()) return <>{children}</>;

  return (
    <ClerkProvider afterSignOutUrl="/" publishableKey={publishableKey}>
      <ClerkAuthStateProvider>{children}</ClerkAuthStateProvider>
    </ClerkProvider>
  );
}

export function ConvexClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProviderMaybe>
      <ConvexProviderMaybe>
        <OnboardingStatusProviderMaybe>
          <OnboardingRedirectMaybe>{children}</OnboardingRedirectMaybe>
        </OnboardingStatusProviderMaybe>
      </ConvexProviderMaybe>
    </ClerkProviderMaybe>
  );
}

export function useClerkAuthState() {
  return useContext(AuthStateContext);
}

export function useOptionalClerkUser() {
  return useContext(ClerkUserContext);
}
