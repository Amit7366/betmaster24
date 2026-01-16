// src/hooks/useGameLauncher.ts
"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { RootState } from "@/redux/store";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useGetUserBalanceQuery, balanceApi } from "@/redux/api/balanceApi";

import { launchGame } from "@/services/actions/launchGame";
import type { PromoSummary } from "@/types";
import { useLiveBalance } from "@/services/balance/userBalance";
import { getIsoTimestamp } from "@/utils/helpers";
import { useVendorTransactions } from "./useVendorTransactions";
import { useSessionTime } from "./useSessionTime";
import { setSessionStart } from "@/redux/slices/sessionSlice";
import useGetStoredUserBalance from "./useGetStoredUserBalance";
import { useNewVendorTransactions } from "./vendorNew";

export type LaunchableGame = {
  game_code: string;
  game_name: string;
  game_image: string;
  game_type: string;
};

type PromoSummaryWithBonuses = PromoSummary & {
  depositBonuses?: { eligibleGameTypes?: string[]; eligibleGames?: string[] }[];
};

const REFRESH_FLAG = "needsBalanceRefresh";

export function useGameLauncher() {
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
  const { refetch: refetchVendorNew } = useNewVendorTransactions(userData?.id);
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
    refetchBalance]);
  const handlePlay = async (game: LaunchableGame) => {

    // const allowedIds = ["sbm47373", "sbm48016"];

    // if (!allowedIds.includes(userData?.id)) {
    //   toast.warning("Updating... Please wait a moment.");
    //   return;
    // }

    if (userData?.id === 'sbm47593') {
      toast.warning("Please verify KYC...");
      return;
    }


    // toast.warning("Updating... Please wait a moment.");
    // return;


    const { sessionTime, isoTime } = getSessionTime();

    dispatch(setSessionStart(sessionTime));

    // eligibility
    const eligible =
      promoSummary?.depositBonuses?.[0]?.eligibleGameTypes ??
      promoSummary?.depositBonuses?.[0]?.eligibleGames ??
      [];
    const bonuses = promoSummary?.depositBonuses ?? [];
    // true if ANY bonus has promoCode === "NO_PROMO"
    const hasOnlyNoPromo =
      bonuses.length > 0 &&
      bonuses.every(
        (b) => (b.promoCode ?? "").trim().toUpperCase() === "NO_PROMO" || 'PROMO_100_ALL' || 'PROMO_300_FIXED'
      );

    // console.log(hasOnlyNoPromo, promoSummary?.depositBonuses);

    if (
      eligible.length > 0 &&
      !eligible.includes(game.game_type) &&
      !hasOnlyNoPromo
    ) {
      toast.warning("Game is not available in your promotion");
      return;
    }
    if (!isAuthenticated || !user) {
      toast.warning("You are not logged in.");
      return;
    }

    // use the *latest* number we have at this moment
    const current = Number.isFinite(liveBalance)
      ? Number(liveBalance)
      : Number(balanceData?.data?.currentBalance ?? 0);

    if ((current ?? 0) <= 0) {
      toast.warning("Deposit Please...");
      return;
    }

    setLaunching(true);
    // try {
    //   const walletAmount = current.toFixed(2);
    //   const payload = {
    //     user_id: userData?.id || "test001",
    //     wallet_amount: walletAmount,
    //     game_uid: game.game_code,
    //     token: process.env.NEXT_PUBLIC_PLAYWIN_TOKEN,
    //     timestamp: Date.now(),
    //   };

    //   const res = await launchGame(payload);

    //   if (res?.payload) {
    //     // invalidate & refetch now (updates RTK cache)
    //     if (objectId) {
    //       dispatch(balanceApi.util.invalidateTags([{ type: "UserBalance", id: objectId }]));
    //       await refetchBalance().unwrap().catch(() => { });
    //     }

    //     // mark for a second refresh when user returns
    //     if (typeof window !== "undefined") {
    //       localStorage.setItem(REFRESH_FLAG, "1");
    //     }

    //     // const launchURL = `https://playwin6.com/launchGame?user_id=${res.payload.user_id
    //     //   }&wallet_amount=${res.payload.wallet_amount}&game_uid=${res.payload.game_uid
    //     //   }&token=${res.payload.token}&timestamp=${res.payload.timestamp
    //     //   }&&payload=${encodeURIComponent(res.encyption)}`;

    //     // console.log(payload)

    //     // keep loader on screen, then leave
    //     // window.location.href = launchURL;
    //     return; // page unloads
    //   } else {
    //     toast.error("Failed to get game URL.");
    //   }
    // } catch (err) {
    //   console.error(err);
    //   toast.error("Something went wrong!");
    // } finally {
    //   // only runs if we didn't navigate
    //   setLaunching(false);
    // }

    // try {
    //   // const response = await fetch(`${process.env.NEXT_PUBLIC_PLAYWIN_URL}/gameLaunch.php`, {
    //   const response = await fetch(`${process.env.NEXT_PUBLIC_PLAYWIN_URL}/gameLaunch.php`, {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({
    //       agency_uid: '8313eb45b0a212e0718b929849705972',
    //       game_uid: '8146db6ded1ef29540d262650817d090',
    //       member_account: "hfb20f_" + 'sbm123' + "_1fac6d",
    //       timestamp: new Date().toISOString().replace(/\.\d{3}Z$/, "Z"),
    //       credit_amount: 100,
    //       currency_code: "INR", language: "en",
    //       platform: "2",
    //       home_url: window.location.protocol + "//" + window.location.host,
    //       transfer_id: `tx_${Date.now()}`,
    //     }),
    //   });

    //   const data = await response.json();
    //   if (data.code === 0) {
    //     console.log("🎮 Game URL:", data.payload.game_launch_url);
    //   } else {
    //     console.error("⚠️ API Error:", data.msg);
    //   }
    // } catch (err) {
    //   console.error("❌ Request failed:", err);
    // }
    const home_url = window.location.protocol + "//" + window.location.host;
    // const home_url = window.location.host;
    function getPlatform() {
      const ua = navigator.userAgent || navigator.vendor || (window as any).opera;

      // Detect mobile
      if (/android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua.toLowerCase())) {
        // return "mobile"; // Mobile 2
        return 2; // Mobile 2
      }

      // return "web"; // Web 1(default)
      return 1; // Web 1(default)
    }
    function generateTransferId() {
      const timestamp = Date.now(); // e.g. 1753449847733
      const random = Math.floor(Math.random() * 1e6); // up to 6 digits
      return `tx_${timestamp}`;
    }


    // console.log((localData?.todayBalance)?.toFixed(2))
    // console.log(current);



    try {
      // 🧩 STEP 1: Fetch & ingest vendor transactions first
      console.log("⏳ Fetching vendor transactions before launch...");
      await refetchVendorNew(); // waits for vendorNew to finish

      // 🧩 STEP 2: Refetch balance after vendor ingestion
      console.log("💰 Refetching balance after vendor sync...");
      const refreshedBalance = await refetchBalance().unwrap(); // ✅ get updated data
      const current = refreshedBalance?.data?.currentBalance ?? 0;
      console.log('Refershed Balance: ',refreshedBalance?.data);




      // const requestBalance = {
      //   // agency_uid: "57cad57a41cCodeHub9410f86afc3bc1",
      //   agency_uid: "214391ef6669df671affeb79414d400e",
      //   game_uid: (game.game_code).toString(),
      //   member_account: `h037ad_${userData?.id}_sbm24`,
      //   timestamp: (Date.now()).toString(),
      //   credit_amount: 0.0,
      //   currency_code: "BDT",
      //   language: "en",
      //   platform: getPlatform(),
      //   home_url: home_url,
      //   transfer_id: generateTransferId(),
      // };

      // const responseBalance = await fetch("/api/getBalance", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(requestBalance),
      // });

      // const dataBalance = await responseBalance.json();
      // console.log("Balance data:", dataBalance);


      const requestPayload = {
        // agency_uid: "57cad57a41cCodeHub9410f86afc3bc1",
        agency_uid: process.env.NEXT_PUBLIC_JS_UID,
        game_uid: (game.game_code).toString(),
        member_account: `h94044_${userData?.id}_sbm24`,
        timestamp: (Date.now()).toString(),
        credit_amount: (parseFloat(current?.toFixed(1))).toString(),
        // credit_amount: dataBalance?.payload?.after_amount || '0.0',
        currency_code: "BDT",
        language: "en",
        platform: getPlatform(),
        home_url: home_url,
        transfer_id: generateTransferId(),
      };

      // console.log('payload: ', requestPayload)
      // const response = await fetch("https://loginapi.24gameapi.org/api/gameLaunch.php", {
      const response = await fetch("/api/game-launch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestPayload),
      });
      const data = await response.json();
      // console.log('data:', data)

      if (data.code === 0) {
        const launchUrl = data.payload?.game_launch_url;
        // console.log("🎮 Game Launch URL:", launchUrl, data);

        // optional: mark balance refresh flag
        localStorage.setItem("needsBalanceRefresh", "1");

        // redirect user
        // window.open(launchUrl, "_blank"); 
        window.location.href = launchUrl;
      } else {
        toast.error(`API Error: ${data.msg}`);
      }
    } catch (error: any) {
      console.error("❌ Game launch failed:", error.message);
      toast.error("Game launch failed, please try again.");
    } finally {
      setLaunching(false);
    }
    //====== direct call ========
    // try {
    //   const res = await fetch("/api/launch-game", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify(requestPayload),
    //   });
    //   const data = await res.json();

    //   console.log("🎯Game Vendor Response:", data);

    //   if (data.code === 0) {
    //     const launchUrl = data.payload?.game_launch_url;
    //     console.log("🎯 Game Launch URL:", launchUrl);
    //     // window.location.href = launchUrl;
    //   } else {
    //     toast.error(`API Error: ${data.msg}`);
    //   }

    // } catch (err: any) {
    //   console.error("❌ Launch Error:", err.message);
    // }finally {
    //   setLaunching(false);
    // }




  };

  const refreshBalance = () => objectId && refetchBalance();

  return {
    handlePlay,
    launching,
    liveBalance,
    isAuthenticated,
    userData,
    promoSummary,
    refreshBalance,
  };
}
