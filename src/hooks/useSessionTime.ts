"use client";

import { useCallback } from "react";

/**
 * Custom hook that returns a function to get the current UTC timestamp (in ms)
 * and ISO string (e.g., 2025-10-11T14:23:45.000Z)
 */
export function useSessionTime() {
  const getSessionTime = useCallback(() => {
    const now = new Date();

    // Get UTC components of current moment
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth();
    const date = now.getUTCDate();
    const hours = now.getUTCHours();
    const minutes = now.getUTCMinutes();
    const seconds = now.getUTCSeconds();

    // Combine into UTC timestamp
    const sessionTime = Date.UTC(year, month, date, hours, minutes, seconds);
    const isoTime = new Date(sessionTime).toISOString();

    return { sessionTime, isoTime };
  }, []);

  return { getSessionTime };
}
