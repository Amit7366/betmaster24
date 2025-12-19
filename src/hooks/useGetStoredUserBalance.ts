"use client";

import { useEffect, useState } from "react";

export interface LocalRedisData {
  id: string;
  todayBalance: number;
  expenseBalance: number;
  timestamp: string;
}

/**
 * Hook to fetch stored user balance data from localStorage
 * @param userId - The unique user ID used as storage key
 * @returns LocalRedisData | null
 */
export default function useGetStoredUserBalance(userId?: string) {
  const [storedData, setStoredData] = useState<LocalRedisData | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!userId) return;

    const storageKey = userId;
    const existing = localStorage.getItem(storageKey);

    if (existing) {
      try {
        const parsed: LocalRedisData = JSON.parse(existing);
        setStoredData(parsed);
        console.log("📦 Loaded local user balance data:", parsed);
      } catch (err) {
        console.error("❌ Error parsing localStorage data:", err);
      }
    } else {
      console.log("⚠️ No local data found for user:", userId);
      setStoredData(null);
    }
  }, [userId]);

  return storedData;
}
