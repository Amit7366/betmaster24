"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

type WeeklyReward = {
  _id: string;
  weekStart: string;
  weekEnd: string;
  cashbackAmount: number;
  cashbackPercent: number;
  createdAt: string;
  isClaimed: boolean;
  netLoss: number;
  totalBets: number;
  totalWins: number;
  vipTier: string;
};

interface Props {
  userId: string;
  onClose: () => void;
}

export default function WeeklyRewardModal({ userId, onClose }: Props) {
  const [data, setData] = useState<WeeklyReward | null>(null);
  const [loading, setLoading] = useState(false);

  const weekdays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const today = new Date();
  const weekdayName = weekdays[today.getDay()];
  console.log(weekdayName); // e.g., "Sunday"

  useEffect(() => {
    const fetchReward = async () => {
      const token = localStorage.getItem("accessToken");

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/weeklyReward/weekly-reward/my-reward?userId=${userId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `${token}`,
            },
          }
        );

        const json = await res.json();

        if (json.success) {
          setData(json.data);
        } else {
          toast.error("Failed to load weekly reward");
        }
      } catch (error) {
        toast.error("Error fetching weekly reward");
      }
    };

    fetchReward();
  }, [userId]);

  const handleClaim = async () => {
    const token = localStorage.getItem("accessToken");
    const url = `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/weeklyReward/weekly-reward/claim?userId=${userId}`;

    await toast.promise(
      fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
      }).then(async (res) => {
        const json = await res.json();
        if (!json.success) throw new Error(json.message || "Claim failed");

        // Optional: refresh reward data
        setData({ ...data!, isClaimed: true });
      }),
      {
        loading: "Claiming reward...",
        success: "Reward claimed successfully!",
        error: "Failed to claim reward.",
      }
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-primary rounded-xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-black"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold mb-4 text-center text-white">
          Weekly Reward Summary
        </h2>

        {data ? (
          <div className="space-y-2 text-sm text-accent">
            <p>
              <strong>VIP Tier:</strong> {data.vipTier}
            </p>
            <p>
              <strong>Week:</strong>{" "}
              {new Date(data.weekStart).toLocaleDateString()} →{" "}
              {new Date(data.weekEnd).toLocaleDateString()}
            </p>
            <p>
              <strong>Total Bets:</strong> {data.totalBets}
            </p>
            <p>
              <strong>Total Wins:</strong> {data.totalWins}
            </p>
            <p>
              <strong>Net Loss:</strong> {data.netLoss}
            </p>
            <p>
              <strong>Cashback %:</strong> {data.cashbackPercent}%
            </p>
            <p>
              <strong>Cashback Amount:</strong> {data.cashbackAmount}
            </p>
            <p>
              <strong>Claimed:</strong> {data.isClaimed ? "✅ Yes" : "❌ No"}
            </p>

            {(!data.isClaimed && weekdayName === "Monday") && (
              <button
                onClick={handleClaim}
                disabled={loading}
                className="px-4 py-2 bg-accent text-white rounded hover:bg-accent/80 transition"
              >
                Claim
              </button>
            )}
          </div>
        ) : (
          <p className="text-center text-sm text-white">Loading...</p>
        )}
      </div>
    </div>
  );
}
