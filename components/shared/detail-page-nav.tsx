"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppNavigation } from "@/components/shared/app-navigation";

export function DetailPageNav() {
  const router = useRouter();
  const [persona, setPersona] = useState<"participant" | "organizer">("participant");

  return (
    <AppNavigation
      persona={persona}
      setPersona={setPersona}
      setParticipantTab={() => router.push("/")}
    />
  );
}
