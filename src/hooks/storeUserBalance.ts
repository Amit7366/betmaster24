"use client";

import { useEffect, useState } from "react";

// ---- Type Definitions ----
export interface RecordItem {
  agency_uid: string;
  serial_number: string;
  currency_code: string;
  game_uid: string;
  member_account: string;
  bet_amount: string;
  win_amount: string;
  timestamp: string;
  game_round: string;
}

export interface BalanceData {
  data?: {
    currentBalance?: number;
  };
}

export interface UserData {
  id?: string;
  [key: string]: any;
}

export interface LocalRedisData {
  id: string;
  todayBalance: number;
  expenseBalance: number;
  timestamp: string;
}

// ---- Hook Implementation ----
export default function useStoreUserBalance(
  userData: UserData | null,
  balanceData: BalanceData | null,
  record: RecordItem[]
) {
  const [localData, setLocalData] = useState<LocalRedisData | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return; // Ensure client-side only
    if (!userData?.id) return;

    const storageKey = userData.id;
    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-GB"); // e.g. 18/10/2025

    const existingData = localStorage.getItem(storageKey);

    if (existingData) {
      const parsedData: LocalRedisData = JSON.parse(existingData);

      if (parsedData.timestamp === formattedDate) {
        // Same day → update balances
        const totalBet = record.reduce(
          (sum, item) => sum + parseFloat(item.bet_amount || "0"),
          0
        );
        const totalWin = record.reduce(
          (sum, item) => sum + parseFloat(item.win_amount || "0"),
          0
        );

        const expenseBalance = totalWin - totalBet;

        const updatedData: LocalRedisData = {
          ...parsedData,
          todayBalance:
            balanceData?.data?.currentBalance ?? parsedData.todayBalance,
          expenseBalance,
        };

        localStorage.setItem(storageKey, JSON.stringify(updatedData));
        setLocalData(updatedData);
        console.log("✅ Updated existing data for today:", updatedData);
      } else {
        // New day → reset data
        const newData: LocalRedisData = {
          id: userData.id,
          todayBalance: balanceData?.data?.currentBalance ?? 0,
          expenseBalance: 0,
          timestamp: formattedDate,
        };

        localStorage.setItem(storageKey, JSON.stringify(newData));
        setLocalData(newData);
        console.log("📅 New day — stored new data:", newData);
      }
    } else {
      // No data yet → insert fresh entry
      const newData: LocalRedisData = {
        id: userData.id,
        todayBalance: balanceData?.data?.currentBalance ?? 0,
        expenseBalance: 0,
        timestamp: formattedDate,
      };

      localStorage.setItem(storageKey, JSON.stringify(newData));
      setLocalData(newData);
      console.log("🆕 Inserted new data:", newData);
    }
  }, [userData, balanceData, record]);

  return localData; // ✅ Return current local data for UI use
}
