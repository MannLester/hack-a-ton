"use client";

import { useEffect } from "react";

function canRegisterServiceWorker() {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    process.env.NODE_ENV === "production"
  );
}

export function PwaRegistration() {
  useEffect(() => {
    if (!canRegisterServiceWorker()) return;

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Registration failure should not block the web app.
    });
  }, []);

  return null;
}
