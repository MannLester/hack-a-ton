"use client";

import { ClerkProvider, useAuth, useUser } from "@clerk/nextjs";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { createContext, useContext, useState } from "react";

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
}

const defaultAuthState: AuthState = {
  isAuthLoaded: true,
  isSignedIn: false,
};

const AuthStateContext = createContext<AuthState>(defaultAuthState);
const ClerkUserContext = createContext<OptionalClerkUser | null>(null);

export function isClerkConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
}

function ConvexProviderMaybe({ children }: { children: React.ReactNode }) {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  const [convex] = useState(() =>
    convexUrl ? new ConvexReactClient(convexUrl) : null,
  );

  if (!convex) return children;

  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}

function ClerkAuthStateProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const authState = {
    isAuthLoaded: isLoaded,
    isSignedIn: Boolean(isSignedIn),
  };

  return (
    <AuthStateContext.Provider value={authState}>
      <ClerkUserContext.Provider value={user ?? null}>
        {children}
      </ClerkUserContext.Provider>
    </AuthStateContext.Provider>
  );
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
      <ConvexProviderMaybe>{children}</ConvexProviderMaybe>
    </ClerkProviderMaybe>
  );
}

export function useClerkAuthState() {
  return useContext(AuthStateContext);
}

export function useOptionalClerkUser() {
  return useContext(ClerkUserContext);
}
