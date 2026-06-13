"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { useState } from "react";

function ConvexProviderMaybe({ children }: { children: React.ReactNode }) {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  const [convex] = useState(() =>
    convexUrl ? new ConvexReactClient(convexUrl) : null,
  );

  if (!convex) return children;

  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}

export function ConvexClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider afterSignOutUrl="/">
      <ConvexProviderMaybe>{children}</ConvexProviderMaybe>
    </ClerkProvider>
  );
}

export function useClerkAuthState() {
  const { isLoaded, isSignedIn } = useAuth();

  return {
    isAuthLoaded: isLoaded,
    isSignedIn: Boolean(isSignedIn),
  };
}
