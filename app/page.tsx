"use client";

import { HackatonApp } from "@/components/app-shell";
import { OnboardingFlow } from "@/components/landing/onboarding-flow";
import { useEffect, useState } from "react";

function hasCompletedOnboarding() {
  return window.localStorage.getItem("hackaton-onboarding-v2") === "true";
}

export default function Home() {
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);

  useEffect(() => {
    setIsOnboardingComplete(hasCompletedOnboarding());
    setIsCheckingOnboarding(false);
  }, []);

  if (isCheckingOnboarding) return null;
  if (!isOnboardingComplete) return <OnboardingFlow />;
  return <HackatonApp />;
}
