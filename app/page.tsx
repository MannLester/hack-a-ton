"use client";

import { HackatonApp } from "@/components/hackaton-app";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem("hackaton-onboarding-v2") === "true";
    if (!done) {
      router.replace("/onboarding");
    } else {
      setReady(true);
    }
  }, [router]);

  if (!ready) return null;
  return <HackatonApp />;
}
