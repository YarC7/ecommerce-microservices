"use client";

import { useEffect, useRef } from "react";

export default function AutoRefreshClient() {
  const timer = useRef<number | null>(null);

  useEffect(() => {
    // Refresh every 12 minutes
    const interval = 12 * 60 * 1000;
    async function refresh() {
      try {
        await fetch("/api/auth/refresh", { method: "POST" });
      } catch (e) {
        // ignore
      }
    }

    timer.current = window.setInterval(() => refresh(), interval);
    // initial attempt
    refresh();

    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, []);

  return null;
}
