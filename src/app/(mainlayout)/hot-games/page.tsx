"use client";

import FullscreenLoader from "@/components/ui/FullscreenLoader";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useSessionTime } from "@/hooks/useSessionTime";
import { useGetUserBalanceQuery } from "@/redux/api/balanceApi";
import { RootState } from "@/redux/store";
import { useLiveBalance } from "@/services/balance/userBalance";
import { PromoSummary } from "@/types";
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

type PromoSummaryWithBonuses = PromoSummary & {
  depositBonuses?: { eligibleGameTypes?: string[]; eligibleGames?: string[] }[];
};

const REFRESH_FLAG = "needsBalanceRefresh";
const Page = () => {
  const games = [
    {
      _id: "68f3af742660fb6a568b52c6",
      game_code: "0ea8519b837ebd62f5a8978acca33e1d",
      createdAt: "2025-10-18T16:17:10.468Z",
      game_image:
        "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Dinosaur-Tycoon-II.png",
      game_name: "Baccarat B",
      game_type: "live",
      platform: "digital",
      provider: "evolution",
      updatedAt: "2025-10-18T16:17:10.468Z",
    },
    {
      _id: "68f3af742660fb6a568b52c5",
      game_code: "a04d1f3eb8ccec8a4823bdf18e3f0e84",
      createdAt: "2025-10-18T16:17:10.384Z",
      game_image:
        "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/All-star-Fishing.png",
      game_name: "Aviator",
      game_type: "crash",
      platform: "digital",
      provider: "spribe",
      updatedAt: "2025-10-18T16:17:10.384Z",
    },
    {
      _id: "68f3af742660fb6a568b52c4",
      game_code: "4afef91d3addb9ce5107abaf3342b9a5",
      createdAt: "2025-10-18T16:17:10.296Z",
      game_image:
        "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Happy-Fishing.png",
      game_name: "Dragon Hatch",
      game_type: "slot",
      platform: "digital",
      provider: "pgsoft",
      updatedAt: "2025-10-18T16:17:10.296Z",
    },
  ];
  const dispatch = useDispatch();
  const [launching, setLaunching] = useState(false);
  const { getSessionTime } = useSessionTime();

  const { user, isAuthenticated } = useSelector((s: RootState) => s.auth);
  const objectId = user?.objectId ?? undefined;

  const token = useMemo(() => {
    if (typeof window === "undefined") return undefined;
    return localStorage.getItem("accessToken") ?? undefined;
  }, []);

  const { data: dashboard } = useDashboardData(objectId, token);
  const userData = dashboard?.user ?? null;
  // const localData = useGetStoredUserBalance(userData?.id);
  const promoSummary = dashboard?.promoSummary as
    | PromoSummaryWithBonuses
    | undefined;

  // console.log(promoSummary?.depositBonuses[0])

  const { data: balanceData, refetch: refetchBalance } = useGetUserBalanceQuery(
    objectId!,
    {
      skip: !objectId,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    }
  );

  const liveBalance = useLiveBalance(
    objectId,
    balanceData?.data?.currentBalance ?? 0,
    token as string
  );

  // ✅ initialize vendorNew hook

  //  const { refetch: refetchVendor } = useVendorTransactions();
  // one-shot refresh when returning from game
  useEffect(() => {
    if (typeof window === "undefined" || !objectId) return;
    const flag = localStorage.getItem(REFRESH_FLAG);
    if (flag) {
      localStorage.removeItem(REFRESH_FLAG);
      //txn chk insert
      //  (async () => {
      //   await refetchVendor();

      // })();
      refetchBalance();
    }
  }, [
    objectId,
    // refetchVendor,
    refetchBalance,
  ]);

  const current = Number.isFinite(liveBalance)
    ? Number(liveBalance)
    : Number(balanceData?.data?.currentBalance ?? 0);
  // const handlePlay = async (game: any) => {
  //   try {
  //      setLaunching(true); // 🔥 SHOW LOADER
  //     const indiaTime = new Date().toLocaleString("en-IN", {
  //       timeZone: "Asia/Kolkata",
  //     });
  //     console.log("Local time (Asia/Kolkata):", indiaTime);

  //     // Build payload identical to PHP
  //     const timestamp = Date.now().toString(); // ✅ UTC ISO like PHP gmdate("Y-m-d\TH:i:s\Z")
  //     const homeUrl = window.location.origin;

  //     const checkbalance = current.toFixed(1);

  //     const payload = {
  //       agency_uid: "69965379a8924gameapi9095953c7231",
  //       game_uid: game.game_code,
  //       member_account: `hfb20f_${userData?.id}_bmxyz`,
  //       timestamp, // ✅ correct ISO UTC string
  //       credit_amount: checkbalance.toString(), // ✅ ensures float with 2 decimals
  //       currency_code: "BDT",
  //       language: "en",
  //       platform: 2,
  //       home_url: homeUrl,
  //       transfer_id: `tx_${Math.random().toString(36).substring(2, 10)}`,
  //     };

  //     console.log(checkbalance, payload);

  //     const response = await fetch("/api/game-launch", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(payload),
  //     });

  //     const result = await response.json();
  //     console.log("Game Launch Response:", result.payload.game_launch_url);
  //     const launchUrl = result.payload.game_launch_url;
  //     if (launchUrl) {
  //       console.log(launchUrl);
  //       window.location.href = launchUrl;
  //     } else {
  //       alert("Game launched successfully (no URL returned)");
  //     }
  //   } catch (error) {
  //     console.error("Error launching game:", error);
  //     alert("Failed to launch game. Please try again.");
  //   }
  // };

  const handlePlay = async (game: any) => {
    try {
      setLaunching(true); // 🔥 SHOW LOADER

      const indiaTime = new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
      });
      console.log("Local time (Asia/Kolkata):", indiaTime);

      const timestamp = Date.now().toString();
      const homeUrl = window.location.origin;
      const checkbalance = current.toFixed(1);

      const payload = {
        agency_uid: "69965379a8924gameapi9095953c7231",
        game_uid: game.game_code,
        member_account: `hfb20f_${userData?.id}_bmxyz`,
        timestamp,
        credit_amount: checkbalance.toString(),
        currency_code: "BDT",
        language: "en",
        platform: 2,
        home_url: homeUrl,
        transfer_id: `tx_${Math.random().toString(36).substring(2, 10)}`,
      };

      const response = await fetch("/api/game-launch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      const launchUrl = result?.payload?.game_launch_url;

      if (launchUrl) {
        // ⛔ DO NOT setLaunching(false) here
        // Loader stays visible until browser navigates
        window.location.href = launchUrl;
      } else {
        setLaunching(false);
        alert("Game launched successfully (no URL returned)");
      }
    } catch (error) {
      console.error("Error launching game:", error);
      setLaunching(false); // ❌ Hide loader on error
      alert("Failed to launch game. Please try again.");
    }
  };

  return (
    <>
      {launching && <FullscreenLoader message="Launching game..." />}

      <div className="grid grid-cols-3 gap-3 px-4 py-16">
        {games.map((game, idx) => (
          <div
            key={game._id || idx}
            onClick={() => handlePlay(game)}
            className="relative w-full h-[130px] rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all ease-in-out duration-300"
          >
            <div className="absolute z-[5] inset-0">
              <div className="relative w-full h-full">
                <Image
                  src={game.game_image}
                  alt={game.game_name}
                  fill
                  sizes="(max-width: 768px) 50px, 100px"
                  className="object-cover rounded-md"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/70" />
            </div>

            <div className="relative z-20 flex flex-col justify-between h-full px-3 py-4 text-white">
              <h3 className="text-xs font-bold">{game.game_name}</h3>
              <p className="text-xs text-white/80">{game.game_type}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default Page;
function useNewVendorTransactions(id: any): { refetch: any } {
  throw new Error("Function not implemented.");
}
